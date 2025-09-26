import type { InvoiceItem } from "@invoices";

export type InvoicesDataSource = {
  listByUser: (userId: string) => Promise<InvoiceItem[]>;
  getInvoiceUrl: (userId: string, fileName: string) => Promise<string>;
};

let invoicesSource: InvoicesDataSource | null = null;

export function configureInvoicesDataSource(source: InvoicesDataSource) {
  invoicesSource = source;
}

function requireInvoicesSource(): InvoicesDataSource {
  if (!invoicesSource) {
    throw new Error(
      "Invoices data source not configured. Configure it via configureInvoicesDataSource()."
    );
  }
  return invoicesSource;
}

export async function listInvoicesByUser(userId: string) {
  return requireInvoicesSource().listByUser(userId);
}

export async function getInvoiceDownloadUrl(userId: string, fileName: string) {
  return requireInvoicesSource().getInvoiceUrl(userId, fileName);
}
