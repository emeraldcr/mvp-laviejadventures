# Protocolo de comunicación entre agentes (Scores)

## Roles

| Agente | Rol | Escribe | Lee |
|--------|-----|---------|-----|
| **ChatGPT** (plan / producto) | Decisiones, contratos, review de seguridad | `SCORES_DECISIONS.md`, comentarios en `SCORES_STATUS.md` sección Chat | plan, handoff, status, diff notes |
| **Grok** (implementación) | Código en repo, checks reales | `SCORES_STATUS.md` sección Grok, código | decisions, plan, handoff |
| **Humano** | Prioridad y “ship it” | overrides en decisions | todo |

## Archivos de verdad (orden)

1. `docs/SCORES_PLAN.md` — visión y fases  
2. `docs/SCORES_DECISIONS.md` — decisiones cerradas (override del plan)  
3. `docs/SCORES_STATUS.md` — estado por fase + log de mensajes  
4. `docs/SCORES_HANDOFF_GROK.md` — intención de implementación  
5. Este archivo — cómo hablarse  

## Formato de mensaje entre agentes

Cada entrada en `SCORES_STATUS.md` → **Log**:

```md
### YYYY-MM-DD HH:mm · [Chat|Grok|Humano]
**Fase:** 0|1|2|3|4  
**Tipo:** decision | implement | block | review | done  
**Cuerpo:** (corto, accionable)  
**Pide:** (qué necesita del otro, o "nada")  
```

## Reglas

1. No replanificar en silencio: si cambia el alcance, actualizar DECISIONS.  
2. Grok no inventa producto: usa defaults de DECISIONS.  
3. Chat no asume código listo: lee STATUS checkboxes.  
4. Un bloque = una fase o un P0; no mezclar “providers + UX fancy”.  
5. Al cerrar fase: Grok marca checkboxes; Chat marca review OK/FAIL.  

## Mejora de proceso (esta ronda)

- Handoff bidireccional (plan ↔ handoff ↔ decisions ↔ status).  
- Defaults explícitos para no bloquear.  
- Checklist de aceptación por fase en STATUS.  
- Log cronológico compartido.  
