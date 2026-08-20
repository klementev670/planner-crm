"use client";
import { useMemo, useState } from "react";
import { useRealtimeList } from "@/lib/useRealtimeList";
import { CalendarEvent } from "@/lib/types";
import { fmtDay } from "@/lib/date";
import DayEvents from "@/components/DayEvents";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function monthStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function loadColor(n: number) {
  if (n === 0) return null;
  if (n <= 2) return "#378ADD";
  if (n <= 4) return "#EF9F27";
  return "#E24B4A";
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const todayStr = fmtDay(new Date());
  const [selected, setSelected] = useState(todayStr);

  const mStr = monthStr(cursor);
  const { items: events } = useRealtimeList<CalendarEvent>("calendar_events", "/api/events", `?month=${mStr}`);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of events) m[e.day] = (m[e.day] || 0) + 1;
    return m;
  }, [events]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const leadDays = (firstOfMonth.getDay() + 6) % 7; // Monday-first offset
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < leadDays; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(fmtDay(new Date(year, month, d)));

  function shiftMonth(delta: number) {
    setCursor(new Date(year, month + delta, 1));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📆 Календарь</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftMonth(-1)}
            className="w-7 h-7 border border-white/10 rounded hover:bg-white/10">←</button>
          <span className="text-sm font-semibold w-40 text-center capitalize">
            {cursor.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })}
          </span>
          <button onClick={() => shiftMonth(1)}
            className="w-7 h-7 border border-white/10 rounded hover:bg-white/10">→</button>
          <button onClick={() => { setCursor(new Date()); setSelected(todayStr); }}
            className="text-xs border border-white/10 rounded px-2 py-1 hover:bg-white/10">Сегодня</button>
        </div>
      </div>

      <div className="card p-3 mb-4">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-[10px] text-slate-500 font-semibold py-1">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={`empty-${i}`} />;
            const n = counts[d] || 0;
            const color = loadColor(n);
            const isToday = d === todayStr;
            const isSelected = d === selected;
            return (
              <button
                key={d}
                onClick={() => setSelected(d)}
                className={`aspect-square rounded-lg border text-xs flex flex-col items-center justify-center gap-0.5 transition ${
                  isSelected ? "border-blue-500 bg-blue-900/30" : "border-white/10 hover:bg-white/5"
                } ${isToday ? "ring-1 ring-blue-500/50" : ""}`}
              >
                <span className={isToday ? "font-bold text-blue-400" : "text-slate-300"}>{Number(d.slice(-2))}</span>
                {color && (
                  <span className="flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                    <span className="text-[9px] text-slate-500">{n}</span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-sm font-semibold mb-2 capitalize">
        {new Date(selected + "T00:00:00").toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          weekday: "long",
        })}
      </div>

      <DayEvents day={selected} />
    </div>
  );
}
