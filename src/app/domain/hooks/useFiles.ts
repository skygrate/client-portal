"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FileItem } from "../types";
import { deleteFile, listFiles, uploadFile } from "@shared/services/storage";

const PAGE_SIZE = 50;

export function useFiles(prefix: string) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const nextTokenRef = useRef<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(
    async (reset = false) => {
      setLoading(true);
      try {
        const { items, nextToken: nt } = await listFiles(prefix, {
          pageSize: PAGE_SIZE,
          nextToken: reset ? undefined : nextTokenRef.current,
        });
        setFiles((prev) => (reset ? items : [...prev, ...items]));
        setNextToken(nt);
        nextTokenRef.current = nt;
      } finally {
        setLoading(false);
      }
    },
    [prefix]
  );

  useEffect(() => {
    // when prefix changes, reset and load first page
    setFiles([]);
    setNextToken(undefined);
    nextTokenRef.current = undefined;
    void load(true);
  }, [prefix, load]);

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
