"use client";

import { useTranslation } from "react-i18next";
import type { ApplicationItem } from "../types";
import { computeApplicationStatus } from "../utils/status";
import { useAsyncAction } from "@shared/hooks/useAsyncAction";
import { toErrorMessage } from "@shared/utils/errors";
import {
  deleteApplication,
  markApplicationForDeletion,
  unmarkApplicationForDeletion,
} from "../services/apps";

type Props = {
  apps: ApplicationItem[];
  userId: string | null;
  onChange: () => Promise<void> | void; // callback to refresh data after delete
  onError?: (msg: string) => void;
};

export function ApplicationsTable({ apps, userId, onChange, onError }: Props) {
  const { t } = useTranslation();

  // group and sort by domain, then by app name
  const byDomain = (() => {
    const m = new Map<string, ApplicationItem[]>();
    for (const a of apps) {
      if (!m.has(a.domain)) m.set(a.domain, []);
      m.get(a.domain)!.push(a);
    }
    for (const [, arr] of m) arr.sort((a,b) => a.appName.localeCompare(b.appName));
    return Array.from(m.entries()).sort((a,b) => a[0].localeCompare(b[0]));
  })();

  return (
    <div className="space-y-6">
      {byDomain.map(([domain, list]) => (
        <section key={domain}>
          <h2 className="text-lg font-semibold mb-2">{domain}</h2>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="text-left px-3 py-2 w-1/4">{t('applications.col_name')}</th>
                  <th className="text-left px-3 py-2 w-1/5">{t('applications.col_type')}</th>
                  <th className="text-left px-3 py-2">URL</th>
                  <th className="text-left px-3 py-2 w-1/5">Status</th>
                  <th className="text-right px-3 py-2 w-40">{t('applications.col_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {list.map(app => (
                  <ApplicationRow
                    key={`${app.userId}:${app.domain}:${app.appName}`}
                    app={app}
                    userId={userId}
                    onChange={onChange}
                    onError={onError}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

type ApplicationRowProps = {
  app: ApplicationItem;
  userId: string | null;
  onChange: () => Promise<void> | void;
  onError?: (msg: string) => void;
};

function ApplicationRow({ app, userId, onChange, onError }: ApplicationRowProps) {
  const { t } = useTranslation();
  const status = computeApplicationStatus(app);
  const isOnline = status === 'Online';
  const statusClass = status === 'To be deleted'
    ? 'text-red-600 font-semibold'
    : isOnline
      ? 'text-green-600 font-semibold'
      : undefined;

  const softDelete = useAsyncAction({
    confirmMessage: () => t('applications.confirm_soft_delete', { app: app.appName, domain: app.domain }),
    action: async () => {
      if (!userId || app.toBeDeleted) return;
      await markApplicationForDeletion({ userId, domain: app.domain, appName: app.appName });
      await onChange();
    },
    onError: (err) => onError?.(toErrorMessage(err, 'Failed to update application')),
  });

  const cancelSoftDelete = useAsyncAction({
    action: async () => {
      if (!userId) return;
      await unmarkApplicationForDeletion({ userId, domain: app.domain, appName: app.appName });
      await onChange();
    },
    onError: (err) => onError?.(toErrorMessage(err, 'Failed to cancel deletion')),
  });

  const hardDelete = useAsyncAction({
    confirmMessage: () => t('applications.confirm_delete', { app: app.appName, domain: app.domain }),
    action: async () => {
      if (!userId) return;
      await deleteApplication({ userId, domain: app.domain, appName: app.appName });
      await onChange();
    },
    onError: (err) => onError?.(toErrorMessage(err, 'Failed to delete application')),
  });

  return (
    <tr className="border-t">
      <td className="px-3 py-2 font-medium">{app.appName}</td>
      <td className="px-3 py-2">{app.type}</td>
      <td className="px-3 py-2">
        {isOnline ? (
          <a href={`https://${app.fqdn}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{app.fqdn}</a>
        ) : (
          <span>{app.fqdn}</span>
        )}
      </td>
      <td className="px-3 py-2">
        <span className={statusClass}>{status}</span>
      </td>
      <td className="px-3 py-2">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded-md px-2 py-1 border hover:bg-gray-50 disabled:opacity-50"
            disabled={app.toBeDeleted || softDelete.busy}
            onClick={() => softDelete.run()}
          >
            {softDelete.busy ? t('reusable.deleting') : t('reusable.delete')}
          </button>
          {app.toBeDeleted && (
            <button
              type="button"
              className="rounded-md px-2 py-1 border hover:bg-gray-50 disabled:opacity-50"
              disabled={cancelSoftDelete.busy}
              onClick={() => cancelSoftDelete.run()}
            >
              {cancelSoftDelete.busy ? t('reusable.loading') : t('reusable.cancel_deletion', 'Cancel deletion')}
            </button>
          )}
          <button
            type="button"
            className="rounded-md px-2 py-1 border hover:bg-gray-50 disabled:opacity-50"
            disabled={hardDelete.busy}
            onClick={() => hardDelete.run()}
          >
            {hardDelete.busy ? t('reusable.deleting') : t('reusable.hard_delete', 'Hard delete')}
          </button>
        </div>
      </td>
    </tr>
  );
}
