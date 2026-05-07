# CCB Network — Connect, Create, & Build

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftoptierprnews-source%2Fccb-worldwide.git&project-name=ccb-worldwide&repository-name=ccb-worldwide)

CCB Network is a clean, from-scratch Next.js + Prisma + PostgreSQL platform for launching web-first creator streaming networks and preparing future distribution roadmaps.

## Repository

- GitHub: <https://github.com/toptierprnews-source/ccb-worldwide.git>
- Vercel deploy: <https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ftoptierprnews-source%2Fccb-worldwide.git&project-name=ccb-worldwide&repository-name=ccb-worldwide>

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- PostgreSQL with Prisma ORM
- NextAuth credentials auth with admin/creator roles
- Zod validation, React Hook Form, REST API routes
- Local MVP uploads with S3/Stripe/email/TV platform placeholders

## Important deployment note

This repository is **not** a Cloudflare Workers/D1 template. There is no `wrangler.json`, Worker type file, or old D1 sample migration. Deploy it as a Next.js app with PostgreSQL.

## Local setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Default admin: `admin@ccbnetwork.local` / `ChangeMe123!`.
Default creators: `creator1@ccbnetwork.local`, `creator2@ccbnetwork.local`, `creator3@ccbnetwork.local` / `Creator123!`.

## Production deploy

1. Use the GitHub repository `https://github.com/toptierprnews-source/ccb-worldwide.git`.
2. Create a managed PostgreSQL database.
3. Import the repo into Vercel or another Next.js host, not a Workers/D1 template.
4. Set `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
5. Deploy, then run `npm run db:deploy` and `npm run prisma:seed` once against production.

## Checks

```bash
npm run typecheck
npm run build
```
