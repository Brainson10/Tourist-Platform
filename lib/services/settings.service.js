import { cache } from "react";
import * as settingsRepository from "@/lib/repositories/settings.repository";

export const DEFAULT_SETTINGS = {
  supportEmail: null,
  supportPhone: null,
  emergencyNumber: "112",
  touristHelpline: "1363",
  autoApproveReviews: false,
  /** ₹ per person per day used for trip budget estimates when a trip has none. */
  defaultDailyBudget: 2500,
};

export const getSettings = cache(async () => {
  try {
    const stored = await settingsRepository.readSettings();
    return { ...DEFAULT_SETTINGS, ...(stored && typeof stored === "object" ? stored : {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
});

export async function saveSettings(values) {
  const saved = await settingsRepository.writeSettings(values);
  return { ...DEFAULT_SETTINGS, ...saved };
}
