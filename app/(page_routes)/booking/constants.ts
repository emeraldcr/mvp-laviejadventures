export const DEFAULT_TOUR_PACKAGE = {
  es: "Tour Ciudad Esmeralda",
  en: "Ciudad Esmeralda Tour",
} as const;

export const RESERVATIONS_COLLECTION = "Reservations";

export const BOOKING_COPY = {
  welcome: {
    es: "Bienvenido de vuelta",
    en: "Welcome back",
  },
  title: {
    es: "Mis Reservas",
    en: "My Bookings",
  },
  bookNewTour: {
    es: "Reservar Nuevo Tour",
    en: "Book New Tour",
  },
  signOut: {
    es: "Cerrar sesion",
    en: "Sign out",
  },
  noBookings: {
    es: "Aun no tienes reservas. Reserva tu primera aventura.",
    en: "You have no bookings yet. Book your first adventure!",
  },
  browseTours: {
    es: "Ver tours",
    en: "Browse tours",
  },
  upcoming: {
    es: "Proximas",
    en: "Upcoming",
  },
  past: {
    es: "Historial",
    en: "Past",
  },
  noUpcoming: {
    es: "Sin reservas proximas.",
    en: "No upcoming bookings.",
  },
  noPast: {
    es: "Sin reservas anteriores.",
    en: "No past bookings.",
  },
  ticketLabel: {
    es: "ticket(s)",
    en: "ticket(s)",
  },
  confirmed: {
    es: "Confirmada",
    en: "Confirmed",
  },
  cancelled: {
    es: "Cancelada",
    en: "Cancelled",
  },
  pending: {
    es: "Pendiente",
    en: "Pending",
  },
} as const;

export const CONFIRMED_BOOKING_STATUSES = new Set(["COMPLETED", "CAPTURED", "APPROVED"]);
export const CANCELLED_BOOKING_STATUSES = new Set(["CANCELLED", "VOIDED", "FAILED"]);
