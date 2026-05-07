import { approvalQueue, bookingCtas, demoCampaigns, demoLeads, leadStatuses, recentActivity, roles, tones } from "./data";

type Page =
  | "login"
  | "dashboard"
  | "leads"
  | "lead-profile"
  | "campaigns"
  | "campaign-builder"
  | "approval-queue"
  | "inbox"
  | "booking-links"
  | "team"
  | "settings"
  | "compliance"
  | "integrations";

const navItems: Array<{ href: string; label: string; page: Page }> = [
  { href: "/dashboard", label: "Dashboard", page: "dashboard" },
  { href: "/leads", label: "Leads", page: "leads" },
  { href: "/lead/ld_001", label: "Lead Profile", page: "lead-profile" },
  { href: "/campaigns", label: "Campaigns", page: "campaigns" },
  { href: "/campaign-builder", label: "Builder", page: "campaign-builder" },
  { href: "/approval-queue", label: "Approval Queue", page: "approval-queue" },
  { href: "/inbox", label: "Inbox", page: "inbox" },
  { href: "/booking-links", label: "Booking Links", page: "booking-links" },
  { href: "/team", label: "Team", page: "team" },
  { href: "/settings", label: "Settings", page: "settings" },
  { href: "/compliance", label: "Compliance", page: "compliance" },
  { href: "/integrations", label: "Integrations", page: "integrations" },
];

function shell(page: Page, title: string, subtitle: string, body: string) {
  const isLogin = page === "login";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} · 1SV Growth Engine</title>
  <meta name="description" content="Ethical Instagram lead discovery, CRM, and outreach automation for creators, studios, artists, and small businesses." />
  <style>${styles}</style>
</head>
<body>
  <div class="app ${isLogin ? "login-shell" : ""}">
    ${isLogin ? "" : sidebar(page)}
    <main class="main">
      ${isLogin ? "" : topbar(title, subtitle)}
      ${body}
    </main>
  </div>
  <script>${clientScript}</script>
