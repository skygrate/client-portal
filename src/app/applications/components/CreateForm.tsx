"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DomainItem } from "@domain/types";
import { getReadyDomains, isDomainReady, pickInitialReadyDomain } from "@domain/utils/readiness";
import type { AppType } from "../types";

type Props = {
  domains: DomainItem[];
  domainsLoading?: boolean;
  initialType: AppType;
  onCancel: () => void;
  onCreate: (payload: {
    domain: string;
    appName: string;
    type: AppType;
    subdomain?: string;
  }) => Promise<void> | void;
};

export function CreateForm({ domains, domainsLoading, initialType, onCancel, onCreate }: Props) {
  const { t } = useTranslation();
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [appName, setAppName] = useState<string>("");
  const [subdomain, setSubdomain] = useState<string>("");

  useEffect(() => {
    const next = pickInitialReadyDomain(domains, selectedDomain);
    if (next !== selectedDomain) {
      setSelectedDomain(next);
    }
  }, [domains, selectedDomain]);

  const selectedDomainObj = useMemo(
    () => (selectedDomain ? domains.find((d) => d.name === selectedDomain) : undefined),
    [selectedDomain, domains]
  );
  const selectedDomainReady = isDomainReady(selectedDomainObj ?? null);
  const readyDomains = useMemo(() => getReadyDomains(domains), [domains]);
  const hasReadyDomain = readyDomains.length > 0;

  const canSubmit = Boolean(selectedDomain && selectedDomainReady && appName.trim().length > 0);

  return (
    <div className="mb-6 rounded-2xl border p-4 shadow-sm bg-white">
      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('application_create_form.domain_label')}</label>
          <select
            className="border rounded-md px-2 py-1 min-w-[16rem]"
            value={selectedDomain ?? ''}
            onChange={(e) => setSelectedDomain(e.target.value || null)}
            disabled={domainsLoading}
          >
            <option value="" disabled>{t('applications.select_domain_placeholder', 'Select domain')}</option>
            {domains.map((d) => (
              <option key={d.name} value={d.name} disabled={!isDomainReady(d)}>
                {d.name}
                {!isDomainReady(d) ? ` (${t('applications.domain_status_pending', 'Provisioning')})` : ''}
              </option>
            ))}
          </select>
          {selectedDomain && !selectedDomainReady && (
            <p className="mt-2 text-xs text-red-600">
              {t('applications.domain_not_ready_hint', { domain: selectedDomain })}
            </p>
          )}
          {!hasReadyDomain && domains.length > 0 && (
            <p className="mt-2 text-xs text-yellow-600">
              {t('applications.no_ready_domains')}
            </p>
          )}
          {domains.length === 0 && (
            <p className="mt-2 text-xs text-gray-500">
              {t('applications.no_domains_available', 'Add a domain to create applications.')}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('application_create_form.application_name_label')}</label>
         <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="border rounded-md px-2 py-1 min-w-[16rem]"
            placeholder={initialType === 'STATIC' ? 'www' : 'blog'}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">{t('application_create_form.subdomain_label')}</label>
          <input
            type="text"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            className="border rounded-md px-2 py-1 min-w-[16rem]"
            placeholder="e.g., blog"
          />
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-50"
            onClick={() => {
              setAppName('');
              setSubdomain('');
              onCancel();
            }}
          >
            {t('reusable.cancel')}
          </button>
         <button
            type="button"
            className="rounded-lg px-3 py-1.5 border bg-black text-white text-sm hover:opacity-90 disabled:opacity-50"
            disabled={!canSubmit}
            onClick={() => {
              if (!selectedDomain) return;
              void onCreate({
                domain: selectedDomain,
                appName: appName.trim(),
                type: initialType,
                subdomain: subdomain.trim() || undefined,
              });
            }}
          >
            Add {initialType === 'STATIC' ? 'Static' : 'WordPress'}
          </button>
        </div>
      </div>
      {selectedDomain && (
        <p className="mt-2 text-xs text-gray-500">
          URL: <code>{subdomain ? `${subdomain}.${selectedDomain}` : selectedDomain}</code>
        </p>
      )}
    </div>
  );
}
