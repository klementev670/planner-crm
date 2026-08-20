"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";

const EDGE_ZONE_FRACTION = 0.2; // swipe can start anywhere in the left 20% of the screen
const OPEN_THRESHOLD_PX = 60;

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerOpenRef = useRef(drawerOpen);
  drawerOpenRef.current = drawerOpen;

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // A left-edge swipe normally triggers the browser/PWA's native
  // "go back" gesture. Intercept it as soon as it starts near the edge so
  // it opens the drawer instead — needs a non-passive touchmove listener
  // (React's synthetic touch handlers are passive) so preventDefault()
  // actually suppresses the native swipe.
  useEffect(() => {
    let tracking = false;
    let startX = 0;
    let startY = 0;

    function onTouchStart(e: TouchEvent) {
      const t = e.touches[0];
      tracking = !drawerOpenRef.current && t.clientX <= window.innerWidth * EDGE_ZONE_FRACTION;
      startX = t.clientX;
      startY = t.clientY;
    }
    function onTouchMove(e: TouchEvent) {
      if (!tracking) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault();
        if (dx > OPEN_THRESHOLD_PX) {
          setDrawerOpen(true);
          tracking = false;
        }
      }
    }
    function onTouchEnd() {
      tracking = false;
    }

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  if (pathname?.startsWith("/login")) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-44 shrink-0 h-screen sticky top-0">
        <Sidebar />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-sidebar px-3 h-12 border-b border-white/10">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Открыть меню"
          className="p-2 -ml-2 text-slate-200"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="text-sm font-bold text-blue-400">📋 Планировщик</div>
        <div className="w-8" />
      </div>

      {/* Mobile drawer overlay — always mounted so the slide-in can animate;
          hidden via opacity/transform + pointer-events when closed. */}
      <div
        className={`md:hidden fixed inset-0 z-40 flex transition-opacity duration-200 ${
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60"
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={`relative w-64 max-w-[80%] h-full shadow-xl transition-transform duration-200 ease-out ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onNavigate={() => setDrawerOpen(false)} />
        </div>
      </div>

      <main className="flex-1 p-4 pt-16 md:p-6 md:pt-6 overflow-x-hidden w-full min-w-0">
        {children}
      </main>
    </div>
  );
}
