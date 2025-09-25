"use client";

import type { ApplicationItem } from "../types";

export function mapApplicationRecord(record: Record<string, unknown>): ApplicationItem | null {
  const userId = record.userId;
  const domain = record.domain;
  const appName = record.appName;
  if (typeof userId !== 'string' || typeof domain !== 'string' || typeof appName !== 'string') return null;
  const type = (record.type as 'STATIC' | 'WORDPRESS') ?? 'STATIC';
  const fqdn = (record.fqdn as string) ?? `${String(appName)}.${String(domain)}`;
  return {
    userId,
    domain,
    appName,
    type,
    fqdn,
    infraReady: Boolean(record.infraReady),
    s3Prefix: (record.s3Prefix as string) ?? null,
    subdomain: (record.subdomain as string) ?? null,
    toBeDeleted: Boolean(record.toBeDeleted),
  };
}
