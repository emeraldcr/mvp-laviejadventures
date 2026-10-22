export type SendEmailParams = {
  to: string | null;
  name: string | null;
  phone: string | null;
  date: string | null;
  tickets: string | number | null;
  amount: string | number | null;
  currency: string | null;
  orderId: string;
  captureId: string | null;
  status: string | null;
  reservationId: string | null;
  language?: "es" | "en";
  tourName?: string | null;
  tourPackage?: string | null;
  tourTime?: string | null;
};
