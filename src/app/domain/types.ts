"use client";

export type DomainItem = {
  userId: string;
  name: string;
  status: string;
  parameters?: { s3_prefix?: string } | null;
};

// FileItem moved to files/types.ts
