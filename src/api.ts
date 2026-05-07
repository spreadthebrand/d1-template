import { bookingCtas, leadStatuses, roles, tones } from "./data";
import {
  createBookingLink,
  createCampaign,
  createLead,
  createLeadSearch,
  createMessageDraft,
  generateDm,
  getApprovalQueue,
  getBookingLinks,
  getCampaigns,
  getDashboardMetrics,
  getLead,
  getLeads,
  getRecentActivity,
  getTeamMembers,
  updateLeadStatus,
  updateMessageDraft,
} from "./db";

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
  });
}

async function requestBody(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return request.json().catch(() => ({})) as Promise<Record<string, unknown>>;
  }
  if (contentType.includes("form")) {
    const form = await request.formData();
    return Object.fromEntries(form.entries());
  }
  return {};
}

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "/api/health") {
    return json({ ok: true, service: "1SV Growth Engine", mode: "live-d1-ethical-outreach" });
  }

  if (url.pathname === "/api/dashboard") {
    return json({ metrics: await getDashboardMetrics(env), recentActivity: await getRecentActivity(env) });
  }

  if (url.pathname === "/api/leads" && request.method === "GET") {
    return json({ leads: await getLeads(env), statuses: leadStatuses });
  }

  if (url.pathname === "/api/leads" && request.method === "POST") {
    const id = await createLead(env, await requestBody(request));
    return json({ status: "created", id }, { status: 201 });
  }

  if (url.pathname.startsWith("/api/leads/") && request.method === "PATCH") {
    const id = url.pathname.split("/").pop() ?? "";
    const body = await requestBody(request) as Record<string, string>;
    await updateLeadStatus(env, id, body.status);
    return json({ status: "updated", id });
  }

  if (url.pathname.startsWith("/api/leads/")) {
    const id = url.pathname.split("/").pop() ?? "";
    const lead = await getLead(env, id);
    return json({
      lead,
      conversation: [
        { from: "1SV", body: "Shared studio tour link after manual approval.", date: "2026-05-05" },
        { from: lead?.name ?? "Lead", body: "This looks good. Do you have evening times?", date: "2026-05-06" },
      ],
      reminders: [{ due: "2026-05-08", task: "Confirm booking preference and send calendar link." }],
    });
  }

  if (url.pathname === "/api/lead-searches" && request.method === "POST") {
    const id = await createLeadSearch(env, await requestBody(request));
    return json({ status: "queued", id }, { status: 201 });
  }

  if (url.pathname === "/api/campaigns" && request.method === "GET") {
    return json({ campaigns: await getCampaigns(env), tokens: ["{first_name}", "{username}", "{city}", "{source}"] });
  }

  if (url.pathname === "/api/campaigns" && request.method === "POST") {
    const id = await createCampaign(env, await requestBody(request));
    return json({ status: "created", id }, { status: 201 });
  }

  if (url.pathname === "/api/approval-queue" && request.method === "GET") {
    return json({ queue: await getApprovalQueue(env), actions: ["approve", "edit", "reject"] });
  }

  if (url.pathname === "/api/approval-queue" && request.method === "POST") {
    const id = await createMessageDraft(env, await requestBody(request));
    return json({ status: "queued", id }, { status: 201 });
  }

  if (url.pathname.startsWith("/api/approval-queue/") && request.method === "PATCH") {
    const id = url.pathname.split("/").pop() ?? "";
    const body = await requestBody(request) as Record<string, string>;
    await updateMessageDraft(env, id, body.action || "approve");
    return json({ status: "updated", id, action: body.action || "approve" });
  }

  if (url.pathname === "/api/inbox") {
    const leads = await getLeads(env);
    return json({
      replies: leads
        .filter((lead) => ["Replied", "Interested", "Booked Tour", "Booked Session"].includes(lead.status))
        .map((lead) => ({
          lead: lead.name,
          username: lead.username,
          sentiment: lead.sentiment,
          recommendedNextReply: `Thanks ${lead.name.split(" ")[0]} — want me to send the best booking link for you?`,
          actions: ["Booking link", "Mark interested", "Mark not interested"],
        })),
    });
  }

  if (url.pathname === "/api/booking-links" && request.method === "GET") {
    return json(await getBookingLinks(env));
  }

  if (url.pathname === "/api/booking-links" && request.method === "POST") {
    const id = await createBookingLink(env, await requestBody(request));
    return json({ status: "created", id }, { status: 201 });
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
    return json(await getTeamMembers(env));
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
    const body = await requestBody(request) as Record<string, string>;
    const generated = await generateDm(env, body);
    return json({ ...generated, tone: body.tone || "Friendly", safety: "Draft only. Requires user approval before sending." });
  }

  if (url.pathname === "/api/import/csv" && request.method === "POST") {
    const body = await requestBody(request) as Record<string, string>;
    const rows = String(body.csv || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    let imported = 0;
    for (const line of rows.slice(1)) {
      const [name, username, profileUrl, email, phone, platform, source, tags, notes] = line.split(",").map((part) => part.trim());
      if (name || username) {
        await createLead(env, { name, username, profileUrl, email, phone, platform, source, tags, notes, consentStatus: "uploaded_with_consent" });
        imported += 1;
      }
    }
    return json({ status: "imported", imported, requiredColumns: ["name", "username", "profile URL", "email", "phone", "platform", "source", "tags", "notes"] }, { status: 202 });
  }

  if (url.pathname === "/api/integrations") {
    return json({
      integrations: [
        { name: "Meta Graph API", status: "configure", purpose: "Approved Instagram messaging and business asset workflows" },
        { name: "Instagram Basic Display API", status: "configure", purpose: "User-authorized profile/media access" },
        { name: "CSV import", status: "enabled", purpose: "Manual consent-safe upload" },
        { name: "Twilio", status: "configure", purpose: "SMS with consent" },
        { name: "SendGrid", status: "configure", purpose: "Email with unsubscribe" },
        { name: "GoHighLevel webhook", status: "configure", purpose: "Booking and CRM sync" },
        { name: "Zapier webhook", status: "configure", purpose: "No-code workflow handoff" },
      ],
      tones,
      defaultCtas: bookingCtas,
    });
  }

  return json({ error: "Not found" }, { status: 404 });
}
