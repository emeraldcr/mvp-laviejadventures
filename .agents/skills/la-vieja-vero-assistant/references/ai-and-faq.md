# OpenAI y FAQ

## Orden híbrido

1. Opción directa.
2. FAQ por keywords normalizadas en Mongo.
3. Atajos inequívocos como “agente”.
4. OpenAI para intención, extracción múltiple o consulta no resuelta.
5. Validación local antes de escribir estado.

## Documento FAQ

Usar `id`, `question`, `answer`, `keywords`, `category`, `priority`, `active`, `seedVersion` y `updatedAt`. Elegir por coincidencias y luego prioridad. No guardar cifras de precio o disponibilidad sin fuente vigente.

## OpenAI

Usar Responses API con Structured Outputs. Resolver modelo en este orden:

```text
OPENAI_ASSISTANT_MODEL
OPENAI_MODEL
gpt-5.6-luna
```

La salida incluye intención, respuesta y todos los campos de reserva con `null` o `[]` cuando no sean explícitos. Exigir fecha ISO y enums cerrados.

El prompt debe fijar ustedeo, fecha de Costa Rica, datos existentes, FAQ recuperadas y prohibición de inventar precio, cupos, seguridad, clima, pago o confirmación.

## Fallback

- Sin clave o con timeout: continuar con árbol, FAQ y humano.
- Pregunta no respaldada: pedir confirmación al equipo.
- Guardar solo campos validados.
- No repetir como aceptado un valor rechazado por validación.
