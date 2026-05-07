import { renderHtml, type SubmissionView } from "./renderHtml";

const textValue = (formData: FormData, key: string) => {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim() : "";
};

const fileNameFromForm = (formData: FormData) => {
	const value = formData.get("upload");
	return value instanceof File && value.name ? value.name : "";
};

async function handleSubmission(request: Request, env: Env) {
	const formData = await request.formData();
	const uploadFileName = fileNameFromForm(formData);
	const sponsorshipInterest = formData.has("sponsorshipInterest") ? "Yes" : "No";
	const submission: SubmissionView = {
		name: textValue(formData, "name"),
		email: textValue(formData, "email"),
		role: textValue(formData, "role"),
		fileName: uploadFileName,
		sponsorshipInterest,
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
			sponsor_name,
			sponsor_level
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
	)
		.bind(
			submission.name,
			submission.email,
			submission.role,
			textValue(formData, "social"),
			textValue(formData, "notes"),
			uploadFileName,
			sponsorshipInterest,
			textValue(formData, "sponsorName"),
			textValue(formData, "sponsorLevel"),
		)
		.run();

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
