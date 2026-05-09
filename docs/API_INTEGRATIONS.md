# API Integration Setup

This app can go live in two levels:

1. **Basic live CRM**: Cloudflare Worker + D1 + booking links. This is enough to run the dashboard, leads, campaigns, approval queue, inbox, and booking link flows.
2. **Connected automation**: Add OpenAI, Meta-approved workflows, email/SMS/webhooks, and production auth after each provider account is approved and configured.

## Required for basic launch

### Cloudflare Worker + D1

D1 is the only required API/binding for the app to be live.

```bash
npx wrangler login
npm run db:create
```

Copy the returned `database_id` into `wrangler.json`, then run:

```bash
npm run db:migrate:remote
npm run deploy:production
```

Verify the deployment:

```bash
curl https://YOUR_WORKER_URL/api/health
curl https://YOUR_WORKER_URL/api/setup-checklist
curl https://YOUR_WORKER_URL/api/dashboard
```

## Local secret setup

For local development, copy `.dev.vars.example` to `.dev.vars` and fill in only the providers you are testing:

```bash
cp .dev.vars.example .dev.vars
npm run dev
```

For production, use Wrangler secrets instead of committing values:

```bash
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put META_APP_SECRET
npx wrangler secret put TWILIO_AUTH_TOKEN
npx wrangler secret put SENDGRID_API_KEY
```

## Provider-by-provider setup

### OpenAI

Status: **active optional integration**.

The app calls OpenAI for AI-assisted DM drafts when `OPENAI_API_KEY` is present. If the key is missing, it falls back to a safe local template. Messages are still drafts and still require approval.

Secrets/vars:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` optional; defaults to `gpt-4.1-mini` in the Worker code.

Test:

```bash
curl -X POST https://YOUR_WORKER_URL/api/ai/generate-dm \
  -H "content-type: application/json" \
  -d '{"first_name":"Maya","source":"#houstonartist","tone":"Luxury brand"}'
```

### Meta Graph API / Instagram messaging

Status: **placeholder until Meta App Review is complete**.

Use this only for approved Instagram business workflows. Do not add fake login, password collection, unauthorized scraping, or bot-style mass messaging.

Secrets/vars:

- `META_APP_ID`
- `META_APP_SECRET`
- `META_GRAPH_API_VERSION`

Before production messaging:

1. Create a Meta developer app.
2. Connect the correct Instagram business asset.
3. Request and pass the required Meta App Review permissions.
4. Add webhook signature verification.
5. Keep outbound messages gated by the approval queue.

### Instagram Basic Display API

Status: **placeholder until OAuth is implemented**.

Use only for user-authorized profile/media access where allowed.

Secrets/vars:

- `INSTAGRAM_BASIC_DISPLAY_CLIENT_ID`
- `INSTAGRAM_BASIC_DISPLAY_CLIENT_SECRET`

### Twilio SMS

Status: **placeholder until consent and opt-out rules are implemented**.

Secrets/vars:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

Only send SMS to contacts with explicit opt-in consent. Add STOP handling before enabling production sends.

### SendGrid email

Status: **placeholder until verified sender and unsubscribe handling are implemented**.

Secrets/vars:

- `SENDGRID_API_KEY`

Before sending email, configure verified sender/domain authentication, unsubscribe groups, and webhook signature verification.

### GoHighLevel webhook

Status: **optional webhook handoff**.

Secrets/vars:

- `GOHIGHLEVEL_WEBHOOK_URL`

Use this to send approved booking or CRM stage events into GoHighLevel.

### Zapier webhook

Status: **optional webhook handoff**.

Secrets/vars:

- `ZAPIER_WEBHOOK_URL`

Use this for no-code automations after approval or booking events.

### Booking links

Status: **manual, no API required**.

Add live Calendly, Wix, GoHighLevel, or custom URLs on `/booking-links`. These work without any external API key.

## Integration status endpoints

Use these after deployment:

```bash
curl https://YOUR_WORKER_URL/api/integrations
curl https://YOUR_WORKER_URL/api/setup-checklist
```

`/api/integrations` reports which provider secrets are configured. `/api/setup-checklist` reports whether the app is ready for a basic launch and lists optional integrations that still need setup.
