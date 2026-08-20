import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("purchase_batches")
    .select("*")
    .order("purchase_date", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("purchase_batches")
    .insert({
      name: body.name,
      purchase_cost: body.purchase_cost || 0,
      delivery_cost: body.delivery_cost || 0,
      ad_cost: body.ad_cost || 0,
      sale_revenue: body.sale_revenue || 0,
      purchase_date: body.purchase_date,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
