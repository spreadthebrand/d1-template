import { createMockAiPackage, repurposePackage, type AiRequest } from "./aiService";
import { renderHtml } from "./renderHtml";

function jsonResponse(payload: unknown, status = 200) {
	return new Response(JSON.stringify(payload, null, 2), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
		},
	});
}

async function readJson<T>(request: Request): Promise<T> {
	return (await request.json()) as T;
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === "/api/ai/generate" && request.method === "POST") {
			const input = await readJson<AiRequest>(request);
			const hasOpenAiKey = Boolean(env.OPENAI_API_KEY);
			return jsonResponse({ mode: hasOpenAiKey ? "openai-ready-placeholder" : "mock", data: createMockAiPackage(input) });
		}

		if (url.pathname === "/api/repurpose" && request.method === "POST") {
			const input = await readJson<{ source?: string }>(request);
			return jsonResponse({ mode: "mock", data: repurposePackage(input.source ?? "") });
		}

		if (url.pathname === "/api/integrations/status") {
			return jsonResponse({
				postingEnabled: false,
				warning: "Use only with connected accounts and platform-approved permissions.",
				providers: ["Meta Instagram/Facebook Graph API", "TikTok API", "YouTube Data API", "LinkedIn API", "X API", "Pinterest API"],
			});
		}

		return new Response(renderHtml(), {
			headers: {
				"content-type": "text/html; charset=utf-8",
			},
		});
	},
} satisfies ExportedHandler<Env>;
