import type { DomainItem } from "../types";

export type DomainStatus = "New" | "Ready" | "To be deleted";

export function computeStatus(d: DomainItem): DomainStatus {
  if (d.toBeDeleted) {
    return "To be deleted";
  }
  return d.infraReady ? "Ready" : "New";
}
