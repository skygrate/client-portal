"use client";

import { useCallback, useEffect, useState } from "react";
import type { DomainItem } from "../types";
import { getPrefix } from "@domain/services/domains";
import {
  listDomainsByUser,
  createDomainRecord,
  markDomainForDeletion as dataMarkDomainForDeletion,
  cancelDomainDeletion as dataCancelDomainDeletion,
  deleteDomainRecord,
} from "@data/domains";
import { deleteAllUnderPrefix } from "@amplify/storage";

export function useDomains(userId: string | null) {
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const list = await listDomainsByUser(userId);
      setDomains(list);
    } catch (e: unknown) {
      const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message?: string }).message) : 'Failed to load domains.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) void refresh();
  }, [userId, refresh]);

  const create = useCallback(
    async (name: string) => {
      if (!userId) throw new Error("You must be signed in to add domains.");
      await createDomainRecord(userId, name);
    },
    [userId]
  );

  const markForDeletion = useCallback(
    async (name: string) => {
      if (!userId) return;
      await dataMarkDomainForDeletion(userId, name);
    },
    [userId]
  );

  const cancelDeletion = useCallback(
    async (name: string) => {
      if (!userId) return;
      await dataCancelDomainDeletion(userId, name);
    },
    [userId]
  );

  const remove = useCallback(
    async (name: string) => {
      if (!userId) return;
      const d = domains.find((x) => x.name === name);
      const prefix = d ? getPrefix(d) : `public/sites/${userId}/${name}/`;
      await deleteAllUnderPrefix(prefix);
      await deleteDomainRecord(userId, name);
    },
    [domains, userId]
  );

  return { domains, loading, error, refresh, create, remove, markForDeletion, cancelDeletion } as const;
}
