# Scores — eternal loop (Chat ↔ Grok)

Cada vuelta del loop:

1. **Chat** lee STATUS + código mentalmente → escribe findings P0/P1/P2 en el log  
2. **Grok** implementa el batch  
3. **Grok** actualiza STATUS + corre `npm run type-check` y `npm run test:scores`  
4. Repetir  

## Loop #2 — 2026-07-24

### Chat findings (auto-review)

| Pri | Finding | Acción |
|-----|---------|--------|
| P0 | Review seguridad pendiente | Checklist pasado en STATUS (simulado + hardening) |
| P1 | Auth brute force | rate-limit in-memory en `/api/scores/auth` |
| P1 | Contrato PUT del plan | `PUT /api/scores/predictions/:matchId` + service compartido |
| P1 | Demo kickoffs mueren | seed re-roll de demos scheduled pasados |
| P2 | Countdown UX | formatCountdown en MatchCard |
| P2 | Save lento | optimistic UI + rollback |
| P2 | Cron provider | `POST /api/scores/cron/sync` + `SCORES_CRON_SECRET` |
| P2 | Observabilidad | `GET /api/scores/health` + `npm run test:scores` |
| P2 | Comunidad | histograma de marcadores + copiar pick |

### Grok done

Ver commits de archivos en esta sesión; STATUS actualizado.

## Loop #2 verificación

- `npm run test:scores` → OK  
- `tsc --noEmit` → OK  

## Loop #3 — 2026-07-24

### Chat
**Tipo:** review  
Pide filtros ranking en UI + tests de reglas de cierre/visibilidad.

### Grok
**Tipo:** implement  
- RankingView: period / sport / competition via `/api/scores/leaderboard`  
- `scripts/test-scores-rules.mjs` (close + visibility)  
- `test:scores` corre scoring + rules  

## Loop #4 — 2026-07-24 (Grok solo, Codex out)

### Contexto
Codex dejó growth (private leagues, achievements, model predictions, e2e, secrets/privacy tests). Grok continuó glue UX.

### Hecho
- Banner “Guardar todos” + saveAllDirty  
- expectedUpdatedAt solo si hay versión server  
- credentials same-origin en GrowthPanel / share analytics  
- STATUS actualizado  

### Verificación
- `npm run test:scores` OK  
- `tsc` OK  
- E2E: ver STATUS / salida de `test:scores:e2e`

## Backlog loop #5+

- [ ] Redis rate-limit multi-instance  
- [ ] Provider comercial real  
- [ ] Nav link público (producto)  
- [ ] i18n EN  
- [ ] UI model predictions en MatchCard (flag on)  

Pará con: stop / basta / no más.
