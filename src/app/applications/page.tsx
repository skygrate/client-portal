"use client";

import { useTranslation } from "react-i18next";
import { useCurrentUserId } from "@/app/domain/hooks/useCurrentUserId";
import { useDomains } from "@/app/domain/hooks/useDomains";
import { useEffect, useState, useCallback } from "react";
import type { ApplicationItem } from "./types";
import { listAppsByUser, createApplication } from "./services/apps";
import { CreateTiles } from "./components/CreateTiles";
import { CreateForm, type AppType } from "./components/CreateForm";
import { ApplicationsTable } from "./components/ApplicationsTable";

export default function ApplicationsPage() {
  const { t } = useTranslation();
  const { userId, loading: userLoading } = useCurrentUserId();
  const { domains, loading: domainsLoading } = useDomains(userId);
  const [items, setItems] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<null | AppType>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listAppsByUser(userId);
      setItems(res);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) return;
      if (cancelled) return;
      await refresh();
    })();
    return () => { cancelled = true };
  }, [userId, refresh]);
 

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t('sidebar.services_applications_label', 'Applications')}</h1>

      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <CreateTiles onSelect={(t) => setCreating(t)} />

      {creating && (
        <CreateForm
          domains={domains}
          domainsLoading={domainsLoading}
          initialType={creating}
          onCancel={() => setCreating(null)}
          onCreate={async ({ domain, appName, type, subdomain }) => {
            if (!userId) return;
            const domainMeta = domains.find((d) => d.name === domain);
            if (!domainMeta?.infraReady) {
              setError(t('applications.error_domain_not_ready', { domain }));
              return;
            }
            const trimmedSubdomain = (subdomain ?? '').trim();
            const displayFqdn = trimmedSubdomain ? `${trimmedSubdomain}.${domain}` : domain;
            const fqdnToCompare = displayFqdn.toLowerCase();
            const urlAlreadyExists = items.some((item) => item.fqdn.toLowerCase() === fqdnToCompare);
            if (urlAlreadyExists) {
              setError(t('applications.error_duplicate_url', { fqdn: displayFqdn }));
              return;
            }
            try {
              await createApplication({ userId, domain, appName, type, subdomain });
              setCreating(null);
              await refresh();
            } catch (e: unknown) {
              setError((e as { message?: string })?.message ?? 'Failed to create application');
            }
          }}
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
            onError={(msg) => setError(msg)}
          />
        )}
      </div>
    </div>
  );
}
