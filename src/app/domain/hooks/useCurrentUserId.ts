"use client";

import { useEffect, useState } from "react";
import { fetchUserAttributes } from "aws-amplify/auth";

export function useCurrentUserId() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const attrs = await fetchUserAttributes();
        const sub = attrs.sub;
        if (!sub) throw new Error("Could not determine current user.");
        if (!cancelled) setUserId(sub);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load user.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { userId, loading, error } as const;
}

