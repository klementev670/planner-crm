import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const day = req.nextUrl.searchParams.get("day");
  const month = req.nextUrl.searchParams.get("month"); // YYYY-MM
  const db = supabaseAdmin();
  let q = db.from("calendar_events").select("*").order("time");
  if (day) q = q.eq("day", day);
  if (month) {
    const [y, m] = month.split("-").map(Number);
    const start = `${month}-01`;
    const next = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
    q = q.gte("day", start).lt("day", next);
  }
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("calendar_events")
    .insert({
      day: body.day,
      time: body.time,
      text: body.text,
      remind_day_before: !!body.remind_day_before,
      remind_hour_before: !!body.remind_hour_before,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
