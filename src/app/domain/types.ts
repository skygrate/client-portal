"use client";

export type DomainItem = {
  userId: string;
  name: string;
  status: string;
  s3_prefix: string;
  infraReady?: boolean;
  url?: string;
};

// FileItem moved to files/types.ts
