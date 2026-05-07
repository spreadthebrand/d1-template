# The Girls Room Creative Lock In — Cloudflare Worker

This project is a one-page Cloudflare Worker website for **The Girls Room Creative Lock In**. It includes an elegant event landing page, an active invite request form, file-upload metadata capture, sponsorship interest questions, required media-release consent, D1 database storage, and email forwarding to `freegameproductions@gmail.com`.

## What the form does

When a visitor submits the form, the Worker:

1. Validates required fields: name, email, creative lane, and media release consent.
2. Saves the request to the `creative_lock_in_submissions` D1 table.
3. Sends the submission details to FlowForm for forwarding to `freegameproductions@gmail.com`.
4. Shows a custom thank-you message instead of crashing if the email provider is unavailable.

> Upload note: the form accepts files in the browser and stores/sends the uploaded file name. To permanently store full file contents, add Cloudflare R2 or another file-storage service.

## Local development

Install dependencies:

```bash
npm install
```

Apply local D1 migrations:

```bash
npm run seedLocalD1
```

Run the Worker locally:

```bash
npx wrangler dev --ip 127.0.0.1 --port 8787
```

Open <http://127.0.0.1:8787>.

## Checks

```bash
npm run check
```

## Deployment

The deploy script applies remote migrations first and then deploys the Worker:

```bash
npm run deploy
```

If the live site ever shows a Cloudflare Worker error after a form submission, check that remote D1 migrations have been applied and that the email forwarding service has verified `freegameproductions@gmail.com` if required.
