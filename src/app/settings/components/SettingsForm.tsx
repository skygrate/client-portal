"use client";

import { useTranslation } from "react-i18next";
import type { UserProfileForm } from "../hooks/useUserProfile";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  profile: UserProfileForm;
  setProfile: Dispatch<SetStateAction<UserProfileForm>>;
  loading?: boolean;
  onSave: () => Promise<void> | void;
};

export function SettingsForm({ profile, setProfile, loading, onSave }: Props) {
  const { t } = useTranslation();

  const update = <K extends keyof UserProfileForm>(key: K, value: UserProfileForm[K]) => {
    setProfile({ ...profile, [key]: value });
  };

  return (
    <div className="grid grid-cols-[12rem,1fr] gap-x-4 gap-y-3 max-w-xl">
      <h2 className="col-span-2 text-xl text-right font-bold mt-6 mb-2">{t('settings.header')}</h2>

      <label htmlFor="fname" className="text-right self-center">{t('settings.first_name')}</label>
      <input
        id="fname"
        type="text"
        value={profile.firstName}
        onChange={(e) => update('firstName', e.target.value)}
        className="w-full p-2 border rounded"
        disabled={loading}
      />

      <label htmlFor="lname" className="text-right self-center">{t('settings.last_name')}</label>
      <input
        id="lname"
        type="text"
        value={profile.lastName}
        onChange={(e) => update('lastName', e.target.value)}
        className="w-full p-2 border rounded"
        disabled={loading}
      />

      <h2 className="col-span-2 text-xl text-right font-bold mt-6 mb-2">{t('settings.header_invoice')}</h2>

      <label htmlFor="tax" className="text-right self-center">{t('settings.tax_number')}</label>
      <input
        id="tax"
        type="text"
        value={profile.taxNumber}
        onChange={(e) => update('taxNumber', e.target.value)}
        className="w-full p-2 border rounded"
        disabled={loading}
      />

      <label htmlFor="company" className="text-right self-center">{t('settings.company_name')}</label>
      <input
        id="company"
        type="text"
        value={profile.companyName}
        onChange={(e) => update('companyName', e.target.value)}
        className="w-full p-2 border rounded"
        disabled={loading}
      />

      <label htmlFor="address" className="text-right self-center">{t('settings.street')}</label>
      <input
        id="address"
        type="text"
        value={profile.companyAddress}
        onChange={(e) => update('companyAddress', e.target.value)}
        className="w-full p-2 border rounded"
        disabled={loading}
      />

      <label htmlFor="city" className="text-right self-center">{t('settings.city')}</label>
      <input
        id="city"
        type="text"
        value={profile.companyAddressCity}
        onChange={(e) => update('companyAddressCity', e.target.value)}
        className="w-full p-2 border rounded"
        disabled={loading}
      />

      <label htmlFor="postal" className="text-right self-center">{t('settings.postal_code')}</label>
      <input
        id="postal"
        type="text"
        value={profile.companyAddressPostalCode}
        onChange={(e) => update('companyAddressPostalCode', e.target.value)}
        className="w-full p-2 border rounded"
        disabled={loading}
      />

      <div className="col-start-2 flex justify-end">
        <button
          onClick={() => void onSave()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {t('reusable.save')}
        </button>
      </div>
    </div>
  );
}
