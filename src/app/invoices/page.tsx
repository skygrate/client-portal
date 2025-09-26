"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentUserId } from "@shared/auth/useCurrentUserId";
import { useInvoices } from "./hooks/useInvoices";
import { InvoicesTable } from "./components/InvoicesTable";


export default function Payment() {
  const { t } = useTranslation();
  const { userId, loading: userLoading } = useCurrentUserId();
  const { items, loading: invoicesLoading, error, refresh } = useInvoices(userId);
  const [localError, setLocalError] = useState<string | null>(null);

  const loading = userLoading || invoicesLoading;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t('invoices.header')}</h1>

      {error || localError ? (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">
          {error || localError}
        </div>
      ) : null}

      <div className="flex justify-end gap-2 mb-2">
        <button
          type="button"
          onClick={() => refresh().catch((e) => setLocalError(String(e)))}
          disabled={loading}
          className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-100"
        >
          {t('reusable.refresh')}
        </button>
      </div>

      {userId && (
        <InvoicesTable
          userId={userId}
          items={items}
          loading={loading}
          onError={(m) => setLocalError(m)}
        />
      )}
    </div>
  );
}
