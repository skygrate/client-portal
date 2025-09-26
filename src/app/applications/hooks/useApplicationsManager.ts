"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DomainItem } from "@domain/types";
import type { ApplicationItem, AppType } from "../types";
import { createApplication, listAppsByUser } from "../services/apps";
import { useErrorState } from "@shared/hooks/useErrorState";
import { toErrorMessage } from "@shared/utils/errors";

export type UseApplicationsManagerArgs = {
  userId: string | null;
  domains: DomainItem[];
};

export type UseApplicationsManagerResult = {
  items: ApplicationItem[];
  loading: boolean;
  error: string | null;
  creating: AppType | null;
  startCreating: (type: AppType) => void;
  cancelCreating: () => void;
  reportError: (message: string) => void;
  clearError: () => void;
  refresh: () => Promise<void>;
  handleCreate: (payload: { domain: string; appName: string; type: AppType; subdomain?: string }) => Promise<void>;
};

export function useApplicationsManager({ userId, domains }: UseApplicationsManagerArgs): UseApplicationsManagerResult {
  const { t } = useTranslation();
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { error, reportError, clearError } = useErrorState();
  const [creating, setCreating] = useState<AppType | null>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    clearError();
    try {
      const res = await listAppsByUser(userId);
      setItems(res);
    } catch (e: unknown) {
      reportError(toErrorMessage(e, 'Failed to load applications'));
    } finally {
      setLoading(false);
    }
  }, [userId, clearError, reportError]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId || cancelled) return;
      await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, refresh]);

  const handleCreate = useCallback(async ({ domain, appName, type, subdomain }: { domain: string; appName: string; type: AppType; subdomain?: string; }) => {
    if (!userId) return;
    const domainMeta = domains.find((d) => d.name === domain);
    if (!domainMeta?.infraReady) {
      reportError(t('applications.error_domain_not_ready', { domain }));
      return;
    }
    const trimmedSubdomain = (subdomain ?? '').trim();
    const displayFqdn = trimmedSubdomain ? `${trimmedSubdomain}.${domain}` : domain;
    const fqdnToCompare = displayFqdn.toLowerCase();
    const urlAlreadyExists = items.some((item) => item.fqdn.toLowerCase() === fqdnToCompare);
    if (urlAlreadyExists) {
      reportError(t('applications.error_duplicate_url', { fqdn: displayFqdn }));
      return;
    }
    try {
      await createApplication({ userId, domain, appName, type, subdomain });
      setCreating(null);
      await refresh();
    } catch (e: unknown) {
      reportError(toErrorMessage(e, 'Failed to create application'));
    }
  }, [userId, domains, items, refresh, reportError, t]);

  const startCreating = useCallback((type: AppType) => {
    clearError();
    setCreating(type);
  }, [clearError]);

  const cancelCreating = useCallback(() => {
    clearError();
    setCreating(null);
  }, [clearError]);

  return {
    items,
    loading,
    error,
    creating,
    startCreating,
    cancelCreating,
    reportError,
    clearError,
    refresh,
    handleCreate,
  };
}
