# 1SV Growth Engine

1SV Growth Engine is an ethical Instagram lead discovery, CRM, and outreach automation platform for creators, studios, artists, and small businesses. It is positioned as a simpler, safer alternative to tools like ManyChat, Inflact, and PhantomBuster for teams that want lead organization, AI-assisted drafting, approval queues, and booking workflows without spammy automation.

This starter is implemented as a Cloudflare Worker + D1 app so it can run inside the existing repository. It also includes a PostgreSQL Prisma schema and Vercel deployment notes for a production Next.js migration.

## Compliance-first design

The app intentionally does **not** implement illegal scraping, fake Instagram login, password collection, bot abuse, or unauthorized spam tooling.

Key safeguards:

- Official Meta / Instagram API placeholders where applicable.
- Public discovery architecture that only accepts lawful public data or manual CSV imports.
- Draft-only AI message generation.
- Human approval queue before every outbound message.
- Duplicate lead detection model.
- Do Not Contact and opt-out enforcement.
- Daily limits, cooldowns, audit logs, consent tracking, and spam warnings.

## Built pages

- `/login`
- `/dashboard`
- `/leads`
- `/lead/ld_001`
- `/campaigns`
- `/campaign-builder`
- `/approval-queue`
- `/inbox`
- `/booking-links`
- `/team`
- `/settings`
- `/compliance`
- `/integrations`

## API surfaces

- `GET /api/health`
- `GET /api/dashboard`
- `GET /api/leads`
- `GET /api/leads/:id`
- `POST /api/import/csv`
- `GET /api/campaigns`
- `GET /api/approval-queue`
- `POST /api/ai/generate-dm`
- `GET /api/inbox`
- `GET /api/booking-links`
- `GET /api/automation-rules`
- `GET /api/team`
- `GET /api/compliance`
- `GET /api/integrations`

## Demo campaigns

Starter data includes campaigns for:

- Houston recording studio tour
- R&B artist session invite
- Producer collaboration
- Vibe Check Thursday invite
- Podcast room booking
- Membership offer

## Setup

```bash
npm install
cp .env.example .env
npm run seedLocalD1
npm run dev
```

Open the local Worker URL printed by Wrangler, then visit `/dashboard`.

## Validation

```bash
npm run check
```

The check command runs TypeScript and a Wrangler dry-run deploy.

## Production architecture

Requested production stack mapping:

- Frontend: Next.js pages/components styled like a Shadcn/Tailwind SaaS dashboard.
- Backend: Next.js API routes or server actions matching the Worker API surfaces.
- ORM/database: Prisma + PostgreSQL using `prisma/schema.prisma`.
- Auth: Clerk or NextAuth.
- AI: OpenAI API for draft generation only.
- Integrations: Meta Graph API, Instagram Basic Display API, CSV import, Twilio, SendGrid, GoHighLevel webhook, and Zapier webhook placeholders.

See `docs/DEPLOYMENT.md` for Cloudflare and Vercel deployment guidance.
