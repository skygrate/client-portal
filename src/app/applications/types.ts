export type ApplicationItem = {
  userId: string;
  domain: string;
  appName: string;
  type: 'STATIC' | 'WORDPRESS';
  fqdn: string;
  infraReady?: boolean;
  s3Prefix?: string | null;
  subdomain?: string | null;
  toBeDeleted?: boolean;
};

export type AppType = 'STATIC' | 'WORDPRESS';
