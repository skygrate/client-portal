"use client";

import { amplifyClient } from "@shared/services/amplifyClient";
import type { DomainItem } from "../types";
const client = amplifyClient;

export async function listByUser(userId: string): Promise<DomainItem[]> {
  const res = await client.models.Domain.list({ filter: { userId: { eq: userId } } });
  const raw = (res.data as unknown as Array<Record<string, unknown> | null | undefined>) ?? [];
  const items: DomainItem[] = raw
    .filter((x): x is Record<string, unknown> => Boolean(x))
    .filter((x) => typeof x.userId === 'string' && typeof x.name === 'string')
    .map((x) => ({
      userId: x.userId as string,
      name: x.name as string,
      status: String(x.status ?? ''),
      s3_prefix: (x.s3_prefix as string) || `public/sites/${userId}/${String(x.name)}/`,
      infraReady: Boolean(x.infraReady),
      url: typeof x.url === 'string' ? (x.url as string) : `https://${String(x.name)}`,
    }));
  return items;
}

export async function createDomain(userId: string, name: string): Promise<void> {
  await client.models.Domain.create({
    userId,
    name,
    status: "New",
    s3_prefix: `public/sites/${userId}/${name}/`,
    infraReady: false,
  });
}

export async function deleteDomain(userId: string, name: string): Promise<void> {
  await client.models.Domain.delete({ userId, name });
}

export function getPrefix(domain: DomainItem): string {
  return (
    domain.s3_prefix ||
    `public/sites/${domain.userId}/${domain.name}/`
  );
}
