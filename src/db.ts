import { approvalQueue, bookingCtas, demoCampaigns, demoLeads, leadStatuses, recentActivity, roles } from "./data";

export const WORKSPACE_ID = "ws_1sv";

type D1Row = Record<string, string | number | null>;

export type LeadView = typeof demoLeads[number];
export type CampaignView = typeof demoCampaigns[number];
export type DraftView = typeof approvalQueue[number] & { approvalStatus?: string; id: string };

export type DashboardMetrics = {
  totalLeadsDiscovered: number;
  newLeadsToday: number;
  repliesReceived: number;
  campaignsRunning: number;
  bookingsCreated: number;
  conversionRate: string;
};

function safeId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}


function splitTags(tags: string | number | null | undefined) {
  return String(tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function normalizeUsername(username: unknown) {
  const raw = String(username ?? "").trim();
  if (!raw) return "";
  return raw.startsWith("@") ? raw : `@${raw}`;
}

function rowToLead(row: D1Row): LeadView {
  return {
    id: String(row.id),
    name: String(row.name ?? "Unknown Lead"),
    username: String(row.username ?? ""),
    profileUrl: String(row.profile_url ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    platform: String(row.platform ?? "Instagram"),
    source: String(row.source ?? "Manual"),
    tags: splitTags(row.tags),
    status: String(row.status ?? "New"),
    city: String(row.city ?? ""),
    bio: String(row.profile_bio ?? ""),
    lastContacted: String(row.last_contacted_at ?? ""),
    assignedTo: String(row.assigned_to ?? "Unassigned"),
    notes: String(row.notes ?? ""),
    sentiment: String(row.sentiment ?? "Unknown"),
  };
}

function rowToCampaign(row: D1Row): CampaignView {
  return {
    id: String(row.id),
    name: String(row.name),
    type: String(row.campaign_type),
    audience: String(row.audience ?? ""),
    step1: String(row.message_step_1 ?? ""),
    followUp1: String(row.follow_up_1 ?? ""),
    followUp2: String(row.follow_up_2 ?? ""),
    waitTime: `${Math.max(1, Math.round(Number(row.wait_time_hours ?? 72) / 24))} days`,
    stopCondition: String(row.stop_condition ?? "Stop when the lead replies or opts out."),
    limit: Number(row.daily_limit ?? 25),
  };
}

function rowToDraft(row: D1Row): DraftView {
  return {
    id: String(row.id),
    lead: String(row.lead_name ?? "Unknown Lead"),
    campaign: String(row.campaign_name ?? "Manual message"),
    channel: String(row.channel ?? "Manual approval"),
    draft: String(row.body ?? ""),
    risk: String(row.risk_level ?? "Low"),
    approvalStatus: String(row.approval_status ?? "Pending"),
  };
}

async function queryAll<T>(env: Env, sql: string, ...params: unknown[]): Promise<T[]> {
  const stmt = env.DB.prepare(sql).bind(...params);
  const { results } = await stmt.all<T>();
  return results ?? [];
}

async function queryFirst<T>(env: Env, sql: string, ...params: unknown[]): Promise<T | null> {
  return env.DB.prepare(sql).bind(...params).first<T>();
}

export async function getLeads(env: Env): Promise<LeadView[]> {
  try {
    const rows = await queryAll<D1Row>(env, `
      SELECT leads.*, team_members.name AS assigned_to,
        (SELECT sentiment FROM conversations WHERE conversations.lead_id = leads.id AND sentiment IS NOT NULL ORDER BY created_at DESC LIMIT 1) AS sentiment
      FROM leads
      LEFT JOIN team_members ON team_members.id = leads.assigned_member_id
      WHERE leads.workspace_id = ?
      ORDER BY leads.created_at DESC
      LIMIT 200
    `, WORKSPACE_ID);
    return rows.map(rowToLead);
  } catch {
    return demoLeads;
  }
}

export async function getLead(env: Env, id: string): Promise<LeadView | undefined> {
  const leads = await getLeads(env);
  return leads.find((lead) => lead.id === id) ?? leads[0];
}

export async function getCampaigns(env: Env): Promise<CampaignView[]> {
  try {
    const rows = await queryAll<D1Row>(env, "SELECT * FROM campaigns WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 100", WORKSPACE_ID);
    return rows.map(rowToCampaign);
  } catch {
    return demoCampaigns;
  }
}

export async function getApprovalQueue(env: Env): Promise<DraftView[]> {
  try {
    const rows = await queryAll<D1Row>(env, `
      SELECT message_drafts.*, leads.name AS lead_name, campaigns.name AS campaign_name
      FROM message_drafts
      JOIN leads ON leads.id = message_drafts.lead_id
      LEFT JOIN campaigns ON campaigns.id = message_drafts.campaign_id
      WHERE message_drafts.workspace_id = ? AND message_drafts.approval_status = 'Pending'
      ORDER BY message_drafts.created_at DESC
      LIMIT 100
    `, WORKSPACE_ID);
    return rows.map(rowToDraft);
  } catch {
    return approvalQueue;
  }
}

export async function getDashboardMetrics(env: Env): Promise<DashboardMetrics> {
  try {
    const row = await queryFirst<Record<string, number>>(env, `
      SELECT
        COUNT(*) AS totalLeadsDiscovered,
        SUM(CASE WHEN date(created_at) = date('now') THEN 1 ELSE 0 END) AS newLeadsToday,
        SUM(CASE WHEN status IN ('Replied','Interested','Booked Tour','Booked Session') THEN 1 ELSE 0 END) AS repliesReceived,
        SUM(CASE WHEN status IN ('Booked Tour','Booked Session') THEN 1 ELSE 0 END) AS bookingsCreated
      FROM leads
      WHERE workspace_id = ?
    `, WORKSPACE_ID);
    const campaigns = await queryFirst<Record<string, number>>(env, "SELECT COUNT(*) AS campaignsRunning FROM campaigns WHERE workspace_id = ? AND is_running = 1", WORKSPACE_ID);
    const total = Number(row?.totalLeadsDiscovered ?? 0);
    const bookings = Number(row?.bookingsCreated ?? 0);
    return {
      totalLeadsDiscovered: total,
      newLeadsToday: Number(row?.newLeadsToday ?? 0),
      repliesReceived: Number(row?.repliesReceived ?? 0),
      campaignsRunning: Number(campaigns?.campaignsRunning ?? 0),
      bookingsCreated: bookings,
      conversionRate: total ? `${((bookings / total) * 100).toFixed(1)}%` : "0.0%",
    };
  } catch {
    return {
      totalLeadsDiscovered: 1284,
      newLeadsToday: 37,
      repliesReceived: 96,
      campaignsRunning: 6,
      bookingsCreated: 18,
      conversionRate: "7.4%",
    };
  }
}

export async function getRecentActivity(env: Env): Promise<string[]> {
  try {
    const rows = await queryAll<{ action: string; created_at: string }>(env, "SELECT action, created_at FROM audit_logs WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 8", WORKSPACE_ID);
    return rows.length ? rows.map((row) => `${row.created_at.slice(0, 10)} · ${row.action}`) : recentActivity;
  } catch {
    return recentActivity;
  }
}

export async function getTeamMembers(env: Env) {
  try {
    const members = await queryAll<{ id: string; name: string; role: string; email: string }>(env, "SELECT id, name, role, email FROM team_members WHERE workspace_id = ? ORDER BY created_at", WORKSPACE_ID);
    return { roles, members };
  } catch {
    return { roles, members: [] };
  }
}

export async function getBookingLinks(env: Env) {
  try {
    const links = await queryAll<{ id: string; label: string; provider: string; url: string }>(env, "SELECT id, label, provider, url FROM booking_links WHERE workspace_id = ? ORDER BY created_at DESC", WORKSPACE_ID);
    return { providers: ["Calendly", "Wix Booking", "GoHighLevel", "Custom URL"], defaultCtas: bookingCtas, links };
  } catch {
    return { providers: ["Calendly", "Wix Booking", "GoHighLevel", "Custom URL"], defaultCtas: bookingCtas, links: [] };
  }
}

export async function createLead(env: Env, input: FormData | Record<string, unknown>) {
  const get = (key: string) => input instanceof FormData ? input.get(key) : input[key];
  const username = normalizeUsername(get("username") as string);
  const name = String(get("name") || username || "New Lead").trim();
  const id = safeId("ld");
  await env.DB.prepare(`
    INSERT OR IGNORE INTO leads (id, workspace_id, name, username, profile_url, email, phone, platform, source, tags, notes, status, city, profile_bio, assigned_member_id, consent_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', ?, ?, ?, ?)
  `).bind(
    id,
    WORKSPACE_ID,
    name,
    username,
    String(get("profileUrl") || get("profile_url") || ""),
    String(get("email") || ""),
    String(get("phone") || ""),
    String(get("platform") || "Instagram"),
    String(get("source") || "Manual"),
    String(get("tags") || ""),
    String(get("notes") || ""),
    String(get("city") || ""),
    String(get("bio") || get("profileBio") || ""),
    String(get("assignedMemberId") || "tm_va"),
    String(get("consentStatus") || "uploaded_with_consent"),
  ).run();
  await addAudit(env, `Lead ${name} was created/imported safely.`);
  return id;
}

export async function createCampaign(env: Env, input: FormData | Record<string, unknown>) {
  const get = (key: string) => input instanceof FormData ? input.get(key) : input[key];
  const id = safeId("cmp");
  await env.DB.prepare(`
    INSERT INTO campaigns (id, workspace_id, name, campaign_type, audience, message_step_1, follow_up_1, follow_up_2, wait_time_hours, stop_condition, daily_limit, is_running)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).bind(
    id,
    WORKSPACE_ID,
    String(get("name") || "New Campaign"),
    String(get("campaignType") || get("campaign_type") || "Follow-up sequence"),
    String(get("audience") || ""),
    String(get("messageStep1") || get("message_step_1") || ""),
    String(get("followUp1") || get("follow_up_1") || ""),
    String(get("followUp2") || get("follow_up_2") || ""),
    Number(get("waitTimeHours") || get("wait_time_hours") || 72),
    String(get("stopCondition") || get("stop_condition") || "Stop when user replies, books, says stop, or is marked Do Not Contact."),
    Number(get("dailyLimit") || get("daily_limit") || 25),
  ).run();
  await addAudit(env, `Campaign ${String(get("name") || id)} was created and set live.`);
  return id;
}

export async function createBookingLink(env: Env, input: FormData | Record<string, unknown>) {
  const get = (key: string) => input instanceof FormData ? input.get(key) : input[key];
  const id = safeId("book");
  await env.DB.prepare("INSERT INTO booking_links (id, workspace_id, label, provider, url, is_default) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(id, WORKSPACE_ID, String(get("label") || "Booking Link"), String(get("provider") || "Custom URL"), String(get("url") || ""), 0)
    .run();
  await addAudit(env, `Booking link ${String(get("label") || id)} was saved.`);
  return id;
}

export async function createLeadSearch(env: Env, input: FormData | Record<string, unknown>) {
  const get = (key: string) => input instanceof FormData ? input.get(key) : input[key];
  const id = safeId("search");
  await env.DB.prepare("INSERT INTO lead_searches (id, workspace_id, search_type, query, connector, status, notes) VALUES (?, ?, ?, ?, ?, 'Ready for connector', ?)")
    .bind(id, WORKSPACE_ID, String(get("searchType") || "keyword"), String(get("query") || ""), String(get("connector") || "CSV/manual"), String(get("notes") || ""))
    .run();
  await addAudit(env, `Lead search ${String(get("query") || id)} was queued for a compliant connector.`);
  return id;
}

export async function createMessageDraft(env: Env, input: FormData | Record<string, unknown>) {
  const get = (key: string) => input instanceof FormData ? input.get(key) : input[key];
  const leadId = String(get("leadId") || get("lead_id") || "");
  const campaignId = String(get("campaignId") || get("campaign_id") || "") || null;
  const body = String(get("body") || "");
  const id = safeId("msg");
  await env.DB.prepare("INSERT INTO message_drafts (id, workspace_id, lead_id, campaign_id, channel, body, risk_level, approval_status) VALUES (?, ?, ?, ?, ?, ?, 'Low', 'Pending')")
    .bind(id, WORKSPACE_ID, leadId, campaignId, String(get("channel") || "Manual approval"), body)
    .run();
  await addAudit(env, `Message draft ${id} was queued for human approval.`);
  return id;
}

export async function updateMessageDraft(env: Env, id: string, action: string) {
  const status = action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Pending";
  await env.DB.prepare("UPDATE message_drafts SET approval_status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ? AND workspace_id = ?")
    .bind(status, "tm_owner", id, WORKSPACE_ID)
    .run();
  await addAudit(env, `Message draft ${id} was ${status.toLowerCase()}.`);
}

export async function updateLeadStatus(env: Env, leadId: string, status: string) {
  const safeStatus = leadStatuses.includes(status as never) ? status : "New";
  await env.DB.prepare("UPDATE leads SET status = ?, do_not_contact = CASE WHEN ? = 'Do Not Contact' THEN 1 ELSE do_not_contact END, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND workspace_id = ?")
    .bind(safeStatus, safeStatus, leadId, WORKSPACE_ID)
    .run();
  await addAudit(env, `Lead ${leadId} status changed to ${safeStatus}.`);
}

export async function addAudit(env: Env, action: string) {
  await env.DB.prepare("INSERT INTO audit_logs (id, workspace_id, actor_id, action, target_type, target_id) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(safeId("audit"), WORKSPACE_ID, "tm_owner", action, "system", WORKSPACE_ID)
    .run();
}

export async function generateDm(env: Env, input: Record<string, string>) {
  const first = input.first_name || firstName(input.name || "there");
  const fallback = `Hey ${first}, noticed your work from ${input.source || "Instagram"}. 1 Soundvibe may be a good fit for your next creative session — want me to send the right booking link?`;
  const apiKey = (env as Env & { OPENAI_API_KEY?: string }).OPENAI_API_KEY;
  if (!apiKey) {
    return { provider: "local-safe-template", draft: fallback };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: (env as Env & { OPENAI_MODEL?: string }).OPENAI_MODEL || "gpt-4.1-mini",
        input: `Write one short, natural, consent-respecting Instagram DM. No hype, no spam. Tone: ${input.tone || "Friendly"}. Lead source: ${input.source || "Instagram"}. Bio: ${input.bio || ""}. Campaign: ${input.campaignType || "studio invite"}. Business: ${input.business || "1 Soundvibe, a Houston recording and podcast studio"}. Use first name ${first}. Ask permission before sending a link.`,
      }),
    });
    const data = await response.json<Record<string, unknown>>();
    const output = Array.isArray(data.output)
      ? data.output.flatMap((item) => (item as { content?: Array<{ text?: string }> }).content ?? []).map((content) => content.text).filter(Boolean).join(" ")
      : "";
    return { provider: "openai-responses-api", draft: output || fallback };
  } catch {
    return { provider: "local-safe-template", draft: fallback };
  }
}
