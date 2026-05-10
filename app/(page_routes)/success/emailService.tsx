// app/payment/success/emailService.ts
import { Resend } from "resend";
import type { SendEmailParams } from "@/lib/types";

export async function sendConfirmationEmail(params: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set, skipping email sending");
    return;
  }

  const resend = new Resend(apiKey);
  const adminEmail = process.env.RESERVATION_CC || "ciudadesmeraldacr@gmail.com";
  const from =
    process.env.SMTP_FROM ||
    `"La Vieja Adventures" <noreply@laviejaadventures.com>`;

  const html = createMailBody(params);

  const { error } = await resend.emails.send({
    from,
    to: params.to || adminEmail,
    cc: adminEmail,
    subject: `${params.language === "en" ? "New booking created" : "Nueva reservación creada"}: ${params.orderId}`,
    html,
  });

  if (error) {
    console.error("Resend error:", error);
  } else {
    console.log("Confirmation email sent via Resend");
  }
}

function createMailBody(params: SendEmailParams): string {
  const isEnglish = params.language === "en";
  const copy = isEnglish
    ? {
        title: "New Booking - La Vieja Adventures",
        heading: "New Booking",
        greeting: "Hello,",
        intro: "A new booking has been created with the following details:",
        fullName: "Full Name",
        email: "Email",
        phone: "Phone",
        date: "Experience Date",
        tickets: "Number of Tickets",
        tour: "Tour",
        package: "Selected Package",
        tourTime: "Tour Time",
        total: "Total Paid",
        orderId: "Order ID (PayPal)",
        paymentId: "Payment / Transaction ID",
        paymentStatus: "Payment Status",
        reservationId: "Reservation ID (MongoDB)",
        assistance: "Contact the reservations manager (Allan) at",
        assistanceSuffix: "for further assistance.",
        regards: "Best regards,",
      }
    : {
        title: "Nueva Reservación - La Vieja Adventures",
        heading: "Nueva Reservación",
        greeting: "Hola,",
        intro: "Una nueva reservación se ha creado con los siguientes detalles:",
        fullName: "Nombre Completo",
        email: "Correo Electrónico",
        phone: "Teléfono",
        date: "Fecha de la experiencia",
        tickets: "Cantidad de tickets",
        tour: "Tour",
        package: "Paquete elegido",
        tourTime: "Hora del tour",
        total: "Total Pagado",
        orderId: "ID de la Orden (PayPal)",
        paymentId: "ID de Pago / Transacción",
        paymentStatus: "Estado del pago",
        reservationId: "ID de Reservación (MongoDB)",
        assistance: "Contacte al manager de reservas (Allan) al",
        assistanceSuffix: "para mayor asistencia.",
        regards: "Saludos,",
      };

  const naLabel = isEnglish ? "N/A" : "N/D";
  const displayName = params.name ?? (isEnglish ? "Customer" : "Cliente");
  const displayDate = params.date ?? naLabel;
  const displayTickets = params.tickets ?? naLabel;
  const displayAmount = params.amount != null ? `${params.amount} ${params.currency || "USD"}` : naLabel;
  const displayOrderId = params.orderId || naLabel;
  const displayCaptureId = params.captureId ?? naLabel;
  const displayStatus = params.status ?? naLabel;
  const displayReservationId = params.reservationId ?? naLabel;
  const displayPhone = params.phone ?? naLabel;
  const displayTourName = params.tourName ?? naLabel;
  const displayTourPackage = params.tourPackage ?? naLabel;
  const displayTourTime = params.tourTime ?? naLabel;

  return `<!DOCTYPE html>
<html>
<head>
  <title>${copy.title}</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    h1 { font-size: 24px; font-weight: bold; }
    .marked { background-color: yellow; padding: 4px; }
    ul { line-height: 1.5; }
  </style>
</head>
<body>
  <h1>${copy.heading}</h1>
  <p>${copy.greeting}</p>
  <p>${copy.intro}</p>
  <ul>
    <li><b>${copy.fullName}:</b> ${displayName}</li>
    <li><b>${copy.email}:</b> ${params.to ?? naLabel}</li>
    <li><b>${copy.phone}:</b> ${displayPhone}</li>
    <li><b>${copy.date}:</b> ${displayDate}</li>
    <li><b>${copy.tickets}:</b> ${displayTickets}</li>
    <li><b>${copy.tour}:</b> ${displayTourName}</li>
    <li><b>${copy.package}:</b> ${displayTourPackage}</li>
    <li><b>${copy.tourTime}:</b> ${displayTourTime}</li>
    <li><b>${copy.total}:</b> ${displayAmount}</li>
    <li><b>${copy.orderId}:</b> ${displayOrderId}</li>
    <li><b>${copy.paymentId}:</b> ${displayCaptureId}</li>
    <li><b>${copy.paymentStatus}:</b> ${displayStatus}</li>
    <li><b>${copy.reservationId}:</b> ${displayReservationId}</li>
  </ul>
  <p class="marked">
    ${copy.assistance}
    <a href="https://wa.me/message/IVJFG5N6K6VVB1" target="_blank">+506 6233 2535</a>
    ${copy.assistanceSuffix}
  </p>
  <p>${copy.regards}</p>
  <p>La Vieja Adventures</p>
  <p>Ciudad Esmeralda Tour</p>
</body>
</html>`;
}