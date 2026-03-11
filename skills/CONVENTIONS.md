# Skills convention (quick guide)

Use this folder to keep reusable Codex skills for topics like design systems, API rules, and project workflows.

## Recommended structure

Each skill should be a separate folder:

```text
skills/
  <skill-name>/
    SKILL.md               # required, with YAML frontmatter
    references/            # optional, docs loaded only when needed
    scripts/               # optional, automation scripts
    assets/                # optional, templates/images/files used in outputs
```

## Naming convention

- Use lowercase + hyphens: `design-api-knowledge`
- Keep names short and action-oriented.
- One skill = one responsibility.

## SKILL.md minimum format

```md
---
name: design-api-knowledge
description: Use when implementing UI/API work that must follow your internal design and API conventions.
---

# design-api-knowledge

## When to use
- For UI changes requiring design tokens and component standards.
- For backend/frontend API integration with your contracts.

## Workflow
1. Read references/design-system.md for UI rules.
2. Read references/api-standards.md for contract rules.
3. Run scripts/validators.sh if present.
4. Apply patterns and cite changed sources.
```

## What to store in references/

- `design-system.md`: spacing, typography, colors, component behavior.
- `api-standards.md`: endpoint patterns, payload conventions, auth/errors.
- `product-glossary.md`: domain terms and business definitions.

Keep `SKILL.md` short; put detailed documentation in `references/`.

## Tips to keep skills maintainable

- Add only the minimum workflow in `SKILL.md`.
- Move long examples to reference files.
- Prefer scripts for repetitive checks.
- Version updates in git commits with clear messages.
