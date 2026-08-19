import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const day = req.nextUrl.searchParams.get("day");
  const db = supabaseAdmin();
  let q = db.from("daily_tasks").select("*").order("created_at");
  if (day) q = q.eq("day", day);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("daily_tasks")
    .insert({ project_id: body.project_id, text: body.text, day: body.day })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
