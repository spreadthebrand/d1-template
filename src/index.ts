import { renderAdmin, renderDriveSetup, renderIntakeForm, renderSuccess } from "./renderHtml";

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

function isAdmin(request: Request, env: Env): boolean {
	const token = getEnvValue(env, "ADMIN_TOKEN");
	if (!token) {
		return true;
	}
	const url = new URL(request.url);
	const suppliedToken = url.searchParams.get("token") ?? request.headers.get("x-admin-token") ?? "";
	return suppliedToken === token;
}

function requireAdmin(request: Request, env: Env): Response | undefined {
	if (isAdmin(request, env)) {
		return undefined;
	}
	return htmlResponse("<h1>Unauthorized</h1><p>Add your admin token to the URL as <code>?token=...</code>.</p>", { status: 401 });
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

async function listCandidates(env: Env): Promise<InternCandidate[]> {
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

	return redirect("/admin");
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
		return htmlResponse(renderAdmin(await listCandidates(env), await getStats(env), STATUS_OPTIONS));
	}

	if (request.method === "POST" && url.pathname === "/admin/update") {
		return updateCandidate(request, env);
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
