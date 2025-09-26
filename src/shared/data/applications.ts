import type { ApplicationItem, AppType } from "@applications";

export type ApplicationsDataSource = {
  listByUser: (userId: string) => Promise<ApplicationItem[]>;
  delete: (params: { userId: string; domain: string; appName: string }) => Promise<void>;
  markForDeletion: (params: { userId: string; domain: string; appName: string }) => Promise<void>;
  cancelDeletion: (params: { userId: string; domain: string; appName: string }) => Promise<void>;
  create: (params: {
    userId: string;
    domain: string;
    appName: string;
    type: AppType;
    subdomain?: string;
  }) => Promise<void>;
};

let applicationsSource: ApplicationsDataSource | null = null;

export function configureApplicationsDataSource(source: ApplicationsDataSource) {
  applicationsSource = source;
}

function requireApplicationsSource(): ApplicationsDataSource {
  if (!applicationsSource) {
    throw new Error(
      "Applications data source not configured. Configure it via configureApplicationsDataSource()."
    );
  }
  return applicationsSource;
}

export async function listApplicationsByUser(userId: string) {
  return requireApplicationsSource().listByUser(userId);
}

export async function deleteApplicationRecord(params: { userId: string; domain: string; appName: string }) {
  await requireApplicationsSource().delete(params);
}

export async function markApplicationForDeletion(params: { userId: string; domain: string; appName: string }) {
  await requireApplicationsSource().markForDeletion(params);
}

export async function cancelApplicationDeletion(params: { userId: string; domain: string; appName: string }) {
  await requireApplicationsSource().cancelDeletion(params);
}

export async function createApplicationRecord(params: {
  userId: string;
  domain: string;
  appName: string;
  type: AppType;
  subdomain?: string;
}) {
  await requireApplicationsSource().create(params);
}
