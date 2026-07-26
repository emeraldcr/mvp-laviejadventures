# `/scores` — análisis y plan de implementación

Fecha del análisis: 23 de julio de 2026  
Destinatario principal: Grok y cualquier agente que continúe el desarrollo

## 1. Decisión de producto

El nombre y la URL se quedan como **Scores** y **`/scores`**.

La primera versión debe tomar lo que funcionó en `/mundial` —pronosticar, competir y seguir el ranking— y convertirlo en una experiencia permanente para múltiples ligas y deportes.

### Propuesta de valor

> Todos los partidos importantes, una sola identidad y un ranking continuo.

### Alcance asumido para el MVP

`/scores` es primero una **quiniela social multi-deporte**:

- la persona elige el marcador final de cada partido;
- el pick se bloquea al comenzar el evento;
- al terminar, se asignan puntos;
- hay rankings globales, por deporte, liga y período;
- fútbol y baloncesto pueden coexistir sin compartir reglas incorrectas.

No se debe mezclar este MVP con un motor de IA que “garantice” resultados. Si después se agregan predicciones del sistema, deben aparecer como una capa separada (`modelPredictions`) con probabilidades, versión del modelo y métricas históricas verificables.

## 2. Estado actual encontrado

Ya existe trabajo en progreso, todavía sin registrar en Git, en:

- `lib/scores/`
- `lib/scores/sources/`
- `app/api/scores/`

### Lo que ya está bien encaminado

- Base Mongo separada con nombre `go`.
- Colecciones iniciales `matches` y `predictions`.
- Registro de fuentes activables para Premier League, Serie A, NBA, FCL y NBL.
- Creación manual de partidos desde API.
- Cierre automático del pick según `kickoffAt`.
- Marcador en vivo y estado del partido.
- Puntaje inicial de 3 por marcador exacto y 1 por resultado correcto.
- Ranking básico por puntos y marcadores exactos.
- Índices para impedir dos picks del mismo jugador en un partido.
- Separación inicial entre tipos, persistencia, scoring y fuentes.

### Lo que Grok agregó durante este análisis

- Página pública `app/(page_routes)/scores/page.tsx`.
- Cliente, hook y componentes para próximos, en vivo, mis picks y selector de jugador.
- Experiencia inicial de selección y guardado de marcadores.
- Página administrativa `app/(page_routes)/scores/admin/page.tsx`.
- Formularios iniciales para crear y actualizar partidos.

Estas pantallas confirman que el vertical slice ya está en marcha, pero todavía dependen de un nombre guardado en `localStorage`; por eso no eliminan los bloqueadores P0 descritos abajo.

### Lo que todavía no existe o no está resuelto

- Identidad autenticada para participantes.
- Autorización para APIs administrativas.
- Fuentes externas reales; las fuentes actuales son solamente metadatos activados.
- Sincronización programada de fixtures, estados y resultados.
- Reglas específicas por deporte.
- Pruebas automatizadas.
- Analítica, observabilidad y estrategia de recuperación.

## 3. Bloqueadores antes de publicar

Estos puntos son **P0**. No conviene exponer `/scores` públicamente hasta resolverlos.

### 3.1 Suplantación de jugadores

Actualmente `POST /api/scores/predictions` confía en `playerName`. Cualquier cliente podría guardar o cambiar un pick usando el nombre de otra persona.

**Decisión:** reutilizar la identidad de `/mundial` o crear una identidad compartida para toda la plataforma. El servidor debe obtener `userId` de una sesión segura; `playerName` nunca debe ser la llave de autorización.

### 3.2 Administración sin protección

Los endpoints bajo `/api/scores/admin` no comprueban una sesión administrativa.

**Decisión:** cada handler de administración debe llamar a `getAdminFromRequest()` o al helper de autorización definitivo y responder `401/403` antes de leer o modificar datos.

También hay que verificar que `ADMIN_JWT_SECRET` sea obligatorio en producción. Un secreto de fallback no debe permitir firmar tokens productivos.

### 3.3 Picks ajenos visibles antes del cierre

El `GET /api/scores/predictions` devuelve todas las predicciones. Eso permite copiar picks antes del inicio.

**Decisión de visibilidad:**

- el participante ve siempre sus propios picks;
- los picks de otras personas solo se revelan cuando el partido está cerrado;
- el leaderboard puede ser público, pero no debe filtrar marcadores aún abiertos;
- el admin autenticado sí puede consultar todo.

### 3.4 Identidad basada en nombre

`normalizedName` funciona para mostrar y agrupar, pero no para identificar. Dos personas pueden llamarse igual y una persona puede cambiar mayúsculas o nombre.

**Decisión:** toda predicción debe guardar `userId`. Crear un índice único:

