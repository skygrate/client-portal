"use client";

import { useTranslation } from "react-i18next";
import { useFiles } from "../hooks/useFiles";
import { formatBytes, formatDate } from "../utils/format";

type Props = {
  prefix: string;
  onError?: (message: string) => void;
};

export function FilePanel({ prefix, onError }: Props) {
  const { t } = useTranslation();
  const { files, loading, nextToken, refresh, loadMore, upload, remove, uploading } = useFiles(prefix);

  return (
    <div className="mt-3 rounded-xl border p-3 bg-gray-50">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-gray-700">{t("domain.upload_prompt")}</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refresh().catch((e) => onError?.(e?.message ?? String(e)))}
            disabled={loading}
            className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-100"
          >
            {t("reusable.refresh")}
          </button>
          <input
            type="file"
            multiple
            onChange={async (e) => {
              const input = e.currentTarget;
              const files = input.files;
              if (files && files.length > 0) {
                try {
                  await upload(files);
                  alert(t("domain.upload_success"));
                } catch (err: any) {
                  onError?.(t("domain.upload_error") + (err?.message ? `: ${err.message}` : ""));
                } finally {
                  input.value = "";
                }
              }
            }}
            disabled={uploading}
          />
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2 w-1/2">{t("domain.col_name", "Name")}</th>
              <th className="text-left px-3 py-2">{t("domain.col_size", "Size")}</th>
              <th className="text-left px-3 py-2">{t("domain.col_modified", "Last modified")}</th>
              <th className="text-right px-3 py-2">{t("domain.col_actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-gray-500">
                  {loading ? t("reusable.loading") : t("domain.no_files_yet")}
                </td>
              </tr>
            )}
            {files.map((f) => (
              <tr key={f.path} className="border-t">
                <td className="px-3 py-2 font-mono">
                  {stripPrefix(f.path, prefix)}
                </td>
                <td className="px-3 py-2">{formatBytes(f.size)}</td>
                <td className="px-3 py-2">{formatDate(f.lastModified)}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    type="button"
                    onClick={async () => {
                      const filename = stripPrefix(f.path, prefix);
                      const ok = confirm(t("domain.confirm_delete_file", { file: filename }));
                      if (!ok) return;
                      try {
                        await remove(f);
                      } catch (err: any) {
                        onError?.(err?.message ?? "Failed to delete file.");
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

      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {t("domain.prefix_label", "Prefix")}: <code>{prefix}</code>
        </span>
        {nextToken && (
          <button
            type="button"
            onClick={() => loadMore().catch((e) => onError?.(e?.message ?? String(e)))}
            className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-100"
            disabled={loading}
          >
            {loading ? t("reusable.loading") : t("reusable.load_more")}
          </button>
        )}
      </div>
    </div>
  );
}

function stripPrefix(path: string, prefix: string) {
  return path.startsWith(prefix) ? path.slice(prefix.length) : path;
}
