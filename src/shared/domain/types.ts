export type DomainItem = {
  userId: string;
  name: string;
  s3_prefix: string;
  infraReady?: boolean;
  url?: string;
  toBeDeleted?: boolean;
};

// FileItem moved to files/types.ts
