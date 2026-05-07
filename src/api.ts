import { approvalQueue, bookingCtas, demoCampaigns, demoLeads, leadStatuses, recentActivity, roles, tones } from "./data";

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
}

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    return json({ ok: true, service: "1SV Growth Engine", mode: "ethical-outreach" });
  }

  if (url.pathname === "/api/dashboard") {
    return json({
      metrics: {
        totalLeadsDiscovered: 1284,
        newLeadsToday: 37,
        repliesReceived: 96,
        campaignsRunning: 6,
        bookingsCreated: 18,
        conversionRate: "7.4%",
      },
      recentActivity,
    });
  }

  if (url.pathname === "/api/leads") {
    return json({ leads: demoLeads, statuses: leadStatuses });
  }

  if (url.pathname.startsWith("/api/leads/")) {
    const id = url.pathname.split("/").pop();
    const lead = demoLeads.find((item) => item.id === id) ?? demoLeads[0];
    return json({
      lead,
      conversation: [
        { from: "1SV", body: "Shared studio tour link after manual approval.", date: "2026-05-05" },
        { from: lead.name, body: "This looks good. Do you have evening times?", date: "2026-05-06" },
      ],
      reminders: [{ due: "2026-05-08", task: "Confirm booking preference and send calendar link." }],
    });
  }

  if (url.pathname === "/api/campaigns") {
    return json({ campaigns: demoCampaigns, tokens: ["{first_name}", "{username}", "{city}", "{source}"] });
  }

  if (url.pathname === "/api/approval-queue") {
    return json({ queue: approvalQueue, actions: ["approve", "edit", "reject"] });
  }

  if (url.pathname === "/api/inbox") {
    return json({
      replies: demoLeads
        .filter((lead) => ["Replied", "Interested", "Booked Tour"].includes(lead.status))
        .map((lead) => ({
          lead: lead.name,
          username: lead.username,
          sentiment: lead.sentiment,
          recommendedNextReply: `Thanks ${lead.name.split(" ")[0]} — want me to send the best booking link for you?`,
          actions: ["Booking link", "Mark interested", "Mark not interested"],
        })),
    });
  }

  if (url.pathname === "/api/booking-links") {
    return json({
      providers: ["Calendly", "Wix Booking", "GoHighLevel", "Custom URL"],
      defaultCtas: bookingCtas,
      links: [
        { label: "Studio Tour", url: "https://calendly.com/1soundvibe/studio-tour" },
        { label: "Recording Session", url: "https://1soundvibe.com/book-session" },
      ],
    });
  }

  if (url.pathname === "/api/automation-rules") {
    return json({
      rules: [
        { trigger: "Lead replies yes", action: "Move to Interested" },
        { trigger: "Lead asks price", action: "Queue pricing template for approval" },
        { trigger: "Tour booked webhook", action: "Move to Booked Tour" },
        { trigger: "No reply after 3 days", action: "Queue follow-up for approval" },
        { trigger: "Lead says stop", action: "Mark Do Not Contact" },
      ],
    });
  }

  if (url.pathname === "/api/team") {
    return json({
      roles,
      members: [
        { name: "Jordan Owner", role: "Owner", permissions: "Everything" },
        { name: "Nia Manager", role: "Manager", permissions: "Manage campaigns and reporting" },
        { name: "Sam VA", role: "VA", permissions: "Import leads and approve drafts" },
        { name: "Ari Sales", role: "Sales Rep", permissions: "Respond to assigned leads" },
      ],
    });
  }

  if (url.pathname === "/api/compliance") {
    return json({
      safeguards: [
        "Daily message limits",
        "Duplicate lead detection",
        "Unsubscribe / do not contact enforcement",
        "Rate limiting",
        "Audit logs",
        "Consent tracking",
        "Spam warning system",
        "No mass blasting without human review",
      ],
      limits: { instagramManualDmDailyCap: 50, pendingApprovalCap: 100, cooldownMinutes: 8 },
      connectorPolicy:
        "Use Meta-approved APIs where available. Public discovery connectors must only process public data, respect provider terms, and route messages through consent/manual approval or approved messaging workflows.",
    });
  }

  if (url.pathname === "/api/ai/generate-dm" && request.method === "POST") {
    const body = await request.json().catch(() => ({})) as Record<string, string>;
    const firstName = body.first_name || "there";
    return json({
      provider: "OpenAI API placeholder",
      tone: body.tone || "Friendly",
      draft: `Hey ${firstName}, noticed your work from ${body.source || "Instagram"}. 1 Soundvibe may be a good fit for your next creative session — want me to send the right booking link?`,
      safety: "Draft only. Requires user approval before sending.",
    });
  }

  if (url.pathname === "/api/import/csv" && request.method === "POST") {
    return json({
      status: "accepted",
      requiredColumns: ["name", "username", "profile URL", "email", "phone", "platform", "source", "tags", "notes"],
      nextStep: "Parse CSV, normalize usernames, detect duplicates, and place eligible leads into New status.",
    }, { status: 202 });
  }

  if (url.pathname === "/api/integrations") {
    return json({
      integrations: [
        { name: "Meta Graph API", status: "placeholder", purpose: "Approved Instagram messaging and business asset workflows" },
        { name: "Instagram Basic Display API", status: "placeholder", purpose: "User-authorized profile/media access" },
        { name: "CSV import", status: "enabled", purpose: "Manual consent-safe upload" },
        { name: "Twilio", status: "placeholder", purpose: "SMS with consent" },
        { name: "SendGrid", status: "placeholder", purpose: "Email with unsubscribe" },
        { name: "GoHighLevel webhook", status: "placeholder", purpose: "Booking and CRM sync" },
        { name: "Zapier webhook", status: "placeholder", purpose: "No-code workflow handoff" },
      ],
    });
  }

  const dbReady = Boolean(env.DB);
  return json({ error: "Not found", dbReady }, { status: 404 });
}
