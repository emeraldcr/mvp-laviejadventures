# `/scores` — handoff de Grok para ChatGPT

Fecha: 2026-07-23  
Autor: Grok (implementación en repo)  
Contexto: respuesta a `docs/SCORES_PLAN.md`

---

## Para qué es este archivo

ChatGPT ya evaluó el estado de `/scores` y escribió el plan en `docs/SCORES_PLAN.md`.

Este documento es el **contraparte de Grok**:

1. qué entendí del plan;
2. qué voy a implementar yo en el código (y en qué orden);
3. qué **no** voy a hacer todavía;
4. qué necesito que haga **ChatGPT** (decisiones, diseño, revisión — no código a ciegas en el repo).

Si algo de este handoff choca con `SCORES_PLAN.md`, prevalece el plan salvo que el humano diga lo contrario. Si ChatGPT no está de acuerdo con una decisión de implementación, que lo diga **antes** de que yo avance de fase.

---

## 1. Lo que Grok ya hizo (estado real del repo)

Existe un vertical slice mínimo, **no listo para publicar**:

| Área | Ruta / módulo |
|------|----------------|
| DB Mongo dedicada | `go` vía `lib/scores/db.ts` |
| Colecciones | `matches`, `predictions` |
| Fuentes (solo registry) | Premier, Serie A, NBA, FCL, NBL, manual en `lib/scores/sources/` |
| API pública | `GET/POST /api/scores/predictions`, `GET /api/scores/matches` |
| API admin (sin auth) | `GET /api/scores/admin`, `POST/PATCH /api/scores/admin/match` |
| UI | `/scores` (live / next / mine) y `/scores/admin` |

Problemas que el plan ya marcó y **acepto como P0**:

- predicciones identificadas por `playerName` (suplantación);
- admin sin `getAdminFromRequest()`;
- GET de predicciones filtra todos los picks (se pueden copiar antes del kickoff);
- fuentes `enabled` sin datos reales ni health;
- scoring único (no por deporte);
- identidad = `localStorage` + nombre.

`/mundial` **no se toca** en este trabajo salvo reutilizar helpers de identidad/admin si hace falta.

---

## 2. Lo que Grok va a hacer (compromiso de implementación)

### Principio

> Un partido completo y seguro del ciclo (login → pick → bloqueo → resultado → puntos → ranking) vale más que muchas ligas.

Sigo el **orden de la sección 12 del plan**. No conecto proveedores ni multiplico ligas hasta cerrar seguridad e identidad.

---

### Fase 0 — base segura (yo implemento esto ahora / en el próximo bloque)

Checklist operativo (mapeo a sec. 10 del plan):

| # | Trabajo | Cómo lo pienso hacer en código |
|---|---------|--------------------------------|
| 0.1 | Auth admin | En **todos** los handlers bajo `/api/scores/admin*`: llamar `getAdminFromRequest(req)` (`lib/auth/admin-auth.ts` o `@/lib/admin-auth`). `401` si no hay sesión. |
| 0.2 | Identidad en predicciones | Dejar de confiar en `playerName` del body para autorizar. El servidor resuelve `userId` de sesión. Índice único `{ matchId: 1, userId: 1 }`. `playerName` / display name solo como snapshot de UI. |
| 0.3 | Visibilidad de picks | En `GET` predicciones/bootstrap: el viewer ve **siempre** los suyos; picks ajenos **solo** si el partido está cerrado (kickoff / forceClosed / fulltime). Leaderboard público sin filtrar marcadores abiertos. Admin autenticado puede ver todo. |
| 0.4 | Fechas | Guardar `kickoffAt` / `startsAt` y timestamps como `Date` en Mongo; serializar ISO en API. Bloqueo lo decide el **servidor**, no el cliente. |
| 0.5 | Índices | No tragar en silencio fallos de índice único; log + error visible en ensure/bootstrap. |
| 0.6 | Validación por deporte | Fútbol: score 0–30. Baloncesto: rango mayor (p. ej. 0–200). Scoring: fútbol 3/1; baloncesto según decisión de producto (ver preguntas a Chat). |
| 0.7 | Textos | Revisar encoding/mojibake en mensajes de API/UI de scores. |

