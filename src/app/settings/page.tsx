"use client";

import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useCurrentUserId } from "../domain/hooks/useCurrentUserId";
import { useUserProfile } from "./hooks/useUserProfile";
import { SettingsForm } from "./components/SettingsForm";

export default function Settings() {
  const { t } = useTranslation();
  const { userId, loading: userLoading } = useCurrentUserId();
  const { profile, setProfile, loading: profileLoading, error, save } = useUserProfile(userId);

  const loading = userLoading || profileLoading;

  return (
    <div className="p-6 max-w-2x1 ml-10">
      {loading ? (
        <div>Loading…</div>
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
            } catch (e: any) {
              toast.error(t("reusable.error", { defaultValue: "Error" }), {
                description: e?.message ?? "Save failed.",
                duration: 3000,
              });
            }
          }}
        />
      )}
      {error && (
        <div className="mt-4 text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
}
