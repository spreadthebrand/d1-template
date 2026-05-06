import { approveSubmission, artistBySlug, createSubmission, currentChart, recalculateChart, songBySlug } from "./db";
import type { AppContext } from "./types";
import { assertAdmin, bool, json, readBody, redirect, str, slugify } from "./security";

function adminOnly(ctx: AppContext) { return assertAdmin(ctx.request) ? null : json({ error: "Admin token required" }, 401); }

export async function api(ctx: AppContext) {
	const { request, env, url, sessionId, ipHash, userAgentHash } = ctx;
	const path = url.pathname;
	if (path === "/api/chart/current") return json(await currentChart(env.DB));
	if (path === "/api/chart/history") return json((await env.DB.prepare("SELECT * FROM chart_entries ORDER BY week_start_date DESC, rank ASC LIMIT 300").all()).results);
	if (path === "/api/artists" && request.method === "GET") return json((await env.DB.prepare("SELECT * FROM artists WHERE is_approved = 1 AND is_mainstream = 0 ORDER BY name").all()).results);
	if (path === "/api/artists" && request.method === "POST") { const denied = adminOnly(ctx); if (denied) return denied; const b = await readBody(request); const id = crypto.randomUUID(); await env.DB.prepare(`INSERT INTO artists (id,name,slug,bio,image_url,genre,city,neighborhood,social_links,streaming_links,is_approved,editorial_score,local_relevance_score) VALUES (?, ?, ?, ?, ?, ?, 'Houston', ?, ?, ?, ?, ?, ?)`).bind(id, str(b.name,120), slugify(str(b.name,120)), str(b.bio,1200), str(b.imageUrl,500) || 'https://placehold.co/640x640/111827/f97316?text=HI30', str(b.genre,80), str(b.neighborhood,80), str(b.socialLinks,1000) || '{}', str(b.streamingLinks,1000) || '{}', bool(b.isApproved) ? 1 : 0, Number(b.editorialScore || 0), Number(b.localRelevanceScore || 0)).run(); return json({ ok: true, id }, 201); }
	const artistPatch = path.match(/^\/api\/artists\/([^/]+)$/); if (artistPatch && request.method === "PATCH") { const denied = adminOnly(ctx); if (denied) return denied; const b = await readBody(request); await env.DB.prepare("UPDATE artists SET bio = COALESCE(NULLIF(?, ''), bio), image_url = COALESCE(NULLIF(?, ''), image_url), editorial_score = COALESCE(?, editorial_score), local_relevance_score = COALESCE(?, local_relevance_score), updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(str(b.bio,1200), str(b.imageUrl,500), b.editorialScore == null ? null : Number(b.editorialScore), b.localRelevanceScore == null ? null : Number(b.localRelevanceScore), artistPatch[1]).run(); return json({ ok: true }); }
	if (path === "/api/songs" && request.method === "POST") { const denied = adminOnly(ctx); if (denied) return denied; const b = await readBody(request); const id = crypto.randomUUID(); await env.DB.prepare(`INSERT INTO songs (id,artist_id,title,slug,audio_url,downloadable_file_url,cover_art_url,is_download_enabled,is_approved,approved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`).bind(id, str(b.artistId), str(b.title,140), slugify(`${str(b.artistId)}-${str(b.title,140)}`), str(b.audioUrl,500), bool(b.isDownloadEnabled) ? str(b.downloadableFileUrl,500) : null, str(b.coverArtUrl,500), bool(b.isDownloadEnabled) ? 1 : 0, bool(b.isApproved) ? 1 : 0).run(); return json({ ok: true, id }, 201); }
	if (path.startsWith("/api/artists/") && request.method === "GET") { const data = await artistBySlug(env.DB, path.split('/').pop() || ""); return data ? json(data) : json({ error: "Not found" }, 404); }
	if (path.startsWith("/api/songs/") && request.method === "GET" && !path.includes('/download')) { const data = await songBySlug(env.DB, path.split('/').pop() || ""); return data ? json(data) : json({ error: "Not found" }, 404); }
	if (path === "/api/submissions" && request.method === "POST") {
		const body = await readBody(request);
		if (!str(body.artistName) || !str(body.contactEmail).includes("@") || !str(body.songTitle) || !bool(body.permissionToStream)) return json({ error: "Artist name, valid email, song title, and stream permission are required." }, 400);
		const id = await createSubmission(env.DB, {
			artistName: str(body.artistName, 120), contactEmail: str(body.contactEmail, 180), songTitle: str(body.songTitle, 140), genre: str(body.genre, 80), neighborhood: str(body.neighborhood, 80), bio: str(body.bio, 1200),
			socialLinks: JSON.stringify({ instagram: str(body.instagram, 240), tiktok: str(body.tiktok, 240), website: str(body.website, 240) }),
			streamingLinks: JSON.stringify({ spotify: str(body.spotify, 240), appleMusic: str(body.appleMusic, 240), youtube: str(body.youtube, 240), soundcloud: str(body.soundcloud, 240), audiomack: str(body.audiomack, 240), bandcamp: str(body.bandcamp, 240) }),
			audioFile: str(body.audioFile, 500), coverArt: str(body.coverArt, 500), permissionToStream: bool(body.permissionToStream), permissionToDownload: bool(body.permissionToDownload)
		});
		return json({ ok: true, id, message: "Submission received for editorial review." }, 201);
	}
	if (path === "/api/external-click" && request.method === "POST") {
		const body = await readBody(request); const artistId = str(body.artistId); const songId = str(body.songId) || null; const platform = str(body.platform, 40); const targetUrl = str(body.url, 500);
		if (!artistId || !platform || !targetUrl.startsWith("https://")) return json({ error: "Valid artistId, platform and https URL required" }, 400);
		await env.DB.prepare("INSERT INTO external_click_logs (id,artist_id,song_id,platform,url,session_id,ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), artistId, songId, platform, targetUrl, sessionId, ipHash).run();
		if (songId) await env.DB.prepare("UPDATE songs SET external_click_count = external_click_count + 1 WHERE id = ?").bind(songId).run();
		return json({ ok: true });
	}
	const streamStart = path.match(/^\/api\/songs\/([^/]+)\/stream\/start$/);
	if (streamStart && request.method === "POST") {
		const song = await env.DB.prepare("SELECT id, artist_id FROM songs WHERE id = ? AND is_approved = 1 AND audio_url IS NOT NULL").bind(streamStart[1]).first<{id:string;artist_id:string}>();
		if (!song) return json({ error: "Audio unavailable" }, 404);
		await env.DB.prepare("INSERT INTO stream_logs (id,song_id,artist_id,session_id,ip_hash,user_agent_hash,counted) VALUES (?, ?, ?, ?, ?, ?, 0)").bind(crypto.randomUUID(), song.id, song.artist_id, sessionId, ipHash, userAgentHash).run();
		return json({ ok: true, rule: "Counts after 30 seconds or 50% listened, whichever comes first." });
	}
	const streamComplete = path.match(/^\/api\/songs\/([^/]+)\/stream\/complete$/);
	if (streamComplete && request.method === "POST") {
		const body = await readBody(request); const listened = Math.max(0, Math.floor(Number(body.listenedSeconds || 0))); const duration = Math.max(1, Math.floor(Number(body.duration || 60)));
		const song = await env.DB.prepare("SELECT id, artist_id FROM songs WHERE id = ? AND is_approved = 1").bind(streamComplete[1]).first<{id:string;artist_id:string}>();
		if (!song) return json({ error: "Song not found" }, 404);
		const threshold = Math.min(30, Math.ceil(duration * 0.5));
		const recent = await env.DB.prepare("SELECT COUNT(*) c FROM stream_logs WHERE song_id = ? AND session_id = ? AND ip_hash = ? AND counted = 1 AND created_at > datetime('now','-12 hours')").bind(song.id, sessionId, ipHash).first<{c:number}>();
		const counted = listened >= threshold && Number(recent?.c || 0) === 0;
		await env.DB.prepare("INSERT INTO stream_logs (id,song_id,artist_id,session_id,ip_hash,user_agent_hash,listened_seconds,counted) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), song.id, song.artist_id, sessionId, ipHash, userAgentHash, listened, counted ? 1 : 0).run();
		if (counted) await env.DB.batch([
			env.DB.prepare("UPDATE songs SET stream_count = stream_count + 1 WHERE id = ?").bind(song.id),
			env.DB.prepare("UPDATE songs SET unique_listener_count = (SELECT COUNT(DISTINCT session_id) FROM stream_logs WHERE song_id = ? AND counted = 1) WHERE id = ?").bind(song.id, song.id)
		]);
		return json({ ok: true, counted, threshold });
	}
	const download = path.match(/^\/api\/songs\/([^/]+)\/download$/);
	if (download && request.method === "GET") {
		const song = await env.DB.prepare("SELECT id, artist_id, downloadable_file_url FROM songs WHERE id = ? AND is_approved = 1 AND is_download_enabled = 1 AND downloadable_file_url IS NOT NULL").bind(download[1]).first<{id:string;artist_id:string;downloadable_file_url:string}>();
		if (!song) return json({ error: "Downloads are disabled or unavailable for this song." }, 403);
		await env.DB.batch([
			env.DB.prepare("INSERT INTO download_logs (id,song_id,artist_id,session_id,ip_hash,user_agent_hash) VALUES (?, ?, ?, ?, ?, ?)").bind(crypto.randomUUID(), song.id, song.artist_id, sessionId, ipHash, userAgentHash),
			env.DB.prepare("UPDATE songs SET download_count = download_count + 1 WHERE id = ?").bind(song.id)
		]);
		return redirect(song.downloadable_file_url, 302);
	}
	if (path === "/api/rss/items") return json((await env.DB.prepare("SELECT * FROM rss_items WHERE category = COALESCE(NULLIF(?, ''), category) ORDER BY published_at DESC LIMIT 60").bind(url.searchParams.get("category") || "").all()).results);
	if (path === "/api/chart/recalculate" && request.method === "POST") { const denied = adminOnly(ctx); if (denied) return denied; return json({ ok: true, entries: await recalculateChart(env.DB) }); }
	if (path.startsWith("/api/admin/")) {
		const denied = adminOnly(ctx); if (denied) return denied;
		if (path === "/api/admin/submissions" && request.method === "GET") return json((await env.DB.prepare("SELECT * FROM submissions ORDER BY created_at DESC LIMIT 100").all()).results);
		const sub = path.match(/^\/api\/admin\/submissions\/([^/]+)$/); if (sub && request.method === "PATCH") { const b = await readBody(request); return json({ ok: await approveSubmission(env.DB, sub[1], str(b.status, 20), str(b.adminNotes, 500)) }); }
		if (path === "/api/admin/chart/recalculate" && request.method === "POST") return json({ ok: true, entries: await recalculateChart(env.DB) });
		if (path === "/api/admin/chart/override" && request.method === "PATCH") { const b = await readBody(request); await env.DB.prepare("UPDATE chart_entries SET rank = ?, is_manual_override = 1 WHERE id = ?").bind(Number(b.rank), str(b.chartEntryId)).run(); return json({ ok: true }); }
		if (path === "/api/admin/analytics/streams") return json((await env.DB.prepare("SELECT * FROM stream_logs ORDER BY created_at DESC LIMIT 200").all()).results);
		if (path === "/api/admin/analytics/downloads") return json((await env.DB.prepare("SELECT * FROM download_logs ORDER BY created_at DESC LIMIT 200").all()).results);
		if (path === "/api/admin/analytics/external-clicks") return json((await env.DB.prepare("SELECT * FROM external_click_logs ORDER BY created_at DESC LIMIT 200").all()).results);
		if (path === "/api/admin/rss/sources" && request.method === "POST") { const b = await readBody(request); await env.DB.prepare("INSERT INTO rss_sources (id,name,url,category,is_active) VALUES (?, ?, ?, ?, 1)").bind(crypto.randomUUID(), str(b.name,120), str(b.url,500), str(b.category,40)).run(); return json({ ok: true }); }
		const src = path.match(/^\/api\/admin\/rss\/sources\/([^/]+)$/); if (src && request.method === "PATCH") { const b = await readBody(request); await env.DB.prepare("UPDATE rss_sources SET name = COALESCE(NULLIF(?, ''), name), url = COALESCE(NULLIF(?, ''), url), category = COALESCE(NULLIF(?, ''), category), is_active = COALESCE(?, is_active), updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(str(b.name,120), str(b.url,500), str(b.category,40), b.isActive == null ? null : (bool(b.isActive) ? 1 : 0), src[1]).run(); return json({ ok: true }); } if (src && request.method === "DELETE") { await env.DB.prepare("DELETE FROM rss_sources WHERE id = ?").bind(src[1]).run(); return json({ ok: true }); }
		if (path === "/api/admin/rss/refresh" && request.method === "POST") return json({ ok: true, message: "RSS refresh placeholder: connect public feeds through src/rss.ts parser integration." });
	}
	return json({ error: "Not found" }, 404);
}
