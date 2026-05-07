type InternCandidateView = {
	id: number;
	candidate_name: string;
	email: string | null;
	phone: string | null;
	desired_role: string;
	resume_received: string;
	portfolio_received: string;
	interview_status: string;
	notes: string;
	final_placement: string;
	weekly_availability: string;
	portfolio_url: string;
	google_drive_resume_url: string;
	google_drive_portfolio_url: string;
	trial_assignment: string;
	priority_level: string;
	created_at: string;
	updated_at: string;
	last_contacted_at: string | null;
};

type DashboardStatsView = {
	total: number;
	resumesReceived: number;
	pendingResumes: number;
	interviewsScheduled: number;
	accepted: number;
	googleDriveConnected: boolean;
};

type DriveSyncResultView = {
	resume?: { fileName: string; webViewLink: string };
	portfolio?: { fileName: string; webViewLink: string };
};

function escapeHtml(value: unknown): string {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

function page(title: string, body: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>${escapeHtml(title)}</title>
	<style>
		:root { color-scheme: light; --ink: #15171f; --muted: #5c6270; --brand: #6d28d9; --gold: #f59e0b; --soft: #f5f3ff; --line: #e5e7eb; --good: #047857; --warn: #b45309; }
		* { box-sizing: border-box; }
		body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: var(--ink); background: #fafafa; }
		a { color: var(--brand); font-weight: 700; }
		header.hero { padding: 56px 7vw; color: white; background: radial-gradient(circle at top left, #f59e0b, transparent 28rem), linear-gradient(135deg, #111827, #4c1d95 58%, #7c2d12); }
		header.hero p { max-width: 760px; color: #f8fafc; font-size: 1.08rem; line-height: 1.7; }
		h1 { margin: 0 0 12px; font-size: clamp(2rem, 5vw, 4.6rem); letter-spacing: -0.06em; line-height: 0.95; }
		h2 { margin-top: 0; font-size: clamp(1.35rem, 3vw, 2.2rem); letter-spacing: -0.03em; }
		h3 { margin-bottom: 8px; }
		main { width: min(1180px, 92vw); margin: -28px auto 56px; }
		.card { background: white; border: 1px solid var(--line); border-radius: 22px; padding: 26px; box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08); margin-bottom: 22px; }
		.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
		label { display: grid; gap: 8px; color: var(--muted); font-weight: 700; font-size: 0.92rem; }
		input, select, textarea { width: 100%; border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; font: inherit; background: white; color: var(--ink); }
		textarea { min-height: 110px; resize: vertical; }
		button, .button { display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 999px; padding: 12px 18px; background: var(--brand); color: white; text-decoration: none; font-weight: 800; cursor: pointer; }
		.button.secondary { background: #111827; }
		.button.light { background: var(--soft); color: var(--brand); }
		.actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
		.badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 5px 10px; background: var(--soft); color: var(--brand); font-size: 0.8rem; font-weight: 800; }
		.badge.highest { background: #fef3c7; color: #92400e; }
		.stat { padding: 18px; border-radius: 18px; background: #f8fafc; border: 1px solid var(--line); }
		.stat strong { display: block; font-size: 2rem; }
		table { width: 100%; border-collapse: collapse; min-width: 1100px; }
		th, td { border-bottom: 1px solid var(--line); padding: 12px; text-align: left; vertical-align: top; }
		th { position: sticky; top: 0; background: #f8fafc; z-index: 1; }
		.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 18px; }
		.small { color: var(--muted); font-size: 0.86rem; line-height: 1.5; }
		.script { white-space: pre-wrap; background: #111827; color: #f8fafc; padding: 18px; border-radius: 16px; overflow-x: auto; }
		.notice { border-left: 5px solid var(--gold); background: #fffbeb; padding: 16px; border-radius: 14px; }
		@media (max-width: 720px) { header.hero { padding: 36px 5vw; } main { width: 94vw; } .card { padding: 18px; } }
	</style>
</head>
<body>
${body}
</body>
</html>`;
}

const roleOptions = [
	"Studio Staff Intern",
	"Marketing Intern",
	"A&R Intern",
	"Photography Intern",
	"Graphic Design Intern",
	"Producer Intern",
	"Media/Content Support Intern",
	"Studio Staff / Broadcast Support",
];

function roleSelect(name: string, selected = ""): string {
	return `<select name="${name}" required>${roleOptions.map((role) => `<option value="${escapeHtml(role)}" ${role === selected ? "selected" : ""}>${escapeHtml(role)}</option>`).join("")}</select>`;
}

export function renderIntakeForm(): string {
	return page("1 Soundvibe Studios Intern Intake", `
<header class="hero">
	<p class="badge">1 Soundvibe Studios • Intern Intake</p>
	<h1>Intern Intake System</h1>
	<p>Apply for studio operations, marketing, photography/content, graphic design, A&amp;R, music production, or event/media support. Your details are saved to the intern tracker and files can sync to the studio Google Drive when the Drive webhook is configured.</p>
</header>
<main>
	<section class="card">
		<h2>Candidate Intake Form</h2>
		<form method="post" action="/intake" enctype="multipart/form-data">
			<div class="grid">
				<label>Candidate Name<input name="candidate_name" required placeholder="Full name" /></label>
				<label>Email<input type="email" name="email" placeholder="name@example.com" /></label>
				<label>Best Phone Number<input name="phone" placeholder="(555) 555-5555" /></label>
				<label>Desired Role${roleSelect("desired_role")}</label>
			</div>
			<div class="grid">
				<label>Weekly Availability<textarea name="weekly_availability" placeholder="Example: Mon/Wed/Fri after 3 PM, weekends open"></textarea></label>
				<label>Portfolio / Music / Beat Link<textarea name="portfolio_url" placeholder="Paste portfolio, Google Drive, SoundCloud, Instagram, Behance, or website links"></textarea></label>
			</div>
			<div class="grid">
				<label>Resume Upload<input type="file" name="resume" accept=".pdf,.doc,.docx,.txt,.rtf" /></label>
				<label>Portfolio / Work Sample Upload<input type="file" name="portfolio_file" accept=".pdf,.jpg,.jpeg,.png,.mp3,.wav,.mp4,.mov,.zip" /></label>
			</div>
			<label>Notes<textarea name="notes" placeholder="Tell us about your experience, tools you use, artists you like, or what you want to learn."></textarea></label>
			<div class="actions"><button type="submit">Submit Intern Intake</button><a class="button light" href="/admin">Open Tracker</a></div>
		</form>
	</section>
	<section class="card">
		<h2>What Happens Next</h2>
		<div class="grid">
			<div><h3>1. Rere Screens</h3><p class="small">Rere organizes submissions, requests missing resumes or portfolios, and confirms desired roles.</p></div>
			<div><h3>2. Brittany Supports</h3><p class="small">Brittany / BB Management helps with reminders, communication, and follow-up where needed.</p></div>
			<div><h3>3. Lafayette Decides</h3><p class="small">Lafayette Taylor keeps final acceptance authority after interview/orientation and trial assignment review.</p></div>
		</div>
	</section>
</main>`);
}

export function renderSuccess(candidateName: string, driveSync: DriveSyncResultView): string {
	const driveMessage = driveSync.resume || driveSync.portfolio
		? `<p class="notice">Google Drive sync completed for uploaded file(s).</p>`
		: `<p class="notice">Submission saved. Google Drive file sync will activate after <code>GOOGLE_DRIVE_WEBHOOK_URL</code> is configured.</p>`;
	return page("Intern Intake Submitted", `
<header class="hero"><h1>Submission Received</h1><p>Thank you, ${escapeHtml(candidateName)}. Rere will review your intake details and follow up about interviews/orientation.</p></header>
<main><section class="card">${driveMessage}<div class="actions"><a class="button" href="/">Submit Another Candidate</a><a class="button secondary" href="/admin">View Tracker</a></div></section></main>`);
}

function optionTags(options: readonly string[], selected: string): string {
	return options.map((option) => `<option value="${escapeHtml(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`).join("");
}

function candidateRow(candidate: InternCandidateView, statusOptions: readonly string[]): string {
	return `<tr>
	<td><strong>${escapeHtml(candidate.candidate_name)}</strong><br><span class="badge ${candidate.priority_level === "Highest" ? "highest" : ""}">${escapeHtml(candidate.priority_level)}</span><p class="small">Created: ${escapeHtml(candidate.created_at)}<br>Updated: ${escapeHtml(candidate.updated_at)}</p></td>
	<td><form method="post" action="/admin/update"><input type="hidden" name="id" value="${candidate.id}" /><label>Email<input name="email" value="${escapeHtml(candidate.email)}" /></label><label>Phone<input name="phone" value="${escapeHtml(candidate.phone)}" /></label></td>
	<td><label>Role<input name="desired_role" value="${escapeHtml(candidate.desired_role)}" /></label><label>Availability<textarea name="weekly_availability">${escapeHtml(candidate.weekly_availability)}</textarea></label></td>
	<td><label>Resume<select name="resume_received"><option ${candidate.resume_received === "Yes" ? "selected" : ""}>Yes</option><option ${candidate.resume_received !== "Yes" ? "selected" : ""}>No</option></select></label>${candidate.google_drive_resume_url ? `<a href="${escapeHtml(candidate.google_drive_resume_url)}" target="_blank" rel="noreferrer">Drive resume</a>` : ""}</td>
	<td><label>Portfolio<select name="portfolio_received"><option ${candidate.portfolio_received === "Yes" ? "selected" : ""}>Yes</option><option ${candidate.portfolio_received !== "Yes" ? "selected" : ""}>No</option></select></label><label>Portfolio URL<textarea name="portfolio_url">${escapeHtml(candidate.portfolio_url)}</textarea></label>${candidate.google_drive_portfolio_url ? `<a href="${escapeHtml(candidate.google_drive_portfolio_url)}" target="_blank" rel="noreferrer">Drive portfolio</a>` : ""}</td>
	<td><label>Status<select name="interview_status">${optionTags(statusOptions, candidate.interview_status)}</select></label><label>Final Placement<input name="final_placement" value="${escapeHtml(candidate.final_placement)}" /></label></td>
	<td><label>Trial Assignment<textarea name="trial_assignment">${escapeHtml(candidate.trial_assignment)}</textarea></label><label>Notes<textarea name="notes">${escapeHtml(candidate.notes)}</textarea></label></td>
	<td><label>Priority<input name="priority_level" value="${escapeHtml(candidate.priority_level)}" /></label><label>Last Contacted<input type="date" name="last_contacted_at" value="${escapeHtml(candidate.last_contacted_at)}" /></label><button type="submit">Save</button></form></td>
</tr>`;
}

export function renderAdmin(candidates: InternCandidateView[], stats: DashboardStatsView, statusOptions: readonly string[]): string {
	return page("1SV Intern Admin Tracker", `
<header class="hero">
	<p class="badge">Assigned to Rere • Support by Brittany / BB Management</p>
	<h1>Intern Tracker</h1>
	<p>Manage first contact, resume/portfolio collection, interview scheduling, trial assignments, final placement recommendations, and Lafayette Taylor's final acceptance review.</p>
</header>
<main>
	<section class="card">
		<div class="actions"><a class="button" href="/">Public Intake Form</a><a class="button secondary" href="/export.csv">Export CSV for Google Sheets</a><a class="button light" href="/google-drive-setup">Google Drive Setup</a><a class="button light" href="/api/candidates">JSON API</a></div>
	</section>
	<section class="grid">
		<div class="stat"><span>Total Candidates</span><strong>${stats.total}</strong></div>
		<div class="stat"><span>Resumes Received</span><strong>${stats.resumesReceived}</strong></div>
		<div class="stat"><span>Pending Resumes</span><strong>${stats.pendingResumes}</strong></div>
		<div class="stat"><span>Interviews Scheduled</span><strong>${stats.interviewsScheduled}</strong></div>
		<div class="stat"><span>Accepted / Placed</span><strong>${stats.accepted}</strong></div>
		<div class="stat"><span>Google Drive</span><strong>${stats.googleDriveConnected ? "Connected" : "Setup Needed"}</strong></div>
	</section>
	<section class="card">
		<h2>Weekly Update Template</h2>
		<p class="small">Rere should send this to Lafayette every Friday.</p>
		<pre class="script">Intern Intake Weekly Update

Total candidates contacted:
Total resumes received: ${stats.resumesReceived}
Total interviews scheduled: ${stats.interviewsScheduled}
Total interviews completed:
Top candidates this week:
Candidates needing follow-up:
Candidates recommended for acceptance:
Issues or red flags:
Next week’s priority:</pre>
	</section>
	<section class="card">
		<h2>Message Templates</h2>
		<div class="grid">
			<div><h3>First Contact</h3><p class="small">Hey, this is Rere with 1 Soundvibe Studios on behalf of Lafayette Taylor. We reviewed your intern interest form and believe you may be a strong fit. Please send your resume, portfolio/work samples if available, best phone number, weekly availability, and preferred role.</p></div>
			<div><h3>Resume Received</h3><p class="small">Thank you for sending your resume. Please reply with your weekly availability and the role you are most interested in: studio staff, marketing, A&amp;R, photography, graphic design, music production, or media/content support.</p></div>
			<div><h3>Missing Resume</h3><p class="small">We noticed we still need your resume. Please send your resume, portfolio/work samples if available, phone number, and weekly availability so we can move you to the next step.</p></div>
		</div>
	</section>
	<section class="card">
		<h2>Candidate Tracker</h2>
		<div class="table-wrap"><table><thead><tr><th>Candidate</th><th>Contact</th><th>Role / Availability</th><th>Resume</th><th>Portfolio</th><th>Interview / Placement</th><th>Notes / Trial</th><th>Actions</th></tr></thead><tbody>${candidates.map((candidate) => candidateRow(candidate, statusOptions)).join("")}</tbody></table></div>
	</section>
</main>`);
}

export function renderDriveSetup(): string {
	const appsScript = `const SHARED_SECRET = 'CHANGE_ME_TO_A_LONG_SECRET';
const ROOT_FOLDER_NAME = '1 Soundvibe Studios Intern Intake';

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  if (payload.sharedSecret !== SHARED_SECRET) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'Unauthorized' })).setMimeType(ContentService.MimeType.JSON);
  }

  const root = getOrCreateFolder(ROOT_FOLDER_NAME);
  const candidateFolder = getOrCreateFolder(payload.candidateName, root);
  const response = {};

  payload.uploads.forEach((upload) => {
    const bytes = Utilities.base64Decode(upload.data);
    const blob = Utilities.newBlob(bytes, upload.contentType, upload.fileName);
    const file = candidateFolder.createFile(blob);
    response[upload.kind] = { fileName: file.getName(), webViewLink: file.getUrl() };
  });

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateFolder(name, parent) {
  const folderIterator = parent ? parent.getFoldersByName(name) : DriveApp.getFoldersByName(name);
  if (folderIterator.hasNext()) return folderIterator.next();
  return parent ? parent.createFolder(name) : DriveApp.createFolder(name);
}`;
	return page("Google Drive Setup", `
<header class="hero"><h1>Google Drive Connection</h1><p>Use a Google Apps Script web app as the secure bridge between this Cloudflare Worker intake system and your Google Drive folder.</p></header>
<main>
	<section class="card">
		<h2>Setup Steps</h2>
		<ol>
			<li>Open <a href="https://script.google.com" target="_blank" rel="noreferrer">Google Apps Script</a> while signed into the Google Drive account that should own the intern files.</li>
			<li>Create a new project and paste the script below.</li>
			<li>Change <code>SHARED_SECRET</code> to a long private value.</li>
			<li>Deploy as a web app with access limited to yourself or your organization, then copy the web app URL.</li>
			<li>Add Worker secrets: <code>GOOGLE_DRIVE_WEBHOOK_URL</code>, <code>GOOGLE_DRIVE_SHARED_SECRET</code>, and optionally <code>ADMIN_TOKEN</code>.</li>
		</ol>
		<pre class="script">${escapeHtml(appsScript)}</pre>
	</section>
	<section class="card">
		<h2>Wrangler Secret Commands</h2>
		<pre class="script">npx wrangler secret put GOOGLE_DRIVE_WEBHOOK_URL
npx wrangler secret put GOOGLE_DRIVE_SHARED_SECRET
npx wrangler secret put ADMIN_TOKEN</pre>
		<p class="small">After this is configured, uploaded resumes and portfolio files will be copied into candidate-specific folders in Google Drive. The tracker keeps the returned Drive links.</p>
	</section>
</main>`);
}