**Salida de Fase 0:** APIs utilizables de forma segura; la UI pública puede seguir, pero ya no debe ser el foco hasta que 0.1–0.3 pasen.

#### Decisión de identidad que Grok propone (necesita OK o corrección de Chat)

Para no inventar un segundo sistema de auth de la nada:

- **Opción A (preferida por Grok):** reutilizar la sesión de identidad de `/mundial`  
  (`lib/mundial/identity.ts`, cookie `mundial_identity_session`, `cedulaKey` → `userId`).  
  Pros: ya existe PIN, cédula, sesiones, rate limit de PIN.  
  Contras: acopla scores a “mundial” en nombre y en colección de la DB `lva` (sesiones viven en la DB principal, no en `go`).

- **Opción B:** identidad propia de scores en DB `go` (`scores_identities` + `scores_sessions`), copiando el patrón de mundial pero desacoplado.  
  Pros: dominio limpio.  
  Contras: más código, dos logins si el usuario también juega mundial.

- **Opción C:** identidad de plataforma compartida (`lib/identity/`) extraída de mundial, usada por mundial + scores.  
  Pros: correcta a largo plazo.  
  Contras: refactor de mundial fuera de alcance si se hace “bien”.

**Grok va a implementar Opción A de forma pragmática** (leer sesión mundial, mapear `userId = cedulaKey`, display name = `normalizedName` / playerName) **salvo que Chat o el humano digan B o C**.

Admin de scores **no** reutiliza el PIN de quiniela: usa el admin JWT existente de la plataforma.

---

### Fase 1 — vertical slice (después de Fase 0)

Solo cuando 0.1–0.3 estén hechos:

1. Una sola liga de fútbol en modo **manual** (p. ej. FCL o “demo”) con 1–3 partidos de prueba.
2. Flujo E2E: sesión → pick → bloqueo al kickoff → admin pone resultado → puntos → ranking.
3. UI: loading / empty / error / reintento; mobile-first básico.
4. No expandir a 5 tabs fancy hasta que el ciclo funcione.

---

### Fase 2 — multi-deporte (después)

- Scoring strategy por deporte (`lib/scores/scoring/football.ts`, `basketball.ts`).
- Una liga de baloncesto.
- Rankings filtrables (global / deporte / liga; períodos si el modelo lo permite sin over-engineer).
- Políticas postponed/cancelled.

---

### Fase 3+ — proveedor (mucho después)

Adapter canónico, job de sync, health, auditoría. **No empiezo aquí.**

---

## 3. Lo que Grok NO va a hacer (todavía)

- Integrar API-Football / ESPN / etc.
- SSE / chat / penalitos / premium / stat bets (ruido de mundial).
- Copiar carpetas enteras de `/mundial`.
- Publicar `/scores` en nav principal sin P0.
- Model predictions de IA (`modelPredictions`) en el MVP.
- Reescribir todo el árbol de carpetas del plan en un solo PR si no aporta a P0 (puedo renombrar/mover en pasos).

---

## 4. Qué quiero que haga ChatGPT

Chat: **no reescribas el repo**. Necesito de vos diseño, decisiones y revisión.

### 4.1 Decisiones de producto / arquitectura (responder en un reply o en un archivo)

Por favor respondé de forma **explícita** (elige A/B/C o escribe la regla):

1. **Identidad (sec. 2 de este handoff)**  
   ¿Opción A (sesión mundial), B (scores propia en `go`), o C (extraer plataforma)?  
   Si A: ¿`userId` = `cedulaKey` está bien, o preferís un hash anónimo?

2. **Baloncesto MVP scoring**  
   Plan ofrece: exacto 5 / ganador 2 / margen +1, **o** solo ganador al inicio.  
   ¿Cuál cerramos para Fase 2? (Fase 0 puede dejar el switch listo.)

3. **Visibilidad post-cierre**  
   ¿Picks ajenos al cerrar se muestran con nombre completo, o solo agregados (distribución de marcadores) al principio?

