# The Girls Room Creative Lock In — Cloudflare Worker

This project is a one-page Cloudflare Worker website for **The Girls Room Creative Lock In**. It includes an elegant event landing page, an active invite request form, upload support, sponsorship interest questions, required media-release consent, D1 database storage, and form-provider forwarding.

## What the form does

When a visitor submits the form, the Worker:

1. Validates required fields: name, email, creative lane, and media release consent.
2. Saves the request to the `creative_lock_in_submissions` D1 table.
3. Forwards the submission to FlowForm/FoxFlow when a dashboard token or endpoint is configured.
4. Falls back to generic email forwarding to `freegameproductions@gmail.com` when no dashboard endpoint is configured.
5. Shows a custom thank-you message instead of crashing if the external form provider is unavailable.

## FlowForm/FoxFlow setup

The generic endpoint only sends emails. To see requests inside the FlowForm/FoxFlow app dashboard, configure the Worker with the Flow/FoxFlow endpoint from your account.

Recommended secret setup:

```bash
npx wrangler secret put FLOWFORM_TOKEN
```

Paste only the token from a FlowForm/FoxFlow endpoint like `https://flowform.to/f/YOUR_TOKEN_HERE`.

Alternative full endpoint setup:

```bash
npx wrangler secret put FLOWFORM_ENDPOINT
```

Paste the full endpoint, for example `https://flowform.to/f/YOUR_TOKEN_HERE`. You can also use `FORM_PROVIDER_ENDPOINT` if your FormFlow app gives you a different endpoint URL.

Optional organizer email override:

```bash
npx wrangler secret put SUBMISSION_EMAIL
```

If neither `FLOWFORM_TOKEN` nor `FLOWFORM_ENDPOINT` nor `FORM_PROVIDER_ENDPOINT` is set, the Worker uses generic email mode and sends to `freegameproductions@gmail.com`.

## Uploads and attachments

The form accepts image and PDF uploads. The Worker forwards the uploaded file to the connected form provider as the `upload` field and also stores the file name in D1.

FlowForm/FoxFlow file uploads require a dashboard/Flow endpoint and a plan that supports file uploads. Generic email-only mode may send the submission text without an attachment, depending on provider limits.

To permanently store full uploaded files yourself, add Cloudflare R2 and save the file there before forwarding the form.

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

If the live site ever shows a Cloudflare Worker error after a form submission, check that remote D1 migrations have been applied and that your FlowForm/FoxFlow token or endpoint is configured correctly.
