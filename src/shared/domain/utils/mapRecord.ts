import type { DomainItem } from "../types";

export function mapDomainRecord(record: Record<string, unknown>): DomainItem | null {
  const userId = record.userId;
  const name = record.name;
  if (typeof userId !== 'string' || typeof name !== 'string') return null;
  return {
    userId,
    name,
    s3_prefix: (record.s3_prefix as string) || `public/sites/${userId}/${String(name)}/`,
    infraReady: Boolean(record.infraReady),
    url: typeof record.url === 'string' ? (record.url as string) : `https://${String(name)}`,
    toBeDeleted: Boolean(record.toBeDeleted),
  };
}
