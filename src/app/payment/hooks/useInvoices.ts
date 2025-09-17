"use client";

import { useCallback, useEffect, useState } from "react";
import type { InvoiceItem } from "../services/invoices";
import { listInvoicesByUser } from "../services/invoices";

export function useInvoices(userId: string | null) {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listInvoicesByUser(userId);
      setItems(data);
    } catch (e: unknown) {
      const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message?: string }).message) : 'Failed to load invoices.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) void refresh();
  }, [userId, refresh]);

  return { items, loading, error, refresh } as const;
}

