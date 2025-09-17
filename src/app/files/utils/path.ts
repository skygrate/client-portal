"use client";

export function stripPrefix(path: string, prefix: string) {
  return path.startsWith(prefix) ? path.slice(prefix.length) : path;
}

export function ensureTrailingSlash(p: string) {
  return p.endsWith("/") ? p : `${p}/`;
}

export function isValidFolderName(name: string) {
  // allow letters, numbers, dash, underscore, dot; no slashes or spaces
  return /^[A-Za-z0-9._-]+$/.test(name) && name !== "." && name !== "..";
}

export function displayPrefix(p: string) {
  return p.replace(/^public\/sites\//, "");
}

export function getParentPrefix(current: string, base: string) {
  const withoutTrailing = current.replace(/\/+$/, "");
  const parent = withoutTrailing.replace(/[^/]+$/, "");
  const normalized = ensureTrailingSlash(parent);
  if (!normalized.startsWith(base) || normalized.length < base.length) {
    return base;
  }
  return normalized;
}

