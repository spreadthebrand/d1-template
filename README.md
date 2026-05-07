# 1 Soundvibe Studios Intern Intake System

This Cloudflare Worker + D1 app now runs a complete intake and tracking workflow for 1 Soundvibe Studios interns. It gives Rere a public candidate intake form, an admin portal/tracker, weekly reporting tools, CSV export for Google Sheets, and an optional Google Drive file-sync bridge for resumes and portfolios.

## What It Does

- Collects candidate name, email, phone, desired role, resume upload, portfolio/work samples, portfolio links, weekly availability, and notes.
- Seeds the tracker with the current priority intern list for Rere and Brittany / BB Management to manage.
- Tracks the required columns: candidate name, email, desired role, resume received, portfolio received, interview status, notes, and final placement.
- Supports statuses: New Lead, Resume Requested, Resume Received, Interview Scheduled, Interview Completed, Accepted, Not Selected, and Future Consideration.
- Stores candidates and activity logs in Cloudflare D1.
- Exports the tracker as CSV for Google Sheets.
- Uploads files to Google Drive when a Google Apps Script webhook is configured.
- Keeps the tracker admin-only with `ADMIN_TOKEN`; the public intake form links to the token-protected portal, not to candidate names.
- Clearly shows where data is saved: candidate details in Cloudflare D1 and uploaded files in Google Drive when Drive sync is connected.

## Important Routes

| Route | Purpose |
| --- | --- |
| `/` | Public intern intake form for new candidates. |
| `/portal` or `/admin` | Admin-token protected portal for Rere's dashboard and full tracker. |
| `/api/candidates?token=ADMIN_TOKEN` | Admin-protected JSON feed of stats and candidates for integrations. |
| `/export.csv?token=ADMIN_TOKEN` | CSV export for Google Sheets / Google Drive workflows. |
| `/google-drive-setup?token=ADMIN_TOKEN` | Admin-protected Google Apps Script setup instructions for Drive uploads. |


## Where Everything Is Saved

- **Candidate tracker records** are saved in the Cloudflare D1 database configured in `wrangler.json` as binding `DB` and database name `d1-template-database`. The main table is `intern_candidates`; activity history is saved in `intern_activity_log`.
- **Uploaded resume and portfolio files** are sent to Google Drive only after `GOOGLE_DRIVE_WEBHOOK_URL` and `GOOGLE_DRIVE_SHARED_SECRET` are configured. The Drive folder name is `1 Soundvibe Studios Intern Intake`, and each candidate row stores the returned Drive URL.
- **Admin portal** is available at `/portal` and `/admin`. It requires `ADMIN_TOKEN` and shows all candidates, current-list imports, statuses, notes, trial assignments, final placements, CSV export, JSON API, and Drive links.

## Admin Access

The tracker is intentionally private. Set an `ADMIN_TOKEN` before using the admin dashboard:

```bash
npx wrangler secret put ADMIN_TOKEN
```

Then open `/portal` or `/admin`, enter the token, and the app will keep that token on admin-only links and save buttons. If `ADMIN_TOKEN` is not configured, `/admin` shows a setup warning instead of exposing the candidate list.

The admin dashboard includes an **Import Current Candidate List** box so you can paste the current intern list for Rere without displaying candidate names on the public intake form. Supported formats are:

```text
Devon L. Barnett — Graphic Design Intern
Tycian White — Photography Intern
```

or CSV:

```text
Name, Email, Role, Resume Received, Portfolio Received, Status, Notes
Devon L. Barnett,,Graphic Design Intern,No,No,Resume Requested,Only graphic design candidate
```

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. For local admin testing, create a temporary `.dev.vars` file with an admin token:

   ```bash
   printf "ADMIN_TOKEN=test\n" > .dev.vars
   ```

3. Apply local D1 migrations:

   ```bash
   npx wrangler d1 migrations apply DB --local
   ```

4. Start local development:

   ```bash
   npm run dev
   ```

5. Open the local Worker URL shown by Wrangler and visit `/portal?token=test` for the local admin portal.

## Google Drive Connection

Cloudflare Workers cannot access your Google Drive unless you provide a Google-side endpoint. This app uses a Google Apps Script web app as that bridge.

1. Visit `/google-drive-setup?token=ADMIN_TOKEN` in the deployed app.
2. Copy the provided Google Apps Script into a new Apps Script project while signed into the Google account that owns the Drive folder.
3. Change the script's shared secret to a long private value.
4. Deploy the script as a web app and copy its web app URL.
5. Store the values as Worker secrets:

   ```bash
   npx wrangler secret put GOOGLE_DRIVE_WEBHOOK_URL
   npx wrangler secret put GOOGLE_DRIVE_SHARED_SECRET
   ```

When configured, new resume and portfolio uploads are copied into candidate-specific folders under `1 Soundvibe Studios Intern Intake` in Google Drive, and returned Drive links are saved in D1.

## Deployment

1. Apply migrations to the remote D1 database:

   ```bash
   npx wrangler d1 migrations apply DB --remote
   ```

2. Deploy the Worker:

   ```bash
   npm run deploy
   ```

## Intern Intake Operating Flow

- **Monday:** Rere updates the intern tracker and sends follow-up messages.
- **Tuesday:** Rere schedules interviews and confirms resumes.
- **Wednesday:** Brittany helps with reminders and communication.
- **Thursday:** Group interviews or individual follow-ups happen.
- **Friday:** Rere sends Lafayette the weekly intern update from the admin dashboard.

Rere should organize, contact, screen, schedule, and report. Lafayette Taylor should retain final acceptance authority.
