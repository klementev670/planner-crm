"use client";
import { useEffect, useRef, useState } from "react";
import { useRealtimeList } from "@/lib/useRealtimeList";
import { PROJECTS } from "@/lib/projects";
import { PomodoroSession } from "@/lib/types";

export default function PomodoroPage() {
  const { items: sessions, refetch } = useRealtimeList<PomodoroSession>("pomodoro_sessions", "/api/pomodoro");

  const [workMin, setWorkMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [left, setLeft] = useState(25 * 60);
  const [total, setTotal] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [status, setStatus] = useState("Готов к работе");
  const [proj, setProj] = useState(PROJECTS[0].id);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function tick() {
    setLeft((prev) => {
      if (prev <= 1) {
        finish();
        return 0;
      }
      return prev - 1;
    });
  }

  function start() {
    if (running) return;
    setRunning(true); setPaused(false); setIsBreak(false);
    setLeft(workMin * 60); setTotal(workMin * 60);
    setStatus("🍅 Фокус — работаем!");
    intervalRef.current = setInterval(() => tick(), 1000);
  }

  async function finish() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isBreak) {
      await fetch("/api/pomodoro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: proj, minutes: workMin }),
      });
      refetch();
      setStatus("✅ Готово! Начинаю перерыв…");
      setIsBreak(true);
      setLeft(breakMin * 60); setTotal(breakMin * 60);
      setStatus("☕ Перерыв!");
      intervalRef.current = setInterval(() => tick(), 1000);
    } else {
      setRunning(false); setIsBreak(false);
      setStatus("Перерыв окончен — готов к следующей сессии?");
      reset();
    }
  }

  function pause() {
    setPaused((p) => {
      const next = !p;
      if (next && intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (!next) intervalRef.current = setInterval(() => tick(), 1000);
      setStatus(next ? "⏸ Пауза" : "🍅 Продолжаем!");
      return next;
    });
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false); setPaused(false); setIsBreak(false);
    setLeft(workMin * 60); setTotal(workMin * 60);
    setStatus("Готов к работе");
  }

  const m = Math.floor(left / 60), s = left % 60;
  const pct = total ? left / total : 0;
  const color = isBreak ? "#1D9E75" : "#ff6b6b";

  const todayStr = new Date().toDateString();
  const todaySessions = sessions.filter((s) => new Date(s.started_at).toDateString() === todayStr);
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.minutes, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">🍅 Помодоро</h1>
      <div className="card p-8 max-w-md mx-auto text-center">
        <div className="text-sm text-slate-400 mb-2">{status}</div>
        <div className="text-6xl font-bold mb-4" style={{ color }}>
          {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-6">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct * 100}%`, background: color }} />
        </div>
        <div className="flex justify-center gap-2 mb-6">
          <button onClick={start} disabled={running}
            className="bg-red-700 hover:bg-red-600 disabled:bg-slate-700 rounded-full px-5 py-2 text-sm font-semibold">▶ Старт</button>
          <button onClick={pause} className="border border-white/10 rounded-full px-5 py-2 text-sm hover:bg-white/10">⏸ Пауза</button>
          <button onClick={reset} className="border border-white/10 rounded-full px-5 py-2 text-sm hover:bg-white/10">↺ Сброс</button>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs mb-4">
          <span>Работа (мин):</span>
          <input type="number" value={workMin} onChange={(e) => setWorkMin(Math.max(1, +e.target.value))}
            className="w-14 bg-black/30 border border-white/10 rounded px-2 py-1" />
          <span>Перерыв (мин):</span>
          <input type="number" value={breakMin} onChange={(e) => setBreakMin(Math.max(1, +e.target.value))}
            className="w-14 bg-black/30 border border-white/10 rounded px-2 py-1" />
        </div>
        <select value={proj} onChange={(e) => setProj(e.target.value)}
          className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs">
          {PROJECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div className="card p-4 max-w-md mx-auto mt-4 flex justify-around">
        <div className="text-center">
          <div className="text-xl font-bold text-red-400">{todaySessions.length}</div>
          <div className="text-[10px] text-slate-400">сессий сегодня</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-slate-300">{todayMinutes}</div>
          <div className="text-[10px] text-slate-400">мин фокуса</div>
        </div>
      </div>
    </div>
  );
}
