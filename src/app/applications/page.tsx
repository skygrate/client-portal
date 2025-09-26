"use client";

import { useTranslation } from "react-i18next";
import { useCurrentUserId } from "@shared/auth/useCurrentUserId";
import { useDomains } from "@domain/hooks/useDomains";
import { CreateTiles } from "./components/CreateTiles";
import { CreateForm } from "./components/CreateForm";
import { ApplicationsTable } from "./components/ApplicationsTable";
import { useApplicationsManager } from "./hooks/useApplicationsManager";

export default function ApplicationsPage() {
  const { t } = useTranslation();
  const { userId, loading: userLoading } = useCurrentUserId();
  const { domains, loading: domainsLoading } = useDomains(userId);
  const {
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
  } = useApplicationsManager({ userId, domains });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t('sidebar.services_applications_label', 'Applications')}</h1>

      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <CreateTiles onSelect={(type) => startCreating(type)} />

      {creating && (
        <CreateForm
          domains={domains}
          domainsLoading={domainsLoading}
          initialType={creating}
          onCancel={() => {
            clearError();
            cancelCreating();
          }}
          onCreate={handleCreate}
        />
      )}
      <div className="rounded-2xl border p-4 shadow-sm bg-white">
        {userLoading || loading ? (
          <p className="text-sm text-gray-600">{t('reusable.loading')}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-600">No applications yet.</p>
        ) : (
          <ApplicationsTable
            apps={items}
            userId={userId}
            onChange={refresh}
            onError={reportError}
          />
        )}
      </div>
    </div>
  );
}
