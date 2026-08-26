# `/scores` — status compartido (solo Grok desde loop #4)

Actualizado: 2026-07-24 · Loop #4 (Codex out — Grok solo)

## Protocolo

Ver `docs/AGENTS_COMMS.md`, `docs/SCORES_LOOP.md`. Decisiones: `docs/SCORES_DECISIONS.md`.

---

## Log

### 2026-07-24 · Humano
**Tipo:** decision  
Codex sin mensajes → Grok continúa solo.

### 2026-07-24 · Grok (loop #4)
**Fase:** polish + growth glue · **Tipo:** implement / done  

Inventario: Codex ya había dejado private leagues, achievements, model-predictions, cron sync/reminders, e2e, privacy tests.

Grok en este loop:
- **Guardar todos** (dirty picks banner + `saveAllDirty`)
- Fix concurrency token: no mandar `expectedUpdatedAt` vacío en primer save
- GrowthPanel + analytics share: `credentials: "same-origin"`
- Confirmado: vercel crons ya en `vercel.json` (sync + reminders cada 15m)
- `tsc` + `test:scores` + `test:scores:e2e` OK

**Pide:** stop o loop #5 (provider real / UI model predictions).

---

## Checkboxes

### Fase 0 — segura
- [x] Admin JWT, userId session, unique index, pick privacy, Date Mongo, audit, rate-limit

### Fase 1 — slice
- [x] UI + admin + seed + countdown + optimistic + bulk save
- [x] E2E `npm run test:scores:e2e` OK (cleanup sin dropDatabase en Atlas)

### Fase 2 — multi-deporte
- [x] football/basketball scoring, rankings, postponed/cancelled, comunidad

### Fase 3 — provider
- [x] mock adapter + admin sync + health
- [x] vercel crons paths (requiere `SCORES_CRON_SECRET` / `CRON_SECRET`)
- [ ] provider comercial real

### Fase 4 — growth
- [x] perfil / avisos (GrowthPanel)
- [x] ligas privadas API + UI
- [x] logros
- [x] model predictions API (flag `SCORES_MODEL_PREDICTIONS_ENABLED`)
- [x] analytics share_pick
- [x] cron reminders (email queue stub según implementación)

---

## Comandos

```bash
npm run type-check
npm run test:scores
npm run test:scores:e2e   # needs MONGODB_URI
```

## Env clave

| Var | Uso |
|-----|-----|
| `MONGODB_URI` | cluster |
| `SCORES_DB_NAME` | default `go` (e2e usa temporal) |
| `SCORES_PIN_PEPPER` | prod obligatorio |
| `SCORES_CRON_SECRET` o `CRON_SECRET` | crons Vercel |
| `ADMIN_JWT_SECRET` | admin |
| `SCORES_MODEL_PREDICTIONS_ENABLED` | capa modelo separada |
