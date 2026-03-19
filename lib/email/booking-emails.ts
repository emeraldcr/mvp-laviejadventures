import { Resend } from "resend";
import { EMAIL_FROM_DEFAULT } from "@/lib/constants/email";

const FROM = process.env.SMTP_FROM || EMAIL_FROM_DEFAULT;
const ADMIN_EMAIL =
  process.env.RESERVATION_CC || "ciudadesmeraldacr@gmail.com";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return null;
  }
  return new Resend(key);
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

const BRAND_GREEN = "#059669";
const BRAND_DARK = "#064e3b";

function baseWrapper(body: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;border:1px solid #d1fae5;overflow:hidden">
        <!-- header -->
        <tr>
          <td style="background:${BRAND_DARK};padding:28px 32px;text-align:center">
            <p style="margin:0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px">La Vieja Adventures</p>
            <p style="margin:4px 0 0;font-size:12px;color:#6ee7b7;letter-spacing:1px;text-transform:uppercase">Ciudad Esmeralda · San Carlos, Costa Rica</p>
          </td>
        </tr>
        <!-- body -->
        ${body}
        <!-- footer -->
        <tr>
          <td style="background:#f0fdf4;padding:20px 32px;text-align:center;border-top:1px solid #d1fae5">
            <p style="margin:0;font-size:12px;color:#6b7280">© La Vieja Adventures · San Carlos, Alajuela, Costa Rica</p>
            <p style="margin:6px 0 0;font-size:12px;color:#6b7280">
              <a href="https://wa.me/50686430807" style="color:${BRAND_GREEN};text-decoration:none">+506 8643-0807</a>
              &nbsp;·&nbsp;
              <a href="mailto:info@laviejaadventures.com" style="color:${BRAND_GREEN};text-decoration:none">info@laviejaadventures.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 0;font-size:13px;color:#6b7280;width:40%">${label}</td>
    <td style="padding:8px 0;font-size:13px;color:#111827;font-weight:600">${value}</td>
  </tr>`;
}

// ─── 1. Customer Confirmation Email ──────────────────────────────────────────

export type CustomerConfirmationParams = {
  to: string;
  name: string;
  phone?: string | null;
  date: string;
  tourTime?: string | null;
  tourName?: string | null;
  tourPackage?: string | null;
  tickets: string | number;
  amount: string | number;
  currency?: string | null;
  orderId: string;
  reservationId?: string | null;
  language?: "es" | "en";
};

function buildCustomerConfirmationHtml(p: CustomerConfirmationParams): string {
  const isEn = p.language === "en";
  const name = p.name || (isEn ? "Adventurer" : "Aventurero/a");
  const amount = `${p.amount} ${p.currency || "USD"}`;
  const pkg = p.tourPackage ? `${p.tourPackage}` : "—";

  const copy = isEn
    ? {
        subject: "Booking Confirmed",
        greeting: `Hi ${name}! 🎉`,
        intro: "Your booking at <strong>La Vieja Adventures</strong> has been confirmed and payment processed. See you at the canyon!",
        detailsTitle: "Booking Details",
        labelDate: "Tour Date",
        labelTime: "Start Time",
        labelTour: "Tour",
        labelPkg: "Package",
        labelPeople: "Participants",
        labelTotal: "Total Paid",
        labelOrderId: "Order ID",
        labelReservationId: "Reservation ID",
        bringTitle: "What to Bring",
        bring: [
          "Clothes you don't mind getting wet (no denim)",
          "Closed-toe shoes or water sandals with straps",
          "Biodegradable sunscreen (required)",
          "Water bottle (refill available at base)",
          "Light snack",
          "Change of clothes and small towel",
        ],
        locationTitle: "How to Get There",
        locationText:
          "Our meeting point is at the La Vieja Adventures base in San Carlos, Costa Rica.",
        mapLabel: "Open in Google Maps",
        mapUrl: "https://maps.app.goo.gl/Hk7Kcj8X3X3X3X3X3",
        waLabel: "WhatsApp for Directions",
        waUrl: "https://wa.me/50686430807?text=Hello!%20I%20need%20directions%20to%20the%20tour",
        inclusionsTitle: "What's Included",
        inclusions: [
          "Harness, helmet, gloves and wetsuit",
          "Technical rappel ropes",
          "Certified bilingual guide",
          "Tour photography and video",
          "Activity insurance",
        ],
        ctaLabel: "View Booking Details",
        ctaUrl: "https://www.laviejaadventures.com/booking",
        closing: "Questions? Write to us on WhatsApp anytime.",
      }
    : {
        subject: "Reserva Confirmada",
        greeting: `¡Hola ${name}! 🎉`,
        intro: "Tu reserva en <strong>La Vieja Adventures</strong> está confirmada y el pago procesado. ¡Te esperamos en el cañón!",
        detailsTitle: "Detalles de tu Reserva",
        labelDate: "Fecha del Tour",
        labelTime: "Hora de Inicio",
        labelTour: "Tour",
        labelPkg: "Paquete",
        labelPeople: "Participantes",
        labelTotal: "Total Pagado",
        labelOrderId: "Número de Orden",
        labelReservationId: "ID de Reservación",
        bringTitle: "¿Qué traer?",
        bring: [
          "Ropa que se pueda mojar (sin jeans/pantalones de tela)",
          "Zapatos cerrados o sandalias de agua con correas",
          "Bloqueador solar biodegradable (obligatorio)",
          "Botella de agua (recarga disponible en la base)",
          "Un snack ligero",
          "Ropa de cambio y toalla pequeña",
        ],
        locationTitle: "¿Cómo llegar?",
        locationText:
          "El punto de encuentro es en la base de La Vieja Adventures en San Carlos, Costa Rica.",
        mapLabel: "Abrir en Google Maps",
        mapUrl: "https://maps.app.goo.gl/Hk7Kcj8X3X3X3X3X3",
        waLabel: "WhatsApp para indicaciones",
        waUrl: "https://wa.me/50686430807?text=Hola!%20Necesito%20indicaciones%20para%20llegar%20al%20tour",
        inclusionsTitle: "¿Qué está incluido?",
        inclusions: [
          "Arnés, casco, guantes y neopreno",
          "Cuerdas técnicas de rappel",
          "Guía certificado bilingüe",
          "Fotografía y video del tour",
          "Seguro de actividad",
        ],
        ctaLabel: "Ver mis Reservas",
        ctaUrl: "https://www.laviejaadventures.com/booking",
        closing: "¿Preguntas? Escríbenos por WhatsApp cuando quieras.",
      };

  const body = `
    <tr><td style="padding:28px 32px 4px">
      <p style="margin:0;font-size:24px;font-weight:800;color:#111827">${copy.subject} ✅</p>
      <p style="margin:10px 0 0;font-size:15px;color:#374151">${copy.greeting}</p>
      <p style="margin:8px 0 0;font-size:15px;color:#374151">${copy.intro}</p>
    </td></tr>

    <!-- Booking details card -->
    <tr><td style="padding:16px 32px">
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px 24px">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:${BRAND_GREEN};text-transform:uppercase;letter-spacing:1px">${copy.detailsTitle}</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${detailRow(copy.labelDate, p.date)}
          ${p.tourTime ? detailRow(copy.labelTime, p.tourTime) : ""}
          ${p.tourName ? detailRow(copy.labelTour, p.tourName) : ""}
          ${detailRow(copy.labelPkg, pkg)}
          ${detailRow(copy.labelPeople, String(p.tickets))}
          ${detailRow(copy.labelTotal, amount)}
          ${detailRow(copy.labelOrderId, p.orderId)}
          ${p.reservationId ? detailRow(copy.labelReservationId, p.reservationId) : ""}
        </table>
      </div>
    </td></tr>

    <!-- What to bring -->
    <tr><td style="padding:4px 32px 4px">
      <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#111827">${copy.bringTitle}</p>
      <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8">
        ${copy.bring.map((b) => `<li>${b}</li>`).join("")}
      </ul>
    </td></tr>

    <!-- What's included -->
    <tr><td style="padding:16px 32px 4px">
      <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#111827">${copy.inclusionsTitle}</p>
      <ul style="margin:0;padding-left:20px;color:#374151;font-size:14px;line-height:1.8">
        ${copy.inclusions.map((i) => `<li>${i}</li>`).join("")}
      </ul>
    </td></tr>

    <!-- How to get there -->
    <tr><td style="padding:16px 32px">
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:16px 20px">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#92400e">${copy.locationTitle}</p>
        <p style="margin:0 0 12px;font-size:13px;color:#78350f">${copy.locationText}</p>
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:8px">
            <a href="${copy.mapUrl}" style="display:inline-block;background:${BRAND_GREEN};color:#fff;text-decoration:none;padding:9px 16px;border-radius:8px;font-size:12px;font-weight:600">${copy.mapLabel}</a>
          </td>
          <td>
            <a href="${copy.waUrl}" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:9px 16px;border-radius:8px;font-size:12px;font-weight:600">${copy.waLabel}</a>
          </td>
        </tr></table>
      </div>
    </td></tr>

    <!-- CTA -->
    <tr><td style="padding:8px 32px 28px;text-align:center">
      <p style="margin:0 0 14px;font-size:13px;color:#6b7280">${copy.closing}</p>
      <a href="${copy.ctaUrl}" style="display:inline-block;background:${BRAND_DARK};color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:13px;font-weight:600">${copy.ctaLabel}</a>
    </td></tr>
  `;

  return baseWrapper(body);
}

export async function sendCustomerConfirmationEmail(
  p: CustomerConfirmationParams
) {
  const resend = getResend();
  if (!resend) return;

  const isEn = p.language === "en";
  const subject = isEn
    ? `✅ Booking Confirmed — ${p.date} · La Vieja Adventures`
    : `✅ Reserva Confirmada — ${p.date} · La Vieja Adventures`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: p.to,
    subject,
    html: buildCustomerConfirmationHtml(p),
  });

  if (error) console.error("sendCustomerConfirmationEmail error:", error);
  else console.log("Customer confirmation email sent to", p.to);
}

// ─── 2. Admin Notification Email (internal, keeps existing fields) ────────────

export type AdminNotificationParams = CustomerConfirmationParams & {
  captureId?: string | null;
  status?: string | null;
};

export async function sendAdminBookingNotification(
  p: AdminNotificationParams
) {
  const resend = getResend();
  if (!resend) return;

  const na = "N/D";
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="font-family:system-ui,sans-serif;padding:24px">
  <h2 style="color:${BRAND_DARK}">Nueva Reservación — La Vieja Adventures</h2>
  <ul style="line-height:2;font-size:14px">
    <li><b>Nombre:</b> ${p.name}</li>
    <li><b>Email:</b> ${p.to}</li>
    <li><b>Teléfono:</b> ${p.phone ?? na}</li>
    <li><b>Fecha:</b> ${p.date}</li>
    <li><b>Hora:</b> ${p.tourTime ?? na}</li>
    <li><b>Tour:</b> ${p.tourName ?? na}</li>
    <li><b>Paquete:</b> ${p.tourPackage ?? na}</li>
    <li><b>Participantes:</b> ${p.tickets}</li>
    <li><b>Total:</b> ${p.amount} ${p.currency ?? "USD"}</li>
    <li><b>Estado de pago:</b> ${p.status ?? na}</li>
    <li><b>Order ID (PayPal):</b> ${p.orderId}</li>
    <li><b>Capture ID:</b> ${p.captureId ?? na}</li>
    <li><b>ID MongoDB:</b> ${p.reservationId ?? na}</li>
  </ul>
  <p style="background:#fef9c3;padding:10px 14px;border-radius:8px;font-size:13px">
    Contacto reservas (Allan): <a href="https://wa.me/message/IVJFG5N6K6VVB1">+506 6233 2535</a>
  </p>
</body></html>`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Nueva reserva: ${p.name} — ${p.date} — ${p.orderId}`,
    html,
  });

  if (error) console.error("sendAdminBookingNotification error:", error);
  else console.log("Admin notification email sent");
}

// ─── 3. Pre-Tour Reminder Email (48h before) ─────────────────────────────────

export type PreTourReminderParams = {
  to: string;
  name: string;
  date: string;
  tourTime?: string | null;
  tourName?: string | null;
  tourPackage?: string | null;
  tickets: number | string;
  orderId: string;
  language?: "es" | "en";
};

function buildPreTourHtml(p: PreTourReminderParams): string {
  const isEn = p.language === "en";
  const name = p.name || (isEn ? "Adventurer" : "Aventurero/a");

  const copy = isEn
    ? {
        headline: "Your Adventure is in 2 Days! 🏔️",
        greeting: `Hi ${name}!`,
        intro: "This is a reminder that your canyon adventure at <strong>La Vieja Adventures</strong> is just <strong>48 hours away</strong>. Here's everything you need to prepare.",
        detailsTitle: "Your Tour Details",
        labelDate: "Date",
        labelTime: "Start Time",
        labelTour: "Tour",
        labelPkg: "Package",
        labelPeople: "Participants",
        checklistTitle: "✅ Full Preparation Checklist",
        clothing: {
          title: "Clothing & Footwear",
          items: [
            "Quick-dry clothes or swimsuit (no jeans or cotton)",
            "Closed-toe shoes with grip OR water sandals with ankle strap",
            "Optional: neoprene socks for cold water (we provide wetsuit)",
          ],
        },
        gear: {
          title: "What to Bring",
          items: [
            "Biodegradable sunscreen — conventional sunscreen is NOT allowed in the canyon",
            "Water bottle (1L minimum) — refill station available",
            "Light snack (granola bar, fruit)",
            "Change of clothes and small towel",
            "Waterproof bag for phone and valuables (we provide bags)",
            "Cash for optional extras at the base (snacks, merchandise)",
          ],
        },
        leave: {
          title: "Leave at Home",
          items: [
            "Jewelry and accessories",
            "Non-waterproof electronics (unless in dry bag)",
            "Glass containers",
          ],
        },
        meetingTitle: "📍 Meeting Point & Schedule",
        meetingItems: [
          "Arrive 20 minutes before your scheduled start time",
          "Meeting point: La Vieja Adventures base, San Carlos, Costa Rica",
          "We'll do a safety briefing and equipment fitting before descending",
        ],
        mapLabel: "Open in Google Maps",
        mapUrl: "https://maps.app.goo.gl/Hk7Kcj8X3X3X3X3X3",
        waLabel: "Need Directions? WhatsApp Us",
        waUrl: "https://wa.me/50686430807?text=Hello!%20I%20have%20a%20tour%20booking%20and%20need%20directions.",
        weatherTitle: "🌧️ Weather Policy",
        weatherText:
          "Our tours run in light rain — that's part of the adventure! We only cancel due to lightning storms or dangerous river levels. We'll WhatsApp you if there are any changes.",
        emergencyTitle: "Last-Minute Questions?",
        emergencyText:
          "Write to us on WhatsApp or call us directly:",
        phone: "+506 8643-0807",
        excitement: "We can't wait to share this experience with you! 🌿",
      }
    : {
        headline: "¡Tu Aventura es en 2 Días! 🏔️",
        greeting: `¡Hola ${name}!`,
        intro: "Este es un recordatorio de que tu aventura en el cañón de <strong>La Vieja Adventures</strong> es en <strong>48 horas</strong>. Aquí tienes todo lo que necesitas para prepararte.",
        detailsTitle: "Detalles de tu Tour",
        labelDate: "Fecha",
        labelTime: "Hora de inicio",
        labelTour: "Tour",
        labelPkg: "Paquete",
        labelPeople: "Participantes",
        checklistTitle: "✅ Lista de Preparación Completa",
        clothing: {
          title: "Ropa y Calzado",
          items: [
            "Ropa de secado rápido o traje de baño (sin jeans ni algodón grueso)",
            "Zapatos cerrados con suela de agarre O sandalias de agua con correa en el tobillo",
            "Opcional: calcetines de neopreno para agua fría (nosotros proveemos neopreno)",
          ],
        },
        gear: {
          title: "Qué Traer",
          items: [
            "Bloqueador solar biodegradable — el bloqueador convencional NO está permitido en el cañón",
            "Botella de agua (mínimo 1 litro) — punto de recarga disponible",
            "Snack ligero (barra de granola, fruta)",
            "Ropa de cambio y toalla pequeña",
            "Bolsa impermeable para celular y objetos de valor (nosotros proveemos bolsas)",
            "Efectivo para extras opcionales en la base (snacks, recuerdos)",
          ],
        },
        leave: {
          title: "Dejar en Casa",
          items: [
            "Joyas y accesorios",
            "Electrónicos no impermeables (salvo en bolsa seca)",
            "Recipientes de vidrio",
          ],
        },
        meetingTitle: "📍 Punto de Encuentro y Horario",
        meetingItems: [
          "Llegar 20 minutos antes de tu hora programada",
          "Punto de encuentro: Base de La Vieja Adventures, San Carlos, Costa Rica",
          "Haremos un briefing de seguridad y ajuste de equipo antes de descender",
        ],
        mapLabel: "Abrir en Google Maps",
        mapUrl: "https://maps.app.goo.gl/Hk7Kcj8X3X3X3X3X3",
        waLabel: "¿Necesitas indicaciones? Escríbenos",
        waUrl: "https://wa.me/50686430807?text=Hola!%20Tengo%20una%20reserva%20de%20tour%20y%20necesito%20indicaciones.",
        weatherTitle: "🌧️ Política de Clima",
        weatherText:
          "Nuestros tours operan con lluvia ligera — ¡es parte de la aventura! Solo cancelamos por tormentas eléctricas o niveles de río peligrosos. Te avisaremos por WhatsApp si hay cambios.",
        emergencyTitle: "¿Preguntas de Último Momento?",
        emergencyText: "Escríbenos por WhatsApp o llámanos directamente:",
        phone: "+506 8643-0807",
        excitement: "¡Estamos muy emocionados de compartir esta experiencia contigo! 🌿",
      };

  const listSection = (title: string, items: string[]) =>
    `<p style="margin:14px 0 6px;font-size:13px;font-weight:700;color:#374151">${title}</p>
     <ul style="margin:0;padding-left:20px;font-size:13px;color:#374151;line-height:1.8">
       ${items.map((i) => `<li>${i}</li>`).join("")}
     </ul>`;

  const body = `
    <tr><td style="padding:28px 32px 8px">
      <p style="margin:0;font-size:22px;font-weight:800;color:#111827">${copy.headline}</p>
      <p style="margin:10px 0 0;font-size:15px;color:#374151">${copy.greeting}</p>
      <p style="margin:8px 0 0;font-size:15px;color:#374151">${copy.intro}</p>
    </td></tr>

    <!-- Tour details -->
    <tr><td style="padding:8px 32px">
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:16px 20px">
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:${BRAND_GREEN};text-transform:uppercase;letter-spacing:1px">${copy.detailsTitle}</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${detailRow(copy.labelDate, p.date)}
          ${p.tourTime ? detailRow(copy.labelTime, p.tourTime) : ""}
          ${p.tourName ? detailRow(copy.labelTour, p.tourName) : ""}
          ${p.tourPackage ? detailRow(copy.labelPkg, p.tourPackage) : ""}
          ${detailRow(copy.labelPeople, String(p.tickets))}
          ${detailRow("Order ID", p.orderId)}
        </table>
      </div>
    </td></tr>

    <!-- Checklist -->
    <tr><td style="padding:8px 32px">
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:16px 20px">
        <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#111827">${copy.checklistTitle}</p>
        ${listSection(copy.clothing.title, copy.clothing.items)}
        ${listSection(copy.gear.title, copy.gear.items)}
        ${listSection(copy.leave.title, copy.leave.items)}
      </div>
    </td></tr>

    <!-- Meeting point -->
    <tr><td style="padding:8px 32px">
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:14px;padding:16px 20px">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#92400e">${copy.meetingTitle}</p>
        <ul style="margin:0 0 12px;padding-left:20px;font-size:13px;color:#78350f;line-height:1.8">
          ${copy.meetingItems.map((i) => `<li>${i}</li>`).join("")}
        </ul>
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="padding-right:8px">
            <a href="${copy.mapUrl}" style="display:inline-block;background:${BRAND_GREEN};color:#fff;text-decoration:none;padding:9px 16px;border-radius:8px;font-size:12px;font-weight:600">${copy.mapLabel}</a>
          </td>
          <td>
            <a href="${copy.waUrl}" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:9px 16px;border-radius:8px;font-size:12px;font-weight:600">${copy.waLabel}</a>
          </td>
        </tr></table>
      </div>
    </td></tr>

    <!-- Weather -->
    <tr><td style="padding:8px 32px">
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:14px;padding:14px 18px">
        <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1e40af">${copy.weatherTitle}</p>
        <p style="margin:0;font-size:13px;color:#1e3a8a">${copy.weatherText}</p>
      </div>
    </td></tr>

    <!-- Emergency contact -->
    <tr><td style="padding:8px 32px 28px;text-align:center">
      <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#111827">${copy.emergencyTitle}</p>
      <p style="margin:0 0 12px;font-size:13px;color:#6b7280">${copy.emergencyText}</p>
      <a href="https://wa.me/50686430807" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;padding:11px 24px;border-radius:10px;font-size:13px;font-weight:600;margin-right:8px">WhatsApp</a>
      <a href="tel:+50686430807" style="display:inline-block;background:${BRAND_DARK};color:#fff;text-decoration:none;padding:11px 24px;border-radius:10px;font-size:13px;font-weight:600">${copy.phone}</a>
      <p style="margin:20px 0 0;font-size:14px;color:${BRAND_GREEN};font-weight:600">${copy.excitement}</p>
    </td></tr>
  `;

  return baseWrapper(body);
}

export async function sendPreTourReminderEmail(p: PreTourReminderParams) {
  const resend = getResend();
  if (!resend) return;

  const isEn = p.language === "en";
  const subject = isEn
    ? `🏔️ Your adventure at La Vieja Adventures is in 2 days — ${p.date}`
    : `🏔️ Tu aventura en La Vieja Adventures es en 2 días — ${p.date}`;

  const { error } = await resend.emails.send({
    from: FROM,
    to: p.to,
    subject,
    html: buildPreTourHtml(p),
  });

  if (error) console.error("sendPreTourReminderEmail error:", error);
  else console.log("Pre-tour reminder sent to", p.to);
}
