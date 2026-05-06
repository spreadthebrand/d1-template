# Houston Indie 30

Houston Indie 30 is a full-stack music chart web app for ranking the top 30 non-mainstream artists in Houston, Texas. It is inspired by the general product category of ranked artist charts, but uses original naming, UI, copy, seed data, and implementation.

## What is included

- Responsive dark, Houston-inspired public website: home, chart, artist profiles, song pages, submissions, about, RSS news, and admin sections.
- Cloudflare Worker REST API backed by D1 for chart, artist, song, submission, analytics, stream, download, RSS, and admin workflows.
- HTML5 global sticky mini-player with play/pause, progress, loading/error handling, and valid-stream reporting.
- Spam-resistant stream counting: a play only counts after 30 seconds or 50% of duration, whichever comes first, and is rate-limited by song, session, and hashed IP.
- Protected download endpoint for approved songs with permission-enabled downloads and download logs.
- External platform outbound click tracking for Spotify, Apple Music, YouTube, SoundCloud, Audiomack, Bandcamp, Instagram, TikTok, X/Twitter, and websites.
- Weekly scheduled chart recalculation through Cloudflare Cron Triggers.
- Prisma schema for a production PostgreSQL deployment path, plus D1 SQL migrations for local Worker development.
- Seed data for 30 fictional Houston underground artists.
- Defensive first-request D1 bootstrap so preview deployments render instead of throwing if remote migrations were not applied yet.

## Local development

```bash
npm install
npm run seedLocalD1
npm run dev
```

The development server runs with Wrangler. Open the URL printed by Wrangler and visit:

- `/` for the homepage
- `/chart` for the current Houston Indie 30
- `/submit` for public artist submissions
- `/news`, `/news/houston`, `/news/industry`, `/news/new-releases` for RSS-powered pages
- `/admin` for the admin dashboard shell

## Checks

```bash
npm run check
```

`npm run check` runs TypeScript and a Wrangler dry-run deploy.

## Data model

D1 migrations live in `migrations/0001_houston_indie_30.sql` and create the canonical local/remote database. The Worker also calls `ensureDatabase` on startup as a safety net for preview deployments where remote migrations were skipped, preventing Cloudflare Error 1101 from missing tables. The schema includes:

- `users`
- `artists`
- `songs`
- `chart_entries`
- `submissions`
- `rss_sources`
- `rss_items`
- `stream_logs`
- `download_logs`
- `external_click_logs`

`prisma/schema.prisma` mirrors the same production-oriented model in Prisma format for PostgreSQL deployments.

## API overview

Public:

- `GET /api/chart/current`
- `GET /api/chart/history`
- `GET /api/artists`
- `GET /api/artists/:slug`
- `GET /api/songs/:slug`
- `POST /api/submissions`
- `POST /api/songs/:id/stream/start`
- `POST /api/songs/:id/stream/complete`
- `GET /api/songs/:id/download`
- `GET /api/rss/items?category=houston`
- `POST /api/external-click`

Admin API routes require `Authorization: Bearer dev-admin-token` in local development:

- `GET /api/admin/submissions`
- `PATCH /api/admin/submissions/:id`
- `POST /api/admin/chart/recalculate`
- `POST /api/admin/rss/sources`
- `DELETE /api/admin/rss/sources/:id`
- `POST /api/admin/rss/refresh`
- `GET /api/admin/analytics/streams`
- `GET /api/admin/analytics/downloads`
- `GET /api/admin/analytics/external-clicks`

Replace the development token with NextAuth, Auth.js, Cloudflare Access, or another secure admin authentication provider before production.

## Ranking formula

```text
score =
(validOnSiteStreams * 2)
+ (downloadCount * 3)
+ (uniqueListeners * 4)
+ (recentActivityScore * 5)
+ (editorialScore * 10)
+ (localRelevanceScore * 8)
+ (externalPlatformClickScore * 1)
```

The chart excludes mainstream artists by default, stores historical weekly entries, calculates movement (`up`, `down`, `new`, `same`), and limits the public chart to 30 artists.

## Legal and content safety

- The app does not use Billboard names, logos, proprietary chart data, proprietary assets, copied copywriting, or protected content.
- Artist submissions include this permission language: “By submitting, you confirm that you own or control the rights to this music and grant this platform permission to display, stream, and, if selected, offer the submitted song for download.”
- Songs should only be streamed or downloaded after rights and permissions are verified.
- RSS pages should render sanitized summaries and link back to original sources. Do not scrape protected pages.
- External platform service files are placeholders for official APIs and do not promise arbitrary public stream counts.

## Production notes

1. Replace `dev-admin-token` in `src/security.ts` with an environment-backed token or a real auth provider.
2. Move audio and cover art uploads to S3/R2 or another signed URL storage layer.
3. Connect `src/services/spotify.ts`, `src/services/appleMusic.ts`, and `src/services/youtube.ts` only with official API credentials and permissions.
4. Replace placeholder RSS feeds with active public RSS sources and implement feed fetch scheduling if needed.
5. Keep IP hashing enabled and never store plain visitor IP addresses.
6. Review manual chart overrides and suspicious-stream exclusion workflows before launch.
