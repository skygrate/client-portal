"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AddDomainForm } from "./components/AddDomainForm";
import { DomainList } from "./components/DomainList";
import { useCurrentUserId } from "./hooks/useCurrentUserId";
import { useDomains } from "./hooks/useDomains";

export default function Domain() {
  const { t } = useTranslation();
  const { userId, loading: userLoading, error: userError } = useCurrentUserId();
  const { domains, loading: domainsLoading, error: domainsError, refresh, create, remove } = useDomains(userId);
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError || userError || domainsError;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t("domain.header")}</h1>

      <AddDomainForm
        domains={domains}
        disabled={userLoading}
        onError={(msg) => setLocalError(msg)}
        onCreate={async (name) => {
          setLocalError(null);
          await create(name);
          await refresh();
        }}
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <DomainList
        domains={domains}
        loading={userLoading || domainsLoading}
        onDelete={async (name) => {
          setLocalError(null);
          await remove(name);
          await refresh();
        }}
        onError={(msg) => setLocalError(msg)}
      />
    </div>
  );
}
