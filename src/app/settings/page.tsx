"use client"
import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { fetchUserAttributes } from "aws-amplify/auth";
import type { Schema } from "../../../amplify/data/resource";
import { useTranslation } from "react-i18next";
import { toast } from 'sonner';

export default function Settings() {
  const [userId, setUserId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("")
  const [taxNumber, setTaxNumber] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyAddressCity, setCompanyAddressCity] = useState("")
  const [companyAddressPostalCode, setCompanyAddressPostalCode] = useState("")
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation()
  const client = generateClient<Schema>();

  // Step 1: Get the user's Cognito sub
  useEffect(() => {
    const fetchSub = async () => {
      try {
        const attributes = await fetchUserAttributes();
        if (attributes.sub) {
          console.log("🔐 Cognito user sub:", attributes.sub);
          setUserId(attributes.sub);
        } else {
          console.warn("⚠️ No 'sub' found in user attributes.");
          setLoading(false); // Fail early
        }
      } catch (error) {
        console.error("❌ Failed to fetch user attributes:", error);
        setLoading(false); // Avoid stuck loading
      }
    };

    fetchSub();
  }, []);

  // Step 2: Load or create profile
  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      try {
        const { data } = await client.models.UserProfile.get({ userId });

        if (data) {
          console.log("✅ Loaded profile:", data);
          setFirstName(data.firstName ?? "");
          setLastName(data.lastName ?? "")
          setTaxNumber(data.taxNumber ?? "")
          setCompanyName(data.companyName ?? "")
          setCompanyAddress(data.companyAddress ?? "")
          setCompanyAddressCity(data.companyAddressCity ?? "")
          setCompanyAddressPostalCode(data.companyAddressPostalCode ?? "")
        } else {
          console.log("🆕 No profile found. Creating one.");
          await client.models.UserProfile.create({ userId, firstName: "" });
        }
      } catch (error) {
        console.error("❌ Failed to load or create profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, client.models.UserProfile]);

  // Step 3: Save
  const save = async () => {
    if (!userId) {
      alert("User ID not available.");
      return;
    }

    try {
      const { data } = await client.models.UserProfile.get({ userId });

      if (data) {
        await client.models.UserProfile.update({ userId, 
          firstName, 
          lastName, 
          taxNumber, 
          companyName, 
          companyAddress, 
          companyAddressCity, 
          companyAddressPostalCode});
        console.log("💾 Updated profile.");
      } else {
        await client.models.UserProfile.create({ userId, 
          firstName, 
          lastName, 
          taxNumber, 
          companyName, 
          companyAddress, 
          companyAddressCity, 
          companyAddressPostalCode});
        console.log("🆕 Created new profile on save.");
      }

      toast.success(t("reusable.saved"), 
        {description: t("settings.data_saved"),
          duration: 3000,
        }
      );
    } catch (error) {
      console.error("❌ Save failed:", error);
      alert("Save failed.");
    }
  };

  return (
    <div className="p-6 max-w-2x1 ml-10">
      {loading ? (
        <div>Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-[12rem,1fr] gap-x-4 gap-y-3 max-w-xl">
            <h2 className="col-span-2 text-xl text-right font-bold mt-6 mb-2">{t('settings.header')}</h2>
            <label htmlFor="fname" className="text-right self-center">{t('settings.first_name')}</label>
            <input
              id="fname"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <label htmlFor="lname" className="text-right self-center">{t('settings.last_name')}</label>
            <input
              id="lname"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            {/* invoice data */}
            <h2 className="col-span-2 text-xl text-right font-bold mt-6 mb-2">{t('settings.header_invoice')}</h2>
            <label htmlFor="tax" className="text-right self-center">{t('settings.tax_number')}</label>
            <input
              id="tax"
              type="text"
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <label htmlFor="company" className="text-right self-center">{t('settings.company_name')}</label>
            <input
              id="company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <label htmlFor="address" className="text-right self-center">{t('settings.street')}</label>
            <input
              id="address"
              type="text"
              value={companyAddress}
              onChange={(e) => setCompanyAddress(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <label htmlFor="city" className="text-right self-center">{t('settings.city')}</label>
            <input
              id="city"
              type="text"
              value={companyAddressCity}
              onChange={(e) => setCompanyAddressCity(e.target.value)}
              className="w-full p-2 border rounded"
            />    
            <label htmlFor="postal" className="text-right self-center">{t('settings.postal_code')}</label>
            <input
              id="postal"
              type="text"
              value={companyAddressPostalCode}
              onChange={(e) => setCompanyAddressPostalCode(e.target.value)}
              className="w-full p-2 border rounded"
            />
            <div className="col-start-2 flex justify-end">
              <button
                onClick={save}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {t('reusable.save')}
              </button>
            </div>
          </div>

        </>
      )}
    </div>
  );
}
