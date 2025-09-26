"use client";

import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCurrentUserId } from "@shared/auth/useCurrentUserId";
import { useUserProfile } from "./hooks/useUserProfile";
import { SettingsForm } from "./components/SettingsForm";

export default function Settings() {
  const { t } = useTranslation();
  const { userId, loading: userLoading } = useCurrentUserId();
  const { profile, setProfile, loading: profileLoading, error, save } = useUserProfile(userId);

  const loading = userLoading || profileLoading;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">{t('settings.header')}</h1>

      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-red-700">{error}</div>
      )}

      <div className="rounded-2xl border p-4 shadow-sm bg-white">
        {loading ? (
          <p className="text-sm text-gray-600">{t('reusable.loading')}</p>
        ) : (
          <SettingsForm
            profile={profile}
            setProfile={setProfile}
            loading={loading}
            onSave={async () => {
              try {
                await save();
                toast.success(t("reusable.saved"), {
                  description: t("settings.data_saved"),
                  duration: 3000,
                });
              } catch (e: unknown) {
                const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message?: string }).message) : 'Save failed.';
                toast.error(t("reusable.error", { defaultValue: "Error" }), {
                  description: msg,
                  duration: 3000,
                });
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
