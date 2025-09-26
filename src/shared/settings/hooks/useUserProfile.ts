"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserProfileRecord } from "@settings";
import {
  getUserProfileRecord,
  createUserProfileRecord,
  updateUserProfileRecord,
} from "@data/settings";

export type UserProfileForm = {
  firstName: string;
  lastName: string;
  taxNumber: string;
  companyName: string;
  companyAddress: string;
  companyAddressCity: string;
  companyAddressPostalCode: string;
};

const emptyForm: UserProfileForm = {
  firstName: "",
  lastName: "",
  taxNumber: "",
  companyName: "",
  companyAddress: "",
  companyAddressCity: "",
  companyAddressPostalCode: "",
};

export function useUserProfile(userId: string | null) {
  const [profile, setProfile] = useState<UserProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!userId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await getUserProfileRecord(userId);
        if (data) {
          if (!cancelled) {
            setProfile({
              firstName: data.firstName ?? "",
              lastName: data.lastName ?? "",
              taxNumber: data.taxNumber ?? "",
              companyName: data.companyName ?? "",
              companyAddress: data.companyAddress ?? "",
              companyAddressCity: data.companyAddressCity ?? "",
              companyAddressPostalCode: data.companyAddressPostalCode ?? "",
            });
          }
        } else {
          // Create a minimal profile if not exists
          await createUserProfileRecord({ userId, firstName: "" });
          if (!cancelled) setProfile(emptyForm);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message?: string }).message) : 'Failed to load profile.';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const save = useCallback(async () => {
    if (!userId) throw new Error("User ID not available.");
    const payload: UserProfileRecord = { userId, ...profile };
    const existing = await getUserProfileRecord(userId);
    if (existing) {
      await updateUserProfileRecord(payload);
    } else {
      await createUserProfileRecord(payload);
    }
  }, [userId, profile]);

  return { profile, setProfile, loading, error, save } as const;
}
