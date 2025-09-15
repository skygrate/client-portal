"use client";

import { amplifyClient } from "@shared/services/amplifyClient";
import type { DomainItem } from "../types";
const client = amplifyClient;

export async function listByUser(userId: string): Promise<DomainItem[]> {
  const res = await client.models.Domain.list({ where: { userId: { eq: userId } } });
  return (res.data as unknown as DomainItem[]) ?? [];
}

export async function createDomain(userId: string, name: string): Promise<void> {
  await client.models.Domain.create({
    userId,
    name,
    status: "Ready",
    parameters: { s3_prefix: `public/sites/${name}/` },
  });
}

export async function deleteDomain(userId: string, name: string): Promise<void> {
  await client.models.Domain.delete({ userId, name });
}

export function getPrefix(domain: DomainItem): string {
  return domain.parameters?.s3_prefix ?? `public/sites/${domain.name}/`;
}
