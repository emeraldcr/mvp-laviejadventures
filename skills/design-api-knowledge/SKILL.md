---
name: design-api-knowledge
description: Use when working on UI + API tasks that should follow project design standards and API contract conventions.
---

# design-api-knowledge

## Trigger guidance
Use this skill when requests involve:
- design tokens, component behavior, or visual consistency
- refactoring verbose inline Tailwind classes into reusable CSS module patterns
- API contracts, validation, error formats, or integration rules
- documenting product/technical conventions for reuse

## Workflow
1. Open `references/design-system.md` for design rules.
2. For front-end refactors, prefer extracting repeated/long utility strings to co-located `*.module.css` classes with `@apply`.
3. Open `references/api-standards.md` for API conventions.
4. Open `references/product-glossary.md` for shared language.
5. Apply only relevant sections to the active task.
6. If repetitive checks are needed, run scripts from `scripts/`.

## Notes
- Keep this file concise.
- Put deep details and examples in `references/` files.
