import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Browser / client-side client (RLS-safe anon key)
export const supabase = createClient(url, anonKey, {
  realtime: { params: { eventsPerSecond: 5 } },
});

// Server-side client with service role key — only import this in API routes / server code.
export function supabaseAdmin() {
  const { createClient: create } = require("@supabase/supabase-js");
  return create(url, process.env.SUPABASE_SERVICE_ROLE_KEY as string);
}
