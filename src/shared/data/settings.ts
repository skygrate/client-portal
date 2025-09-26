import type { UserProfileRecord } from "@settings";

export type SettingsDataSource = {
  getProfile: (userId: string) => Promise<UserProfileRecord | null>;
  createProfile: (payload: UserProfileRecord) => Promise<void>;
  updateProfile: (payload: UserProfileRecord) => Promise<void>;
};

let settingsSource: SettingsDataSource | null = null;

export function configureSettingsDataSource(source: SettingsDataSource) {
  settingsSource = source;
}

function requireSettingsSource(): SettingsDataSource {
  if (!settingsSource) {
    throw new Error(
      "Settings data source not configured. Configure it via configureSettingsDataSource()."
    );
  }
  return settingsSource;
}

export async function getUserProfileRecord(userId: string) {
  return requireSettingsSource().getProfile(userId);
}

export async function createUserProfileRecord(payload: UserProfileRecord) {
  await requireSettingsSource().createProfile(payload);
}

export async function updateUserProfileRecord(payload: UserProfileRecord) {
  await requireSettingsSource().updateProfile(payload);
}
