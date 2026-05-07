# Deployment Guide

## Cloudflare Worker demo deployment

1. Install dependencies with `npm install`.
2. Create or reuse a D1 database and update `wrangler.json` if needed.
3. Apply migrations locally with `npm run seedLocalD1`.
4. Validate with `npm run check`.
5. Add production secrets with `npx wrangler secret put OPENAI_API_KEY` and any approved provider credentials.
6. Deploy with `npm run deploy`.

## Vercel + Next.js production target

This repository currently ships a Cloudflare Worker implementation that mirrors the requested SaaS pages and API surfaces. For a full Vercel production build:

1. Create a Next.js app directory and move the page sections into React server components.
2. Use the included `prisma/schema.prisma` as the PostgreSQL data model.
3. Configure `DATABASE_URL`, auth variables, `OPENAI_API_KEY`, and integration secrets from `.env.example`.
4. Run `npx prisma migrate deploy` during the Vercel build.
5. Implement Clerk or NextAuth middleware to protect all pages except `/login`.
6. Keep outbound messaging behind the approval queue and provider-specific consent checks.

## Required production hardening

- Complete Meta App Review before using Instagram messaging APIs.
- Store provider tokens encrypted.
- Add webhook signature verification for Meta, GoHighLevel, Zapier, Twilio, and SendGrid.
- Add Cloudflare Queues/Cron Triggers or a Next.js job runner for follow-up scheduling, never direct mass blasting.
- Retain audit logs for compliance reviews.
