# Arquitectura y estado de Vero

## Superficies principales

- UI: `app/(page_routes)/ai/AIAssistantClient.tsx`
- API: `app/api/ai/assistant/route.ts`
- Motor: `lib/conversation/engine.ts`
- Tipos: `lib/conversation/types.ts`
- Interpretación OpenAI: `lib/conversation/ai.ts`
- Handoff: `lib/ai-assistant/shared.ts`
- Recepción: `app/components/reservation/ReservationDetails.tsx`
- Destino: `app/(page_routes)/reservar/page.tsx`

## Colecciones MongoDB

- `conversation_steps`: pasos y opciones.
- `conversation_sessions`: estado, reserva y notificación humana.
- `conversation_faqs`: respuestas verificadas, keywords, prioridad y versión.
- `conversation_messages`: historial con fuente, paso y TTL.

Crear índices únicos para IDs, índices de consulta y TTL para sesiones e historial.

## Base de conocimiento del sitio

- `site_knowledge`: copy público, contenido editorial de tours y FAQ del sitio, con fuente, idioma, keywords, prioridad y versión.
- `lib/knowledge/site-knowledge.ts` siembra contenido estructurado desde `lib/translations.ts`, `lib/tour-content.ts` y `lib/site-faqs.ts`.
- Mantener un documento por sección, tour o FAQ para evitar blobs imposibles de recuperar.
- Conservar `data` estructurado además del texto normalizado; `content` sirve para contexto y `keywords` para recuperación barata.
- Buscar por keywords y prioridad antes de OpenAI. Enviar solo documentos relevantes, nunca toda la página en cada llamada.
- Las colecciones operativas (`tours`, `store_products`, `hero_slogans`) siguen siendo su propia fuente de verdad; no duplicar datos vivos de precio, inventario o disponibilidad.

## Campos de reserva

Conservar `tour`, `date`, `time`, `people`, `ages`, `fitness`, `package`, `transport`, `lunch`, `name`, `email` y `phone`.

Considerar `ages` completo solo con una edad válida por persona. Un paquete con almuerzo completa `lunch=yes` sin volver a preguntarlo.

## Reanudación

- Aceptar campos desde URL, otra página o extracción estructurada.
- Normalizar aliases antes de validar.
- Ignorar valores inválidos.
- Si cambia `people`, invalidar `ages` cuando no coincidan.
- Saltar solamente campos completos.
- Si todo está completo, ir a `reservation_review`, nunca a una reserva confirmada.

## Estados

- `active`: solicitud en progreso.
- `human_requested`: requiere seguimiento humano.
- `ready_for_checkout`: confirmada explícitamente para pasar al configurador.

Al retroceder, restablecer `active` salvo declaración contraria. “Comenzar de nuevo” debe limpiar la reserva.

## Handoff

Transferir fecha, horario, paquete, cantidad, contacto y solicitudes especiales. `/reservar` vuelve a validar cupos, tarifa, horario y pago.

## Idempotencia

- Bloquear solicitudes simultáneas.
- Deduplicar mensajes consecutivos.
- Conservar un `requestId`.
- Usar operaciones atómicas para efectos externos.
- Recuperar historial desde Mongo, no solo `sessionStorage`.
