# CCB Network — Connect, Create, & Build

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)


CCB Network is an original full-stack streaming-network launch platform for creators, churches, podcasters, educators, indie filmmakers, brands, and community organizations. It starts as a free/low-cost web distribution MVP and is structured to scale later into cloud storage, payments, email, Roku, Fire TV, Apple TV, Android TV, mobile apps, FAST, IPTV, and subscriptions.

> The MVP intentionally does **not** claim instant publishing to Roku, Fire TV, Apple TV, or other third-party platforms. Connected-TV distribution is a roadmap phase that can require developer accounts, platform approval, app builds, compliance, technical packaging, and fees.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- NextAuth credentials authentication
- Zod validation
- React Hook Form
- Local-first upload/storage structure with S3-compatible placeholders
- Stripe-ready placeholders
- REST API routes

## Deploy to production

The previous Cloudflare D1 template deploy button is no longer appropriate because this project is now a full Next.js + Prisma + PostgreSQL application. Use a standard Next.js host such as Vercel, connect a managed PostgreSQL database, and set the environment variables from `.env.example`.

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. Create a PostgreSQL database with Neon, Supabase, Railway, Render, Vercel Postgres, or another managed provider.
3. Import the repository into Vercel as a Next.js project, or run `npm run deploy:vercel` after authenticating with Vercel CLI.
4. Add `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the hosting provider environment settings.
5. Deploy the site, then run `npm run db:deploy` and `npm run prisma:seed` once against the production database. The initial Prisma migration is committed under `prisma/migrations/20260507162000_init`.
6. Visit `/deploy` in the application for an in-app deployment checklist.

The included `vercel.json` makes the project show as a Next.js deployment and uses `npm run build`. The build script supplies safe build-time placeholders for `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` so dependency generation does not fail before production environment variables are attached; real runtime values are still required before launch.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Set required local values in `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ccb_network?schema=public"
NEXTAUTH_SECRET="generate-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@ccbnetwork.local"
ADMIN_PASSWORD="ChangeMe123!"
STORAGE_PROVIDER="local"
```

4. Run Prisma migrations:

```bash
npx prisma migrate dev --name init
```

5. Seed the database:

```bash
npm run prisma:seed
```

6. Start the dev server:

```bash
npm run dev
```

Open <http://localhost:3000>.

## Default logins

- Admin: `admin@ccbnetwork.local` / `ChangeMe123!` (or values from `ADMIN_EMAIL` and `ADMIN_PASSWORD`)
- Creators: `creator1@ccbnetwork.local`, `creator2@ccbnetwork.local`, `creator3@ccbnetwork.local` / `Creator123!`

Change all seeded passwords before any public deployment.

## Main routes

### Public pages

- `/` homepage
- `/about`
- `/start`
- `/distribution`
- `/pricing`
- `/deploy`
- `/apply`
- `/networks`
- `/networks/[slug]`
- `/watch`
- `/watch/[slug]`
- `/resources`
- `/resources/[slug]`
- `/contact`
- `/privacy`
- `/terms`
- `/content-rights`
- `/admin/login`

### Creator

- `/dashboard`
- `/api/upload` (authenticated local MVP uploads)
- `/api/dashboard`
- `/api/creator/profile`
- `/api/creator/networks`
- `/api/creator/networks/:id`
- `/api/creator/videos`
- `/api/creator/videos/:id`
- `/api/creator/checklist/:networkId`

### Admin

- `/admin`
- `/admin/applications`
- `/admin/networks`
- `/admin/videos`
- `/admin/users`
- `/admin/pricing`
- `/admin/leads`
- `/admin/resources`
- `/admin/settings`
- `/admin/analytics`

Protected admin APIs include applications, networks, videos, leads, analytics, resources, and settings.

## Storage roadmap

The MVP supports free local development and video links from YouTube, Vimeo, or direct MP4/WebM URLs. `services/storage.ts` centralizes storage decisions. To switch to cloud storage later:

1. Set `STORAGE_PROVIDER=s3` or a provider label such as `r2`/`bunny`.
2. Fill in `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, and `S3_REGION`.
3. Replace the local upload placeholder with signed upload URLs and server-side validation.
4. Keep the existing file type restrictions for videos and images.

## Stripe roadmap

Payments are disabled in MVP. To enable Stripe later:

1. Create Stripe products/prices for Builder, Network Pro, and Enterprise deposits/subscriptions.
2. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
3. Implement checkout sessions in `services/stripe.ts`.
4. Add webhook handling for subscription status and billing events.

## TV app distribution roadmap

Placeholder service files document the requirements for future integrations:

- `services/roku.ts`
- `services/firetv.ts`
- `services/appletv.ts`
- `services/androidtv.ts`

Each future platform can require developer accounts, branding assets, metadata, privacy and terms URLs, app builds, QA devices, technical review, content compliance, and fees.

## Security notes

- NextAuth credentials authentication with bcrypt password hashes.
- Role-based route protection for admin and creator areas.
- Zod validation on form and API inputs.
- Basic in-memory rate limiting on application/contact forms.
- Honeypot spam fields on public forms.
- Hashed IP/user-agent values for view logs.
- Optional environment variables for paid providers.
- No hardcoded production secrets.

## Quality checks

```bash
npm run typecheck
npm run build
npm run db:deploy
```

Run these after changing schema, routes, or UI components.
