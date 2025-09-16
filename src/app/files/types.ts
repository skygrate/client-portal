"use client";

export type FileItem = {
  path: string;
  size?: number;
  lastModified?: string | Date;
  eTag?: string;
};

