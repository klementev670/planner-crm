"use client";
import { useState } from "react";
import DayAgenda from "@/components/DayAgenda";
import { fmtDay } from "@/lib/date";

export default function DailyPage() {
  const [day, setDay] = useState(new Date());
  const dayStr = fmtDay(day);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📅 День</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setDay(new Date(day.getTime() - 86400000))}
            className="w-7 h-7 border border-white/10 rounded hover:bg-white/10">←</button>
          <span className="text-sm font-semibold w-40 text-center">
            {day.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}
          </span>
          <button onClick={() => setDay(new Date(day.getTime() + 86400000))}
            className="w-7 h-7 border border-white/10 rounded hover:bg-white/10">→</button>
          <button onClick={() => setDay(new Date())}
            className="text-xs border border-white/10 rounded px-2 py-1 hover:bg-white/10">Сегодня</button>
        </div>
      </div>

      <DayAgenda day={dayStr} />
    </div>
  );
}
