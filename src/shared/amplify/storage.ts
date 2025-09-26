"use client";

import { list, uploadData, remove } from "aws-amplify/storage";

export type StorageFileItem = {
  path: string;
  size?: number;
  lastModified?: string | Date;
  eTag?: string;
};

type StorageListParams = { path: string; pageSize?: number; nextToken?: string };
type StorageListResponse = { items: StorageFileItem[]; nextToken?: string };

export async function listFiles(prefix: string, opts?: { pageSize?: number; nextToken?: string }) {
  const resp = await list({
    path: prefix.endsWith("/") ? prefix : `${prefix}/`,
    pageSize: opts?.pageSize,
    nextToken: opts?.nextToken,
  } as StorageListParams);
  const r = resp as unknown as StorageListResponse;
  return {
    items: r.items ?? [],
    nextToken: r.nextToken,
  };
}

export async function uploadFile(prefix: string, file: File) {
  await uploadData({
    path: `${prefix}${file.name}`,
    data: file,
    options: { contentType: file.type || "application/octet-stream" },
  }).result;
}

export async function deleteFile(path: string) {
  await remove({ path });
}

export async function deleteAllUnderPrefix(prefix: string) {
  let nextToken: string | undefined = undefined;
  do {
    const { items, nextToken: nt } = await listFiles(prefix, { pageSize: 1000, nextToken });
    for (const it of items) {
      await deleteFile(it.path);
    }
    nextToken = nt;
  } while (nextToken);
}
