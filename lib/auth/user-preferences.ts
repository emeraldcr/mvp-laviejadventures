import type { UserPreferences } from "@/lib/auth/types";

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  notifications: {
    emailEnabled: true,
    bookingReminders: true,
    promotions: false,
    weeklySummary: false,
  },
};
