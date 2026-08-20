"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { enablePush, disablePush, getPushSubscription } from "@/lib/push";

const NAV = [
  { href: "/", label: "🏠 Обзор" },
  { href: "/goals", label: "✅ Цели" },
  { href: "/kanban", label: "📋 Канбан" },
  { href: "/calendar", label: "📆 Календарь" },
  { href: "/purchases", label: "📦 Закупки" },
  { href: "/stats", label: "📊 Статистика" },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [today, setToday] = useState("");
  const [pushState, setPushState] = useState<"loading" | "on" | "off" | "unsupported">("loading");

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
      return;
    }
    getPushSubscription().then((sub) => setPushState(sub ? "on" : "off"));
  }, []);

  async function handleTogglePush() {
    setPushState("loading");
    if (pushState === "on") {
      const ok = await disablePush();
      setPushState(ok ? "off" : "on");
    } else {
      const ok = await enablePush();
      setPushState(ok ? "on" : "off");
    }
  }

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="px-4 pt-5 pb-4">
        <div className="text-sm font-bold text-blue-400">📋 Планировщик</div>
        <div className="text-[10px] text-slate-500 mt-1">CRM</div>
      </div>
      <nav className="flex-1 px-2 flex flex-col gap-1 overflow-y-auto">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            className={`text-sm md:text-xs rounded-lg px-3 py-2.5 md:py-2 transition ${
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
      {pushState !== "unsupported" && (
        <button
          onClick={handleTogglePush}
          disabled={pushState === "loading"}
          title={pushState === "on" ? "Нажмите, чтобы выключить" : "Нажмите, чтобы включить"}
          className={`mx-3 mb-4 text-[10px] rounded-lg border py-2 transition ${
            pushState === "on"
              ? "border-emerald-500/30 text-emerald-500 hover:border-red-400/50 hover:text-red-400"
              : "border-white/10 text-slate-400 hover:text-white hover:border-white/30"
          }`}
        >
          {pushState === "loading" && "…"}
          {pushState === "on" && "🔔 Напоминания включены"}
          {pushState === "off" && "🔕 Включить напоминания"}
        </button>
      )}
    </div>
  );
}
