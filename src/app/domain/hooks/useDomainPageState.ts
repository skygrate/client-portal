"use client";

import { useCallback, useMemo } from "react";
import { useDomains } from "@domain";
import type { DomainItem } from "@domain";
import { useErrorState } from "@shared/hooks/useErrorState";
import type { ReportErrorInput } from "@shared/hooks/useErrorState";

export type DomainPageState = {
  domains: DomainItem[];
  loading: boolean;
  error: string | null;
  handleCreate: (name: string) => Promise<void>;
  handleDelete: (name: string) => Promise<void>;
  handleSoftDelete: (name: string) => Promise<void>;
  handleCancelSoftDelete: (name: string) => Promise<void>;
  reportError: (input: ReportErrorInput) => void;
  clearError: () => void;
};

export function useDomainPageState(userId: string | null): DomainPageState {
  const { domains, loading: domainsLoading, error: domainsError, refresh, create, remove, markForDeletion, cancelDeletion } = useDomains(userId);
  const { error: localError, reportError: reportErrorRaw, clearError } = useErrorState();

  const reportError = useCallback(
    (input: ReportErrorInput) => {
      reportErrorRaw(input);
    },
    [reportErrorRaw]
  );

  const handleCreate = useCallback(async (name: string) => {
    clearError();
    try {
      await create(name);
      await refresh();
    } catch (err) {
      reportError({ error: err, fallback: 'Failed to create domain', origin: 'useDomainPageState.handleCreate' });
    }
  }, [create, refresh, clearError, reportError]);

  const handleDelete = useCallback(async (name: string) => {
    clearError();
    try {
      await remove(name);
      await refresh();
    } catch (err) {
      reportError({ error: err, fallback: 'Failed to delete domain', origin: 'useDomainPageState.handleDelete' });
    }
  }, [remove, refresh, clearError, reportError]);

  const handleSoftDelete = useCallback(async (name: string) => {
    clearError();
    try {
      await markForDeletion(name);
      await refresh();
    } catch (err) {
      reportError({ error: err, fallback: 'Failed to mark domain for deletion', origin: 'useDomainPageState.handleSoftDelete' });
    }
  }, [markForDeletion, refresh, clearError, reportError]);

  const handleCancelSoftDelete = useCallback(async (name: string) => {
    clearError();
    try {
      await cancelDeletion(name);
      await refresh();
    } catch (err) {
      reportError({ error: err, fallback: 'Failed to cancel domain deletion', origin: 'useDomainPageState.handleCancelSoftDelete' });
    }
  }, [cancelDeletion, refresh, clearError, reportError]);

  const error = useMemo(() => localError || domainsError || null, [localError, domainsError]);

  return {
    domains,
    loading: domainsLoading,
    error,
    handleCreate,
    handleDelete,
    handleSoftDelete,
    handleCancelSoftDelete,
    reportError,
    clearError,
  };
}
