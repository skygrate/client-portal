"use client";

import type { DomainItem } from "../types";

export type DomainStatus = "New" | "Ready" | "Online";

export function computeStatus(d: DomainItem): DomainStatus {
  const infra = !!d.infraReady;
  return infra ? "Ready" : "New";
}

