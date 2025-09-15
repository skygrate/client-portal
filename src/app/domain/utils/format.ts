"use client";

export function formatBytes(n?: number) {
  if (!n && n !== 0) return "—";
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"] as const;
  let u = -1;
  let v = n;
  do {
    v /= 1024;
    u++;
  } while (v >= 1024 && u < units.length - 1);
  return `${v.toFixed(1)} ${units[u]}`;
}

export function formatDate(d?: string | Date) {
  if (!d) return "—";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString();
}

export function isValidDomain(d: string) {
  const re = /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/i;
  return re.test(d);
}

