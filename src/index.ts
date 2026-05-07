import { renderHtml, type EmailStatus, type SubmissionView } from "./renderHtml";

const FLOWFORM_ENDPOINT = "https://flowform.to/submit";
const SUBMISSION_EMAIL = "freegameproductions@gmail.com";
const EVENT_NAME = "The Girls Room Creative Lock In";

type SubmissionRecord = Required<SubmissionView> & {
	social: string;
	notes: string;
	sponsorName: string;
	sponsorLevel: string;
};

const htmlHeaders = {
	"content-type": "text/html;charset=UTF-8",
};

const textValue = (formData: FormData, key: string) => {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim() : "";
};

const checkboxValue = (formData: FormData, key: string) => (formData.has(key) ? "Yes" : "No");

const isNamedFile = (value: unknown): value is File =>
	typeof File !== "undefined" && value instanceof File && value.name.trim().length > 0;

const fileNameFromForm = (formData: FormData) => {
	const value = formData.get("upload");
	return isNamedFile(value) ? value.name.trim() : "";
};

const submissionFromForm = (formData: FormData): SubmissionRecord => ({
	name: textValue(formData, "name"),
	email: textValue(formData, "email"),
	role: textValue(formData, "role"),
	social: textValue(formData, "social"),
	notes: textValue(formData, "notes"),
	fileName: fileNameFromForm(formData),
	sponsorshipInterest: checkboxValue(formData, "sponsorshipInterest"),
	mediaConsent: checkboxValue(formData, "mediaConsent"),
	sponsorName: textValue(formData, "sponsorName"),
	sponsorLevel: textValue(formData, "sponsorLevel"),
});

const validateSubmission = (submission: SubmissionRecord) => {
	const missingFields = [];

	if (!submission.name) missingFields.push("full name");
	if (!submission.email) missingFields.push("email");
	if (!submission.role) missingFields.push("creative lane");
	if (submission.mediaConsent !== "Yes") missingFields.push("media release consent");

	return missingFields;
};

async function ensureSubmissionTable(env: Env) {
	await env.DB.prepare(
		`CREATE TABLE IF NOT EXISTS creative_lock_in_submissions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			email TEXT NOT NULL,
			role TEXT NOT NULL,
			social TEXT,
			notes TEXT,
			upload_file_name TEXT,
			sponsorship_interest TEXT NOT NULL DEFAULT 'No',
			media_consent TEXT NOT NULL DEFAULT 'No',
			sponsor_name TEXT,
			sponsor_level TEXT,
			created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
		)`,
	).run();
}

async function saveSubmission(env: Env, submission: SubmissionRecord) {
	await ensureSubmissionTable(env);

	try {
		await env.DB.prepare(
			`INSERT INTO creative_lock_in_submissions (
				name,
				email,
				role,
				social,
				notes,
				upload_file_name,
				sponsorship_interest,
				media_consent,
				sponsor_name,
				sponsor_level
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
			.bind(
				submission.name,
				submission.email,
				submission.role,
				submission.social,
				submission.notes,
				submission.fileName,
				submission.sponsorshipInterest,
				submission.mediaConsent,
				submission.sponsorName,
				submission.sponsorLevel,
			)
			.run();
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);

		if (!message.toLowerCase().includes("media_consent")) {
			throw error;
		}

		await env.DB.prepare(
			`INSERT INTO creative_lock_in_submissions (
				name,
				email,
				role,
				social,
				notes,
				upload_file_name,
				sponsorship_interest,
				sponsor_name,
				sponsor_level
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
			.bind(
				submission.name,
				submission.email,
				submission.role,
				submission.social,
				submission.notes,
				submission.fileName,
				submission.sponsorshipInterest,
				submission.sponsorName,
				submission.sponsorLevel,
			)
			.run();
	}
}

async function sendSubmissionEmail(submission: SubmissionRecord): Promise<EmailStatus> {
	const emailFormData = new FormData();
	emailFormData.append("_to", SUBMISSION_EMAIL);
	emailFormData.append("_subject", "New Creative Lock In invite request");
	emailFormData.append("event", EVENT_NAME);
	emailFormData.append("name", submission.name);
	emailFormData.append("email", submission.email);
	emailFormData.append("creative_lane", submission.role);
	emailFormData.append("instagram_or_website", submission.social || "Not provided");
	emailFormData.append("notes", submission.notes || "Not provided");
	emailFormData.append("upload_file_name", submission.fileName || "No file attached");
	emailFormData.append("media_consent", submission.mediaConsent);
	emailFormData.append("sponsorship_interest", submission.sponsorshipInterest);
	emailFormData.append("sponsor_name", submission.sponsorName || "Not provided");
	emailFormData.append("sponsor_level", submission.sponsorLevel || "Not provided");

	try {
		const response = await fetch(FLOWFORM_ENDPOINT, {
			method: "POST",
			body: emailFormData,
			signal: AbortSignal.timeout(8000),
		});

		if (response.ok) {
			return "sent";
		}

		console.warn(`FlowForm email delivery returned ${response.status}`);
		return "failed";
	} catch (error) {
		console.warn("FlowForm email delivery failed", error);
		return "failed";
	}
}

async function handleSubmission(request: Request, env: Env) {
	const formData = await request.formData();
	const submission = submissionFromForm(formData);
	const missingFields = validateSubmission(submission);

	if (missingFields.length > 0) {
		return new Response(renderHtml(submission, { kind: "error", missingFields }), {
			status: 400,
			headers: htmlHeaders,
		});
	}

	try {
		await saveSubmission(env, submission);
	} catch (error) {
		console.error("D1 submission save failed", error);
		return new Response(renderHtml(submission, { kind: "error", database: "failed" }), {
			status: 500,
			headers: htmlHeaders,
		});
	}

	const email = await sendSubmissionEmail(submission);

	return new Response(renderHtml(submission, { kind: "success", email }), {
		headers: htmlHeaders,
	});
}

export default {
	async fetch(request, env) {
		if (request.method === "POST") {
			return handleSubmission(request, env);
		}

		if (request.method !== "GET" && request.method !== "HEAD") {
			return new Response("Method not allowed", {
				status: 405,
				headers: { allow: "GET, HEAD, POST" },
			});
		}

		return new Response(request.method === "HEAD" ? null : renderHtml(), {
			headers: htmlHeaders,
		});
	},
} satisfies ExportedHandler<Env>;
