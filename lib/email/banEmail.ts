// lib/email/banEmail.ts
import { Resend } from "resend";
import { EMAIL_FROM_DEFAULT, APP_BASE_URL_DEFAULT } from "@/lib/constants/email";

const FROM = process.env.SMTP_FROM || EMAIL_FROM_DEFAULT;
const BASE_URL = process.env.APP_BASE_URL || APP_BASE_URL_DEFAULT;

function resend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[banEmail] RESEND_API_KEY not set — email not sent");
    return null;
  }
  return new Resend(key);
}

function esc(v: string) {
  return v
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function codeBlock(code: string) {
  return `<div style="margin:24px auto;width:fit-content;background:#f4f4f5;border:1px solid #e4e4e7;border-radius:12px;padding:20px 40px;font-size:32px;font-weight:900;letter-spacing:10px;font-family:monospace;color:#18181b">${esc(code)}</div>`;
}

function emailWrapper(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family:system-ui,sans-serif;background:#f4f4f5;margin:0;padding:32px 16px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:40px;border:1px solid #e4e4e7">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px">
        <span style="font-size:28px">⚽</span>
        <span style="font-size:13px;font-weight:600;color:#71717a;letter-spacing:0.05em">QUINIELA MUNDIAL 2026</span>
      </div>
      <h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 12px">${title}</h1>
      ${body}
      <hr style="border:none;border-top:1px solid #e4e4e7;margin:32px 0" />
      <p style="color:#a1a1aa;font-size:11px;margin:0">
        Este correo fue enviado automáticamente por el sistema de recuperación de cuenta de La Vieja Adventures.
        Si no solicitaste este proceso, ignora este mensaje.
      </p>
    </div>
  </body>
</html>`;
}

export async function sendEmailVerificationCode(params: {
  to: string;
  playerName: string;
  code: string;
  ticketId: string;
}) {
  const client = resend();
  if (!client) return;

  const { error } = await client.emails.send({
    from: FROM,
    to: params.to,
    subject: `${params.code} — Código de verificación de email | Quiniela Mundial`,
    html: emailWrapper(
      "Verificación de correo electrónico",
      `<p style="color:#52525b;font-size:15px;margin:0 0 8px">Hola <strong>${esc(params.playerName)}</strong>,</p>
       <p style="color:#52525b;font-size:15px;margin:0 0 16px">Ingresa este código en el proceso de recuperación de cuenta. Válido por <strong>15 minutos</strong>.</p>
       ${codeBlock(params.code)}
       <p style="color:#71717a;font-size:13px;margin:16px 0 0">Ticket de referencia: <code>${esc(params.ticketId)}</code></p>
       <a href="${BASE_URL}/mundial/banned/recover" style="display:inline-block;margin-top:16px;background:#059669;color:#fff;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;font-size:14px">Continuar recuperación</a>`
    ),
  });

  if (error) console.error("[banEmail] sendEmailVerificationCode error", error);
}

export async function sendPhoneVerificationCode(params: {
  to: string;
  playerName: string;
  code: string;
  phone: string;
  ticketId: string;
}) {
  const client = resend();
  if (!client) return;

  const { error } = await client.emails.send({
    from: FROM,
    to: params.to,
    subject: `${params.code} — Código de verificación de teléfono | Quiniela Mundial`,
    html: emailWrapper(
      "Verificación de teléfono",
      `<p style="color:#52525b;font-size:15px;margin:0 0 8px">Hola <strong>${esc(params.playerName)}</strong>,</p>
       <p style="color:#52525b;font-size:15px;margin:0 0 4px">Enviamos un código de verificación para el número <strong>${esc(params.phone)}</strong>.</p>
       <p style="color:#52525b;font-size:15px;margin:0 0 16px">Ingresa este código en el proceso de recuperación. Válido por <strong>15 minutos</strong>.</p>
       ${codeBlock(params.code)}
       <p style="color:#71717a;font-size:13px;margin:16px 0 0">Ticket de referencia: <code>${esc(params.ticketId)}</code></p>`
    ),
  });

  if (error) console.error("[banEmail] sendPhoneVerificationCode error", error);
}

export async function sendTicketConfirmation(params: {
  to: string;
  playerName: string;
  ticketId: string;
}) {
  const client = resend();
  if (!client) return;

  const { error } = await client.emails.send({
    from: FROM,
    to: params.to,
    subject: `Ticket de apelación generado: ${params.ticketId} | Quiniela Mundial`,
    html: emailWrapper(
      "Apelación recibida — en revisión",
      `<p style="color:#52525b;font-size:15px;margin:0 0 8px">Hola <strong>${esc(params.playerName)}</strong>,</p>
       <p style="color:#52525b;font-size:15px;margin:0 0 16px">Recibimos tu solicitud de recuperación. Un administrador la revisará en los próximos <strong>3–5 días hábiles</strong>.</p>
       <div style="background:#f4f4f5;border-radius:10px;padding:16px 20px;margin:0 0 16px">
         <p style="margin:0;font-size:12px;color:#71717a;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Número de ticket</p>
         <p style="margin:6px 0 0;font-size:20px;font-weight:900;font-family:monospace;color:#18181b">${esc(params.ticketId)}</p>
       </div>
       <p style="color:#71717a;font-size:13px;margin:0">Guarda este número como referencia. Si no recibes respuesta en 5 días hábiles, contacta a soporte.</p>`
    ),
  });

  if (error) console.error("[banEmail] sendTicketConfirmation error", error);
}
