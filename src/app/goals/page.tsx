"use client";
import { useState } from "react";
import { useRealtimeList } from "@/lib/useRealtimeList";
import { PROJECTS } from "@/lib/projects";
import { Goal } from "@/lib/types";
import { fmtDay } from "@/lib/date";

export default function GoalsPage() {
  const { items: goals, refetch } = useRealtimeList<Goal>("goals", "/api/goals");
  const [dialogProject, setDialogProject] = useState<string | null>(null);

  async function toggle(g: Goal) {
    await fetch(`/api/goals/${g.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !g.done }),
    });
    refetch();
  }
  async function del(id: string) {
    await fetch(`/api/goals/${id}`, { method: "DELETE" });
    refetch();
  }

  const today = new Date();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Цели</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PROJECTS.map((p) => {
          const pgoals = goals.filter((g) => g.project_id === p.id);
          return (
            <div key={p.id} className="card p-4" style={{ borderColor: p.color }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm" style={{ color: p.color }}>{p.name}</span>
                <button
                  onClick={() => setDialogProject(p.id)}
                  className="text-[10px] border border-white/10 rounded-md px-2 py-1 hover:bg-white/10"
                >
                  + цель
                </button>
              </div>
              <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
                {pgoals.map((g) => {
                  let dateTag = null;
                  if (g.due_date) {
                    const d = new Date(g.due_date);
                    const days = Math.round((d.getTime() - today.getTime()) / 86400000);
                    let dc = "#555", ds = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
                    if (days < 0 && !g.done) { dc = "#E24B4A"; ds = "просроч."; }
                    else if (days === 0) { dc = "#EF9F27"; ds = "сегодня"; }
                    else if (days <= 7) { dc = "#EF9F27"; ds = `${days}д`; }
                    dateTag = <span className="text-[10px] w-14 text-right shrink-0" style={{ color: dc }}>{ds}</span>;
                  }
                  return (
                    <div key={g.id} className="flex items-center gap-2 text-xs py-1">
                      <input type="checkbox" checked={g.done} onChange={() => toggle(g)} className="shrink-0" />
                      <span className={`flex-1 ${g.done ? "text-slate-500 line-through" : "text-slate-200"}`}>
                        {g.text}
                      </span>
                      {dateTag}
                      <button onClick={() => del(g.id)} className="text-slate-600 hover:text-red-400 shrink-0">✕</button>
                    </div>
                  );
                })}
                {pgoals.length === 0 && <div className="text-slate-600 text-xs py-2">Нет целей</div>}
              </div>
            </div>
          );
        })}
      </div>

      {dialogProject && (
        <GoalDialog
          projectId={dialogProject}
          onClose={() => setDialogProject(null)}
          onSaved={refetch}
        />
      )}
    </div>
  );
}

function GoalDialog({ projectId, onClose, onSaved }: { projectId: string; onClose: () => void; onSaved: () => void }) {
  const [text, setText] = useState("");
  const [date, setDate] = useState(fmtDay(new Date()));

  async function save() {
    if (!text.trim()) return;
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, text, due_date: date }),
    });
    onSaved();
    onClose();
  }

  const proj = PROJECTS.find((p) => p.id === projectId);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="card p-6 w-80" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold mb-3" style={{ color: proj?.color }}>Новая цель — {proj?.name}</h3>
        <label className="text-xs text-slate-400">Цель</label>
        <input
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm mt-1 mb-3 outline-none focus:border-blue-500"
          placeholder="Описание цели…"
        />
        <label className="text-xs text-slate-400">Дедлайн</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm mt-1 mb-4 outline-none focus:border-blue-500"
        />
        <div className="flex gap-2">
          <button onClick={save} className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-lg py-2 text-sm font-semibold">
            Добавить
          </button>
          <button onClick={onClose} className="px-4 border border-white/10 rounded-lg text-sm hover:bg-white/10">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
