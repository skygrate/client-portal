import { amplifyClient } from "@amplify/client";
import { getUrl } from "aws-amplify/storage";
import { fetchAuthSession } from "aws-amplify/auth";

type InvoiceModelApi = { list: (args: unknown) => Promise<{ data?: unknown }> };
type DataClient = { models?: { Invoice?: InvoiceModelApi } };
const dataClient = amplifyClient as unknown as DataClient;

export type InvoiceItem = {
  userId: string;
  issueDate: string; // ISO date string
  net: number;
  gross: number;
  vatRate: number; // e.g., 23
  fileName: string; // e.g., invoice1.pdf
  currency?: string; // e.g., PLN, EUR
};

export async function listInvoicesByUser(userId: string): Promise<InvoiceItem[]> {
  const maybeModels = dataClient.models;
  const invoiceModel = maybeModels?.Invoice;
  if (!invoiceModel || typeof invoiceModel.list !== 'function') {
    // Model not available locally (likely amplify_outputs/model_introspection not updated yet)
    console.warn('[Invoices] Invoice model not available. Is the backend deployed and amplify_outputs.json updated?');
    return [];
  }
  const res = await invoiceModel.list({ filter: { userId: { eq: userId } } });
  // Normalize, be lenient with shapes/keys added manually (CSV, console), then sort by issueDate desc
  const raw = (res.data as unknown as Array<Record<string, unknown> | null | undefined>) ?? [];
  const data: InvoiceItem[] = raw
    .filter((x): x is Record<string, unknown> => Boolean(x))
    .map((x) => {
      const u = (x.userId as string) || userId;
      const issueDate = (x.issueDate as string) || (x.date as string) || '';
      const fileName = (x.fileName as string) || (x.filename as string) || '';
      const net = Number(x.net ?? 0);
      const gross = Number(x.gross ?? 0);
      const vatRate = Number(x.vatRate ?? x.vat ?? 0);
      const currency = (x.currency as string) || 'PLN';
      return { userId: u, issueDate, fileName, net, gross, vatRate, currency };
    });
  return data.sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1));
}

export async function getInvoiceUrl(userId: string, fileName: string): Promise<string> {
  // Logical bucket name defined in amplify/storage/resource.ts
  const bucket = 'billing';
  // Preferred: invoices/{identity_id}/file
  const session = await fetchAuthSession();
  const identityId = (session as { identityId?: string } | undefined)?.identityId;
  if (identityId) {
    try {
      const keyId = `invoices/${identityId}/${fileName}`;
      const { url } = await getUrl({ path: keyId, options: { bucket, validateObjectExistence: true } });
      return url.toString();
    } catch {/* fallthrough to sub */}
  }
  // Fallback: invoices/{sub}/file (if you store by sub)
  const keySub = `invoices/${userId}/${fileName}`;
  const { url } = await getUrl({ path: keySub, options: { bucket, validateObjectExistence: true } });
  return url.toString();
}

// intentionally no create helper in production bundle
