"use client";

export type DomainItem = {
  userId: string;
  name: string;
  status: string;
  parameters?: { s3_prefix?: string } | null;
};

export type FileItem = {
  path: string;
  size?: number;
  lastModified?: string | Date;
  eTag?: string;
};

