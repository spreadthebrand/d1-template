import { renderAdmin, renderAdminLogin, renderDriveSetup, renderIntakeForm, renderSuccess } from "./renderHtml";

type InternCandidate = {
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
	resume_file_name: string;
	portfolio_file_name: string;
	google_drive_resume_url: string;
	google_drive_portfolio_url: string;
	trial_assignment: string;
	priority_level: string;
	source: string;
	created_at: string;
	updated_at: string;
	last_contacted_at: string | null;
};

type DashboardStats = {
	total: number;
	resumesReceived: number;
	pendingResumes: number;
	interviewsScheduled: number;
	accepted: number;
	googleDriveConnected: boolean;
};

type DriveUploadResult = {
	fileName: string;
	webViewLink: string;
};

type DriveSyncResult = {
	resume?: DriveUploadResult;
	portfolio?: DriveUploadResult;
};

type SeedCandidate = {
	candidateName: string;
	email?: string;
	desiredRole: string;
	resumeReceived: "Yes" | "No";
	portfolioReceived: "Yes" | "No";
	interviewStatus: string;
	notes: string;
	priorityLevel: string;
};

const STATUS_OPTIONS = [
	"New Lead",
	"Resume Requested",
	"Resume Received",
	"Interview Scheduled",
	"Interview Completed",
	"Accepted",
	"Not Selected",
	"Future Consideration",
] as const;

const ROLE_TRIAL_ASSIGNMENTS: Record<string, string> = {
	Marketing: "Create 3 promo ideas for 1 Soundvibe Studios.",
	"Graphic Design": "Create 1 sample flyer or social media post.",
	Photography: "Submit 5 best photos or a portfolio link.",
	"Studio Staff": "Explain how you would help set up a vocal session.",
	"A&R": "Submit 3 Houston artists you think 1SV should watch.",
	Producer: "Submit 3 beats or production samples.",
	Content: "Submit 2 short-form video ideas for the studio.",
};

