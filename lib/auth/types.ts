export type UserPreferences = {
  notifications: {
    emailEnabled: boolean;
    bookingReminders: boolean;
    promotions: boolean;
    weeklySummary: boolean;
  };
};



// ── Tour summary (used in booking UI and reservation hooks) ──────────────────
