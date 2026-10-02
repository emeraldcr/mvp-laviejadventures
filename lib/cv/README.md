# JD-to-CV generation

`/cv` is the paste-and-generate entry point. Sign in there with the existing site admin account. Previous CVs are accessible at `/cv/archive`; their old URLs redirect to archived snapshots. Cover letters, the application tracker, word budgets, and `/allancv` remain available.

## Server configuration

- `OPENAI_API_KEY`: existing server-side OpenAI key.
- `OPENAI_CV_MODEL`: optional model override supporting Responses structured outputs. Falls back to `OPENAI_MODEL`, then `gpt-4.1-mini`.
- `MONGODB_URI` and `MONGODB_DB`: existing database configuration.
- The existing admin login/JWT configuration is used; generation and saved results require authentication. A saved CV is accessible only to the admin who created it.

No API key or database credential is sent to React. The POST route uses Node.js and has a 240-second execution budget. The OpenAI pipeline has a shared 170-second timeout; hosts must permit that execution duration.

## Sources and editable zones

The flat `cv-data-*.ts` modules and `cv-data.ts` registry remain intact as the archive. `buildCvSources` combines only variants whose candidate name matches the master CV. Oscar's CV is excluded. Employer and period must match canonical employment entries; the known La Vieja Adventures entry is mapped to the current independent consulting entry. Skills and evidence are deduplicated and assigned stable IDs, retaining their archive slugs.

The generator changes the headline, summary, skill selection/order/groups, and experience bullet wording. It preserves the master CV's name, contacts, education, languages, employers, historical job titles, periods, locations, and chronology. Browser-local edits from the previous workspace are not used as server evidence; source data modules supply the factual baseline.

1. Mechanical HTML/text cleanup removes scripts, navigation, controls, duplicate lines and common copied job-site noise.
2. A structured model call cleans the actual job description, identifies role/company, extracts keywords and exact supporting JD quotes, and rejects unrelated input.
3. A structured model call writes a concise CV with evidence IDs for every summary paragraph and experience bullet. Skill IDs resolve to exact existing skill labels.
4. Code validates IDs, job attribution, copied quotes, metrics, employment completeness, and content budgets. A separate model call checks semantic fidelity and keyword matches. Rejected drafts never become printable generated CVs.
5. Requirements without supported matches appear as gaps beside the CV, not as candidate claims. Matching evidence is an aid to review, not an ATS score or a promise of hiring fit. The automated semantic check can still make mistakes; review before applying.

## Persistence

`cv_generations` stores an ID before model calls, owner, source snapshot/hash, cleaned input, extraction, output, failures, timestamps, model responses and token usage. Model output is saved before parsing or validation, including refused/incomplete responses. Estimated cost is null rather than assuming an unverified model price.

`cv_generation_locks` prevents concurrent generations for the same admin through an atomic expiring lock. Interrupted pending records display a retry state after four minutes. History shows the latest 30 attempts; older records are retained and remain addressable at `/cv/generated/<id>`.

Each generated result survives refresh and has PDF printing, plain-text download/copy, JSON export, keyword evidence and the cleaned JD. The existing A4 preview measures overflow in the user's browser; content budgets do not themselves guarantee a one-page fit.

## Validation

Run `node scripts/check-cv-generator.cjs`, targeted ESLint, `npm run type-check`, and `npm run build`. The regression script uses an in-memory TypeScript loader and mocked model/persistence boundaries; it does not require a browser, contact OpenAI or write to the live database. Browser, live-provider and print acceptance remain manual.