```ts
{ matchId: 1, userId: 1 } // unique
```

Conservar `playerName` únicamente como snapshot de presentación o resolverlo desde el perfil.

### 3.5 Fuentes que todavía no traen datos

Activar una fuente en el registro hace que aparezca en la respuesta aunque no exista integración ni fixture.

**Decisión:** separar:

- `enabled`: la liga está autorizada para mostrarse;
- `syncMode`: `manual | provider`;
- `health`: `healthy | stale | error | never_synced`;
- `lastSyncedAt`;
- `provider`.

Una liga sin datos no debe presentarse como operativa.

## 4. Arquitectura propuesta

```text
Proveedor o admin
      │
      ▼
Adapters por proveedor ──► normalización ──► MongoDB
                                              │
                        ┌─────────────────────┼─────────────────────┐
                        ▼                     ▼                     ▼
                    fixtures              picks                resultados
                        │                     │                     │
                        └──────────── scoring idempotente ◄────────┘
                                              │
                                              ▼
                                       rankings/materialized
                                              │
                                              ▼
                                      API pública `/scores`
```

### Regla principal

El proveedor externo nunca define directamente la forma de la UI. Cada adapter convierte su respuesta a un modelo canónico. Así se puede cambiar de proveedor sin reescribir la aplicación.

### Estructura de carpetas objetivo

```text
app/(page_routes)/scores/
  page.tsx
  ScoresClient.tsx
  loading.tsx
  error.tsx
  components/
  hooks/
  admin/
    page.tsx
    ScoresAdminClient.tsx

app/api/scores/
  bootstrap/route.ts
  matches/route.ts
  predictions/route.ts
  leaderboard/route.ts
  admin/
    matches/route.ts
    matches/[matchId]/route.ts
    sync/route.ts

lib/scores/
  auth.ts
  db.ts
  types.ts
  validators.ts
  matches.ts
  predictions.ts
  leaderboard.ts
  scoring/
    index.ts
    football.ts
    basketball.ts
  providers/
    types.ts
    registry.ts
    manual.ts
```

Los nombres pueden adaptarse, pero se debe evitar que un solo route handler concentre validación, acceso a DB, scoring y serialización.

## 5. Modelo de datos recomendado

### `competitions`

```ts
type Competition = {
  id: string;
  sport: "football" | "basketball";
  name: string;
  country?: string;
  logoUrl?: string;
  enabled: boolean;
  syncMode: "manual" | "provider";
  provider?: string;
  providerCompetitionId?: string;
  lastSyncedAt?: Date;
  syncHealth: "healthy" | "stale" | "error" | "never_synced";
};
```

### `matches`

```ts
type Match = {
  id: string;
  provider?: string;
  providerMatchId?: string;
  competitionId: string;
  seasonId: string;
  sport: "football" | "basketball";
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  startsAt: Date; // guardar como Date en Mongo
  timezone: "UTC";
  status:
    | "scheduled"
    | "live"
    | "halftime"
    | "finished"
    | "postponed"
    | "cancelled";
  period?: string;
  clock?: string;
  score: {
    home: number | null;
    away: number | null;
  };
  predictionClosesAt: Date;
  resultVersion: number;
  sourceUpdatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
```

No usar un `MAX_SCORE = 200` universal como regla de dominio. La validación debe depender del deporte. En fútbol, por ejemplo, 0–30 es razonable; en baloncesto se necesita un rango mayor.

### `predictions`

```ts
type Prediction = {
  id: ObjectId;
  matchId: string;
  userId: string;
  displayNameSnapshot: string;
  predictedScore: {
    home: number;
    away: number;
  };
  submittedAt: Date;
  updatedAt: Date;
  lockedAt: Date | null;
  scoredResultVersion?: number;
  scoring?: {
    points: number;
    exact: boolean;
    correctOutcome: boolean;
    ruleVersion: string;
  };
};
```

Guardar el resultado del scoring permite auditar cambios. `ruleVersion` evita que una modificación futura altere silenciosamente temporadas anteriores.

### Índices mínimos

```ts
matches:      { id: 1 } unique
matches:      { competitionId: 1, startsAt: 1 }
matches:      { status: 1, startsAt: 1 }
predictions:  { matchId: 1, userId: 1 } unique
predictions:  { userId: 1, updatedAt: -1 }
predictions:  { matchId: 1, submittedAt: 1 }
```

No silenciar todos los errores al crear índices. Un conflicto de datos que impide un índice único debe quedar registrado y detener el despliegue o la migración.

## 6. Reglas de predicción y scoring

### MVP recomendado

#### Fútbol

