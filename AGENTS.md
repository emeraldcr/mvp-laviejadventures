# Codex Instructions

## Work mode

Codex must act as a code editor, not as a visual QA agent.

Do not use:
- screenshots
- Chrome
- Chrome DevTools
- browser automation
- Playwright visual inspection
- Selenium
- UI screenshot comparison
- long debug sessions
- invented manual testing flows

Only use browser/debug tools if the user explicitly says:
"Use browser debugging" or "Take screenshots" or "Verify visually".

## Allowed actions

Codex may:
- inspect source files
- edit code
- suggest commands
- run fast static checks if needed
- run unit tests only when directly relevant
- explain changed files

## Forbidden behavior

Codex must not:
- invent components, routes, APIs, constants, or dependencies
- rewrite unrelated files
- change design beyond the requested scope
- add features not requested
- run slow verification loops
- make assumptions about business logic without marking them clearly

## Response format

After finishing, Codex must respond with:

1. Files changed
2. What changed
3. Commands for the user to run manually
4. Assumptions or risks

The user will verify the browser/UI manually.