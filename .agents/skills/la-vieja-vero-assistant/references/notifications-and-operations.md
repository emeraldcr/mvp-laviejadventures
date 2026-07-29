# Seguimiento humano

## Resend

Implementación: `lib/email/conversation-followup-email.ts`.

Destinatario único autorizado:

```text
aallanrd@gmail.com
```

No añadir destinatarios ni CC sin autorización. Usar `RESEND_API_KEY` y `getEmailFrom()`.

## Dominio y remitente

- URL y enlaces: `https://www.laviejaadventures.com`.
- Remitente autorizado por Resend: `La Vieja Adventures <noreply@laviejaadventures.com>`.
- Variable opcional: `SMTP_FROM` con ese mismo remitente.

No confundir el host web `www` con el dominio de correo. La clave actual rechaza `noreply@www.laviejaadventures.com` y acepta el dominio raíz. Mantener todos los módulos sobre `lib/constants/email.ts`; no duplicar remitentes.

## Envío

Enviar al entrar en `human_requested`. Incluir contacto, reserva parcial, sesión y aviso de que no es una reserva confirmada. Añadir WhatsApp solo con teléfono.

## Antiduplicados

1. Reclamar atómicamente el envío.
2. Guardar `sending`.
3. Usar idempotency key de Resend por sesión y ciclo.
4. Guardar `sent`, `sentAt` y `resendId` tras confirmación.
5. Guardar `failed` y error abreviado al fallar.

La UI solo afirma que el equipo recibió el aviso con estado `sent`.

## Dónde revisar

- Bandeja de `aallanrd@gmail.com`.
- Resend Dashboard mediante `resendId`.
- `conversation_sessions.humanNotification`.
- `conversation_messages`.

Sin credencial, registrar fallo y mantener WhatsApp; nunca fingir éxito.
