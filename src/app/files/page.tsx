"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useCurrentUserId } from "@/app/domain/hooks/useCurrentUserId";
import { useDomains } from "@/app/domain/hooks/useDomains";
import { getPrefix } from "@/app/domain/services/domains";
import { FilePanel } from "./components/FilePanel";

export default function FilesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useSearchParams();
  const initialDomainParam = params.get("domain");

  const { userId, loading: userLoading } = useCurrentUserId();
  const { domains, loading: domainsLoading } = useDomains(userId);

  const [selected, setSelected] = useState<string | null>(null);

  // Initialize selection once domains are loaded
  useEffect(() => {
    if (domains.length === 0) return;
    if (initialDomainParam && domains.some((d) => d.name === initialDomainParam)) {
      setSelected(initialDomainParam);
    } else if (!selected) {
      setSelected(domains[0].name);
    }
    // intentionally omit selected from deps to avoid overriding user choice on re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domains.length, initialDomainParam]);

  const loading = userLoading || domainsLoading;
  const selectedDomain = useMemo(() => domains.find((d) => d.name === selected) || null, [domains, selected]);
  const prefix = selectedDomain ? getPrefix(selectedDomain) : null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t("sidebar.services_files_label", "Files")}</h1>

      <div className="mb-4">
        {domains.length === 0 ? (
          <div className="text-sm text-gray-600">{t("files.no_domains_yet")}</div>
        ) : (
          <div className="flex items-center gap-2">
            <label htmlFor="domainSelect" className="text-sm text-gray-700">
              {t("files.domain_list_label")}
            </label>
            <select
              id="domainSelect"
              className="border rounded-md px-2 py-1"
              value={selected ?? ""}
              disabled={loading}
              onChange={(e) => {
                const name = e.target.value;
                setSelected(name);
                const url = new URL(window.location.href);
                url.searchParams.set("domain", name);
                router.replace(url.toString());
              }}
            >
              {domains.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {prefix && <FilePanel prefix={prefix} onError={() => {}} />}
    </div>
  );
}
