import { renderHtml, type EmailStatus, type SubmissionView } from "./renderHtml";

const DEFAULT_FLOWFORM_ENDPOINT = "https://flowform.to/submit";
const DEFAULT_SUBMISSION_EMAIL = "freegameproductions@gmail.com";
const EVENT_NAME = "The Girls Room Creative Lock In";

type AppEnv = Env & {
	FLOWFORM_ENDPOINT?: string;
	FLOWFORM_TOKEN?: string;
	FORM_PROVIDER_ENDPOINT?: string;
	FORM_PROVIDER_TOKEN?: string;
	SUBMISSION_EMAIL?: string;
};

type SubmissionRecord = Required<SubmissionView>;

type ProviderConfig = {
	endpoint: string;
	recipientEmail: string;
	usesDashboardEndpoint: boolean;
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

const fileFromForm = (formData: FormData) => {
	const value = formData.get("upload");
	return isNamedFile(value) ? value : undefined;
};

const fileNameFromForm = (formData: FormData) => fileFromForm(formData)?.name.trim() || "";

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

const providerConfig = (env: AppEnv): ProviderConfig => {
	const recipientEmail = env.SUBMISSION_EMAIL || DEFAULT_SUBMISSION_EMAIL;
	const configuredEndpoint = env.FLOWFORM_ENDPOINT?.trim() || env.FORM_PROVIDER_ENDPOINT?.trim();
	const configuredToken = env.FLOWFORM_TOKEN?.trim() || env.FORM_PROVIDER_TOKEN?.trim();
	const endpoint = configuredEndpoint || (configuredToken ? `https://flowform.to/f/${configuredToken}` : DEFAULT_FLOWFORM_ENDPOINT);

	return {
		endpoint,
		recipientEmail,
		usesDashboardEndpoint: endpoint.includes("/f/"),
	};
};

async function ensureSubmissionTable(env: AppEnv) {
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

async function saveSubmission(env: AppEnv, submission: SubmissionRecord) {
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

function buildProviderFormData(submission: SubmissionRecord, originalFormData: FormData, config: ProviderConfig) {
	const providerFormData = new FormData();

	if (!config.usesDashboardEndpoint) {
		providerFormData.append("_to", config.recipientEmail);
	}

	providerFormData.append("_subject", "New Creative Lock In invite request");
	providerFormData.append("_replyto", submission.email);
	providerFormData.append("event", EVENT_NAME);
	providerFormData.append("name", submission.name);
	providerFormData.append("email", submission.email);
	providerFormData.append("creative_lane", submission.role);
	providerFormData.append("instagram_or_website", submission.social || "Not provided");
	providerFormData.append("notes", submission.notes || "Not provided");
	providerFormData.append("upload_file_name", submission.fileName || "No file attached");
	providerFormData.append("media_consent", submission.mediaConsent);
	providerFormData.append("sponsorship_interest", submission.sponsorshipInterest);
	providerFormData.append("sponsor_name", submission.sponsorName || "Not provided");
	providerFormData.append("sponsor_level", submission.sponsorLevel || "Not provided");

	const upload = fileFromForm(originalFormData);
	if (upload) {
		providerFormData.append("upload", upload, upload.name);
	}

	return providerFormData;
}

async function sendSubmissionToFormProvider(
	submission: SubmissionRecord,
	originalFormData: FormData,
	config: ProviderConfig,
): Promise<EmailStatus> {
	try {
		const response = await fetch(config.endpoint, {
			method: "POST",
			body: buildProviderFormData(submission, originalFormData, config),
			signal: AbortSignal.timeout(15000),
		});

		if (response.ok) {
			return config.usesDashboardEndpoint ? "sent-to-dashboard" : "sent";
		}

		console.warn(`Form provider delivery returned ${response.status}`);
		return "failed";
	} catch (error) {
		console.warn("Form provider delivery failed", error);
		return "failed";
	}
}

async function handleSubmission(request: Request, env: AppEnv) {
	const formData = await request.formData();
	const submission = submissionFromForm(formData);
	const missingFields = validateSubmission(submission);
	const config = providerConfig(env);

	if (missingFields.length > 0) {
		return new Response(renderHtml(submission, { kind: "error", missingFields }, config.recipientEmail), {
			status: 400,
			headers: htmlHeaders,
		});
	}

	try {
		await saveSubmission(env, submission);
	} catch (error) {
		console.error("D1 submission save failed", error);
		return new Response(renderHtml(submission, { kind: "error", database: "failed" }, config.recipientEmail), {
			status: 500,
			headers: htmlHeaders,
		});
	}

	const email = await sendSubmissionToFormProvider(submission, formData, config);

	return new Response(renderHtml(submission, { kind: "success", email }, config.recipientEmail), {
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

		return new Response(request.method === "HEAD" ? null : renderHtml(undefined, undefined, providerConfig(env).recipientEmail), {
			headers: htmlHeaders,
		});
	},
} satisfies ExportedHandler<AppEnv>;
