import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const sub = await req.json();
  const db = supabaseAdmin();
  const { error } = await db
    .from("push_subscriptions")
    .upsert({ endpoint: sub.endpoint, subscription: sub }, { onConflict: "endpoint" });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json();
  const db = supabaseAdmin();
  const { error } = await db.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
