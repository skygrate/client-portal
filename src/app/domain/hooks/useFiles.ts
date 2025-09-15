"use client";

import { useCallback, useEffect, useState } from "react";
import type { FileItem } from "../types";
import { deleteFile, listFiles, uploadFile } from "@shared/services/storage";

const PAGE_SIZE = 50;

export function useFiles(prefix: string) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const { items, nextToken } = await listFiles(prefix, {
          pageSize: PAGE_SIZE,
          nextToken: reset ? undefined : nextToken,
        });
        setFiles((prev) => (reset ? items : [...prev, ...items]));
        setNextToken(nextToken);
      } finally {
        setLoading(false);
      }
    },
    [prefix, nextToken]
  );

  useEffect(() => {
    // when prefix changes, reset and load first page
    setFiles([]);
    setNextToken(undefined);
    void load(true);
  }, [prefix]);

  const refresh = useCallback(async () => load(true), [load]);
  const loadMore = useCallback(async () => load(false), [load]);

  const upload = useCallback(
    async (filesToUpload: FileList) => {
      if (!filesToUpload?.length) return;
      setUploading(true);
      try {
        for (const file of Array.from(filesToUpload)) {
          await uploadFile(prefix, file);
        }
        await refresh();
      } finally {
        setUploading(false);
      }
    },
    [prefix, refresh]
  );

  const remove = useCallback(
    async (item: FileItem) => {
      await deleteFile(item.path);
      setFiles((prev) => prev.filter((f) => f.path !== item.path));
    },
    []
  );

  return { files, nextToken, loading, uploading, refresh, loadMore, upload, remove } as const;
}
