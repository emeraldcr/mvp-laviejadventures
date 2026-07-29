# Validación

## Comandos

```powershell
npm.cmd run type-check
npx.cmd eslint 'app/(page_routes)/ai/AIAssistantClient.tsx' 'app/api/ai/assistant/route.ts' 'lib/conversation/engine.ts' 'lib/conversation/ai.ts'
npm.cmd run build
git diff --check
```

## Casos obligatorios

- Precarga parcial: conservar y saltar al primer faltante.
- Precarga completa: `reservation_review`, confirmación y `reservation_ready`.
- FAQ: `answerSource=mongodb-faq`, sin OpenAI.
- Lenguaje natural: extraer varios campos, fecha ISO y ustedeo.
- Validaciones: correo, teléfono, fecha, cantidad y edades inválidas.
- Reinicio: reserva vacía, estado activo e historial visual limpio.
- Humano desde menú e input: `human_ready` y `human_requested`.
- Resend configurado: `sent`; sin clave: `failed`; recarga tras `sent`: sin duplicado.

## Inspección visual

Renderizar escritorio y móvil. Revisar overflow, botón, pastillas, opciones ocultas, inputs, progreso, duplicados y texto de notificación.
