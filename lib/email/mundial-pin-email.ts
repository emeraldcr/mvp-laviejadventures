import { Resend } from "resend";
import { EMAIL_FROM_DEFAULT } from "@/lib/constants/email";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char] ?? char);
}

export async function sendMundialPinConfiguredEmail(params: {
  email: string;
  playerName: string;
  migrated?: boolean;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping Mundial PIN notification");
    return;
  }

  const resend = new Resend(apiKey);
  const name = escapeHtml(params.playerName);
  const { error } = await resend.emails.send({
    from: process.env.SMTP_FROM ?? EMAIL_FROM_DEFAULT,
    to: params.email,
    subject: params.migrated ? "Tu acceso a la quiniela fue protegido" : "Tu PIN de la quiniela fue configurado",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:28px;color:#17211b">
        <h1 style="font-size:22px;margin:0 0 14px">Acceso protegido</h1>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Tu cédula quedó vinculada como identidad principal y tu PIN de 6 dígitos fue ${params.migrated ? "actualizado" : "configurado"} correctamente.</p>
        <p style="padding:12px;background:#f4f7f5;border-radius:8px"><strong>Por seguridad, nunca enviamos ni guardamos tu PIN en texto legible.</strong></p>
        <p>Si no realizaste este cambio, respondé este correo inmediatamente para proteger tu quiniela.</p>
      </div>`,
  });
  if (error) throw new Error(`No se pudo enviar el respaldo del PIN: ${error.message}`);
}
