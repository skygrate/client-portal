"use client";

import { useTranslation } from "react-i18next";
import { AddDomainForm } from "./components/AddDomainForm";
import { DomainList } from "./components/DomainList";
import { useCurrentUserId } from "@shared/auth/useCurrentUserId";
import { useDomainPageState } from "./hooks/useDomainPageState";

export default function Domain() {
  const { t } = useTranslation();
  const { userId, loading: userLoading, error: userError } = useCurrentUserId();
  const {
    domains,
    loading: domainsLoading,
    error: domainError,
    handleCreate,
    handleDelete,
    handleSoftDelete,
    handleCancelSoftDelete,
    reportError,
  } = useDomainPageState(userId);

  const error = userError || domainError;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t("domain.header")}</h1>

      <AddDomainForm
        domains={domains}
        disabled={userLoading}
        onError={reportError}
        onCreate={handleCreate}
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <DomainList
        domains={domains}
        loading={userLoading || domainsLoading}
        onDelete={handleDelete}
        onSoftDelete={handleSoftDelete}
        onCancelSoftDelete={handleCancelSoftDelete}
        onError={reportError}
      />
    </div>
  );
}
