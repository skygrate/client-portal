import type { DomainItem } from "@domain";

export type DomainDataSource = {
  listByUser: (userId: string) => Promise<DomainItem[]>;
  create: (userId: string, name: string) => Promise<void>;
  markForDeletion: (userId: string, name: string) => Promise<void>;
  cancelDeletion: (userId: string, name: string) => Promise<void>;
  delete: (userId: string, name: string) => Promise<void>;
};

let domainSource: DomainDataSource | null = null;

export function configureDomainDataSource(source: DomainDataSource) {
  domainSource = source;
}

function requireDomainSource(): DomainDataSource {
  if (!domainSource) {
    throw new Error(
      "Domain data source not configured. Configure it via configureDomainDataSource()."
    );
  }
  return domainSource;
}

export async function listDomainsByUser(userId: string) {
  return requireDomainSource().listByUser(userId);
}

export async function createDomainRecord(userId: string, name: string) {
  await requireDomainSource().create(userId, name);
}

export async function markDomainForDeletion(userId: string, name: string) {
  await requireDomainSource().markForDeletion(userId, name);
}

export async function cancelDomainDeletion(userId: string, name: string) {
  await requireDomainSource().cancelDeletion(userId, name);
}

export async function deleteDomainRecord(userId: string, name: string) {
  await requireDomainSource().delete(userId, name);
}
