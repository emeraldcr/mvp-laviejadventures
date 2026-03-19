// lib/constants/storage.ts
// Keys for sessionStorage and localStorage used across the app.

/** localStorage key for the user's selected language */
export const LANGUAGE_STORAGE_KEY = "lva-lang";

/** Custom window event dispatched when the language changes */
export const LANGUAGE_CHANGE_EVENT = "lva-lang-change";

/** sessionStorage key for the path to return to after completing a reservation */
export const RESERVATION_RETURN_KEY = "reservationReturnPath";

/** sessionStorage key for persisting the AI booking conversation state */
export const AI_BOOKING_SESSION_KEY = "aiBookingConversationState";
