import { renderHtml, renderManifest, renderServiceWorker } from "./renderHtml";

export default {
	async fetch(request) {
		const url = new URL(request.url);

		if (url.pathname === "/manifest.webmanifest") {
			return new Response(renderManifest(), {
				headers: { "content-type": "application/manifest+json" },
			});
		}

		if (url.pathname === "/sw.js") {
			return new Response(renderServiceWorker(), {
				headers: {
					"content-type": "application/javascript",
					"cache-control": "no-cache",
				},
			});
		}

		return new Response(renderHtml(), {
			headers: { "content-type": "text/html; charset=utf-8" },
		});
	},
} satisfies ExportedHandler<Env>;
