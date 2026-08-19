import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("pomodoro_sessions")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("pomodoro_sessions")
    .insert({ project_id: body.project_id || null, minutes: body.minutes })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
