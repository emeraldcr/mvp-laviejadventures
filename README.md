# La Vieja Adventures (LVA)

La Vieja Adventures is the main website for information and reservations for La Vieja Adventures tours, built with Next.js and TypeScript. This repository contains the frontend, API routes, and server-side helpers used by the production site.

**What you'll find here:**
- Source for the website UI: `app/`, `components/`, `styles` and static assets in `public/`.
- Server-side helpers and API routes: `lib/` and `app/api/`.
- Authentication, booking and payment integrations (Auth0, PayPal, email delivery, MongoDB storage).

**Quick overview:**
- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS

**Features implemented**
- Reservation flow and payment integration (PayPal)
- Auth0-based authentication and admin/B2B features
- Email sending hooks (Resend / SMTP support)
- Analytics snippets and optional Google Ads
- MongoDB persistence for bookings and site data

**Table of contents**
- Getting started
- Environment variables (`.env` example)
- Run locally
- Build & deploy
- Recommended next steps

## Getting started

Prerequisites:
- Node.js 18+ (or the version required by Next.js configured in the project)
- npm, pnpm or yarn
- MongoDB access (Atlas or self-hosted) for local development if you want to persist bookings

Clone and install:

```bash
git clone https://github.com/your-org/mvp-laviejadventures.git
cd mvp-laviejadventures
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment variables (.env.example)

This project relies on several environment variables for third-party integrations and secrets. Below is a safe `.env.example` you can copy to `.env.local` (for local development) and fill with your values.

Examples marked `NEXT_PUBLIC_` are exposed to client-side code and should not contain secrets.

```env
# App
NODE_ENV=development
NEXT_PUBLIC_APP_NAME="La Vieja Adventures"
APP_BASE_URL=http://localhost:3000

# Database (server only)
MONGODB_URI="mongodb+srv://USER:PASS@cluster.mongodb.net"
MONGODB_DB=lva_db

# Authentication (Auth0)
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=YOUR_AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET=YOUR_AUTH0_CLIENT_SECRET
AUTH0_AUDIENCE=YOUR_AUTH0_AUDIENCE
AUTH0_CONNECTION=Username-Password-Authentication
AUTH0_ORGANIZATION= # optional
AUTH_URL=https://your-auth-domain
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=some-long-random-string

# Admin / B2B JWT secrets
ADMIN_JWT_SECRET=change-me-in-production
B2B_JWT_SECRET=change-me-in-production

# PayPal (server and public fallbacks)
PAYPAL_MODE=sandbox # or live
PAYPAL_CLIENT_ID= # server-side client id
PAYPAL_CLIENT_SECRET= # server-side secret
PAYPAL_SANDBOX_CLIENT_ID= # sandbox client id
PAYPAL_SANDBOX_CLIENT_SECRET= # sandbox secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID= # used by client
NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID=
NEXT_PUBLIC_PAYPAL_MODE=sandbox

# Email (Resend or SMTP)
RESEND_API_KEY= # if using Resend
SMTP_FROM="La Vieja Adventures <noreply@example.com>"

# Analytics / Ads (client-side IDs)
NEXT_PUBLIC_GOOGLE_ADS_ID=G-XXXXXXXXXX

# Social / posting
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=

# Misc
NEXT_PUBLIC_ENABLE_DEBUG=false

```

Guidelines:
- Keep secrets (any value without `NEXT_PUBLIC_`) out of client bundles and never commit `.env.local` to git.
- Use strong random values for `AUTH_SECRET`, `ADMIN_JWT_SECRET`, and `B2B_JWT_SECRET` (at least 32 characters).
- For production, set `NODE_ENV=production` and configure secure hosting for secrets (Vercel Secrets, environment in your hosting provider, or HashiCorp Vault).

## Run locally

- Start dev server: `npm run dev`
- Lint: `npm run lint` (if configured)
- Build: `npm run build`
- Start production locally: `npm run start`

If you need sample data, you can create test bookings via the app UI or seed the database using scripts (not included by default).

## Build & deploy

Recommended deployment: Vercel (native for Next.js). Create a project in Vercel, connect this repo, and add the environment variables in the Vercel dashboard (use the exact names above).

Other hosts that support Node/Next.js (Netlify, Render, Fly) will also work — ensure you provide the same environment variables through their settings.

## Security & production notes
- Never commit secrets. Add `.env.local` to `.gitignore` (Next.js default already excludes it).
- Use HTTPS for `APP_BASE_URL` in production.
- Rotate API keys and secrets if they are exposed.
- Use provider-managed secrets (Vercel Environment Variables, AWS Secrets Manager, etc.) in production.

## Recommended next steps for this project
- Add a minimal CI pipeline (GitHub Actions) to run linting and build on PRs.
- Add automated tests for the reservation flow (unit + integration).
- Add monitoring (Sentry) and uptime checks.
- Configure image CDN or Cloud Storage for `public/` images (Cloudinary, S3 + CDN).
- Add database backup jobs for MongoDB Atlas or your DB host.

## Where to look in the code
- Main routes and pages: `app/`
- Reusable components: `components/`
- Server helpers (DB, auth, payments): `lib/`
- API endpoints: `app/api/`

## Contributing
Feel free to open issues and PRs. For changes that affect production behavior (auth, payments, DB schema), please coordinate with the team and include migration notes.

---

If you'd like, I can also:
- generate a `.env.example` file in the repo
- scaffold a GitHub Actions workflow for CI
- add a CONTRIBUTING.md with rules for PRs and releases

Tell me which of these you'd like next and I will implement it.