- marcador exacto: 3 puntos;
- resultado correcto (local/empate/visita): 1 punto;
- incorrecto: 0 puntos.

Para fases eliminatorias futuras, reutilizar la lógica madura de `/mundial`: marcador al final del tiempo reglamentario, ganador y método de desempate. No copiar solo la versión simplificada actual de `lib/scores/scoring.ts`.

#### Baloncesto

No existe empate final. Para el MVP:

- marcador exacto: 5 puntos;
- ganador correcto: 2 puntos;
- margen de victoria dentro de una tolerancia configurable: 1 punto adicional.

Si se quiere lanzar más rápido, se puede empezar únicamente con ganador en baloncesto y activar marcador exacto cuando producto confirme la regla.

### Rankings

Debe haber:

- global;
- por deporte;
- por competición;
- semanal;
- mensual;
- temporada completa.

Desempate sugerido:

1. puntos;
2. exactos;
3. resultados correctos;
4. porcentaje de acierto con mínimo de picks;
5. fecha en la que alcanzó el puntaje.

No comparar porcentajes sin un mínimo de participación, porque un usuario con 1/1 quedaría artificialmente arriba.

### Scoring idempotente

Cuando llega un resultado:

1. incrementar `resultVersion` si el resultado cambió;
2. recalcular solamente picks cuyo `scoredResultVersion` sea anterior;
3. guardar scoring y versión en la misma operación lógica;
4. reconstruir o actualizar rankings;
5. si el proveedor corrige un resultado, recalcular sin duplicar puntos.

## 7. Contrato de API

### `GET /api/scores/bootstrap`

Una llamada inicial optimizada:

```json
{
  "viewer": {},
  "competitions": [],
  "matches": [],
  "myPredictions": [],
  "leaderboard": [],
  "serverTime": "2026-07-23T18:00:00.000Z"
}
```

`serverTime` ayuda a mostrar el countdown, pero el bloqueo siempre lo decide el servidor.

### `GET /api/scores/matches`

Filtros permitidos:

- `sport`
- `competitionId`
- `dateFrom`
- `dateTo`
- `status`
- `cursor`
- `limit`

Aplicar paginación. No devolver para siempre todos los partidos históricos.

### `PUT /api/scores/predictions/:matchId`

El servidor toma `userId` de la sesión.

```json
{
  "homeScore": 2,
  "awayScore": 1,
  "expectedUpdatedAt": "2026-07-23T17:55:00.000Z"
}
```

Usar `expectedUpdatedAt` o una versión para evitar que dos pestañas se sobrescriban silenciosamente.

### `GET /api/scores/leaderboard`

Filtros: `scope`, `sport`, `competitionId`, `period`, `cursor`.

### APIs administrativas

Todo endpoint bajo `/api/scores/admin` exige sesión administrativa. Registrar auditoría con:

- admin;
- acción;
- partido;
- valor anterior;
- valor nuevo;
- fecha;
- origen manual o proveedor.

## 8. UX de `/scores`

### Pantalla principal móvil

1. Encabezado **Scores** con identidad del participante.
2. Selector horizontal de deporte.
3. Selector de liga.
4. Tabs: **Próximos**, **En vivo**, **Finalizados**, **Mis picks**, **Ranking**.
5. Tarjetas por fecha.
6. En cada tarjeta:
   - equipos y logos;
   - hora local;
   - inputs de marcador;
   - estado de guardado;
   - countdown de cierre;
   - marcador en vivo o final cuando corresponda.
7. Guardado optimista con confirmación visible y reintento.

### Reglas de interacción

- No depender únicamente de color para diferenciar ganado/perdido.
- Inputs numéricos con botones `–` y `+`, pero también editables.
- Mostrar la zona horaria del usuario; persistir UTC.
- Si cambia la hora de inicio, actualizar el cierre y avisar.
- Si un partido se pospone, desbloquear o mantener picks según una política explícita.
- Si se cancela, el partido no cuenta.
- Después del cierre, mostrar distribución comunitaria sin revelar identidad si no es necesario.

### Lo que vale la pena reutilizar de `/mundial`

- flujo de identidad y sesión;
- drafts y guardado por partido;
- estados visuales de pick guardado/bloqueado;
- ranking y perfiles;
- actualización en vivo;
- analítica de `pick_saved`;
- panel administrativo y detalle por participante.

Conviene extraer componentes y helpers compartidos; copiar archivos completos de `/mundial` crearía dos sistemas difíciles de mantener.

## 9. Sincronización de datos

### Estrategia

1. Empezar con **una liga de fútbol y una de baloncesto**.
2. Definir el adapter canónico.
3. Ejecutar sync mediante cron o job protegido.
4. Hacer `upsert` por `provider + providerMatchId`.
5. Nunca reemplazar campos administrados manualmente sin una regla de precedencia.
6. Marcar datos como stale si el último sync supera el umbral.
7. Mantener creación y corrección manual como respaldo.

