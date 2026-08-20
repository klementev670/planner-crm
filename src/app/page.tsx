"use client";
import { useRealtimeList } from "@/lib/useRealtimeList";
import { PROJECTS, projectColor } from "@/lib/projects";
import { Goal } from "@/lib/types";

const DESCRIPTIONS: Record<string, { emoji: string; desc: string }> = {
  "ai-model": { emoji: "🤖", desc: "Цель: $2M инвестиций" },
  cargo: { emoji: "📦", desc: "Импорт из Китая\nДропшиппинг" },
  courses: { emoji: "📚", desc: "Вайбкодинг на Клоде\nОпора России / ТюмГУ" },
  tyumgu: { emoji: "🎓", desc: "2→3-й курс\nВеб-разработка" },
};

export default function OverviewPage() {
  const { items: goals, loading } = useRealtimeList<Goal>("goals", "/api/goals");

  const today = new Date();
  const upcoming = goals
    .filter((g) => !g.done && g.due_date)
    .map((g) => {
      const d = new Date(g.due_date as string);
      const days = Math.round((d.getTime() - today.getTime()) / 86400000);
      return { ...g, days };
    })
    .filter((g) => g.days >= -7 && g.days <= 90)
    .sort((a, b) => a.days - b.days)
    .slice(0, 10);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Обзор проектов</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {PROJECTS.map((p) => {
          const pgoals = goals.filter((g) => g.project_id === p.id);
          const done = pgoals.filter((g) => g.done).length;
          const total = pgoals.length;
          const pct = total ? done / total : 0;
          const info = DESCRIPTIONS[p.id];
          return (
            <div key={p.id} className="card p-4" style={{ borderColor: p.color }}>
              <div className="font-bold text-sm mb-1" style={{ color: p.color }}>
                {info?.emoji} {p.name}
              </div>
              <div className="text-[10px] text-slate-400 whitespace-pre-line mb-3">
                {info?.desc}
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-1.5">
                <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, background: p.color }} />
              </div>
              <div className="text-[10px] text-slate-400">{done} / {total} целей</div>
            </div>
          );
        })}
      </div>

      <h2 className="text-lg font-bold mt-8 mb-3">Ближайшие вехи</h2>
      <div className="card p-2 min-h-[200px]">
        {loading ? (
          <div className="text-center text-slate-500 text-sm py-10">Загрузка…</div>
        ) : upcoming.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-10">Нет ближайших вех (−7 … +90 дней)</div>
        ) : (
          upcoming.map((g) => {
            const c = projectColor(g.project_id);
            let tag = `через ${g.days}д`;
            let tc = "#666";
            if (g.days < 0) { tag = `−${-g.days}д просрочено`; tc = "#E24B4A"; }
            else if (g.days === 0) { tag = "сегодня!"; tc = "#EF9F27"; }
            else if (g.days <= 7) { tc = "#EF9F27"; }
            return (
              <div key={g.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                <span className="font-bold w-24 shrink-0 truncate" style={{ color: c }}>
                  ● {PROJECTS.find((p) => p.id === g.project_id)?.name}
                </span>
                <span className="flex-1 text-slate-200">{g.text}</span>
                <span className="w-28 text-right shrink-0" style={{ color: tc }}>{tag}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
