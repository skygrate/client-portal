"use client";

import { useState } from "react";
import type { DomainItem } from "../types";
import { getPrefix } from "../services/domains";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

type Props = {
  domain: DomainItem;
  onDelete: (name: string) => Promise<void>;
  onError: (message: string) => void;
};

export function DomainRow({ domain, onDelete, onError }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
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
    } catch (e: unknown) {
      const msg = extractErrorMessage(e, "Failed to delete domain.");
      onError(msg);
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
            onClick={() => router.push(`/files?domain=${encodeURIComponent(domain.name)}`)}
            className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-50 disabled:opacity-50"
            aria-disabled={!canUpload}
          >
            {t("domain.manage_files")}
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

      {/* File management moved to /files page */}
    </li>
  );
}

function extractErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const maybe = err as { message?: string; errors?: Array<{ message?: string }> };
    return maybe.errors?.[0]?.message || maybe.message || fallback;
  }
  return fallback;
}
