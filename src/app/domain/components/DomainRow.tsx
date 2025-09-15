"use client";

import { useState } from "react";
import type { DomainItem } from "../types";
import { getPrefix } from "../services/domains";
import { FilePanel } from "./FilePanel";
import { useTranslation } from "react-i18next";

type Props = {
  domain: DomainItem;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: (name: string) => Promise<void>;
  onError: (message: string) => void;
};

export function DomainRow({ domain, isOpen, onToggle, onDelete, onError }: Props) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    const confirmed = confirm(
      t("domain.confirm_delete_domain", {
        domain: domain.name,
      })
    );
    if (!confirmed) return;
    setBusy(true);
    try {
      await onDelete(domain.name);
    } catch (e: any) {
      onError(e?.errors?.[0]?.message ?? e?.message ?? "Failed to delete domain.");
    } finally {
      setBusy(false);
    }
  }

  const prefix = getPrefix(domain);
  const canUpload = Boolean(prefix);

  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-medium">{domain.name}</div>
          <div className="text-sm text-gray-600">
            {t("domain.status_label", "Status")}: {domain.status}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canUpload}
            onClick={onToggle}
            className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-50 disabled:opacity-50"
            aria-pressed={isOpen}
            aria-disabled={!canUpload}
          >
            {isOpen ? t("reusable.close") : t("domain.manage_files")}
          </button>

          <button
            onClick={handleDelete}
            className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-50"
            disabled={busy}
          >
            {busy ? t("reusable.deleting") : t("reusable.delete")}
          </button>
        </div>
      </div>

      {isOpen && canUpload && (
        <FilePanel prefix={prefix} onError={onError} />
      )}
    </li>
  );
}

