import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const EDITABLE_FIELDS = [
  "name",
  "purchase_cost",
  "delivery_cost",
  "ad_cost",
  "sale_revenue",
  "purchase_date",
  "sold_date",
];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const db = supabaseAdmin();
  const update: Record<string, unknown> = {};
  for (const k of EDITABLE_FIELDS) {
    if (k in body) update[k] = body[k];
  }
  const { data, error } = await db
    .from("purchase_batches")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = supabaseAdmin();
  const { error } = await db.from("purchase_batches").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
