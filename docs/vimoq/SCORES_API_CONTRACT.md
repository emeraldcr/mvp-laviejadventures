# `/scores` — contrato API mínimo para Fase 0–1

Fecha: 2026-07-23  
Consumidores: UI pública, admin y pruebas de seguridad

## Reglas globales

- Fechas de salida: ISO 8601 UTC.
- El servidor decide si un partido está cerrado.
- El cliente nunca envía una identidad autorizable.
- Errores: `{ "error": "mensaje seguro" }`.
- `401`: falta o invalidez de sesión.
- `403`: sesión válida sin permiso.
- `409`: conflicto de versión o índice.

## `GET /api/scores/predictions`

Puede ser anónimo. La respuesta separa explícitamente picks propios y revelados:

```json
{
  "viewer": {
    "authenticated": true,
    "displayName": "Ana"
  },
  "matches": [],
  "myPredictions": [],
  "revealedPredictions": [],
  "leaderboard": [],
  "serverTime": "2026-07-23T22:00:00.000Z"
}
```

Reglas:

- `myPredictions`: solo picks del `userId` derivado de la sesión.
- `revealedPredictions`: picks de partidos cerrados; nunca incluye cédula, `cedulaKey` ni `userId`.
- Sin sesión, `myPredictions` es `[]`.
- No conservar un campo ambiguo `predictions` con datos abiertos de varias personas.

## `POST /api/scores/predictions`

Requiere sesión.

Request:

```json
{
  "matchId": "demo-001",
  "homeScore": 2,
  "awayScore": 1
}
```

Ignorar o rechazar campos como `playerName`, `normalizedName`, `userId` y `locked`.

Response `201`:

```json
{
  "prediction": {
    "id": "…",
    "matchId": "demo-001",
    "homeScore": 2,
    "awayScore": 1,
    "locked": false,
    "updatedAt": "2026-07-23T22:00:00.000Z"
  }
}
```

El upsert usa `{ matchId, userId }`. Después del cierre responde `400`.

## `GET /api/scores/matches`

Público. Fase 1 puede mantener filtros simples:

- `sourceId`
- `live=1`

Debe incluir `serverTime`. No devolver campos internos del proveedor o auditoría.

## `/api/scores/admin/**`

Todos los métodos requieren admin JWT:

- sin cookie o token inválido: `401`;
- sesión válida sin permiso futuro: `403`;
- nunca aceptar `updatedBy` desde el body; derivarlo de la sesión.

Fase 1 agregará auditoría antes de exposición pública.

## Compatibilidad de UI

El hook de Scores debe derivar:

```text
visiblePredictions = myPredictions + revealedPredictions
```

La clave de propiedad es el contexto del array, no comparar nombres. `localStorage` puede recordar preferencias visuales, pero no autentica.

