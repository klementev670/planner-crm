import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { APP_TZ, todayInTZ } from "@/lib/date";
import { initWebPush, sendPushToAll } from "@/lib/notify";

// Called daily by Vercel Cron. Notifies about goals due today or tomorrow
// (and flags overdue ones) that haven't been notified yet.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  initWebPush();

  const db = supabaseAdmin();
  // The server runs in UTC, not the app owner's timezone — pin "today" to
  // Yekaterinburg so it matches the plain YYYY-MM-DD dates users pick.
  const todayStr = todayInTZ(APP_TZ);
  const in2Str = todayInTZ(APP_TZ, 2);

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

      sent += await sendPushToAll(db, subs, { title: "⏰ Напоминание о цели", body, url: "/goals" });
      await db.from("goals").update({ notified: true }).eq("id", g.id);
    }
  }

  return NextResponse.json({ ok: true, notified: goals?.length || 0, sent });
}
