"use client";

import { useCallback, useMemo } from "react";
import { useDomains } from "@domain/hooks/useDomains";
import type { DomainItem } from "@domain/types";
import { useErrorState } from "@shared/hooks/useErrorState";
import { toErrorMessage } from "@shared/utils/errors";

export type DomainPageState = {
  domains: DomainItem[];
  loading: boolean;
  error: string | null;
  handleCreate: (name: string) => Promise<void>;
  handleDelete: (name: string) => Promise<void>;
  handleSoftDelete: (name: string) => Promise<void>;
  handleCancelSoftDelete: (name: string) => Promise<void>;
  reportError: (message: string) => void;
  clearError: () => void;
};

export function useDomainPageState(userId: string | null): DomainPageState {
  const { domains, loading: domainsLoading, error: domainsError, refresh, create, remove, markForDeletion, cancelDeletion } = useDomains(userId);
  const { error: localError, reportError, clearError } = useErrorState();

  const handleCreate = useCallback(async (name: string) => {
    clearError();
    try {
      await create(name);
      await refresh();
    } catch (err) {
      reportError(toErrorMessage(err, 'Failed to create domain'));
    }
  }, [create, refresh, clearError, reportError]);

  const handleDelete = useCallback(async (name: string) => {
    clearError();
    try {
      await remove(name);
      await refresh();
    } catch (err) {
      reportError(toErrorMessage(err, 'Failed to delete domain'));
    }
  }, [remove, refresh, clearError, reportError]);

  const handleSoftDelete = useCallback(async (name: string) => {
    clearError();
    try {
      await markForDeletion(name);
      await refresh();
    } catch (err) {
      reportError(toErrorMessage(err, 'Failed to mark domain for deletion'));
    }
  }, [markForDeletion, refresh, clearError, reportError]);

  const handleCancelSoftDelete = useCallback(async (name: string) => {
    clearError();
    try {
      await cancelDeletion(name);
      await refresh();
    } catch (err) {
      reportError(toErrorMessage(err, 'Failed to cancel domain deletion'));
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
