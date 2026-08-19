"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { enablePush } from "@/lib/push";

const NAV = [
  { href: "/", label: "🏠 Обзор" },
  { href: "/goals", label: "✅ Цели" },
  { href: "/kanban", label: "📋 Канбан" },
  { href: "/pomodoro", label: "🍅 Помодоро" },
  { href: "/daily", label: "📅 День" },
  { href: "/timeline", label: "🗓️ Таймлайн" },
  { href: "/stats", label: "📊 Статистика" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [today, setToday] = useState("");
  const [pushState, setPushState] = useState<"idle" | "on" | "unsupported">("idle");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    );
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushState("unsupported");
    }
  }, []);

  async function handleEnablePush() {
    const ok = await enablePush();
    if (ok) setPushState("on");
  }

  return (
    <aside className="w-44 shrink-0 bg-sidebar flex flex-col h-screen sticky top-0">
      <div className="px-4 pt-5 pb-4">
        <div className="text-sm font-bold text-blue-400">📋 Планировщик</div>
        <div className="text-[10px] text-slate-500 mt-1">май 2026 → май 2027</div>
      </div>
      <nav className="flex-1 px-2 flex flex-col gap-1">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`text-xs rounded-lg px-3 py-2 transition ${
              pathname === n.href
                ? "bg-blue-900/60 text-white"
                : "text-slate-300 hover:bg-white/5"
            }`}
          >
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="px-4 pb-3 text-[10px] text-slate-500 text-center whitespace-pre-line">
        {`Сегодня:\n${today}`}
      </div>
      {pushState !== "on" && pushState !== "unsupported" && (
        <button
          onClick={handleEnablePush}
          className="mx-3 mb-4 text-[10px] rounded-lg border border-white/10 py-2 text-slate-400 hover:text-white hover:border-white/30"
        >
          🔔 Включить напоминания
        </button>
      )}
      {pushState === "on" && (
        <div className="mx-3 mb-4 text-[10px] text-emerald-500 text-center">🔔 Напоминания включены</div>
      )}
    </aside>
  );
}
