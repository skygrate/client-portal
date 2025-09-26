"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useCurrentUserId } from "@shared/auth/useCurrentUserId";
import { useDomains } from "@domain/hooks/useDomains";
import { getPrefix } from "@domain/services/domains";
import { getReadyDomains, isDomainReady, pickInitialReadyDomain } from "@domain/utils/readiness";
import { FilePanel } from "./components/FilePanel";

export default function FilesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useSearchParams();
  const initialDomainParam = params.get("domain");

  const { userId, loading: userLoading } = useCurrentUserId();
  const { domains, loading: domainsLoading } = useDomains(userId);

  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const next = pickInitialReadyDomain(domains, initialDomainParam ?? selected);
    if (next !== selected) {
      setSelected(next);
    }
  }, [domains, initialDomainParam, selected]);

  const loading = userLoading || domainsLoading;
  const selectedDomain = useMemo(() => domains.find((d) => d.name === selected) || null, [domains, selected]);
  const selectedDomainReady = isDomainReady(selectedDomain);
  const readyDomains = useMemo(() => getReadyDomains(domains), [domains]);
  const prefix = selectedDomainReady && selectedDomain ? getPrefix(selectedDomain) : null;
  const hasReadyDomain = readyDomains.length > 0;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t("sidebar.services_files_label", "Files")}</h1>

      <div className="mb-4">
        {domains.length === 0 ? (
          <div className="text-sm text-gray-600">{t("files.no_domains_yet")}</div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor="domainSelect" className="text-sm text-gray-700">
                {t("files.domain_list_label")}
              </label>
              <select
                id="domainSelect"
                className="border rounded-md px-2 py-1"
                value={selected ?? ""}
                disabled={loading || !hasReadyDomain}
                onChange={(e) => {
                  const name = e.target.value;
                  setSelected(name || null);
                  if (name) {
                    const url = new URL(window.location.href);
                    url.searchParams.set("domain", name);
                    router.replace(url.toString());
                  }
                }}
              >
                <option value="" disabled>{t("files.select_domain_placeholder", "Select domain")}</option>
                {domains.map((d) => (
                  <option key={d.name} value={d.name} disabled={!isDomainReady(d)}>
                    {d.name}
                    {!isDomainReady(d) ? ` (${t('files.domain_status_pending', 'Provisioning')})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {selected && !selectedDomainReady && (
              <p className="text-xs text-red-600">
                {t("files.domain_not_ready_hint", { domain: selected })}
              </p>
            )}
            {!hasReadyDomain && domains.length > 0 && (
              <p className="text-xs text-yellow-600">
                {t("files.no_ready_domains")}
              </p>
            )}
          </div>
        )}
      </div>

      {prefix ? (
        <FilePanel prefix={prefix} onError={() => {}} />
      ) : (
        domains.length > 0 && !hasReadyDomain && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
            {t("files.no_ready_domains")}
          </div>
        )
      )}
    </div>
  );
}
