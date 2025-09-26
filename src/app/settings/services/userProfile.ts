"use client";

import { amplifyClient } from "@amplify/client";

const client = amplifyClient;

export type UserProfileRecord = {
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  taxNumber?: string | null;
  companyName?: string | null;
  companyAddress?: string | null;
  companyAddressCity?: string | null;
  companyAddressPostalCode?: string | null;
};

export async function getUserProfile(userId: string) {
  const { data } = await client.models.UserProfile.get({ userId });
  return data as UserProfileRecord | null;
}

export async function createUserProfile(payload: UserProfileRecord) {
  await client.models.UserProfile.create(payload);
}

export async function updateUserProfile(payload: UserProfileRecord) {
  await client.models.UserProfile.update(payload);
}
