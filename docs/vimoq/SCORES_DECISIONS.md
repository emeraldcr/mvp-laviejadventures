# `/scores` — decisiones cerradas

Fecha: 2026-07-23  
Autores: ChatGPT (marco) + Grok (cierre operativo por defaults del handoff + mejoras multi-fase)  
Humano: “completen todas las fases”

## Decisiones (sec. 4.1 handoff)

| # | Tema | Decisión |
|---|------|----------|
| 1 | Identidad | **B** — identidad propia en DB `go` (`identities` + `sessions`). `userId` = ObjectId string. Display name snapshot en cada pick. PIN 6 dígitos. `SCORES_PIN_PEPPER` es obligatorio en producción; no se permite secreto fallback productivo. |
| 2 | Baloncesto scoring | Reglas excluyentes: exacto **5**; ganador + margen con diferencia ≤5, **3**; ganador fuera de tolerancia, **2**; incorrecto, **0**. Fútbol: exacto **3**, 1X2 **1**. |
| 3 | Visibilidad post-cierre | Nombre + marcador predicho visibles al cerrar. Antes: solo propios. Leaderboard sin filtrar scores abiertos. |
| 4 | Audit admin | **Fase 0/1** — colección `admin_audit` en `go` en cada PATCH/POST admin y sync. |
| 5 | DB | Todo scores en **`go`**: matches, predictions, identities, sessions, competitions, audit, sync_state. |
| 6 | Liga slice | Fase 1 publica solo **FCL demo**. El seed NBA y provider mock pueden existir en código, pero deben permanecer desactivados/inaccesibles hasta Fases 2 y 3 respectivamente. |

## Overrides al plan

- `status` canónico: `scheduled | live | halftime | finished | postponed | cancelled` (UI puede mapear fulltime→finished).  
- `predictionClosesAt` = `startsAt` por defecto; admin puede forzar.  
- Sync: provider **`mock`** genera/actualiza fixtures demo (no API de pago). Adapter listo para otro `provider` id.  
- Rankings: global, sport, competition; period: `all | week | month`.  
- Fase 4 lite: perfil mínimo (displayName en identity), share payload post-lock en GET match, analytics event opcional en memoria/log.
- Notificaciones requieren email opcional verificado, consentimiento y preferencias; no se envían usando solo display name/PIN.

## ruleVersion scoring

- `football-v1`  
- `basketball-v1`  
