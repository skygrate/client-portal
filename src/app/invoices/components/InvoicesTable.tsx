"use client";

import { useTranslation } from "react-i18next";
import type { InvoiceItem } from "@invoices";
import { getInvoiceDownloadUrl } from "@data/invoices";

type Props = {
  userId: string;
  items: InvoiceItem[];
  loading: boolean;
  onError?: (message: string) => void;
};

export function InvoicesTable({ userId, items, loading, onError }: Props) {
  const { t } = useTranslation();

  return (
    <div className="mt-3 overflow-hidden rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="text-left px-3 py-2 w-1/4">{t("payment.col_date", "Issue date")}</th>
            <th className="text-right px-3 py-2">{t("payment.col_net", "Net")}</th>
            <th className="text-right px-3 py-2">{t("payment.col_vat_rate", "VAT %")}</th>
            <th className="text-right px-3 py-2">{t("payment.col_gross", "Gross")}</th>
            <th className="text-right px-3 py-2">{t("payment.col_actions", "Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                {loading ? t("reusable.loading") : t("payment.no_invoices", "No invoices yet")}
              </td>
            </tr>
          )}
          {items.map((inv) => (
            <tr key={`${inv.userId}:${inv.issueDate}`} className="border-t">
              <td className="px-3 py-2">{formatDate(inv.issueDate)}</td>
              <td className="px-3 py-2 text-right">{formatMoney(inv.net, inv.currency || 'PLN')}</td>
              <td className="px-3 py-2 text-right">{formatVat(inv.vatRate)}</td>
              <td className="px-3 py-2 text-right">{formatMoney(inv.gross, inv.currency || 'PLN')}</td>
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  title={t("payment.open_invoice", "Open invoice")}
                  className="rounded-md px-2 py-1 border hover:bg-gray-50"
                  disabled={!inv.fileName}
                  onClick={async () => {
                    try {
                      const url = await getInvoiceDownloadUrl(userId, inv.fileName);
                      window.open(url, '_blank', 'noopener,noreferrer');
                    } catch (e: unknown) {
                      onError?.(typeof e === 'object' && e && 'message' in e ? String((e as { message?: string }).message) : 'Failed to open invoice.');
                    }
                  }}
                >
                  📄
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatMoney(n: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n);
  } catch {
    return n.toFixed(2);
  }
}

function formatVat(v: number) {
  return `${v}%`;
}

function formatDate(s: string) {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleDateString();
}
