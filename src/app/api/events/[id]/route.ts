import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const EDITABLE_FIELDS = ["day", "time", "text", "done", "remind_day_before", "remind_hour_before"];

const REMIND_TO_NOTIFIED: Record<string, string> = {
  remind_day_before: "notified_day_before",
  remind_hour_before: "notified_hour_before",
};

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const db = supabaseAdmin();
  const update: Record<string, unknown> = {};
  for (const k of EDITABLE_FIELDS) {
    if (k in body) update[k] = body[k];
  }

  // Changing the time/day shifts every reminder's target instant — let them
  // fire again. Flipping a single reminder toggle only resets that one.
  if ("day" in update || "time" in update) {
    for (const notifiedKey of Object.values(REMIND_TO_NOTIFIED)) update[notifiedKey] = false;
  }
  for (const [remindKey, notifiedKey] of Object.entries(REMIND_TO_NOTIFIED)) {
    if (remindKey in update) update[notifiedKey] = false;
  }

  const { data, error } = await db
    .from("calendar_events")
    .update(update)
    .eq("id", params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const db = supabaseAdmin();
  const { error } = await db.from("calendar_events").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
