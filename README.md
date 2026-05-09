# 1SV Distribution — 1 Soundvibe Entertainment

A production-ready MVP for **1SV Distribution**, a luxury black/gold/white music distribution website and artist portal for **1 Soundvibe Entertainment**.

**Tagline:** Connect. Create. Build. Distribute.

The app runs as a Cloudflare Worker with D1 and includes a public marketing site, artist application flow, authenticated artist dashboard, release submission workflow, internal admin dashboard, manual royalty management, payout requests, Stripe Checkout integration, Resend email notifications, RBAC, audit logs, and backend distributor fields that are hidden from artists by default.

## Product positioning

> 1SV Distribution gives independent artists and labels access to a professional release ecosystem powered by music distribution, content creation, sync licensing, studio resources, and artist development.

> Artists submit music through 1 Soundvibe Entertainment. Our team reviews, prepares, and processes releases through our distribution infrastructure and backend partners.

> Backend distribution providers are internal operational partners and should not be publicly displayed by default.

## Included features

### Public website

- Home landing page with luxury black/gold/white branding.
- About 1SV Distribution section.
- Distribution Services, Artist Services, Sync Licensing, YouTube Monetization, Pricing, Apply Now, FAQ, Contact, and Login/Register entry points.
- Mobile responsive cards, premium hero, trust copy, CTAs, and footer.

### Artist application

The application captures first name, last name, artist name, legal name, email, phone, city/state, genre, DSP and social links, current distributor, monthly listeners, monthly streaming revenue, number of releases, upcoming release date, label/master ownership flags, publishing/sync/marketing needs, notes, EPK metadata, and consent.

### Auth and roles

- Cookie-based sessions using secure, HttpOnly, SameSite cookies.
- Passwords hashed with a per-user salt using Web Crypto SHA-256.
- Roles: `artist`, `label_manager`, `admin`, `super_admin`.
- Demo accounts:
  - Super Admin: `admin@1sv.test` / `1Soundvibe!`
  - Artist: `artist@1sv.test` / `1Soundvibe!`

### Artist dashboard

Artists can create release drafts, submit releases, add metadata, upload validated file metadata for WAV audio and JPG/PNG artwork, add track credits, opt into YouTube Content ID and sync licensing, view release statuses, see admin notes, view royalty rows, and request payouts.

Release statuses include `draft`, `submitted`, `in_review`, `changes_requested`, `approved`, `delivered`, `live`, and `rejected`.

### Admin dashboard

Admins and super admins can view applications, approve or reject applicants, view all artists/releases, change release status, add internal and artist-facing notes, export release metadata CSV, upload manual royalty rows, see overview metrics, and manage operational backend distributor fields.

### Backend distributor logic

The schema includes internal-only backend distributor options: Vydia, Too Lost, Symphonic, FUGA, Virgin Music Group, and Other. Release records include delivery status, delivery notes, delivery date, DSP issue flag, Content ID status, and royalty import source. These fields are available to admin APIs and excluded from public presentation by default.

### Payments and email

- Stripe Checkout endpoint for application fees, distribution setup fees, monthly artist plans, add-ons, and invoice-like payments.
- Resend transactional email hook for application confirmations.
- The app returns a clear configuration error if Stripe keys or price IDs are not configured.

## Tech stack

- Cloudflare Workers
- TypeScript
- Cloudflare D1 SQL database
- Vanilla responsive HTML/CSS/JS rendered by the Worker
- Stripe Checkout API
- Resend Email API

> Note: The original request suggested Next.js, Supabase, Tailwind, Stripe, and Resend. This repository is a Cloudflare Worker + D1 template, so this implementation keeps the deployment native to the existing project while preserving the requested product behavior, schema, RBAC, payments, and email integration patterns.

## Database tables

The D1 migration creates:

- `users`
- `sessions`
- `artist_profiles`
- `applications`
- `releases`
- `tracks`
- `contributors`
- `royalty_statements`
- `royalty_rows`
- `payout_requests`
- `service_orders`
- `messages`
- `admin_notes`
- `files`
- `pricing_plans`
- `backend_distributors`
- `platform_settings`
- `audit_logs`

## Environment variables

Set these as Cloudflare Worker secrets or environment variables:

```bash
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_PRICE_APPLICATION_FEE
wrangler secret put STRIPE_PRICE_SETUP_FEE
wrangler secret put STRIPE_PRICE_MONTHLY_PLAN
wrangler secret put STRIPE_PRICE_ADD_ON
wrangler secret put STRIPE_SUCCESS_URL
wrangler secret put STRIPE_CANCEL_URL
wrangler secret put RESEND_API_KEY
wrangler secret put RESEND_FROM_EMAIL
```

Required binding:

- `DB` — Cloudflare D1 database binding configured in `wrangler.json`.

## Local setup

```bash
npm install
npm run seedLocalD1
npm run dev
```

Open the local Wrangler URL and use the demo credentials above.

## Checks

```bash
npm run check
```

This runs TypeScript and a Wrangler dry-run deploy.

## Deployment

### Cloudflare Workers

1. Create a D1 database:

   ```bash
   npx wrangler d1 create 1sv-distribution-database
   ```

2. Copy the generated database ID into `wrangler.json`.
3. Apply migrations:

   ```bash
   npx wrangler d1 migrations apply DB --remote
   ```

4. Add secrets:

   ```bash
   wrangler secret put STRIPE_SECRET_KEY
   wrangler secret put RESEND_API_KEY
   ```

5. Deploy:

   ```bash
   npm run deploy
   ```

### Vercel deployment notes

This repository is implemented as a Cloudflare Worker because the provided starter template is Worker + D1. To deploy the same product on Vercel, use the data model and route contracts in this repo with a Next.js app:

1. Create a Next.js project with TypeScript.
2. Port `src/renderHtml.ts` into React components and `src/index.ts` API branches into Next.js Route Handlers.
3. Replace D1 binding calls with Supabase SQL queries or a Postgres client.
4. Move file metadata validation into server actions and connect Supabase Storage.
5. Configure Stripe and Resend environment variables in Vercel Project Settings.
6. Deploy with `vercel --prod`.

The product workflows, schema, RBAC rules, and hidden backend distributor design in this repository are structured so they can be moved to Supabase/Vercel without changing artist-facing behavior.

## Security notes

- Role-based API checks protect artist, admin, and super-admin workflows.
- Artists can only query their own releases and royalties.
- Admin and super-admin routes can view global operational data.
- File metadata is validated for allowed MIME types, dangerous extensions, and max file sizes.
- Sensitive backend distributor fields are internal operational fields.
- Audit logs are written for login, registration, applications, releases, decisions, royalties, and payout requests.
- Add an object storage binding such as Cloudflare R2 or Supabase Storage before accepting binary production assets at scale.