4. **Admin audit log**  
   ¿Obligatorio en Fase 0 (colección `admin_audit` en `go`) o se puede diferir a Fase 1?

5. **DB de sesiones**  
   Si Opción A: sesiones siguen en DB `lva` (mundial) y picks en `go`. ¿OK o todo debe vivir en `go`?

6. **Una liga para el vertical slice de Fase 1**  
   ¿FCL, “manual demo”, o Premier manual? Necesito **un** nombre y si se seedan fixtures de prueba.

### 4.2 Artefactos que me sirven (si los escribís)

Podés dejar archivos en `docs/` (yo los leo):

| Archivo sugerido | Contenido |
|------------------|-----------|
| `docs/SCORES_DECISIONS.md` | Respuestas 1–6 + cualquier override al plan |
| `docs/SCORES_API_CONTRACT.md` | Contrato final de bootstrap / predictions / leaderboard (request/response) |
| `docs/SCORES_DATA_MODEL.md` | Schema mínimo Fase 0–1 (solo campos que debo persistir ya) |

Mantenerlo **corto**. Si el plan ya es la fuente de verdad, en `SCORES_DECISIONS.md` basta un diff de decisiones.

### 4.3 Revisión (después de que yo implemente Fase 0)

Cuando diga “Fase 0 lista”, pedí o hacé checklist:

- [ ] admin sin cookie → 401  
- [ ] POST pick sin sesión → 401  
- [ ] POST con sesión de A no puede escribir como B  
- [ ] GET no devuelve picks ajenos de partidos abiertos  
- [ ] POST después de kickoff → 400  
- [ ] índice único matchId+userId  
- [ ] type-check limpio en archivos scores  

Si encontrás un agujero, priorizalo P0/P1 y no propongas features nuevas en el mismo mensaje.

### 4.4 Lo que NO necesito de Chat ahora

- Otro plan de 500 líneas que repita `SCORES_PLAN.md`.
- Lista de 20 ligas o branding.
- Código completo de adapters de proveedores.
- Rediseño de UX de 7 tabs.

---

## 5. Contrato de trabajo entre agentes

```text
Humano
  │
  ├─► ChatGPT: plan, decisiones, contratos, review de seguridad/producto
  │
  └─► Grok: implementación en el repo, PRs/commits según pida el humano,
            respeta SCORES_PLAN + SCORES_DECISIONS
```

- Grok implementa y reporta “hecho / bloqueado / necesito decisión X”.
- ChatGPT decide y revisa; no asume que el código ya cambió hasta que Grok lo diga.
- Si el humano dice “solo plan” o “solo code”, se respeta.

---

## 6. Próximo mensaje esperado de Grok (después de decisiones)

Cuando existan respuestas a la sec. 4.1 (o el humano diga “seguí con A y defaults del plan”):

1. Implementar Fase 0 en el repo.
2. Actualizar este handoff o un `docs/SCORES_STATUS.md` con checkboxes reales.
3. No empezar Fase 3 (providers).

---

## 7. Defaults si Chat no responde y el humano dice “seguí”

Para no quedar bloqueado, Grok usará:

| Tema | Default |
|------|---------|
| Identidad | A — sesión mundial, `userId = cedulaKey` |
| Baloncesto scoring | solo ganador 2 pts en MVP; exacto después |
| Visibilidad post-cierre | nombre + marcador predicho (como mundial simple) |
| Audit admin | diferido a Fase 1 |
| Sesiones | `lva` (mundial); datos de juego en `go` |
| Liga slice | `manual` + 2 partidos seed de demo fútbol |

Chat: si alguno de estos defaults te parece mal, **escribilo ya** en `docs/SCORES_DECISIONS.md`.

---

## 8. Resumen en una frase

**Grok va a endurecer seguridad e identidad de `/scores` (Fase 0) y luego un solo ciclo de liga manual (Fase 1). ChatGPT debe cerrar las 6 decisiones de la sec. 4.1 y luego revisar el diff de seguridad; no reabrir el alcance a proveedores ni multi-liga hasta que eso esté verde.**
