"use client";

import { useTranslation } from "react-i18next";
import { displayPrefix } from "../utils/path";

type Props = {
  currentPrefix: string;
  canGoUp: boolean;
  onGoUp: () => void;
  onCreateFolder: () => void;
  onRefresh: () => void;
  loading: boolean;
  uploading: boolean;
};

export function FilesToolbar({ currentPrefix, canGoUp, onGoUp, onCreateFolder, onRefresh, loading, uploading }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-500">
        <code>{displayPrefix(currentPrefix)}</code>
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          title={t("files.go_up", "Up one level")}
          onClick={onGoUp}
          className="rounded-lg px-2 py-1.5 border text-sm hover:bg-gray-100 disabled:opacity-50"
          disabled={!canGoUp || loading || uploading}
          aria-label={t("files.go_up", "Up one level")}
        >
          ←
        </button>
        <button
          type="button"
          title={t("files.create_folder", "+")}
          onClick={onCreateFolder}
          className="rounded-lg px-2 py-1.5 border text-sm hover:bg-gray-100"
          disabled={loading || uploading}
          aria-label={t("files.create_folder", "Create folder")}
        >
          +
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg px-3 py-1.5 border text-sm hover:bg-gray-100"
        >
          {t("reusable.refresh")}
        </button>
      </div>
    </div>
  );
}
