import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const db = supabaseAdmin();
  const update: any = {};
  if ("done" in body) update.done = body.done;
  if ("text" in body) update.text = body.text;
  if ("due_date" in body) update.due_date = body.due_date;
  if (update.done !== undefined) update.notified = false; // allow re-notify if reopened
  const { data, error } = await db.from("goals").update(update).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = supabaseAdmin();
  const { error } = await db.from("goals").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