const CURRENT_CANDIDATES: SeedCandidate[] = [
	{ candidateName: "Devon L. Barnett", desiredRole: "Graphic Design Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "Resume Requested", notes: "Highest priority: only graphic design candidate. Contact immediately and request resume plus design samples.", priorityLevel: "Highest" },
	{ candidateName: "Tycian White", desiredRole: "Photography Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "Resume Requested", notes: "Highest priority: best direct match for photography. Request portfolio/sample work and schedule interview.", priorityLevel: "Highest" },
	{ candidateName: "William Williams", desiredRole: "Marketing Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "Resume Requested", notes: "Highest priority: strongest fit for artist-facing marketing. Request resume and schedule interview.", priorityLevel: "Highest" },
	{ candidateName: "Elijah Victorian", desiredRole: "A&R Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "Resume Requested", notes: "Highest priority: artist/producer/engineer background. Request resume, portfolio, and music links.", priorityLevel: "Highest" },
	{ candidateName: "Robert Garcia", desiredRole: "Studio Staff Intern", resumeReceived: "Yes", portfolioReceived: "No", interviewStatus: "Resume Received", notes: "Highest priority: resume received. Strong studio support candidate. Schedule group interview.", priorityLevel: "Highest" },
	{ candidateName: "Ralph Onwumere", desiredRole: "Studio Staff Intern", resumeReceived: "Yes", portfolioReceived: "No", interviewStatus: "Resume Received", notes: "Highest priority: resume received. Audio engineer background. Schedule group interview.", priorityLevel: "Highest" },
	{ candidateName: "Cesar Sifuentes", desiredRole: "Studio Staff Intern", resumeReceived: "Yes", portfolioReceived: "No", interviewStatus: "Resume Received", notes: "Highest priority: resume received. HCC audio engineering background. Schedule group interview.", priorityLevel: "Highest" },
	{ candidateName: "Madeline Herrera", desiredRole: "Studio Staff / Broadcast Support", resumeReceived: "Yes", portfolioReceived: "No", interviewStatus: "Resume Received", notes: "Highest priority: resume received. Radio broadcast/master engineering background. Schedule group interview.", priorityLevel: "Highest" },
	{ candidateName: "Meaux Melody", desiredRole: "Marketing Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "New Lead", notes: "Marketing backup candidate.", priorityLevel: "Backup" },
	{ candidateName: "Brandon Molina", desiredRole: "Marketing Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "New Lead", notes: "Marketing backup candidate.", priorityLevel: "Backup" },
	{ candidateName: "Kareem Alsabur", desiredRole: "Marketing / Producer Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "New Lead", notes: "Marketing and producer backup candidate.", priorityLevel: "Backup" },
	{ candidateName: "Alan Jackson", desiredRole: "A&R Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "New Lead", notes: "A&R backup candidate.", priorityLevel: "Backup" },
	{ candidateName: "Keenon Taylor II", desiredRole: "A&R Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "New Lead", notes: "A&R backup candidate.", priorityLevel: "Backup" },
	{ candidateName: "Eduardo Primera", desiredRole: "A&R Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "New Lead", notes: "A&R backup candidate.", priorityLevel: "Backup" },
	{ candidateName: "Jonah Donnell", desiredRole: "Photography Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "New Lead", notes: "Photography backup candidate.", priorityLevel: "Backup" },
	{ candidateName: "Esperanza Nolasco", desiredRole: "Photography Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "New Lead", notes: "Photography backup candidate.", priorityLevel: "Backup" },
	{ candidateName: "Mason Richards", desiredRole: "Producer Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "New Lead", notes: "Top producer candidate. Request beat links/music samples.", priorityLevel: "High" },
	{ candidateName: "Trevin Richards", desiredRole: "Producer Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "New Lead", notes: "Top producer candidate. Request beat links/music samples.", priorityLevel: "High" },
	{ candidateName: "Jordan Moreno", desiredRole: "Producer Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "New Lead", notes: "Producer backup candidate.", priorityLevel: "Backup" },
	{ candidateName: "Donye Tolbert", desiredRole: "Producer Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "New Lead", notes: "Producer backup candidate.", priorityLevel: "Backup" },
	{ candidateName: "Anthony Chavarria", desiredRole: "Producer Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "New Lead", notes: "Producer backup candidate.", priorityLevel: "Backup" },
	{ candidateName: "Martarius Bolden", desiredRole: "Producer Intern", resumeReceived: "No", portfolioReceived: "No", interviewStatus: "New Lead", notes: "Producer backup candidate.", priorityLevel: "Backup" },
];


function htmlResponse(html: string, init: ResponseInit = {}) {
	return new Response(html, {
		...init,
		headers: {
			"content-type": "text/html; charset=UTF-8",
			...init.headers,
		},
	});
}

function jsonResponse(data: unknown, init: ResponseInit = {}) {
	return new Response(JSON.stringify(data, null, 2), {
		...init,
		headers: {
			"content-type": "application/json; charset=UTF-8",
			...init.headers,
		},
	});
}

function redirect(location: string) {
	return new Response(null, {
		status: 303,
		headers: { location },
	});
}

function getEnvValue(env: Env, key: string): string {
	const value = (env as unknown as Record<string, string | undefined>)[key];
	return typeof value === "string" ? value.trim() : "";
}

function getSuppliedAdminToken(request: Request): string {
	const url = new URL(request.url);
	return url.searchParams.get("token") ?? request.headers.get("x-admin-token") ?? "";
}

function getAdminQuery(request: Request): string {
	const token = getSuppliedAdminToken(request);
	return token ? `?token=${encodeURIComponent(token)}` : "";
}

function isAdmin(request: Request, env: Env): boolean {
	const token = getEnvValue(env, "ADMIN_TOKEN");
	if (!token) {
		return false;
	}
	return getSuppliedAdminToken(request) === token;
}

function requireAdmin(request: Request, env: Env): Response | undefined {
	if (isAdmin(request, env)) {
		return undefined;
	}
	return htmlResponse(renderAdminLogin(Boolean(getEnvValue(env, "ADMIN_TOKEN"))), { status: 401 });
}

function safeString(value: string | File | null): string {
	return typeof value === "string" ? value.trim() : "";
}

function boolToYesNo(value: boolean): "Yes" | "No" {
	return value ? "Yes" : "No";
}

function inferTrialAssignment(role: string): string {
	const normalizedRole = role.toLowerCase();
	const match = Object.entries(ROLE_TRIAL_ASSIGNMENTS).find(([key]) => normalizedRole.includes(key.toLowerCase()));
	return match?.[1] ?? "Bring examples of your work and explain how you would support 1 Soundvibe Studios.";
}

function csvEscape(value: unknown): string {
	const stringValue = value === null || value === undefined ? "" : String(value);
	return `"${stringValue.replaceAll('"', '""')}"`;
}

function toCsv(candidates: InternCandidate[]): string {
	const headers = [
		"Candidate Name",
		"Email",
		"Phone",
		"Desired Role",
		"Resume Received",
		"Portfolio Received",
		"Interview Status",
		"Notes",
		"Final Placement",
		"Weekly Availability",
		"Portfolio URL",
		"Google Drive Resume URL",
		"Google Drive Portfolio URL",
		"Trial Assignment",
		"Priority Level",
		"Last Contacted At",
		"Created At",
		"Updated At",
	];
	const rows = candidates.map((candidate) => [
		candidate.candidate_name,
		candidate.email,
		candidate.phone,
		candidate.desired_role,
		candidate.resume_received,
		candidate.portfolio_received,
		candidate.interview_status,
		candidate.notes,
		candidate.final_placement,
		candidate.weekly_availability,
		candidate.portfolio_url,
		candidate.google_drive_resume_url,
		candidate.google_drive_portfolio_url,
		candidate.trial_assignment,
		candidate.priority_level,
		candidate.last_contacted_at,
		candidate.created_at,
		candidate.updated_at,
	]);
	return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

async function fileToBase64(file: File): Promise<string> {
	const bytes = new Uint8Array(await file.arrayBuffer());
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}

async function uploadFilesToGoogleDrive(env: Env, candidateName: string, files: { resume?: File; portfolio?: File }): Promise<DriveSyncResult> {
	const webhookUrl = getEnvValue(env, "GOOGLE_DRIVE_WEBHOOK_URL");
	if (!webhookUrl) {
		return {};
	}

	const sharedSecret = getEnvValue(env, "GOOGLE_DRIVE_SHARED_SECRET");
	const uploads = await Promise.all(
		Object.entries(files)
			.filter(([, file]) => file instanceof File && file.size > 0)
			.map(async ([kind, file]) => ({
				kind,
				fileName: file.name,
				contentType: file.type || "application/octet-stream",
				data: await fileToBase64(file),
			})),
	);

	if (uploads.length === 0) {
		return {};
	}

	const driveResponse = await fetch(webhookUrl, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			sharedSecret,
			candidateName,
			folderName: "1 Soundvibe Studios Intern Intake",
			uploads,
		}),
	});

	if (!driveResponse.ok) {
		return {};
	}

	return (await driveResponse.json()) as DriveSyncResult;
}


async function ensureInternTables(env: Env): Promise<void> {
	await env.DB.batch([
		env.DB.prepare(`CREATE TABLE IF NOT EXISTS intern_candidates (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			candidate_name TEXT NOT NULL,
			email TEXT,
			phone TEXT,
			desired_role TEXT NOT NULL DEFAULT 'New Lead',
			resume_received TEXT NOT NULL DEFAULT 'No',
			portfolio_received TEXT NOT NULL DEFAULT 'No',
			interview_status TEXT NOT NULL DEFAULT 'New Lead',
			notes TEXT NOT NULL DEFAULT '',
			final_placement TEXT NOT NULL DEFAULT '',
			weekly_availability TEXT NOT NULL DEFAULT '',
			portfolio_url TEXT NOT NULL DEFAULT '',
			resume_file_name TEXT NOT NULL DEFAULT '',
			portfolio_file_name TEXT NOT NULL DEFAULT '',
			google_drive_resume_url TEXT NOT NULL DEFAULT '',
			google_drive_portfolio_url TEXT NOT NULL DEFAULT '',
			trial_assignment TEXT NOT NULL DEFAULT '',
			priority_level TEXT NOT NULL DEFAULT 'Normal',
			source TEXT NOT NULL DEFAULT 'Intern Intake Form',
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			last_contacted_at TEXT,
			UNIQUE(candidate_name, desired_role)
		)`),
		env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_intern_candidates_status ON intern_candidates(interview_status)"),
		env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_intern_candidates_role ON intern_candidates(desired_role)"),
		env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_intern_candidates_priority ON intern_candidates(priority_level)"),
		env.DB.prepare(`CREATE TABLE IF NOT EXISTS intern_activity_log (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			candidate_id INTEGER,
			action TEXT NOT NULL,
			details TEXT NOT NULL DEFAULT '',
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(candidate_id) REFERENCES intern_candidates(id) ON DELETE CASCADE
		)`),
	]);

	const existing = await env.DB.prepare("SELECT COUNT(*) AS total FROM intern_candidates").first<{ total: number }>();
	if ((existing?.total ?? 0) > 0) {
		return;
	}

	await env.DB.batch(CURRENT_CANDIDATES.map((candidate) => env.DB.prepare(`
		INSERT OR IGNORE INTO intern_candidates
		(candidate_name, email, desired_role, resume_received, portfolio_received, interview_status, notes, priority_level, source, trial_assignment)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Initial intern placement report', ?)
	`).bind(
		candidate.candidateName,
		candidate.email ?? "",
		candidate.desiredRole,
		candidate.resumeReceived,
		candidate.portfolioReceived,
		candidate.interviewStatus,
		candidate.notes,
		candidate.priorityLevel,
		inferTrialAssignment(candidate.desiredRole),
	)));
}

function parseImportLine(line: string): SeedCandidate | undefined {
	const trimmed = line.trim();
	if (!trimmed) {
		return undefined;
	}
	const cells = trimmed.includes(",") ? trimmed.split(",").map((cell) => cell.trim()) : trimmed.split(/\s+[—-]\s+/).map((cell) => cell.trim());
	const candidateName = cells[0] ?? "";
	const email = trimmed.includes(",") ? cells[1] ?? "" : "";
	const desiredRole = cells[2] && trimmed.includes(",") ? cells[2] : cells[1] ?? "New Lead";
	if (!candidateName || candidateName.toLowerCase() === "candidate name" || candidateName.toLowerCase() === "name") {
		return undefined;
	}
	return {
		candidateName,
		email,
		desiredRole: desiredRole || "New Lead",
		resumeReceived: cells[3]?.toLowerCase() === "yes" ? "Yes" : "No",
		portfolioReceived: cells[4]?.toLowerCase() === "yes" ? "Yes" : "No",
		interviewStatus: STATUS_OPTIONS.includes(cells[5] as (typeof STATUS_OPTIONS)[number]) ? cells[5] as (typeof STATUS_OPTIONS)[number] : "New Lead",
		notes: cells[6] ?? "Imported from current list.",
		priorityLevel: "Normal",
	};
}

async function listCandidates(env: Env): Promise<InternCandidate[]> {
	await ensureInternTables(env);
	const { results } = await env.DB.prepare("SELECT * FROM intern_candidates ORDER BY CASE priority_level WHEN 'Highest' THEN 0 WHEN 'High' THEN 1 WHEN 'Backup' THEN 2 ELSE 3 END, updated_at DESC, candidate_name ASC").all<InternCandidate>();
	return results;
}

async function getStats(env: Env): Promise<DashboardStats> {
	const candidates = await listCandidates(env);
	return {
		total: candidates.length,
		resumesReceived: candidates.filter((candidate) => candidate.resume_received === "Yes").length,
		pendingResumes: candidates.filter((candidate) => candidate.resume_received !== "Yes").length,
		interviewsScheduled: candidates.filter((candidate) => candidate.interview_status === "Interview Scheduled").length,
		accepted: candidates.filter((candidate) => candidate.interview_status === "Accepted" || candidate.final_placement).length,
		googleDriveConnected: Boolean(getEnvValue(env, "GOOGLE_DRIVE_WEBHOOK_URL")),
	};
}

async function createCandidate(request: Request, env: Env): Promise<Response> {
	await ensureInternTables(env);
	const form = await request.formData();
	const candidateName = safeString(form.get("candidate_name"));
	const desiredRole = safeString(form.get("desired_role"));
	if (!candidateName || !desiredRole) {
		return htmlResponse("<h1>Missing information</h1><p>Name and desired role are required.</p>", { status: 400 });
	}

	const resume = form.get("resume");
	const portfolioFile = form.get("portfolio_file");
	const resumeFile = resume instanceof File && resume.size > 0 ? resume : undefined;
	const uploadedPortfolioFile = portfolioFile instanceof File && portfolioFile.size > 0 ? portfolioFile : undefined;
	const driveSync = await uploadFilesToGoogleDrive(env, candidateName, { resume: resumeFile, portfolio: uploadedPortfolioFile });
	const portfolioUrl = safeString(form.get("portfolio_url"));
	const hasPortfolio = Boolean(portfolioUrl || uploadedPortfolioFile || driveSync.portfolio?.webViewLink);
	const hasResume = Boolean(resumeFile || driveSync.resume?.webViewLink);
	const trialAssignment = inferTrialAssignment(desiredRole);

	const result = await env.DB.prepare(`
		INSERT INTO intern_candidates (
			candidate_name, email, phone, desired_role, resume_received, portfolio_received,
			interview_status, notes, final_placement, weekly_availability, portfolio_url,
			resume_file_name, portfolio_file_name, google_drive_resume_url, google_drive_portfolio_url,
			trial_assignment, priority_level, source, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, 'Normal', 'Public intake form', CURRENT_TIMESTAMP)
	`).bind(
		candidateName,
		safeString(form.get("email")),
		safeString(form.get("phone")),
		desiredRole,
		boolToYesNo(hasResume),
		boolToYesNo(hasPortfolio),
		hasResume ? "Resume Received" : "Resume Requested",
		safeString(form.get("notes")),
		safeString(form.get("weekly_availability")),
		portfolioUrl,
		resumeFile?.name ?? "",
		uploadedPortfolioFile?.name ?? "",
		driveSync.resume?.webViewLink ?? "",
		driveSync.portfolio?.webViewLink ?? "",
		trialAssignment,
	).run();

	await env.DB.prepare("INSERT INTO intern_activity_log (candidate_id, action, details) VALUES (?, 'Candidate submitted intake form', ?)")
		.bind(result.meta.last_row_id, driveSync.resume || driveSync.portfolio ? "Files synced to Google Drive." : "Stored candidate details in D1.")
		.run();

	return htmlResponse(renderSuccess(candidateName, driveSync));
}

async function updateCandidate(request: Request, env: Env): Promise<Response> {
	const unauthorized = requireAdmin(request, env);
	if (unauthorized) {
		return unauthorized;
	}
	await ensureInternTables(env);
	const form = await request.formData();
	const id = Number(safeString(form.get("id")));
	if (!Number.isInteger(id)) {
		return htmlResponse("<h1>Invalid candidate</h1>", { status: 400 });
	}
	const interviewStatus = safeString(form.get("interview_status"));
	if (!STATUS_OPTIONS.includes(interviewStatus as (typeof STATUS_OPTIONS)[number])) {
		return htmlResponse("<h1>Invalid status</h1>", { status: 400 });
	}

	await env.DB.prepare(`
		UPDATE intern_candidates
		SET email = ?, phone = ?, desired_role = ?, resume_received = ?, portfolio_received = ?,
			interview_status = ?, notes = ?, final_placement = ?, weekly_availability = ?,
			portfolio_url = ?, trial_assignment = ?, priority_level = ?, last_contacted_at = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`).bind(
		safeString(form.get("email")),
		safeString(form.get("phone")),
		safeString(form.get("desired_role")),
		safeString(form.get("resume_received")) || "No",
		safeString(form.get("portfolio_received")) || "No",
		interviewStatus,
		safeString(form.get("notes")),
		safeString(form.get("final_placement")),
		safeString(form.get("weekly_availability")),
		safeString(form.get("portfolio_url")),
		safeString(form.get("trial_assignment")),
		safeString(form.get("priority_level")) || "Normal",
		safeString(form.get("last_contacted_at")) || null,
		id,
	).run();

	await env.DB.prepare("INSERT INTO intern_activity_log (candidate_id, action, details) VALUES (?, 'Candidate updated', ?)")
		.bind(id, `Status changed to ${interviewStatus}.`)
		.run();

	return redirect(`/admin${getAdminQuery(request)}`);
}

async function importCandidates(request: Request, env: Env): Promise<Response> {
	const unauthorized = requireAdmin(request, env);
	if (unauthorized) {
		return unauthorized;
	}
	await ensureInternTables(env);
	const form = await request.formData();
	const lines = safeString(form.get("candidate_list")).split(/\r?\n/);
	const candidates = lines.map(parseImportLine).filter((candidate): candidate is SeedCandidate => Boolean(candidate));
	if (candidates.length === 0) {
		return redirect(`/admin${getAdminQuery(request)}`);
	}
	await env.DB.batch(candidates.map((candidate) => env.DB.prepare(`
		INSERT INTO intern_candidates
		(candidate_name, email, desired_role, resume_received, portfolio_received, interview_status, notes, priority_level, source, trial_assignment, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Admin current-list import', ?, CURRENT_TIMESTAMP)
		ON CONFLICT(candidate_name, desired_role) DO UPDATE SET
			interview_status = excluded.interview_status,
			email = CASE WHEN intern_candidates.email IS NULL OR intern_candidates.email = '' THEN excluded.email ELSE intern_candidates.email END,
			notes = CASE WHEN intern_candidates.notes = '' THEN excluded.notes ELSE intern_candidates.notes END,
			updated_at = CURRENT_TIMESTAMP
	`).bind(
		candidate.candidateName,
		candidate.email ?? "",
		candidate.desiredRole,
		candidate.resumeReceived,
		candidate.portfolioReceived,
		candidate.interviewStatus,
		candidate.notes,
		candidate.priorityLevel,
		inferTrialAssignment(candidate.desiredRole),
	)));
	return redirect(`/admin${getAdminQuery(request)}`);
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);

	if (request.method === "GET" && url.pathname === "/") {
		return htmlResponse(renderIntakeForm());
	}

	if (request.method === "POST" && url.pathname === "/intake") {
		return createCandidate(request, env);
	}

	if (request.method === "GET" && url.pathname === "/admin") {
		const unauthorized = requireAdmin(request, env);
		if (unauthorized) {
			return unauthorized;
		}
		return htmlResponse(renderAdmin(await listCandidates(env), await getStats(env), STATUS_OPTIONS, getAdminQuery(request)));
	}

	if (request.method === "POST" && url.pathname === "/admin/update") {
		return updateCandidate(request, env);
	}

	if (request.method === "POST" && url.pathname === "/admin/import") {
		return importCandidates(request, env);
	}

	if (request.method === "GET" && url.pathname === "/api/candidates") {
		const unauthorized = requireAdmin(request, env);
		if (unauthorized) {
			return unauthorized;
		}
		return jsonResponse({ stats: await getStats(env), candidates: await listCandidates(env) });
	}

	if (request.method === "GET" && url.pathname === "/export.csv") {
		const unauthorized = requireAdmin(request, env);
		if (unauthorized) {
			return unauthorized;
		}
		return new Response(toCsv(await listCandidates(env)), {
			headers: {
				"content-type": "text/csv; charset=UTF-8",
				"content-disposition": "attachment; filename=1sv-intern-tracker.csv",
			},
		});
	}

	if (request.method === "GET" && url.pathname === "/google-drive-setup") {
		return htmlResponse(renderDriveSetup());
	}

	return htmlResponse("<h1>Not found</h1><p>Visit <a href=\"/\">Intern intake</a> or <a href=\"/admin\">Admin tracker</a>.</p>", { status: 404 });
}

export default {
	fetch: handleRequest,
} satisfies ExportedHandler<Env>;
