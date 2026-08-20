import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { APP_TZ, todayInTZ } from "@/lib/date";
import { initWebPush, sendPushToAll } from "@/lib/notify";

// Fires calendar_events reminders (день/час/10 минут/момент начала).
// Not wired into vercel.json — Vercel Cron on the Hobby plan can only run
// once a day, far too coarse for a "10 minutes before" reminder. Trigger
// this endpoint every 1-5 minutes from an external scheduler (e.g.
// cron-job.org) with the same Authorization header, or add it to
// vercel.json with a tight schedule once on a plan that allows it.
//
// Asia/Yekaterinburg has no DST, so day+time can be converted to a UTC
// instant with a fixed 5-hour offset.
function eventInstantMs(day: string, time: string): number {
  const [y, m, d] = day.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return Date.UTC(y, m - 1, d, hh, mm) - 5 * 60 * 60 * 1000;
}

const TIERS: { remind: string; notified: string; offsetMin: number; body: (t: string, text: string) => string }[] = [
  { remind: "remind_day_before", notified: "notified_day_before", offsetMin: 24 * 60, body: (t, text) => `Завтра в ${t}: «${text}»` },
  { remind: "remind_hour_before", notified: "notified_hour_before", offsetMin: 60, body: (t, text) => `Через час (${t}): «${text}»` },
  { remind: "remind_10min_before", notified: "notified_10min_before", offsetMin: 10, body: (t, text) => `Через 10 минут (${t}): «${text}»` },
  { remind: "remind_at_start", notified: "notified_at_start", offsetMin: 0, body: (_t, text) => `Сейчас: «${text}»` },
];

// Reminders more than this late (cron was down, external pinger lagged)
// are marked notified without sending — no point paging someone about a
// meeting that started 4 hours ago.
const MAX_LATE_MIN = 180;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  initWebPush();
  const db = supabaseAdmin();
  const nowMs = Date.now();

  const { data: events } = await db
    .from("calendar_events")
    .select("*")
    .eq("done", false)
    .gte("day", todayInTZ(APP_TZ, -1))
    .lte("day", todayInTZ(APP_TZ, 1));

  const { data: subs } = await db.from("push_subscriptions").select("*");

  let sent = 0;
  let fired = 0;
  if (events && subs) {
    for (const ev of events) {
      const instant = eventInstantMs(ev.day, ev.time);
      for (const tier of TIERS) {
        if (!ev[tier.remind] || ev[tier.notified]) continue;
        const targetMs = instant - tier.offsetMin * 60000;
        if (nowMs < targetMs) continue;

        const lateMin = (nowMs - targetMs) / 60000;
        if (lateMin <= MAX_LATE_MIN) {
          sent += await sendPushToAll(db, subs, {
            title: "⏰ Напоминание",
            body: tier.body(ev.time, ev.text),
            url: "/calendar",
          });
          fired++;
        }
        await db.from("calendar_events").update({ [tier.notified]: true }).eq("id", ev.id);
      }
    }
  }

  return NextResponse.json({ ok: true, checked: events?.length || 0, fired, sent });
}
