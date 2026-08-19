"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";

// Fetches `apiPath` once, then re-fetches whenever Supabase realtime reports
// a change on `table` — this is what keeps phone and PC in sync live.
export function useRealtimeList<T>(table: string, apiPath: string, extraQuery = "") {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const res = await fetch(apiPath + extraQuery, { cache: "no-store" });
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, [apiPath, extraQuery]);

  useEffect(() => {
    refetch();
    const channel = supabase
      .channel(`${table}-changes-${extraQuery}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        refetch();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, apiPath, extraQuery]);

  return { items, loading, refetch };
}