### Frecuencia orientativa

- próximos partidos: cada 1–6 horas;
- partidos del día: cada 5–15 minutos;
- partidos en vivo: según límites y licencia del proveedor;
- resultados recientemente finalizados: verificación posterior.

La frecuencia real depende del proveedor, sus términos y su límite de solicitudes. No escoger ni integrar una API sin confirmar cobertura, derechos de uso, latencia y costo.

## 10. Fases de ejecución para Grok

### Fase 0 — asegurar la base actual

- [ ] Agregar autorización a todos los endpoints admin.
- [ ] Adoptar `userId` de sesión en predicciones.
- [ ] Ocultar picks ajenos antes del cierre.
- [ ] Convertir fechas Mongo a `Date` y normalizar UTC.
- [ ] Hacer que la creación de índices falle de forma visible.
- [ ] Añadir validación por deporte.
- [ ] Corregir textos con mojibake (`invÃ¡lido`, `â€”`, etc.).

**Salida:** APIs seguras, sin UI pública todavía.

### Fase 1 — vertical slice funcional

- [x] Crear la primera versión de `/scores`.
- [x] Crear la primera versión de `/scores/admin`.
- [ ] Publicar una liga de fútbol en modo manual.
- [ ] Flujo completo: login → pick → bloqueo → resultado → puntos → ranking.
- [ ] Estados loading, vacío, error y reintento.
- [ ] Mobile-first y accesibilidad básica.

**Salida:** una liga completa que se puede probar de punta a punta.

### Fase 2 — multi-deporte real

- [ ] Introducir estrategia de scoring por deporte.
- [ ] Agregar una liga de baloncesto.
- [ ] Rankings filtrables.
- [ ] Paginación y períodos.
- [ ] Políticas de pospuesto/cancelado.

**Salida:** fútbol y baloncesto funcionan con reglas distintas.

### Fase 3 — proveedor automático

- [ ] Seleccionar proveedor.
- [ ] Implementar adapter.
- [ ] Crear job protegido e idempotente.
- [ ] Health y `lastSyncedAt`.
- [ ] Corrección manual con auditoría.
- [ ] Alertas por sync fallido o datos stale.

**Salida:** fixtures y resultados se mantienen sin carga manual ordinaria.

### Fase 4 — crecimiento

- [ ] Perfiles y logros.
- [ ] Ligas privadas entre amigos.
- [ ] Notificaciones antes del cierre.
- [ ] Compartir picks después del bloqueo.
- [ ] Métricas de retención.
- [ ] Predicción estadística del sistema, claramente separada de los picks de usuarios.

## 11. Pruebas y criterios de aceptación

### Unitarias

- scoring de fútbol y baloncesto;
- desempates del ranking;
- cierre exacto en el instante de inicio;
- validación por deporte;
- serialización de fechas;
- partidos cancelados y pospuestos.

### Integración

- un usuario no puede editar el pick de otro;
- un usuario no puede cambiar su pick después del cierre;
- dos requests simultáneos no crean duplicados;
- un visitante no ve picks ajenos abiertos;
- un usuario normal recibe `401/403` en admin;
- corregir un resultado recalcula puntos sin duplicarlos;
- sync repetido no duplica partidos.

### E2E

- login → crear pick → refrescar → pick persiste;
- admin finaliza partido → ranking se actualiza;
- UI móvil a 360 px;
- filtros por deporte y liga;
- error de red con reintento y sin pérdida del draft.

### Condición de lanzamiento

- `npm run type-check` pasa;
- lint de archivos nuevos pasa;
- pruebas de scoring y autorización pasan;
- no hay endpoints administrativos públicos;
- no se filtran picks abiertos;
- al menos un flujo completo se valida en preview;
- se documentan variables de entorno y procedimiento de rollback.

## 12. Orden recomendado para el siguiente bloque de trabajo

Grok debería ejecutar ahora, en este orden:

1. detener la creación de UI temporalmente;
2. cerrar autorización e identidad;
3. definir visibilidad de picks en el servidor;
4. refactorizar scoring por deporte;
5. construir un vertical slice con una sola liga;
6. probarlo de punta a punta;
7. agregar la segunda liga/deporte;
8. integrar un proveedor únicamente después de estabilizar el modelo.

El error más caro sería conectar muchas ligas antes de resolver identidad, visibilidad, reglas deportivas e idempotencia. La meta del primer release no es “tener muchos partidos”; es demostrar que **un partido recorre todo el ciclo correctamente y de forma segura**.
