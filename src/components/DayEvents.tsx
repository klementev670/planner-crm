"use client";
import { useState } from "react";
import { useRealtimeList } from "@/lib/useRealtimeList";
import { PROJECTS, projectColor } from "@/lib/projects";
import { CalendarEvent } from "@/lib/types";

const REMINDER_TOGGLES: { key: keyof CalendarEvent; icon: string; label: string }[] = [
  { key: "remind_day_before", icon: "📅", label: "За день" },
  { key: "remind_hour_before", icon: "⏰", label: "За час" },
  { key: "remind_10min_before", icon: "⏱", label: "За 10 мин" },
  { key: "remind_at_start", icon: "🔔", label: "В начале" },
];

export default function DayEvents({ day }: { day: string }) {
  const { items: events, refetch } = useRealtimeList<CalendarEvent>("calendar_events", "/api/events", `?day=${day}`);
  const [time, setTime] = useState("12:00");
  const [text, setText] = useState("");
  const [proj, setProj] = useState(PROJECTS[0].id);
  const [reminders, setReminders] = useState<Record<string, boolean>>({
    remind_day_before: false,
    remind_hour_before: false,
    remind_10min_before: false,
    remind_at_start: true,
  });

  async function add() {
    if (!text.trim()) return;
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: proj, text, day, time, ...reminders }),
    });
    setText("");
    refetch();
  }
  async function patch(ev: CalendarEvent, fields: Partial<CalendarEvent>) {
    await fetch(`/api/events/${ev.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });
    refetch();
  }
  async function del(id: string) {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    refetch();
  }

  const doneCount = events.filter((e) => e.done).length;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-xs w-24"
        />
        <select value={proj} onChange={(e) => setProj(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-xs">
          {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Встреча, задача…"
          className="flex-1 min-w-[140px] bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs" />
        <button onClick={add} className="bg-blue-600 hover:bg-blue-500 rounded-lg px-4 py-2 text-xs font-semibold">+ Добавить</button>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {REMINDER_TOGGLES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setReminders((prev) => ({ ...prev, [r.key]: !prev[r.key as string] }))}
            className={`text-[10px] rounded-full px-2 py-1 border transition ${
              reminders[r.key as string]
                ? "bg-blue-900/50 border-blue-500 text-blue-300"
                : "border-white/10 text-slate-500 hover:border-white/30"
            }`}
          >
            {r.icon} {r.label}
          </button>
        ))}
      </div>

      <div className="card p-3 min-h-[160px]">
        {events.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-16">Нет событий на этот день.<br />Добавь задачу или встречу выше!</div>
        ) : (
          <>
            {events.map((ev) => (
              <div key={ev.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 mb-1">
                <span className="text-xs font-mono text-slate-400 w-11 shrink-0">{ev.time}</span>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: projectColor(ev.project_id || "") }} />
                <input type="checkbox" checked={ev.done} onChange={() => patch(ev, { done: !ev.done })} />
                <span className={`flex-1 text-xs min-w-[80px] ${ev.done ? "text-slate-500 line-through" : "text-slate-200"}`}>
                  {ev.text}
                </span>
                <div className="flex gap-0.5 shrink-0">
                  {REMINDER_TOGGLES.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      title={r.label}
                      onClick={() => patch(ev, { [r.key]: !ev[r.key] } as Partial<CalendarEvent>)}
                      className={`text-[11px] w-6 h-6 rounded-md flex items-center justify-center transition ${
                        ev[r.key] ? "bg-blue-900/50" : "opacity-25 hover:opacity-60"
                      }`}
                    >
                      {r.icon}
                    </button>
                  ))}
                </div>
                <button onClick={() => del(ev.id)} className="text-slate-600 hover:text-red-400 text-xs shrink-0">✕</button>
              </div>
            ))}
            <div className="text-[10px] text-slate-500 mt-2">Выполнено: {doneCount} / {events.length}</div>
          </>
        )}
      </div>
    </div>
  );
}
