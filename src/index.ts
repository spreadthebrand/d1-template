import { renderHtml, type SubmissionView } from "./renderHtml";

const FLOWFORM_ENDPOINT = "https://flowform.to/submit";
const SUBMISSION_EMAIL = "freegameproductions@gmail.com";

const textValue = (formData: FormData, key: string) => {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim() : "";
};

const fileNameFromForm = (formData: FormData) => {
	const value = formData.get("upload");
	return value instanceof File && value.name ? value.name : "";
};

async function sendSubmissionEmail(formData: FormData, uploadFileName: string) {
	const emailFormData = new FormData();
	emailFormData.append("_to", SUBMISSION_EMAIL);
	emailFormData.append("_subject", "New Creative Lock In invite request");
	emailFormData.append("event", "The Girls Room Creative Lock In");
	emailFormData.append("upload_file_name", uploadFileName || "No file attached");

	for (const [key, value] of formData.entries()) {
		if (typeof value === "string") {
			emailFormData.append(key, value);
		} else {
			emailFormData.append(key, value, value.name);
		}
	}

	const response = await fetch(FLOWFORM_ENDPOINT, {
		method: "POST",
		body: emailFormData,
	});

	if (!response.ok) {
		throw new Error(`FlowForm email delivery failed with status ${response.status}`);
	}
}

async function handleSubmission(request: Request, env: Env) {
	const formData = await request.formData();
	const uploadFileName = fileNameFromForm(formData);
	const sponsorshipInterest = formData.has("sponsorshipInterest") ? "Yes" : "No";
	const mediaConsent = formData.has("mediaConsent") ? "Yes" : "No";
	const submission: SubmissionView = {
		name: textValue(formData, "name"),
		email: textValue(formData, "email"),
		role: textValue(formData, "role"),
		fileName: uploadFileName,
		sponsorshipInterest,
		mediaConsent,
	};

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
			textValue(formData, "social"),
			textValue(formData, "notes"),
			uploadFileName,
			sponsorshipInterest,
			mediaConsent,
			textValue(formData, "sponsorName"),
			textValue(formData, "sponsorLevel"),
		)
		.run();

	await sendSubmissionEmail(formData, uploadFileName);

	return new Response(renderHtml(submission), {
		headers: {
			"content-type": "text/html;charset=UTF-8",
		},
	});
}

export default {
	async fetch(request, env) {
		if (request.method === "POST") {
			return handleSubmission(request, env);
		}

		return new Response(renderHtml(), {
			headers: {
				"content-type": "text/html;charset=UTF-8",
			},
		});
	},
} satisfies ExportedHandler<Env>;
