"use client";

import type { DomainItem } from "../types";
import { DomainRow } from "./DomainRow";
import { useTranslation } from "react-i18next";

type Props = {
  domains: DomainItem[];
  loading: boolean;
  selected: string | null;
  onToggle: (name: string) => void;
  onDelete: (name: string) => Promise<void>;
  onError: (message: string) => void;
};

export function DomainList({ domains, loading, selected, onToggle, onDelete, onError }: Props) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border p-4 shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-3">{t("domain.domain_list_label")}</h2>

      {loading ? (
        <p className="text-sm text-gray-600">{t("reusable.loading")}</p>
      ) : domains.length === 0 ? (
        <p className="text-sm text-gray-600">{t("domain.no_domains_yet")}</p>
      ) : (
        <ul className="divide-y">
          {domains.map((d) => (
            <DomainRow
              key={`${d.userId}:${d.name}`}
              domain={d}
              isOpen={selected === d.name}
              onToggle={() => onToggle(d.name)}
              onDelete={onDelete}
              onError={onError}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

