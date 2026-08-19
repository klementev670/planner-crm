"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/login")) return <>{children}</>;
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 overflow-x-hidden">{children}</main>
    </div>
  );
}
