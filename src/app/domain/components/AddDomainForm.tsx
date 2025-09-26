"use client";

import { useMemo, useState } from "react";
import type { DomainItem } from "@domain/types";
import { isValidDomain } from "@shared/utils/format";
import { useTranslation } from "react-i18next";
import { toErrorMessage } from "@shared/utils/errors";

type Props = {
  domains: DomainItem[];
  disabled?: boolean;
  onCreate: (name: string) => Promise<void>;
  onError: (message: string) => void;
  onAfterCreate?: () => void;
};

export function AddDomainForm({ domains, disabled, onCreate, onError, onAfterCreate }: Props) {
  const { t } = useTranslation();
  const [domainInput, setDomainInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const normalizedDomain = useMemo(() => {
    const d = domainInput.trim().toLowerCase().replace(/\.$/, "");
    return d;
  }, [domainInput]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!normalizedDomain) return;

    if (!isValidDomain(normalizedDomain)) {
      onError("Please enter a valid domain (e.g., example.com).");
      return;
    }
    if (domains.some((d) => d.name === normalizedDomain)) {
      onError("You already added this domain.");
      return;
    }

    setSubmitting(true);
    try {
      await onCreate(normalizedDomain);
      setDomainInput("");
      onAfterCreate?.();
    } catch (e: unknown) {
      onError(toErrorMessage(e, "Failed to add domain."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-8 rounded-2xl border p-4 shadow-sm bg-white">
      <h2 className="text-lg font-semibold mb-2">{t("domain.add_domain_label")}</h2>
      <p className="text-sm text-gray-600 mb-4">{t("domain.add_domain_description")}</p>

      <form onSubmit={handleSubmit} className="flex gap-2 items-start">
        <input
          type="text"
          inputMode="url"
          placeholder="example.com"
          value={domainInput}
          onChange={(e) => setDomainInput(e.target.value)}
          className="flex-1 rounded-xl border px-3 py-2"
          disabled={disabled || submitting}
          aria-label="Domain name"
        />
        <button
          type="submit"
          disabled={disabled || submitting || !normalizedDomain}
          className="rounded-xl px-4 py-2 border bg-black text-white disabled:opacity-50"
        >
          {submitting ? t("reusable.adding") : t("reusable.add")}
        </button>
      </form>

      {normalizedDomain && !isValidDomain(normalizedDomain) && (
        <p className="mt-2 text-sm text-red-600">
          {t("domain.invalid_domain_hint", "That doesn’t look like a valid domain.")}
        </p>
      )}
    </div>
  );
}
