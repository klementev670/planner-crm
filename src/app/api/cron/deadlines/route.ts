import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import webpush from "web-push";

// Called daily by Vercel Cron. Notifies about goals due today or tomorrow
// (and flags overdue ones) that haven't been notified yet.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  webpush.setVapidDetails(
    "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
    process.env.VAPID_PRIVATE_KEY as string
  );

  const db = supabaseAdmin();
  const today = new Date();
  const in2days = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
  const todayStr = today.toISOString().slice(0, 10);
  const in2Str = in2days.toISOString().slice(0, 10);

  const { data: goals } = await db
    .from("goals")
    .select("id, text, due_date, project_id, notified")
    .eq("done", false)
    .eq("notified", false)
    .lte("due_date", in2Str);

  const { data: subs } = await db.from("push_subscriptions").select("*");

  let sent = 0;
  if (goals && subs) {
    for (const g of goals) {
      const overdue = g.due_date < todayStr;
      const body = overdue
        ? `Просрочено: «${g.text}»`
        : g.due_date === todayStr
        ? `Дедлайн сегодня: «${g.text}»`
        : `Дедлайн скоро: «${g.text}» (${g.due_date})`;

      for (const s of subs) {
        try {
          await webpush.sendNotification(
            s.subscription,
            JSON.stringify({ title: "⏰ Напоминание о цели", body, url: "/goals" })
          );
          sent++;
        } catch (e) {
          // subscription likely expired — remove it
          await db.from("push_subscriptions").delete().eq("id", s.id);
        }
      }
      await db.from("goals").update({ notified: true }).eq("id", g.id);
    }
  }

  return NextResponse.json({ ok: true, notified: goals?.length || 0, sent });
}
