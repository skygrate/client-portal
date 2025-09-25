"use client";

import { amplifyClient } from "@shared/services/amplifyClient";
import { toRecordArray } from "@/shared/utils/amplifyRecords";
import type { DomainItem } from "../types";
import { mapDomainRecord } from "../utils/mapRecord";

const client = amplifyClient;

export async function listByUser(userId: string): Promise<DomainItem[]> {
  const res = await client.models.Domain.list({ filter: { userId: { eq: userId } } });
  return toRecordArray(res.data)
    .map(mapDomainRecord)
    .filter((item): item is DomainItem => Boolean(item));
}

export async function createDomain(userId: string, name: string): Promise<void> {
  await client.models.Domain.create({
    userId,
    name,
    s3_prefix: `public/sites/${userId}/${name}/`,
    infraReady: false,
    toBeDeleted: false,
  });
}

export async function markDomainForDeletion(userId: string, name: string): Promise<void> {
  await client.models.Domain.update({
    userId,
    name,
    toBeDeleted: true,
  });
}

export async function unmarkDomainForDeletion(userId: string, name: string): Promise<void> {
  await client.models.Domain.update({
    userId,
    name,
    toBeDeleted: false,
  });
}

export async function deleteDomain(userId: string, name: string): Promise<void> {
  let nextToken: string | undefined;
  do {
    const res = await client.models.Application.list({
      filter: {
        userId: { eq: userId },
        domain: { eq: name },
      },
      nextToken,
    });
    const rawApps = (res.data as unknown as Array<Record<string, unknown> | null | undefined>) ?? [];
    const appsToDelete = rawApps
      .filter((item): item is Record<string, unknown> => Boolean(item))
      .filter((item) => typeof item.userId === 'string' && typeof item.domain === 'string' && typeof item.appName === 'string')
      .map((item) => ({
        userId: item.userId as string,
        domain: item.domain as string,
        appName: item.appName as string,
      }));
    if (appsToDelete.length > 0) {
      await Promise.all(
        appsToDelete.map((app) =>
          client.models.Application.delete({
            userId: app.userId,
            domain: app.domain,
            appName: app.appName,
          })
        )
      );
    }
    nextToken = (res as { nextToken?: string | null }).nextToken ?? undefined;
  } while (nextToken);
  await client.models.Domain.delete({ userId, name });
}

export function getPrefix(domain: DomainItem): string {
  return (
    domain.s3_prefix ||
    `public/sites/${domain.userId}/${domain.name}/`
  );
}
