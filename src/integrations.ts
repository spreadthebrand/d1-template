export type IntegrationStatus = {
  name: string;
  category: "required" | "optional" | "placeholder";
  status: "connected" | "missing" | "manual" | "placeholder";
  purpose: string;
  secretNames: string[];
  nextStep: string;
};

type IntegrationEnv = Env & Record<string, string | undefined>;

function hasAll(env: IntegrationEnv, names: string[]) {
  return names.every((name) => Boolean(env[name]));
}

export function getIntegrationStatuses(env: Env): IntegrationStatus[] {
  const integrationEnv = env as IntegrationEnv;

  return [
    {
      name: "Cloudflare D1",
      category: "required",
      status: env.DB ? "connected" : "missing",
      purpose: "Production CRM database for leads, campaigns, approvals, bookings, and audit logs.",
      secretNames: ["DB binding in wrangler.json"],
      nextStep: "Run `npm run db:create`, paste the returned database_id into wrangler.json, then run `npm run db:migrate:remote`.",
    },
    {
      name: "OpenAI",
      category: "optional",
      status: hasAll(integrationEnv, ["OPENAI_API_KEY"]) ? "connected" : "missing",
      purpose: "AI-assisted DM draft generation. Messages remain drafts and still require human approval.",
      secretNames: ["OPENAI_API_KEY", "OPENAI_MODEL"],
      nextStep: "Run `npx wrangler secret put OPENAI_API_KEY`. OPENAI_MODEL is optional; the app has a safe fallback template without a key.",
    },
    {
      name: "Meta Graph API",
      category: "placeholder",
      status: hasAll(integrationEnv, ["META_APP_ID", "META_APP_SECRET"]) ? "connected" : "placeholder",
      purpose: "Approved Instagram business workflows after Meta App Review.",
      secretNames: ["META_APP_ID", "META_APP_SECRET", "META_GRAPH_API_VERSION"],
      nextStep: "Create a Meta app, complete required reviews/permissions, then add the app secret with Wrangler. Do not send automated DMs outside approved workflows.",
    },
    {
      name: "Instagram Basic Display API",
      category: "placeholder",
      status: hasAll(integrationEnv, ["INSTAGRAM_BASIC_DISPLAY_CLIENT_ID", "INSTAGRAM_BASIC_DISPLAY_CLIENT_SECRET"]) ? "connected" : "placeholder",
      purpose: "User-authorized Instagram profile/media access where allowed.",
      secretNames: ["INSTAGRAM_BASIC_DISPLAY_CLIENT_ID", "INSTAGRAM_BASIC_DISPLAY_CLIENT_SECRET"],
      nextStep: "Create the Instagram app credentials, add OAuth callback URLs, and store the client secret with Wrangler.",
    },
    {
      name: "Twilio",
      category: "placeholder",
      status: hasAll(integrationEnv, ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"]) ? "connected" : "placeholder",
      purpose: "Consent-based SMS follow-up only.",
      secretNames: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_FROM_NUMBER"],
      nextStep: "Add Twilio credentials only after opt-in/consent rules are implemented for your SMS use case.",
    },
    {
      name: "SendGrid",
      category: "placeholder",
      status: hasAll(integrationEnv, ["SENDGRID_API_KEY"]) ? "connected" : "placeholder",
      purpose: "Consent-based email with unsubscribe handling.",
      secretNames: ["SENDGRID_API_KEY"],
      nextStep: "Add the SendGrid key and implement verified sender, unsubscribe groups, and webhook signature checks before sending production email.",
    },
    {
      name: "GoHighLevel webhook",
      category: "optional",
      status: hasAll(integrationEnv, ["GOHIGHLEVEL_WEBHOOK_URL"]) ? "connected" : "missing",
      purpose: "Booking and CRM handoff when a lead books or changes stage.",
      secretNames: ["GOHIGHLEVEL_WEBHOOK_URL"],
      nextStep: "Create a GoHighLevel inbound webhook and store the URL with Wrangler if you want booking/CRM sync.",
    },
    {
      name: "Zapier webhook",
      category: "optional",
      status: hasAll(integrationEnv, ["ZAPIER_WEBHOOK_URL"]) ? "connected" : "missing",
      purpose: "No-code workflow handoff for approved events.",
      secretNames: ["ZAPIER_WEBHOOK_URL"],
      nextStep: "Create a Zapier Catch Hook and store the URL with Wrangler if you want no-code automations.",
    },
    {
      name: "Booking links",
      category: "required",
      status: "manual",
      purpose: "Calendly, Wix, GoHighLevel, or custom booking URLs shown inside the CRM.",
      secretNames: [],
      nextStep: "Add live booking URLs in `/booking-links`; no API key is required for basic link buttons.",
    },
  ];
}

export function getLaunchChecklist(env: Env) {
  const integrations = getIntegrationStatuses(env);
  const requiredMissing = integrations.filter((item) => item.category === "required" && item.status === "missing");
  const optionalMissing = integrations.filter((item) => item.category !== "required" && ["missing", "placeholder"].includes(item.status));

  return {
    readyForBasicLaunch: requiredMissing.length === 0,
    requiredMissing,
    optionalMissing,
    productionCommands: [
      "npm install",
      "npx wrangler login",
      "npm run db:create",
      "# paste the returned database_id into wrangler.json",
      "npm run db:migrate:remote",
      "npm run check",
      "npm run deploy:production",
    ],
  };
}
