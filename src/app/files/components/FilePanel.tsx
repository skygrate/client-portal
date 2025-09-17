"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFiles } from "../hooks/useFiles";
import { formatBytes, formatDate } from "@shared/utils/format";
import { uploadFile, deleteAllUnderPrefix } from "@shared/services/storage";

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
  const fileInputId = "file-upload-input";
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
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500">
          {t("files.prefix_label", "Prefix")}: <code>{displayPrefix(currentPrefix)}</code>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            title={t("files.go_up", "Up one level")}
            onClick={() => {
              if (!canGoUp) return;
              const next = getParentPrefix(currentPrefix, basePrefix);
              setCurrentPrefix(next);
            }}
            className="rounded-lg px-2 py-1.5 border text-sm hover:bg-gray-100 disabled:opacity-50"
            disabled={!canGoUp || loading || uploading}
            aria-label={t("files.go_up", "Up one level")}
          >
            ←
          </button>
          <button
            type="button"
            title={t("files.create_folder", "+")}
            onClick={async () => {
              const name = prompt(t("files.new_folder_ph", "New folder name"))?.trim();
              if (!name) return;
              if (!isValidFolderName(name)) {
                alert(t("files.invalid_folder_name", "Folder name contains invalid characters."));
                return;
              }
              const clean = name.replaceAll(/\/+$/g, "");
              const target = ensureTrailingSlash(currentPrefix) + clean + "/";
              try {
                // create placeholder to materialize folder without showing it later
                const placeholder = new File([""], ".keep", { type: "text/plain" });
                await uploadFile(target, placeholder);
              } catch (_) {
                // ignore; S3 doesn't require explicit folders
              }
              setCurrentPrefix(target);
            }}
            className="rounded-lg px-2 py-1.5 border text-sm hover:bg-gray-100"
            disabled={loading || uploading}
            aria-label={t("files.create_folder", "Create folder")}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => refresh().catch((e: unknown) => onError?.(extractErrorMessage(e, "Failed to refresh.")))}
            disabled={loading}
            className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-100"
          >
            {t("reusable.refresh")}
          </button>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2 w-1/2">{t("files.col_name", "Name")}</th>
              <th className="text-left px-3 py-2">{t("files.col_size", "Size")}</th>
              <th className="text-left px-3 py-2">{t("files.col_modified", "Last modified")}</th>
              <th className="text-right px-3 py-2">{t("files.col_actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {/* Folder rows */}
            {folderNames.map((folder) => (
              <tr key={`dir:${folder}`} className="border-t bg-gray-50/50">
                <td className="px-3 py-2 font-mono">
                  <button
                    type="button"
                    onClick={() => setCurrentPrefix(ensureTrailingSlash(currentPrefix) + folder + "/")}
                    className="text-left w-full hover:underline"
                    title={t("files.open_folder", { defaultValue: "Open folder" })}
                  >
                    📁 {folder}/
                  </button>
                </td>
                <td className="px-3 py-2">—</td>
                <td className="px-3 py-2">—</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 border hover:bg-gray-50 disabled:opacity-50"
                    disabled={loading || uploading || deletingFolder === folder}
                    onClick={async () => {
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
                  >
                    {deletingFolder === folder ? t("reusable.deleting") : t("reusable.delete")}
                  </button>
                </td>
              </tr>
            ))}
            {/* Empty state */}
            {folderNames.length === 0 && visibleFiles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                  {loading ? t("reusable.loading") : t("files.no_files_yet")}
                </td>
              </tr>
            )}
            {visibleFiles.map((f) => (
              <tr key={f.path} className="border-t">
                <td className="px-3 py-2 font-mono">
                  {stripPrefix(f.path, currentPrefix)}
                </td>
                <td className="px-3 py-2">{formatBytes(f.size)}</td>
                <td className="px-3 py-2">{formatDate(f.lastModified)}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={async () => {
                      const filename = stripPrefix(f.path, currentPrefix);
                      const ok = confirm(t("files.confirm_delete_file", { file: filename }));
                      if (!ok) return;
                      try {
                        await remove(f);
                      } catch (err: unknown) {
                        onError?.(extractErrorMessage(err, "Failed to delete file."));
                      }
                    }}
                    className="rounded-md px-2 py-1 border hover:bg-gray-50"
                  >
                    {t("reusable.delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload area */}
      <div className="mt-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (uploading) return;
            const dropped = e.dataTransfer.files;
            if (!dropped || dropped.length === 0) return;
            try {
              await upload(dropped);
              alert(t("files.upload_success"));
            } catch (err: unknown) {
              onError?.(extractErrorMessage(err, t("files.upload_error")));
            }
          }}
          className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-4 text-center"
          aria-label={t("files.upload_prompt")}
       >
          <p className="text-sm text-gray-700 mb-3">{t("files.upload_prompt")}</p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => document.getElementById(fileInputId)?.click()}
              className="rounded-md px-3 py-2 border bg-black text-white text-sm disabled:opacity-50"
              disabled={uploading}
            >
              {uploading ? t("reusable.uploading") : t("reusable.upload")}
            </button>
            {nextToken && (
              <button
                type="button"
                onClick={() => loadMore().catch((e) => onError?.(extractErrorMessage(e, "Failed to load more.")))}
                className="rounded-md px-3 py-2 border text-sm hover:bg-gray-50 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? t("reusable.loading") : t("reusable.load_more")}
              </button>
            )}
          </div>
          <input
            id={fileInputId}
            type="file"
            className="sr-only"
            multiple
            onChange={async (e) => {
              const input = e.currentTarget;
              const picked = input.files;
              if (picked && picked.length > 0) {
                try {
                  await upload(picked);
                  alert(t("files.upload_success"));
                } catch (err: unknown) {
                  const msg = extractErrorMessage(err, t("files.upload_error"));
                  onError?.(msg);
                } finally {
                  input.value = "";
                }
              }
            }}
            disabled={uploading}
          />
        </div>
      </div>
    </div>
  );
}

function stripPrefix(path: string, prefix: string) {
  return path.startsWith(prefix) ? path.slice(prefix.length) : path;
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
