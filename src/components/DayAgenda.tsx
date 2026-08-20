"use client";
import { useState } from "react";
import { useRealtimeList } from "@/lib/useRealtimeList";
import { PROJECTS, projectColor, projectName } from "@/lib/projects";
import { DailyTask } from "@/lib/types";

export default function DayAgenda({ day }: { day: string }) {
  const { items: tasks, refetch } = useRealtimeList<DailyTask>("daily_tasks", "/api/daily", `?day=${day}`);
  const [text, setText] = useState("");
  const [proj, setProj] = useState(PROJECTS[0].id);

  async function add() {
    if (!text.trim()) return;
    await fetch("/api/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: proj, text, day }),
    });
    setText("");
    refetch();
  }
  async function toggle(t: DailyTask) {
    await fetch(`/api/daily/${t.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !t.done }),
    });
    refetch();
  }
  async function del(id: string) {
    await fetch(`/api/daily/${id}`, { method: "DELETE" });
    refetch();
  }

  const byProj: Record<string, DailyTask[]> = {};
  for (const t of tasks) (byProj[t.project_id] ||= []).push(t);
  const done = tasks.filter((t) => t.done).length;

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <select value={proj} onChange={(e) => setProj(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-xs">
          {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Задача на день…"
          className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs" />
        <button onClick={add} className="bg-blue-600 hover:bg-blue-500 rounded-lg px-4 py-2 text-xs font-semibold">+ Добавить</button>
      </div>

      <div className="card p-3 min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-16">Нет задач на этот день.<br />Добавь задачу выше!</div>
        ) : (
          <>
            {Object.entries(byProj).map(([pid, ptasks]) => (
              <div key={pid} className="mb-3">
                <div className="text-[11px] font-bold mb-1" style={{ color: projectColor(pid) }}>● {projectName(pid)}</div>
                {ptasks.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 mb-1">
                    <input type="checkbox" checked={t.done} onChange={() => toggle(t)} />
                    <span className={`flex-1 text-xs ${t.done ? "text-slate-500 line-through" : "text-slate-200"}`}>{t.text}</span>
                    <button onClick={() => del(t.id)} className="text-slate-600 hover:text-red-400 text-xs">✕</button>
                  </div>
                ))}
              </div>
            ))}
            <div className="text-[10px] text-slate-500 mt-2">Выполнено: {done} / {tasks.length}</div>
          </>
        )}
      </div>
    </div>
  );
}
