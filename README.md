# 1SV Content Engine

1SV Content Engine is an original creator content automation SaaS prototype for **1 Soundvibe Entertainment**, **1 Soundvibe Studios**, artists, podcasters, event promoters, creators, client brands, and small business owners.

This first version is a fully usable planning dashboard before live social posting is connected. It runs as a Cloudflare Worker demo today and includes a Supabase-ready schema, AI service layer, mock analytics, exports, billing placeholders, and compliant social API integration placeholders.

> This app does **not** copy any third-party branding, text, logos, protected designs, or assets. It provides similar content-automation workflow concepts with original 1 Soundvibe branding.

## Current stack

The repository is currently a Cloudflare Worker TypeScript app with a single-page SaaS interface. The architecture and schema are ready to migrate into a full Next.js + React + Tailwind + Supabase + Stripe application when desired.

Implemented now:

- TypeScript Cloudflare Worker
- Original responsive SaaS UI with black/gold/white luxury branding
- Mock AI generation service with `OPENAI_API_KEY` detection
- API endpoints for AI generation, repurposing, and integration status
- Supabase/Postgres schema for production data models
- Stripe-ready billing plan data model and UI placeholders
- Social platform API configuration placeholders

## Product modules included

- Auth UI: signup, login, forgot password, user profile concepts, workspace selection, and roles
- Main dashboard: scheduled posts, weekly publishing, engagement, leads, top content, AI usage, and quick actions
- Workspaces: default sample brands and client workspace data
- AI content generator: platform-specific captions, email, SMS, blog, hooks, hashtags, and overlay text
- Content repurposer: captions, stories, email, SMS, blog, YouTube description, hashtags, CTAs, and schedule
- Content calendar/scheduler: month/list planning, post creation, statuses, media upload placeholder
- Automation builder: keyword triggers, public replies, DM copy, follow-up, booking link, lead tags, toggles
- Lead CRM: contact details, source, trigger keyword, service interest, status, assignment, follow-up
- Link-in-bio builder: templates, profile preview, buttons, QR/V-card placeholders, social links
- Analytics dashboard: mock line, bar, pie, top content, ROI-ready structure
- Campaign builder: goals, dates, offers, audiences, platforms, frequency, PDF-ready HTML export
- Template library: reusable captions, scripts, emails, SMS, testimonials, and DMs
- Admin panel: users, workspaces, plans, usage, templates, automations, and logs
- Billing structure: Free Trial, Creator, Pro, Agency, and Lifetime Deal placeholders

## Local setup

```bash
npm install
npm run dev
```

Open the local Wrangler URL printed in your terminal.

## Environment variables

Copy the example environment file and fill values as services are connected:

```bash
cp .env.example .env.local
```

Important variables:

- `OPENAI_API_KEY` — optional. If not present, the app returns high-quality mock AI content.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — for a future Next.js/Supabase frontend.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only key for backend admin operations.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — billing placeholders.
- Platform API credentials for Meta, TikTok, YouTube, LinkedIn, X, and Pinterest.

## API endpoints

### Generate content

```bash
curl -X POST http://localhost:8787/api/ai/generate \
  -H 'content-type: application/json' \
  -d '{"topic":"studio booking campaign","goal":"book sessions","audience":"artists","offer":"book now","tone":"Luxury"}'
```

### Repurpose content

```bash
curl -X POST http://localhost:8787/api/repurpose \
  -H 'content-type: application/json' \
  -d '{"source":"Promote the new studio package."}'
```

### Integration status

```bash
curl http://localhost:8787/api/integrations/status
```

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor.
3. Run `migrations/0002_1sv_content_engine_supabase_schema.sql`.
4. Connect Supabase Auth and Storage in the future Next.js app.
5. Add Row Level Security policies before production launch.

## Deployment

### Cloudflare Worker demo

```bash
npm run check
npm run deploy
```

### Vercel-ready future path

For a full Next.js deployment, create a Next.js app shell, move the UI into React components, wire Supabase Auth, and deploy to Vercel with these variables:

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Stripe keys
- Approved social API credentials

## Compliance and safety

The automation builder is a planning and configuration interface only. Live auto-posting or auto-messaging must be connected only through official APIs and approved permissions.

Do not use the platform to:

- Send spam
- Scrape private data
- Auto-message users without permission
- Bypass social platform rules
- Publish to accounts without proper authorization

The app includes this warning in automation settings: **“Use only with connected accounts and platform-approved permissions.”**

## TODO: connecting real services

- Replace mock AI generation with OpenAI API calls in `src/aiService.ts`.
- Add Supabase Auth, workspace membership checks, RLS policies, and storage buckets.
- Connect Stripe Checkout, customer portal, webhooks, usage metering, and plan enforcement.
- Add OAuth for Meta, TikTok, YouTube, LinkedIn, X, and Pinterest.
- Implement platform-specific posting adapters with retry, error logging, and audit trails.
- Add real analytics ingestion and normalization by platform.
- Generate QR images for link pages and downloadable V-cards.
- Convert the Worker UI into modular Next.js React components with Tailwind CSS.
