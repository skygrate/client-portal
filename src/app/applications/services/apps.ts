"use client";

import { amplifyClient } from "@shared/services/amplifyClient";
import { toRecordArray } from "@/shared/utils/amplifyRecords";
import { uploadFile } from "@shared/services/storage";
import type { ApplicationItem } from "../types";
import { mapApplicationRecord } from "../utils/mapRecord";

const client = amplifyClient;

export async function listAppsByUser(userId: string): Promise<ApplicationItem[]> {
  const res = await client.models.Application.list({ filter: { userId: { eq: userId } } });
  return toRecordArray(res.data)
    .map(mapApplicationRecord)
    .filter((item): item is ApplicationItem => Boolean(item));
}

export async function deleteApplication(params: { userId: string; domain: string; appName: string }) {
  const { userId, domain, appName } = params;
  await client.models.Application.delete({ userId, domain, appName });
}

export async function markApplicationForDeletion(params: { userId: string; domain: string; appName: string }) {
  const { userId, domain, appName } = params;
  await client.models.Application.update({ userId, domain, appName, toBeDeleted: true });
}

export async function unmarkApplicationForDeletion(params: { userId: string; domain: string; appName: string }) {
  const { userId, domain, appName } = params;
  await client.models.Application.update({ userId, domain, appName, toBeDeleted: false });
}

export async function createApplication(params: { userId: string; domain: string; appName: string; type: 'STATIC' | 'WORDPRESS'; subdomain?: string; }) {
  const { userId, domain, appName, type, subdomain } = params;
  const finalName = appName.trim();
  if (!finalName) throw new Error('Application name is required');
  const sd = (subdomain ?? '').trim();
  const fqdn = sd ? `${sd}.${domain}` : domain;
  const s3Prefix = type === 'WORDPRESS'
    ? `public/sites/${userId}/${domain}/wp-uploads/`
    : `public/sites/${userId}/${domain}/www/`;
  await client.models.Application.create({
    userId,
    domain,
    appName: finalName,
    type,
    fqdn,
    infraReady: false,
    s3Prefix,
    subdomain,
    toBeDeleted: false,
  });
  try {
    const folder = sd ? `${s3Prefix}${sd}/` : s3Prefix;
    const placeholder = new File([""], ".keep", { type: "text/plain" });
    await uploadFile(folder, placeholder);
  } catch {}
}
