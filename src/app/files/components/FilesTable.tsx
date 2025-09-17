"use client";

import { useTranslation } from "react-i18next";
import { formatBytes, formatDate } from "@shared/utils/format";
import type { FileItem } from "../types";

type Props = {
  folderNames: string[];
  onOpenFolder: (folder: string) => void;
  deletingFolder: string | null;
  onDeleteFolder: (folder: string) => Promise<void>;
  files: FileItem[];
  currentPrefix: string;
  onDeleteFile: (file: FileItem) => Promise<void>;
  loading: boolean;
};

export function FilesTable({ folderNames, onOpenFolder, deletingFolder, onDeleteFolder, files, currentPrefix, onDeleteFile, loading }: Props) {
  const { t } = useTranslation();

  return (
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
          {folderNames.map((folder) => (
            <tr key={`dir:${folder}`} className="border-t bg-gray-50/50">
              <td className="px-3 py-2 font-mono">
                <button
                  type="button"
                  onClick={() => onOpenFolder(folder)}
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
                  disabled={loading || deletingFolder === folder}
                  onClick={() => onDeleteFolder(folder)}
                >
                  {deletingFolder === folder ? t("reusable.deleting") : t("reusable.delete")}
                </button>
              </td>
            </tr>
          ))}

          {files.length === 0 && folderNames.length === 0 && (
            <tr>
              <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                {loading ? t("reusable.loading") : t("files.no_files_yet")}
              </td>
            </tr>
          )}

          {files.map((f) => (
            <tr key={f.path} className="border-t">
              <td className="px-3 py-2 font-mono">
                {stripCurrent(f.path, currentPrefix)}
              </td>
              <td className="px-3 py-2">{formatBytes(f.size)}</td>
              <td className="px-3 py-2">{formatDate(f.lastModified)}</td>
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  onClick={() => onDeleteFile(f)}
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
  );
}

function stripCurrent(path: string, prefix: string) {
  return path.startsWith(prefix) ? path.slice(prefix.length) : path;
}

