"use client";

import { useMemo } from "react";
import type { DomainItem } from "@domain/types";
import { getPrefix } from "@domain/services/domains";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { computeStatus } from "@domain/utils/status";
import { useAsyncAction } from "@shared/hooks/useAsyncAction";
import { toErrorMessage } from "@shared/utils/errors";

type Props = {
  domain: DomainItem;
  onDelete: (name: string) => Promise<void>;
  onSoftDelete: (name: string) => Promise<void>;
  onCancelSoftDelete: (name: string) => Promise<void>;
  onError: (message: string) => void;
};

export function DomainRow({ domain, onDelete, onSoftDelete, onCancelSoftDelete, onError }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const hardDelete = useAsyncAction({
    confirmMessage: () => t("domain.confirm_delete_domain", { domain: domain.name }),
    action: () => onDelete(domain.name),
    onError: (err) => onError(toErrorMessage(err, "Failed to delete domain.")),
  });

  const softDelete = useAsyncAction({
    confirmMessage: () => t("domain.confirm_soft_delete_domain", { domain: domain.name }),
    action: async () => {
      if (domain.toBeDeleted) return;
      await onSoftDelete(domain.name);
    },
    onError: (err) => onError(toErrorMessage(err, "Failed to mark domain for deletion.")),
  });

  const cancelSoftDelete = useAsyncAction({
    action: async () => {
      if (!domain.toBeDeleted) return;
      await onCancelSoftDelete(domain.name);
    },
    onError: (err) => onError(toErrorMessage(err, "Failed to cancel domain deletion.")),
  });

  const prefix = useMemo(() => getPrefix(domain), [domain]);
  const canUpload = Boolean(prefix);

  const computed = computeStatus(domain);
  const isReady = computed === 'Ready';
  const isPendingDeletion = computed === 'To be deleted';
  const statusClass = isPendingDeletion
    ? 'text-red-600 font-semibold'
    : isReady
      ? 'text-green-600 font-semibold'
      : undefined;

  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium">
            <span>{domain.name}</span>
          </div>
          <div className="text-sm text-gray-600">
            {t("domain.status_label", "Status")}: {" "}
            <span className={statusClass}>{computed}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canUpload}
            onClick={() => router.push(`/files?domain=${encodeURIComponent(domain.name)}`)}
            className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-50 disabled:opacity-50"
            aria-disabled={!canUpload}
          >
            {t("domain.manage_files")}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/applications?domain=${encodeURIComponent(domain.name)}`)}
            className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-50"
          >
            {t("domain.manage_applications", "Applications")}
          </button>
          <button
            onClick={() => softDelete.run()}
            className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-50 disabled:opacity-50"
            disabled={softDelete.busy || Boolean(domain.toBeDeleted)}
          >
            {softDelete.busy ? t("reusable.deleting") : t("reusable.delete")}
          </button>
          {domain.toBeDeleted && (
            <button
              onClick={() => cancelSoftDelete.run()}
              className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-50 disabled:opacity-50"
              disabled={cancelSoftDelete.busy}
            >
              {cancelSoftDelete.busy ? t("reusable.loading") : t("reusable.cancel_deletion", "Cancel deletion")}
            </button>
          )}

          <button
            onClick={() => hardDelete.run()}
            className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-50 disabled:opacity-50"
            disabled={hardDelete.busy}
          >
            {hardDelete.busy ? t("reusable.deleting") : t("reusable.hard_delete", "Hard delete")}
          </button>
        </div>
      </div>

      {/* File management moved to /files page */}
    </li>
  );
}
