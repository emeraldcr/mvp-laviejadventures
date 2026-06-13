export type Booking = {
  id: string;
  orderId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  date: string | null;
  tickets: number | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  tourTime: string | null;
  tourPackage: string | null;
  packagePrice: number | null;
  createdAt: string | null;
};

export type BookingClientProps = {
  bookings: Booking[];
  userName: string | null;
  userEmail: string | null;
};

export type BookingSectionVariant = "upcoming" | "past";

