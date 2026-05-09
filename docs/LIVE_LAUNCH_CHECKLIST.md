# Live Launch Checklist for 1SV Growth Engine

Use this checklist to turn the local demo into a live Cloudflare Worker + D1 app.

## What is already live-capable

The current Worker app can run in production without a Next.js conversion. It already has:

- A Cloudflare Worker entrypoint at `src/index.ts`.
- A D1 binding named `DB` in `wrangler.json`.
- D1 migrations for the CRM, campaigns, approval queue, booking links, audit logs, and lead searches.
- HTML forms that POST to Worker action routes and persist to D1.
- JSON APIs that read/write D1.
- OpenAI draft generation support when `OPENAI_API_KEY` is configured.

## 1. Authenticate Wrangler

```bash
npx wrangler login
```

Confirm the browser login finishes successfully before creating the production database.

## 2. Create the production D1 database

```bash
npm run db:create
```

Copy the `database_id` returned by Wrangler and paste it into `wrangler.json` under the existing `d1_databases[0].database_id` field.

Keep these values aligned:

```json
{
  "name": "1sv-growth-engine",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "1sv-growth-engine-db",
      "database_id": "PASTE-YOUR-REAL-D1-ID-HERE"
    }
  ]
}
```

## 3. Add production secrets

Only add secrets for providers you are actively using. The app still works without OpenAI by falling back to a safe local DM template. See `docs/API_INTEGRATIONS.md` for provider-by-provider setup.

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put META_APP_SECRET
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put SENDGRID_API_KEY
```

Do **not** commit real secrets to `.env.example`, `wrangler.json`, or the repository.

## 4. Apply remote D1 migrations

```bash
npm run db:migrate:remote
```

This creates the production tables and seeds starter data for campaigns, approval drafts, booking links, automation rules, and audit logs.

## 5. Validate before deploy

```bash
npm run check
```

The check command runs TypeScript and a Wrangler dry-run deploy.

## 6. Deploy the Worker

```bash
npm run deploy:production
```

Wrangler prints the deployed `workers.dev` URL. Visit `/dashboard` on that URL.

## 7. Smoke test the live URL

Replace `YOUR_WORKER_URL` with the URL Wrangler prints.

```bash
curl https://YOUR_WORKER_URL/api/health
curl https://YOUR_WORKER_URL/api/dashboard
curl https://YOUR_WORKER_URL/api/setup-checklist
curl -X POST https://YOUR_WORKER_URL/api/leads \
  -H "content-type: application/json" \
  -d '{"name":"Launch Test Artist","username":"launchtestartist","source":"Launch smoke test"}'
curl https://YOUR_WORKER_URL/api/leads
```

Expected result: the created lead appears in `/api/leads` and on the `/leads` page.

## 8. Make it usable by a team

Before sharing with VAs or sales reps, finish these production controls:

- Put Cloudflare Access, Clerk, or NextAuth in front of the dashboard.
- Add your real booking links under `/booking-links`.
- Add your OpenAI key only if you want AI-generated drafts.
- Complete Meta App Review before connecting Instagram messaging workflows.
- Keep every outbound message in the approval queue; do not add mass blasting.

## 9. Custom domain

After the Worker is deployed, add a custom domain in the Cloudflare Workers dashboard or with a Worker route. Point a subdomain like `growth.1soundvibe.com` at the Worker, then re-run the smoke tests against the custom domain.
