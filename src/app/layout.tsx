import "./globals.css";
import type { Metadata, Viewport } from "next";
import Shell from "@/components/Shell";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
    title: "Планировщик — CRM",
  description: "Личная CRM: цели, канбан,, ежедневник",
  manifest: "/manifest.json",
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a16",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-bg text-white">
        <ServiceWorkerRegister />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
