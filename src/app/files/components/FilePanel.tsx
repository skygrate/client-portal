"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFiles } from "../hooks/useFiles";
import { uploadFile, deleteAllUnderPrefix } from "@shared/services/storage";
import { FilesToolbar } from "./FilesToolbar";
import { FilesTable } from "./FilesTable";
import { UploadArea } from "./UploadArea";
import { ensureTrailingSlash, getParentPrefix, isValidFolderName, stripPrefix } from "../utils/path";

type Props = {
  prefix: string;
  onError?: (message: string) => void;
};

export function FilePanel({ prefix, onError }: Props) {
  const { t } = useTranslation();
  const [currentPrefix, setCurrentPrefix] = useState(ensureTrailingSlash(prefix));
  useEffect(() => {
    setCurrentPrefix(ensureTrailingSlash(prefix));
  }, [prefix]);
  const basePrefix = ensureTrailingSlash(prefix);
  const canGoUp = currentPrefix !== basePrefix;
  const { files, loading, nextToken, refresh, loadMore, upload, remove, uploading } = useFiles(currentPrefix);
  const [deletingFolder, setDeletingFolder] = useState<string | null>(null);
  const directRel = files.map((f) => stripPrefix(f.path, currentPrefix));
  const folderNames = Array.from(
    new Set(
      directRel
        .filter((p) => p.includes("/"))
        .map((p) => p.split("/")[0])
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
  const visibleFiles = files.filter((f) => {
    const rel = stripPrefix(f.path, currentPrefix);
    return rel !== ".keep" && !rel.includes("/");
  });

  return (
    <div className="mt-3 rounded-xl border p-3 bg-gray-50">
      <FilesToolbar
        currentPrefix={currentPrefix}
        canGoUp={canGoUp}
        onGoUp={() => {
          if (!canGoUp) return;
          setCurrentPrefix(getParentPrefix(currentPrefix, basePrefix));
        }}
        onCreateFolder={async () => {
          const name = prompt(t("files.new_folder_ph", "New folder name"))?.trim();
          if (!name) return;
          if (!isValidFolderName(name)) {
            alert(t("files.invalid_folder_name", "Folder name contains invalid characters."));
            return;
          }
          const clean = name.replaceAll(/\/+$/g, "");
          const target = ensureTrailingSlash(currentPrefix) + clean + "/";
          try {
            const placeholder = new File([""], ".keep", { type: "text/plain" });
            await uploadFile(target, placeholder);
          } catch {}
          setCurrentPrefix(target);
        }}
        onRefresh={() => refresh().catch((e: unknown) => onError?.(extractErrorMessage(e, "Failed to refresh.")))}
        loading={loading}
        uploading={uploading}
      />

      <FilesTable
        folderNames={folderNames}
        onOpenFolder={(folder) => setCurrentPrefix(ensureTrailingSlash(currentPrefix) + folder + "/")}
        deletingFolder={deletingFolder}
        onDeleteFolder={async (folder) => {
          const ok = confirm(t("files.confirm_delete_folder", { folder }));
          if (!ok) return;
          const target = ensureTrailingSlash(currentPrefix) + folder + "/";
          setDeletingFolder(folder);
          try {
            await deleteAllUnderPrefix(target);
            await refresh();
          } catch (err: unknown) {
            onError?.(extractErrorMessage(err, "Failed to delete folder."));
          } finally {
            setDeletingFolder(null);
          }
        }}
        files={visibleFiles}
        currentPrefix={currentPrefix}
        onDeleteFile={async (f) => {
          const filename = stripPrefix(f.path, currentPrefix);
          const ok = confirm(t("files.confirm_delete_file", { file: filename }));
          if (!ok) return;
          try {
            await remove(f);
          } catch (err: unknown) {
            onError?.(extractErrorMessage(err, "Failed to delete file."));
          }
        }}
        loading={loading}
      />

      <UploadArea
        uploading={uploading}
        nextToken={nextToken}
        loading={loading}
        onPickFiles={async (picked) => {
          try {
            await upload(picked);
            alert(t("files.upload_success"));
          } catch (err: unknown) {
            onError?.(extractErrorMessage(err, t("files.upload_error")));
          }
        }}
        onLoadMore={() => loadMore().catch((e) => onError?.(extractErrorMessage(e, "Failed to load more.")))}
      />
    </div>
  );
}

function extractErrorMessage(err: unknown, fallback: string) {
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const maybe = err as { message?: string; errors?: Array<{ message?: string }> };
    return maybe.errors?.[0]?.message || maybe.message || fallback;
  }
  return fallback;
}

function ensureTrailingSlash(p: string) {
  return p.endsWith("/") ? p : `${p}/`;
}

function isValidFolderName(name: string) {
  // allow letters, numbers, dash, underscore, dot; no slashes or spaces
  return /^[A-Za-z0-9._-]+$/.test(name) && name !== "." && name !== "..";
}

function displayPrefix(p: string) {
  return p.replace(/^public\/sites\//, "");
}

function getParentPrefix(current: string, base: string) {
  // Remove the last segment (ending with a trailing slash)
  const withoutTrailing = current.replace(/\/+$/, "");
  const parent = withoutTrailing.replace(/[^/]+$/, "");
  const normalized = ensureTrailingSlash(parent);
  // Never go above the domain root
  if (!normalized.startsWith(base) || normalized.length < base.length) {
    return base;
  }
  return normalized;
}
