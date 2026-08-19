"use client";
import { useState } from "react";
import { useRealtimeList } from "@/lib/useRealtimeList";
import { PROJECTS, projectColor, projectName } from "@/lib/projects";
import { KANBAN_COLUMNS, KanbanColumn, KanbanTask } from "@/lib/types";

const COL_COLOR: Record<string, string> = { "Бэклог": "#888", "В работе": "#378ADD", "Готово": "#1D9E75" };

export default function KanbanPage() {
  const { items: tasks, refetch } = useRealtimeList<KanbanTask>("kanban_tasks", "/api/kanban");
  const [text, setText] = useState("");
  const [proj, setProj] = useState(PROJECTS[0].id);

  async function add() {
    if (!text.trim()) return;
    await fetch("/api/kanban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: proj, text, column_name: "Бэклог" }),
    });
    setText("");
    refetch();
  }
  async function move(id: string, column_name: KanbanColumn) {
    await fetch(`/api/kanban/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ column_name }),
    });
    refetch();
  }
  async function del(id: string) {
    await fetch(`/api/kanban/${id}`, { method: "DELETE" });
    refetch();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Канбан-доска</h1>
        <div className="flex gap-2">
          <select value={proj} onChange={(e) => setProj(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-xs">
            {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Новая задача…"
            className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs w-48" />
          <button onClick={add} className="bg-blue-600 hover:bg-blue-500 rounded-lg px-3 py-2 text-xs font-semibold">+ Добавить</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {KANBAN_COLUMNS.map((col) => (
          <div key={col} className="card p-3 min-h-[300px]">
            <div className="text-xs font-bold mb-2" style={{ color: COL_COLOR[col] }}>{col}</div>
            <div className="flex flex-col gap-2">
              {tasks.filter((t) => t.column_name === col).map((t) => {
                const idx = KANBAN_COLUMNS.indexOf(col);
                const c = projectColor(t.project_id);
                return (
                  <div key={t.id} className="rounded-lg border p-2 bg-black/20" style={{ borderColor: c }}>
                    <div className="text-[10px] font-bold mb-1" style={{ color: c }}>● {projectName(t.project_id)}</div>
                    <div className="text-xs text-slate-200 mb-2">{t.text}</div>
                    <div className="flex justify-between">
                      <div className="flex gap-1">
                        {idx > 0 && (
                          <button onClick={() => move(t.id, KANBAN_COLUMNS[idx - 1])}
                            className="text-[10px] border border-white/10 rounded px-1.5 py-0.5 hover:bg-white/10">←</button>
                        )}
                        {idx < KANBAN_COLUMNS.length - 1 && (
                          <button onClick={() => move(t.id, KANBAN_COLUMNS[idx + 1])}
                            className="text-[10px] border border-white/10 rounded px-1.5 py-0.5 hover:bg-white/10">→</button>
                        )}
                      </div>
                      <button onClick={() => del(t.id)} className="text-[10px] text-slate-600 hover:text-red-400">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
