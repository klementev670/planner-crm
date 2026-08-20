"use client";
import { useState } from "react";
import { useRealtimeList } from "@/lib/useRealtimeList";
import { CalendarEvent } from "@/lib/types";

const REMINDER_TOGGLES: { key: "remind_day_before" | "remind_hour_before"; icon: string; label: string }[] = [
  { key: "remind_day_before", icon: "📅", label: "За день" },
  { key: "remind_hour_before", icon: "⏰", label: "За час" },
];

async function withErrorHandling(req: () => Promise<Response>, setError: (e: string | null) => void) {
  setError(null);
  try {
    const res = await req();
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || `Ошибка сервера (${res.status})`);
    }
    return true;
  } catch (e: any) {
    setError(e.message || "Не удалось сохранить, попробуйте ещё раз.");
    return false;
  }
}

export default function DayEvents({ day }: { day: string }) {
  const { items: events, refetch } = useRealtimeList<CalendarEvent>("calendar_events", "/api/events", `?day=${day}`);
  const [time, setTime] = useState("12:00");
  const [text, setText] = useState("");
  const [reminders, setReminders] = useState<Record<string, boolean>>({
    remind_day_before: false,
    remind_hour_before: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function add() {
    if (!text.trim() || saving) return;
    setSaving(true);
    const ok = await withErrorHandling(
      () =>
        fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, day, time, ...reminders }),
        }),
      setError
    );
    setSaving(false);
    if (ok) {
      setText("");
      refetch();
    }
  }
  async function patch(ev: CalendarEvent, fields: Partial<CalendarEvent>) {
    const ok = await withErrorHandling(
      () =>
        fetch(`/api/events/${ev.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(fields),
        }),
      setError
    );
    if (ok) refetch();
  }
  async function del(id: string) {
    const ok = await withErrorHandling(() => fetch(`/api/events/${id}`, { method: "DELETE" }), setError);
    if (ok) refetch();
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
        <input value={text} onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Встреча, задача…"
          className="flex-1 min-w-[140px] bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs" />
        <button onClick={add} disabled={saving} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg px-4 py-2 text-xs font-semibold">
          {saving ? "…" : "+ Добавить"}
        </button>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {REMINDER_TOGGLES.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setReminders((prev) => ({ ...prev, [r.key]: !prev[r.key] }))}
            className={`text-[10px] rounded-full px-2 py-1 border transition ${
              reminders[r.key]
                ? "bg-blue-900/50 border-blue-500 text-blue-300"
                : "border-white/10 text-slate-500 hover:border-white/30"
            }`}
          >
            {r.icon} {r.label}
          </button>
        ))}
      </div>

      {error && <div className="text-[11px] text-red-400 mb-3">{error}</div>}

      <div className="card p-3 min-h-[160px]">
        {events.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-16">Нет событий на этот день.<br />Добавь задачу или встречу выше!</div>
        ) : (
          <>
            {events.map((ev) => (
              <div key={ev.id} className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 mb-1">
                <input type="checkbox" checked={ev.done} onChange={() => patch(ev, { done: !ev.done })} className="shrink-0" />
                <span className="text-xs font-mono text-slate-400 shrink-0">{ev.time}</span>
                <span className={`flex-1 text-xs min-w-0 truncate ${ev.done ? "text-slate-500 line-through" : "text-slate-200"}`}>
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
