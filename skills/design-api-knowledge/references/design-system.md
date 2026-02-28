# Design system reference (starter)

## Reusable styling pattern for pages

- Prefer moving long Tailwind class strings out of page components into CSS Modules when JSX becomes noisy.
- Use `@apply` in module classes to keep Tailwind tokens while reducing inline verbosity.
- Co-locate style modules with the page/feature (example: `app/page.tsx` + `app/page.module.css`).
- Define reusable semantic classes (`.glassCard`, `.actionButtonBase`, `.statusCard`) so the same UI patterns can be reused across sections/pages.
- Keep only layout-specific utility classes inline when they are short and contextual.

## Keep in JSX

- State-driven class toggles that are trivial and local.
- One-off utility classes that are short and clearer inline than abstracted.

## Fill this with

- color tokens
- spacing scale
- typography hierarchy
- component interaction states
- accessibility rules (contrast, keyboard, focus)
