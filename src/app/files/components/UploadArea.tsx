"use client";

import { useTranslation } from "react-i18next";

type Props = {
  uploading: boolean;
  nextToken?: string;
  loading: boolean;
  onPickFiles: (files: FileList) => Promise<void>;
  onLoadMore: () => Promise<void>;
};

export function UploadArea({ uploading, nextToken, loading, onPickFiles, onLoadMore }: Props) {
  const { t } = useTranslation();
  const fileInputId = "file-upload-input";

  return (
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
          await onPickFiles(dropped);
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
              onClick={() => onLoadMore()}
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
              await onPickFiles(picked);
              input.value = "";
            }
          }}
          disabled={uploading}
        />
      </div>
    </div>
  );
}

