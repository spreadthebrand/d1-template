import { api } from "./api";
import { ensureDatabase } from "./bootstrap";
import { artistBySlug, currentChart, recalculateChart, songBySlug } from "./db";
import { aboutPage, adminPage, adminSection, artistPage, chartPage, hero, layout, newsPage, songPage, submitPage } from "./renderHtml";
import { html, readBody, requestHashes, str } from "./security";

async function handle(request: Request, env: Env) {
	const url = new URL(request.url);
	const hashes = await requestHashes(request, "houston-indie-30");
	const ctx = { request, env, url, sessionId: hashes.sessionId, ipHash: hashes.ipHash, userAgentHash: hashes.userAgentHash };
	await ensureDatabase(env.DB);
	let response: Response;
	if (url.pathname.startsWith("/api/")) response = await api(ctx);
	else if (request.method === "POST" && url.pathname === "/submit") {
		const body = await readBody(request);
		const apiRequest = new Request(new URL("/api/submissions", url.origin), { method: "POST", headers: { "content-type": "application/json", cookie: request.headers.get("cookie") || "" }, body: JSON.stringify({
			artistName: str(body.artistName), contactEmail: str(body.contactEmail), songTitle: str(body.songTitle), genre: str(body.genre), neighborhood: str(body.neighborhood), bio: str(body.bio, 1200), audioFile: str(body.audioFile, 500), coverArt: str(body.coverArt, 500), spotify: str(body.spotify, 240), appleMusic: str(body.appleMusic, 240), youtube: str(body.youtube, 240), soundcloud: str(body.soundcloud, 240), audiomack: str(body.audiomack, 240), bandcamp: str(body.bandcamp, 240), permissionToStream: body.permissionToStream === "on", permissionToDownload: body.permissionToDownload === "on"
		}) });
		const result = await api({ ...ctx, request: apiRequest, url: new URL(apiRequest.url) });
		response = result.ok ? html(layout("Submitted", `<section class="page"><h1>Submission received</h1><p>Your song is pending admin/editorial review. Approved songs can appear on-site after rights and stream permissions are confirmed.</p><a class="btn" href="/chart">Back to chart</a></section>`), 201) : result;
	}
	else if (url.pathname === "/" ) response = html(hero(await currentChart(env.DB, 6)));
	else if (url.pathname === "/chart") response = html(chartPage(await currentChart(env.DB)));
	else if (url.pathname.startsWith("/artist/")) { const data = await artistBySlug(env.DB, url.pathname.split("/").pop() || ""); response = data ? html(artistPage(data.artist, data.songs)) : html(layout("Not found", "<h1>Artist not found</h1>"), 404); }
	else if (url.pathname.startsWith("/song/")) { const data = await songBySlug(env.DB, url.pathname.split("/").pop() || ""); response = data ? html(songPage(data)) : html(layout("Not found", "<h1>Song not found</h1>"), 404); }
	else if (url.pathname === "/submit") response = html(submitPage());
	else if (url.pathname === "/about") response = html(aboutPage());
	else if (url.pathname.startsWith("/news")) {
		const category = url.pathname === "/news/houston" ? "houston" : url.pathname === "/news/industry" ? "industry" : url.pathname === "/news/new-releases" ? "releases" : "";
		const items = (await env.DB.prepare("SELECT * FROM rss_items WHERE category = COALESCE(NULLIF(?, ''), category) ORDER BY published_at DESC LIMIT 60").bind(category).all<Record<string, unknown>>()).results;
		response = html(newsPage(items, category ? `${category[0].toUpperCase()}${category.slice(1)} News` : "Music News"));
	}
	else if (url.pathname === "/admin" || url.pathname === "/admin/login") response = html(adminPage());
	else if (url.pathname.startsWith("/admin/")) response = html(adminSection(url.pathname.split("/").pop() || "Dashboard"));
	else response = html(layout("Not found", "<h1>Page not found</h1><p>The route you requested does not exist.</p>"), 404);
	if (hashes.setCookie) response.headers.append("set-cookie", hashes.setCookie);
	return response;
}
export default {
	fetch: handle,
	async scheduled(_event, env) { await ensureDatabase(env.DB); await recalculateChart(env.DB); }
} satisfies ExportedHandler<Env>;
