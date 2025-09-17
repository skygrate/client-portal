"use client";

import amplifyOutputs from "../../../amplify_outputs.json";

export function getBillingBucketName(): string {
  const buckets = (amplifyOutputs as any)?.storage?.buckets as Array<{ name: string; bucket_name: string }> | undefined;
  const found = buckets?.find((b) => b.name === "billing");
  if (found?.bucket_name) return found.bucket_name;
  throw new Error("Billing storage bucket not found in amplify_outputs.json. Ensure storage 'billing' is deployed.");
}
