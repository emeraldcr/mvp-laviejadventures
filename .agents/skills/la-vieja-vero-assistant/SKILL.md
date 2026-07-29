---
name: la-vieja-vero-assistant
description: Diseñar, implementar, depurar o revisar Vero, el asistente híbrido de La Vieja Adventures, incluyendo el motor de estados en MongoDB, reservas con campos parciales, FAQ por keywords, extracción estructurada con OpenAI, historial, validaciones, UX de inputs, handoff al configurador y seguimiento humano por Resend. Usar cuando se modifique `/ai`, `/api/ai/assistant`, `lib/conversation`, la conexión entre Vero y `/reservar`, o las colecciones de conversación.
---

# Vero Assistant

Mantener una experiencia cálida y flexible sin ceder a la IA el control de reservas, precios, disponibilidad o seguridad.

## Flujo obligatorio

1. Leer `references/architecture.md` antes de cambiar estados, sesiones, MongoDB o el handoff.
2. Leer `references/ai-and-faq.md` antes de modificar prompts, modelos, FAQ, keywords o llamadas a OpenAI.
3. Leer `references/ux-and-validation.md` para cualquier cambio de interfaz, input o navegación.
4. Leer `references/notifications-and-operations.md` si el cambio toca seguimiento humano, Resend, variables de entorno o trazabilidad.
5. Leer `references/testing.md` antes de validar o entregar.
6. Usar también `../la-vieja-brand-design/SKILL.md` cuando el trabajo cambie el aspecto visual.

## Invariantes

- Conservar MongoDB como fuente de verdad de estado, FAQ, historial y notificaciones.
- Resolver FAQ por keywords antes de usar tokens.
- Usar OpenAI solo para interpretar lenguaje natural, extraer datos explícitos o redactar desde información verificada.
- Nunca permitir que el modelo confirme precios, cupos, clima operativo, seguridad, pago o una reserva.
- Validar nuevamente en servidor todos los campos extraídos por IA o recibidos por URL.
- Preservar datos ya válidos y avanzar al primer campo faltante.
- Pedir confirmación explícita antes del handoff al configurador.
- No crear una reserva ni cobrar dentro del chat.
- Evitar duplicados en mensajes, transiciones y correos.
- Escalar grupos grandes, condiciones médicas, itinerarios especiales y pagos complejos.

## Orden de decisión

1. Aplicar y validar campos precargados.
2. Reanudar en el primer campo incompleto.
3. Resolver opciones deterministas.
4. Buscar FAQ activas en Mongo por keywords.
5. Usar OpenAI con salida estructurada si todavía hace falta.
6. Volver al flujo determinista con los campos validados.
7. Escalar a humano cuando corresponda.

## Criterio de entrega

- Ejecutar type-check, ESLint dirigido, build y pruebas representativas de estado.
- Renderizar e inspeccionar `/ai` si cambia la UI.
- Probar una reserva parcial, una completa, una FAQ sin OpenAI y una frase natural con varios campos.
- Declarar cualquier integración no probada por falta de credenciales; nunca presentar un correo o pago como exitoso sin confirmación real.
