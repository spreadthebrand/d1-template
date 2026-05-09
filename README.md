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


### Release export package system

Admins and super admins can generate internal-only delivery packages for Vydia or manual backend delivery from approved releases. Artist accounts never receive backend distributor, backend account, export log, or internal delivery-note fields; artist release responses are limited to artist-safe status, artist-facing notes, live links, and royalty data.

Admin export controls include:

- **Generate Delivery Package** for the full release ZIP.
- **Export Metadata CSV** for partner metadata entry.
- **Download Audio Files** and **Download Artwork** bundles.
- **Download Full Release ZIP** with the required `1SV_RELEASE_EXPORT` folder structure.
- **Mark as Delivered** and **Add Backend Delivery Notes** for manual delivery status tracking.
- **Copy Vydia Delivery Notes** for a formatted Vydia handoff note.

The full ZIP is generated server-side and contains:

```text
/1SV_RELEASE_EXPORT/
  /metadata/
    metadata.csv
    split_sheet.csv
    contributor_credits.csv
  /audio/
    track_01_title.wav
  /artwork/
    cover_art_3000x3000.jpg
  /lyrics/
    track_01_lyrics.txt
  /admin/
    delivery_notes.txt
    backend_distributor.txt
    content_id_opt_in.txt
    sync_opt_in.txt
  release_summary.pdf
```

Before export, the server validates WAV presence, cover art presence/type, release date, artist name, track title, writer credits, P-line, C-line, explicit flag choice, Content ID choice, and sync opt-in choice. Cover dimensions are surfaced as warnings if they are missing or not 3000x3000. Admins are blocked on missing required items; super admins can intentionally override by calling the export endpoint with `?override=1`.

Export activity is written to `export_logs` and `audit_logs`, including release ID, exported admin, export type, backend distributor, secure storage path when configured, timestamp, and validation notes.

### Vydia/manual delivery workflow

1. Admin opens the Admin Dashboard and selects **Generate Delivery Package** for a release.
2. Admin reviews the validation checklist and Vydia checklist: metadata, WAV audio, artwork, rights, uncleared samples, explicit lyrics flag, Content ID eligibility, territories, artist profile links, and release-date window.
3. Admin saves backend delivery notes and selects an internal backend distributor such as `Vydia` or `Manual / Other`.
4. Admin downloads the metadata CSV or full ZIP and uploads/processes it in the selected backend distributor account.
5. Admin uses **Copy Vydia Delivery Notes** to paste a clean internal delivery note into the backend partner workflow.
6. Admin updates delivery status through: `Ready for Export`, `Export Generated`, `Sent to Backend Distributor`, `Delivered`, `Live`, `Issue Flagged`, `Takedown Requested`, or `Archived`.
7. Admin adds live DSP links after the release is live; artists can see only the live links and artist-facing notes.

### Supabase Storage configuration for exports

The Worker can store generated export packages in a private Supabase Storage bucket while still returning the generated file to the admin browser. Configure two private buckets:

- `release-assets` for source WAV, artwork, lyric, and press-kit assets.
- `release-exports` for generated delivery packages.

Recommended Supabase policy approach:

- Keep both buckets private.
- Do not expose service-role keys to the browser.
- Allow only the Worker/server runtime to read source assets and write export packages.
- Store object paths in the `files.storage_path` field for source assets.
- Store generated export object paths in `export_logs.export_file_url`.

Required storage variables:

```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put SUPABASE_ASSET_BUCKET
wrangler secret put SUPABASE_EXPORT_BUCKET
```

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
- `export_logs`

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
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put SUPABASE_ASSET_BUCKET
wrangler secret put SUPABASE_EXPORT_BUCKET
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