</body>
</html>`;
}

function sidebar(active: Page) {
  return `<aside class="sidebar">
    <a class="brand" href="/dashboard"><span class="brand-mark">1SV</span><span><b>Growth Engine</b><small>Ethical creator CRM</small></span></a>
    <nav>${navItems
      .map((item) => `<a class="nav ${item.page === active ? "active" : ""}" href="${item.href}">${item.label}</a>`)
      .join("")}</nav>
    <div class="safety-card"><b>Safety Mode On</b><p>Every outbound DM is drafted, checked, and held for manual approval before send.</p></div>
  </aside>`;
}

function topbar(title: string, subtitle: string) {
  return `<header class="topbar"><div><p class="eyebrow">1 Soundvibe SaaS Platform</p><h1>${title}</h1><p>${subtitle}</p></div><div class="top-actions"><a class="btn ghost" href="/leads#import">Import Leads</a><a class="btn" href="/campaign-builder">Create Campaign</a></div></header>`;
}

function card(title: string, value: string, helper = "") {
  return `<section class="metric-card"><span>${title}</span><strong>${value}</strong>${helper ? `<small>${helper}</small>` : ""}</section>`;
}

function button(label: string, kind = "") {
  return `<button class="btn ${kind}" type="button">${label}</button>`;
}

export function renderPage(page: Page, pathname = "/") {
  switch (page) {
    case "login":
      return shell("login", "Login", "", `<section class="login-card"><div class="brand login-brand"><span class="brand-mark">1SV</span><span><b>Growth Engine</b><small>Luxury outreach dashboard</small></span></div><h1>Turn Instagram attention into booked sessions — safely.</h1><p>Log in with Clerk or NextAuth in production. Demo mode shows the complete SaaS workflow.</p><form><label>Email<input value="owner@1soundvibe.com" /></label><label>Password<input value="••••••••••••" type="password" /></label><a class="btn wide" href="/dashboard">Open Dashboard</a></form><p class="fine-print">No password harvesting, fake Instagram login, or unauthorized scraping is implemented.</p></section>`);
    case "dashboard":
      return shell(page, "Dashboard", "A clean operating view for lead discovery, approvals, replies, bookings, and compliance.", dashboard());
    case "leads":
      return shell(page, "Leads", "Discover public leads through compliant connectors or import consent-safe CSV files.", leads());
    case "lead-profile":
      return shell(page, "Lead Profile", "Review status, source, tags, notes, reminders, and conversation history.", leadProfile(pathname));
    case "campaigns":
      return shell(page, "Campaigns", "Reusable outreach templates with personalization tokens and stop conditions.", campaigns());
    case "campaign-builder":
      return shell(page, "Campaign Builder", "Create a consent-aware sequence that stops when a person replies.", campaignBuilder());
    case "approval-queue":
      return shell(page, "Message Approval Queue", "Approve, edit, or reject every message before it can be sent.", approvalQueuePage());
    case "inbox":
      return shell(page, "Inbox", "Track replies, sentiment, recommended next steps, and booking actions.", inbox());
    case "booking-links":
      return shell(page, "Booking Links", "Connect Calendly, Wix, GoHighLevel, or custom booking URLs.", bookingLinks());
    case "team":
      return shell(page, "Team Members", "Role-based access for owners, managers, VAs, and sales reps.", team());
    case "settings":
      return shell(page, "Settings", "Configure brand voice, AI, limits, auth, and workspace details.", settings());
    case "compliance":
      return shell(page, "Compliance Center", "Built-in guardrails for ethical discovery and outreach.", compliance());
    case "integrations":
      return shell(page, "Integrations", "Official API placeholders and safe import/export connectors.", integrations());
  }
}

function dashboard() {
  return `<section class="metrics">${card("Total leads discovered", "1,284", "+37 today")}${card("New leads today", "37", "CSV + public discovery")}${card("Replies received", "96", "7 positive today")}${card("Campaigns running", "6", "All review-gated")}${card("Bookings created", "18", "This month")}${card("Conversion rate", "7.4%", "Lead to booking")}</section><section class="grid two"><div class="panel"><div class="panel-head"><h2>Recent activity</h2>${button("Follow Up", "small")}</div><ul class="activity">${recentActivity.map((item) => `<li>${item}</li>`).join("")}</ul></div><div class="panel gold-panel"><h2>Today’s safety snapshot</h2><p>32 draft messages pending human review. 18 remaining safe-send slots based on workspace daily limits.</p><div class="progress"><span style="width:64%"></span></div><small>Mass blasting is disabled. Stop words and Do Not Contact statuses override every rule.</small></div></section>`;
}

function leads() {
  return `<section class="panel" id="discovery"><div class="panel-head"><div><h2>Lead discovery</h2><p>Architecture supports Meta-approved APIs, compliant providers, and manual uploads.</p></div>${button("Create Search", "small")}</div><div class="chips">${["Instagram username", "Hashtags", "Keywords", "Location", "Niche", "Competitor account", "Post URL", "Commenters", "Followers", "Likers if legally available"].map((x) => `<span>${x}</span>`).join("")}</div><div class="notice"><b>Connector policy:</b> If official API access is unavailable, connect a Meta-reviewed app, compliant data provider, or CSV upload here. Only public data may be collected, and messaging still requires approval or consent.</div></section><section class="panel" id="import"><div class="panel-head"><h2>Manual Lead Import</h2>${button("Import Leads", "small")}</div><p class="muted">CSV columns: name, username, profile URL, email, phone, platform, source, tags, notes.</p></section><section class="panel"><div class="panel-head"><h2>CRM leads</h2><a class="btn small" href="/lead/ld_001">Open Profile</a></div><table><thead><tr><th>Name</th><th>Status</th><th>Source</th><th>Tags</th><th>Assigned</th><th>Last contact</th></tr></thead><tbody>${demoLeads.map((lead) => `<tr><td><a href="/lead/${lead.id}"><b>${lead.name}</b><br><small>${lead.username}</small></a></td><td><span class="status">${lead.status}</span></td><td>${lead.source}</td><td>${lead.tags.map((tag) => `<span class="tag">${tag}</span>`).join(" ")}</td><td>${lead.assignedTo}</td><td>${lead.lastContacted || "Never"}</td></tr>`).join("")}</tbody></table></section>`;
}

function leadProfile(pathname: string) {
  const id = pathname.split("/").pop();
  const lead = demoLeads.find((item) => item.id === id) ?? demoLeads[0];
  return `<section class="grid profile-grid"><div class="panel"><p class="eyebrow">${lead.platform} · ${lead.source}</p><h2>${lead.name}</h2><p><a href="${lead.profileUrl}">${lead.username}</a></p><p>${lead.bio}</p><div class="chips">${leadStatuses.map((status) => `<span class="${status === lead.status ? "selected" : ""}">${status}</span>`).join("")}</div><dl><dt>Assigned team member</dt><dd>${lead.assignedTo}</dd><dt>Last contacted</dt><dd>${lead.lastContacted || "Never"}</dd><dt>Tags</dt><dd>${lead.tags.join(", ")}</dd><dt>Notes</dt><dd>${lead.notes}</dd></dl><div class="row-actions">${button("Generate DM", "small")}${button("Book Tour", "small ghost")}${button("Follow Up", "small ghost")}</div></div><div class="panel"><h2>Conversation history</h2><div class="message mine">Shared studio tour link after manual approval.</div><div class="message">This looks good. Do you have evening times?</div><h3>Follow-up reminder</h3><p>Due May 8, 2026: Confirm booking preference and send calendar link.</p></div></section>`;
}

function campaigns() {
  return `<section class="campaign-grid">${demoCampaigns.map((campaign) => `<article class="panel campaign"><p class="eyebrow">${campaign.type}</p><h2>${campaign.name}</h2><p>${campaign.audience}</p><ol><li>${campaign.step1}</li><li>${campaign.followUp1}</li><li>${campaign.followUp2}</li></ol><p><b>Wait:</b> ${campaign.waitTime}</p><p><b>Stop:</b> ${campaign.stopCondition}</p><span class="status">${campaign.limit}/day cap</span></article>`).join("")}</section>`;
}

function campaignBuilder() {
  const templates = ["Studio tour invite", "Recording session offer", "Membership offer", "Vibe Check event invite", "Podcast studio invite", "Producer collaboration invite", "Follow-up sequence"];
  return `<section class="panel builder"><div><label>Campaign template<select>${templates.map((x) => `<option>${x}</option>`).join("")}</select></label><label>Message step 1<textarea>Hey {first_name}, saw you through {source}. Want me to send a quick 1 Soundvibe booking link?</textarea></label><label>Follow-up 1<textarea>Just circling back, {first_name}. We have a few openings this week.</textarea></label><label>Follow-up 2<textarea>No pressure — should I close the loop or keep you posted?</textarea></label></div><div><label>Wait time between messages<input value="3 days" /></label><label>Stop condition<input value="Stop when user replies, books, says stop, or is marked Do Not Contact" /></label><label>Personalization tokens<input value="{first_name}, {username}, {city}, {source}" /></label><label>Tone<select>${tones.map((tone) => `<option>${tone}</option>`).join("")}</select></label><div class="row-actions">${button("Generate DM")}${button("Create Campaign", "ghost")}</div></div></section>`;
}

function approvalQueuePage() {
  return `<section class="panel"><div class="panel-head"><h2>Drafts awaiting review</h2><span class="status">Human approval required</span></div>${approvalQueue.map((item) => `<article class="approval"><div><p class="eyebrow">${item.campaign} · ${item.channel}</p><h3>${item.lead}</h3><p>${item.draft}</p><small>Risk: ${item.risk}</small></div><div class="approval-actions">${button("Approve Message", "small")}${button("Edit", "small ghost")}${button("Reject", "small danger")}</div></article>`).join("")}</section>`;
}

function inbox() {
  return `<section class="panel"><table><thead><tr><th>Lead</th><th>Sentiment</th><th>Recommended next reply</th><th>Actions</th></tr></thead><tbody>${demoLeads.filter((lead) => ["Replied", "Interested", "Booked Tour"].includes(lead.status)).map((lead) => `<tr><td><b>${lead.name}</b><br><small>${lead.username}</small></td><td><span class="status">${lead.sentiment}</span></td><td>Thanks ${lead.name.split(" ")[0]} — want me to send the best booking link for you?</td><td>${button("Booking Link", "small")} ${button("Interested", "small ghost")} ${button("Not Interested", "small ghost")}</td></tr>`).join("")}</tbody></table></section>`;
}

function bookingLinks() {
  return `<section class="grid two"><div class="panel"><h2>Booking providers</h2>${["Calendly link", "Wix booking link", "GoHighLevel calendar", "Custom booking URL"].map((label) => `<label>${label}<input placeholder="https://" /></label>`).join("")}<button class="btn">Save Booking Links</button></div><div class="panel"><h2>Default 1 Soundvibe CTAs</h2><div class="chips cta">${bookingCtas.map((cta) => `<span>${cta}</span>`).join("")}</div></div></section>`;
}

function team() {
  return `<section class="grid four">${roles.map((role) => `<div class="panel"><h2>${role}</h2><p>${role === "Owner" ? "Sees everything" : role === "Manager" ? "Can manage campaigns" : role === "VA" ? "Can import leads and approve drafts" : "Can respond to assigned leads"}</p></div>`).join("")}</section><section class="panel"><h2>Team members</h2><table><tbody><tr><td>Jordan Owner</td><td>Owner</td></tr><tr><td>Nia Manager</td><td>Manager</td></tr><tr><td>Sam VA</td><td>VA</td></tr><tr><td>Ari Sales</td><td>Sales Rep</td></tr></tbody></table></section>`;
}

function settings() {
  return `<section class="grid two"><div class="panel"><h2>Workspace</h2><label>Business name<input value="1 Soundvibe" /></label><label>Business description<textarea>Luxury Houston recording, podcast, membership, and event studio.</textarea></label><label>Default tone<select>${tones.map((tone) => `<option>${tone}</option>`).join("")}</select></label></div><div class="panel"><h2>Automation rules</h2><ul class="activity"><li>If lead replies “yes,” move to Interested.</li><li>If lead asks price, queue pricing template.</li><li>If lead books tour, move to Booked Tour.</li><li>If no reply after 3 days, queue follow-up.</li><li>If lead says stop, mark Do Not Contact.</li></ul></div></section>`;
}

function compliance() {
  const safeguards = ["Daily message limits", "Duplicate lead detection", "Unsubscribe / do not contact", "Rate limiting", "Audit logs", "Consent tracking", "Spam warning system", "No mass blasting without review"];
  return `<section class="grid two"><div class="panel gold-panel"><h2>Compliance posture</h2><p>1SV Growth Engine is designed as a safer outreach workflow: discover only lawful public or uploaded leads, draft messages, require review, and honor opt-outs.</p><p>No illegal scraping, spam tools, password stealing, fake login, bot abuse, or privacy-violating workflows are implemented.</p></div><div class="panel"><h2>Safeguards</h2><div class="chips">${safeguards.map((x) => `<span>${x}</span>`).join("")}</div></div></section><section class="panel"><h2>Audit log preview</h2><table><tbody><tr><td>2026-05-07</td><td>Sam VA approved draft msg_002</td></tr><tr><td>2026-05-07</td><td>Duplicate lead @coreybeats blocked</td></tr><tr><td>2026-05-06</td><td>Lead opted out and was marked Do Not Contact</td></tr></tbody></table></section>`;
}

function integrations() {
  const items = ["Meta Graph API placeholder", "Instagram Basic Display API placeholder", "CSV import", "Twilio placeholder for SMS", "SendGrid placeholder for email", "GoHighLevel webhook placeholder", "Zapier webhook placeholder", "OpenAI API for message writing"];
  return `<section class="integrations">${items.map((item) => `<article class="panel"><h2>${item}</h2><p>Status: ${item.includes("CSV") ? "Enabled" : "Ready to configure"}</p><p>Designed to use official APIs, consent, unsubscribe, and approval-gated workflows.</p>${button("Configure", "small ghost")}</article>`).join("")}</section>`;
}

export function pageFromPath(pathname: string): Page {
  if (pathname === "/" || pathname === "/login") return "login";
  if (pathname.startsWith("/lead/")) return "lead-profile";
  const key = pathname.replace(/^\//, "") as Page;
  return navItems.some((item) => item.page === key) ? key : "dashboard";
}

const styles = `
:root{--bg:#090909;--panel:#141414;--muted:#a7a7a7;--text:#fff;--gold:#d9ad4f;--gold2:#7a5a1d;--line:#262626;--danger:#ff6b6b}*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at top right,#3c2a0e,transparent 30%),var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif}.app{display:grid;grid-template-columns:280px 1fr;min-height:100vh}.login-shell{display:grid;place-items:center;grid-template-columns:1fr}.sidebar{border-right:1px solid var(--line);padding:24px;background:rgba(12,12,12,.92);position:sticky;top:0;height:100vh}.brand{display:flex;align-items:center;gap:12px;color:var(--text);text-decoration:none;margin-bottom:28px}.brand-mark{display:grid;place-items:center;width:48px;height:48px;border:1px solid var(--gold);background:linear-gradient(135deg,#fff2b8,var(--gold));color:#080808;border-radius:16px;font-weight:900}.brand small,.muted,small{display:block;color:var(--muted)}.nav{display:block;padding:11px 13px;border-radius:12px;color:#d8d8d8;text-decoration:none;margin:3px 0}.nav:hover,.nav.active{background:#20190c;color:#fff;border:1px solid #3e3218}.safety-card,.notice{margin-top:24px;padding:16px;border:1px solid #3b311c;border-radius:18px;background:rgba(217,173,79,.09);color:#eadbad}.main{padding:28px;max-width:1500px;width:100%}.topbar{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:24px}.topbar h1,.login-card h1{font-size:40px;line-height:1.02;margin:3px 0 8px}.eyebrow{text-transform:uppercase;letter-spacing:.16em;color:var(--gold);font-size:12px;font-weight:800}.top-actions,.row-actions,.approval-actions{display:flex;gap:10px;flex-wrap:wrap}.btn{border:0;border-radius:12px;padding:11px 15px;background:linear-gradient(135deg,#fff0a8,var(--gold));color:#090909;text-decoration:none;font-weight:800;cursor:pointer}.btn.ghost{background:#171717;color:#fff;border:1px solid #393939}.btn.small{padding:8px 10px;font-size:13px}.btn.danger{border-color:#5b2323;color:#ffd4d4}.btn.wide{display:block;text-align:center;width:100%;margin-top:10px}.metrics,.grid,.campaign-grid,.integrations{display:grid;gap:16px}.metrics{grid-template-columns:repeat(6,minmax(150px,1fr));margin-bottom:16px}.grid.two{grid-template-columns:1.4fr 1fr}.grid.four{grid-template-columns:repeat(4,1fr)}.profile-grid{grid-template-columns:1fr 1fr}.campaign-grid{grid-template-columns:repeat(3,1fr)}.integrations{grid-template-columns:repeat(4,1fr)}.metric-card,.panel,.login-card{border:1px solid var(--line);background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.018));border-radius:22px;padding:20px;box-shadow:0 24px 60px rgba(0,0,0,.25)}.metric-card strong{display:block;font-size:31px;margin:7px 0}.panel-head{display:flex;align-items:center;justify-content:space-between;gap:16px}.gold-panel{border-color:#4b3b18;background:linear-gradient(135deg,rgba(217,173,79,.20),rgba(255,255,255,.03))}.progress{height:10px;background:#2a2a2a;border-radius:99px;overflow:hidden}.progress span{display:block;height:100%;background:var(--gold)}.activity{padding-left:18px}.activity li{margin:12px 0}.chips{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}.chips span,.tag,.status{display:inline-flex;align-items:center;border:1px solid #373737;background:#171717;border-radius:999px;padding:6px 10px;color:#e9e9e9;font-size:13px}.chips span.selected,.status{border-color:var(--gold);background:#231a08;color:#ffe4a0}table{width:100%;border-collapse:collapse}th,td{padding:13px;border-bottom:1px solid var(--line);text-align:left;vertical-align:top}a{color:#ffe29c}label{display:block;color:#d9d9d9;font-weight:700;margin:0 0 13px}input,textarea,select{width:100%;margin-top:7px;border:1px solid #333;background:#0c0c0c;color:#fff;border-radius:12px;padding:12px}textarea{min-height:90px}.builder{display:grid;grid-template-columns:1fr 1fr;gap:22px}.approval{display:flex;justify-content:space-between;gap:20px;padding:16px 0;border-top:1px solid var(--line)}.message{padding:13px 14px;background:#1b1b1b;border-radius:16px;margin:10px 0;max-width:80%}.message.mine{margin-left:auto;background:#2b210d;border:1px solid #4d3d1d}.login-card{max-width:560px}.login-brand{margin-bottom:20px}.fine-print{color:#c9b682;font-size:13px}@media(max-width:1100px){.app{grid-template-columns:1fr}.sidebar{position:relative;height:auto}.metrics,.campaign-grid,.integrations,.grid.two,.grid.four,.profile-grid,.builder{grid-template-columns:1fr}.topbar{display:block}.approval{display:block}}`;

const clientScript = `document.querySelectorAll('button').forEach((button)=>button.addEventListener('click',()=>{button.textContent=button.textContent.includes('✓')?button.textContent:'✓ '+button.textContent;}));`;
