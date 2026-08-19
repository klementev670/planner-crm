import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Browser / client-side client (RLS-safe anon key).
// Falls back to placeholder values so this module never throws during
// server-side build/static analysis (e.g. Next.js "collecting page data"),
// when only server-side env vars are guaranteed to be present.
export const supabase = createClient(url, anonKey, {
  realtime: { params: { eventsPerSecond: 5 } },
});

// Server-side client with service role key — only import this in API routes / server code.
export function supabaseAdmin() {
  const { createClient: create } = require("@supabase/supabase-js");
  return create(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );
}
