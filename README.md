# The Girls Room Creative Lock In — Cloudflare Worker

This project is a one-page Cloudflare Worker website for **The Girls Room Creative Lock In**. It includes an elegant event landing page, an active invite request form, upload support, sponsorship interest questions, required media-release consent, D1 database storage, and Freeform forwarding.

## What the form does

When a visitor submits the form, the Worker:

1. Validates required fields: name, email, creative lane, and media release consent.
2. Saves the request to the `creative_lock_in_submissions` D1 table.
3. Forwards the submission and attached upload to your configured Freeform endpoint.
4. Shows a custom thank-you message instead of crashing if Freeform is unavailable or not connected yet.

## Freeform setup

To see requests inside your Freeform dashboard, copy the endpoint URL from the form you created in Freeform and add it to the Worker as a secret:

```bash
npx wrangler secret put FREEFORM_ENDPOINT
```

Paste the full endpoint URL from Freeform when Wrangler prompts for the secret value.

The Worker also accepts `FORM_PROVIDER_ENDPOINT` as a generic backup name, but `FREEFORM_ENDPOINT` is preferred for this project.

Optional organizer email override:

```bash
npx wrangler secret put SUBMISSION_EMAIL
```

If `FREEFORM_ENDPOINT` and `FORM_PROVIDER_ENDPOINT` are both missing, the Worker still saves submissions to D1, but it cannot send them to Freeform.

## Uploads and attachments

The form accepts image and PDF uploads. The Worker forwards the uploaded file to Freeform as the `upload` field and also stores the file name in D1.

Freeform file uploads may require a dashboard endpoint and a plan that supports file uploads. If your Freeform plan or endpoint does not support uploads, submissions may arrive without attachments even though the D1 record still includes the uploaded file name.

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

If the live site ever shows a Cloudflare Worker error after a form submission, check that remote D1 migrations have been applied and that your Freeform endpoint is configured correctly.
