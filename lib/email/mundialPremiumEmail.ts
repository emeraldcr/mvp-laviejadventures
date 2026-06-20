import { Resend } from "resend";
import { EMAIL_FROM_DEFAULT, APP_BASE_URL_DEFAULT } from "@/lib/constants/email";

const FROM = process.env.SMTP_FROM || EMAIL_FROM_DEFAULT;
const BASE_URL = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_BASE_URL || APP_BASE_URL_DEFAULT;

function client() {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.warn("[mundialPremiumEmail] RESEND_API_KEY not set"); return null; }
  return new Resend(key);
}

function esc(v: string) {
  return v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function wrap(title: string, body: string) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="font-family:system-ui,sans-serif;background:#0a160d;margin:0;padding:32px 16px">
<div style="max-width:540px;margin:0 auto;background:#06100b;border-radius:18px;padding:40px;border:1px solid #1a3020">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px">
    <span style="font-size:26px">🏆</span>
    <span style="font-size:11px;font-weight:800;color:#9dff34;letter-spacing:0.12em;text-transform:uppercase">Quiniela Mundial 2026 · Premium</span>
  </div>
  <h1 style="font-size:24px;font-weight:900;color:#f0b429;margin:0 0 16px;line-height:1.2">${title}</h1>
  ${body}
  <hr style="border:none;border-top:1px solid #1a3020;margin:32px 0"/>
  <p style="color:#2a4030;font-size:11px;margin:0">La Vieja Adventures · Quiniela Mundial 2026. Correo automático.</p>
</div></body></html>`;
}

function featureItem(emoji: string, text: string) {
  return `<li style="color:#8ab89a;font-size:14px;margin:0 0 8px;line-height:1.5"><span style="margin-right:6px">${emoji}</span>${text}</li>`;
}

export async function sendPremiumWelcomeEmail(params: { to: string; playerName: string }) {
  const c = client();
  if (!c) return;

  const { error } = await c.emails.send({
    from: FROM,
    to: params.to,
    subject: "¡Acceso Premium Activado! 🏆 — Quiniela Mundial 2026",
    html: wrap(
      `¡Bienvenido al Premium, ${esc(params.playerName)}!`,
      `<p style="color:#8ab89a;font-size:15px;margin:0 0 20px">Tu pago fue procesado exitosamente. Ya tenés acceso completo a todas las apuestas y pronósticos de eliminación directa del Mundial 2026.</p>
      <div style="background:#0b1f12;border:1px solid #1e3a24;border-radius:12px;padding:20px 20px 12px;margin:0 0 24px">
        <p style="color:#9dff34;font-size:12px;font-weight:800;margin:0 0 14px;text-transform:uppercase;letter-spacing:0.1em">¿Qué incluye tu acceso?</p>
        <ul style="margin:0;padding:0;list-style:none">
          ${featureItem("📋", "Pronósticos de Octavos, Cuartos, Semis, 3er Lugar y Final")}
          ${featureItem("🏆", "Apuesta Campeón del Torneo")}
          ${featureItem("👟", "Bota de Oro — Goleador del Mundial")}
          ${featureItem("⭐", "Balón de Oro — MVP del torneo")}
          ${featureItem("🎯", "Marcador exacto de la Final")}
          ${featureItem("🔮", "Mis Semifinalistas")}
          ${featureItem("🥅", "¿Final a los penales?")}
          ${featureItem("🥉", "Ganador del Tercer Lugar")}
          ${featureItem("💥", "Mayor Goleada del torneo")}
          ${featureItem("⚡", "Primera Gran Sorpresa")}
          ${featureItem("🎰", "Combo Maestro — El bet supremo")}
        </ul>
      </div>
      <a href="${BASE_URL}/mundial" style="display:inline-block;background:#f0b429;color:#07110b;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:900;font-size:15px;letter-spacing:0.02em">Ir a mis Apuestas Premium →</a>`
    ),
  });

  if (error) console.error("[mundialPremiumEmail] error:", error);
}
