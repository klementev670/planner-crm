"use client";
import { useRealtimeList } from "@/lib/useRealtimeList";
import { PROJECTS, projectColor, projectName } from "@/lib/projects";
import { Goal, CalendarEvent } from "@/lib/types";
import { fmtDay } from "@/lib/date";

const DESCRIPTIONS: Record<string, { emoji: string; desc: string }> = {
  "ai-model": { emoji: "🤖", desc: "Цель: $2M инвестиций" },
  cargo: { emoji: "📦", desc: "Импорт из Китая\nДропшиппинг" },
  courses: { emoji: "📚", desc: "Вайбкодинг на Клоде\nОпора России / ТюмГУ" },
  tyumgu: { emoji: "🎓", desc: "2→3-й курс\nВеб-разработка" },
};

export default function OverviewPage() {
  const { items: goals, loading, refetch: refetchGoals } = useRealtimeList<Goal>("goals", "/api/goals");
  const todayStr = fmtDay(new Date());
  const { items: todayEvents, refetch: refetchEvents } = useRealtimeList<CalendarEvent>(
    "calendar_events",
    "/api/events",
    `?day=${todayStr}`
  );

  const today = new Date();
  const upcoming = goals
    .filter((g) => !g.done && g.due_date)
    .map((g) => {
      const d = new Date(g.due_date as string);
      const days = Math.round((d.getTime() - today.getTime()) / 86400000);
      return { ...g, days };
    })
    .filter((g) => g.days >= 1 && g.days <= 90)
    .sort((a, b) => a.days - b.days)
    .slice(0, 10);

  const todayGoals = goals
    .filter((g) => !g.done && g.due_date && g.due_date <= todayStr)
    .sort((a, b) => (a.due_date as string).localeCompare(b.due_date as string));

  async function toggleEvent(ev: CalendarEvent) {
    await fetch(`/api/events/${ev.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !ev.done }),
    });
    refetchEvents();
  }
  async function toggleGoal(g: Goal) {
    await fetch(`/api/goals/${g.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !g.done }),
    });
    refetchGoals();
  }

  const hasToday = todayEvents.length > 0 || todayGoals.length > 0;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Обзор проектов</h1>

      <h2 className="text-lg font-bold mb-3">📍 Сегодня</h2>
      <div className="card p-2 min-h-[80px] mb-8">
        {!hasToday ? (
          <div className="text-center text-slate-500 text-sm py-10">Ничего срочного на сегодня 🎉</div>
        ) : (
          <>
            {todayEvents
              .slice()
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <input type="checkbox" checked={ev.done} onChange={() => toggleEvent(ev)} className="shrink-0" />
                  <span className="text-xs font-mono text-slate-400 w-11 shrink-0">{ev.time}</span>
                  <span className={`flex-1 ${ev.done ? "text-slate-500 line-through" : "text-slate-200"}`}>{ev.text}</span>
                </div>
              ))}
            {todayGoals.map((g) => {
              const overdue = (g.due_date as string) < todayStr;
              return (
                <div key={g.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <input type="checkbox" checked={g.done} onChange={() => toggleGoal(g)} className="shrink-0" />
                  <span className="font-bold w-24 shrink-0 truncate" style={{ color: projectColor(g.project_id) }}>
                    ● {projectName(g.project_id)}
                  </span>
                  <span className="flex-1 text-slate-200">{g.text}</span>
                  <span className="shrink-0" style={{ color: overdue ? "#E24B4A" : "#EF9F27" }}>
                    {overdue ? "просрочено" : "сегодня"}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>

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
          <div className="text-center text-slate-500 text-sm py-10">Нет ближайших вех (1 … 90 дней)</div>
        ) : (
          upcoming.map((g) => {
            const c = projectColor(g.project_id);
            let tag = `через ${g.days}д`;
            let tc = "#666";
            if (g.days <= 7) tc = "#EF9F27";
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
