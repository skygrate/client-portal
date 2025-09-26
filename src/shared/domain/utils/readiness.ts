import type { DomainItem } from "../types";

export function isDomainReady(domain: DomainItem | null | undefined): boolean {
  return Boolean(domain?.infraReady);
}

export function getReadyDomains(domains: DomainItem[]): DomainItem[] {
  return domains.filter((d) => isDomainReady(d));
}

export function pickInitialReadyDomain(domains: DomainItem[], preferred?: string | null): string | null {
  const ready = getReadyDomains(domains);
  if (ready.length === 0) return null;
  if (preferred && ready.some((d) => d.name === preferred)) return preferred;
  return ready[0].name;
}
