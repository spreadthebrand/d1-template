import { renderHtml } from "./renderHtml";

type Role = "artist" | "label_manager" | "admin" | "super_admin";
type ApiResponse = Record<string, unknown> | unknown[];

const json = (body: ApiResponse, init: ResponseInit = {}) =>
	new Response(JSON.stringify(body), {
		...init,
		headers: { "content-type": "application/json", "cache-control": "no-store", ...(init.headers || {}) },
	});

const BAD_EXTENSIONS = /\.(exe|js|mjs|sh|bat|cmd|php|html?)$/i;
const AUDIO_TYPES = ["audio/wav", "audio/x-wav", "audio/wave"];
const ART_TYPES = ["image/jpeg", "image/png"];
const EPK_TYPES = ["application/pdf", "application/zip", "image/jpeg", "image/png"];

interface EnvWithSecrets extends Env {
	STRIPE_SECRET_KEY?: string;
	STRIPE_PRICE_APPLICATION_FEE?: string;
	STRIPE_PRICE_SETUP_FEE?: string;
	STRIPE_PRICE_MONTHLY_PLAN?: string;
	STRIPE_PRICE_ADD_ON?: string;
	STRIPE_SUCCESS_URL?: string;
	STRIPE_CANCEL_URL?: string;
	RESEND_API_KEY?: string;
	RESEND_FROM_EMAIL?: string;
}

async function sha256(value: string) {
	const bytes = new TextEncoder().encode(value);
	const hash = await crypto.subtle.digest("SHA-256", bytes);
	return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function cookie(request: Request, name: string) {
	return request.headers.get("cookie")?.split(";").map((v) => v.trim()).find((v) => v.startsWith(`${name}=`))?.split("=")[1];
}

async function currentUser(request: Request, env: EnvWithSecrets) {
	const token = cookie(request, "sv_session");
	if (!token) return null;
	const tokenHash = await sha256(token);
	const row = await env.DB.prepare(
		`SELECT s.user_id, u.email, u.role, u.full_name, u.artist_profile_id
		 FROM sessions s JOIN users u ON u.id = s.user_id
		 WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND u.status = 'active'`,
	)
		.bind(tokenHash)
		.first<{ user_id: string; email: string; role: Role; full_name: string; artist_profile_id: string | null }>();
	return row;
}

function requireFields(data: Record<string, unknown>, fields: string[]) {
	const missing = fields.filter((f) => !String(data[f] ?? "").trim());
	if (missing.length) throw new Error(`Missing required fields: ${missing.join(", ")}`);
}

function requireRole(user: Awaited<ReturnType<typeof currentUser>>, roles: Role[]) {
	if (!user || !roles.includes(user.role)) throw new Response("Unauthorized", { status: 401 });
}

function safeFile(file: { name?: string; type?: string; size?: number }, allowedTypes: string[], maxMb: number) {
	if (!file?.name || BAD_EXTENSIONS.test(file.name)) return false;
	if (!allowedTypes.includes(file.type || "")) return false;
	return Number(file.size || 0) <= maxMb * 1024 * 1024;
}

async function audit(env: EnvWithSecrets, actorId: string | null, action: string, entityType: string, entityId: string, details: unknown) {
	await env.DB.prepare(
		"INSERT INTO audit_logs (id, actor_user_id, action, entity_type, entity_id, details_json, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
	)
		.bind(crypto.randomUUID(), actorId, action, entityType, entityId, JSON.stringify(details ?? {}))
		.run();
}

async function sendEmail(env: EnvWithSecrets, to: string, subject: string, html: string) {
	if (!env.RESEND_API_KEY) return { queued: false, reason: "RESEND_API_KEY not configured" };
	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
		body: JSON.stringify({ from: env.RESEND_FROM_EMAIL || "1SV Distribution <noreply@1soundvibe.com>", to, subject, html }),
	});
	return { queued: res.ok, status: res.status };
}

async function api(request: Request, env: EnvWithSecrets, path: string) {
	const url = new URL(request.url);
	const user = await currentUser(request, env);
	try {
		if (path === "/api/me") return json({ user });

		if (path === "/api/register" && request.method === "POST") {
			const data = (await request.json()) as Record<string, string>;
			requireFields(data, ["email", "password", "full_name"]);
			const id = crypto.randomUUID();
			const salt = crypto.randomUUID();
			await env.DB.prepare("INSERT INTO users (id, email, password_hash, password_salt, full_name, role, status, created_at) VALUES (?, ?, ?, ?, ?, 'artist', 'active', datetime('now'))")
				.bind(id, data.email.toLowerCase(), await sha256(`${salt}:${data.password}`), salt, data.full_name)
				.run();
			await audit(env, id, "user.registered", "user", id, { email: data.email });
			return json({ ok: true, id }, { status: 201 });
		}

		if (path === "/api/login" && request.method === "POST") {
			const data = (await request.json()) as Record<string, string>;
			requireFields(data, ["email", "password"]);
			const found = await env.DB.prepare("SELECT id, password_hash, password_salt, role, full_name FROM users WHERE email = ? AND status = 'active'")
				.bind(data.email.toLowerCase())
				.first<{ id: string; password_hash: string; password_salt: string; role: Role; full_name: string }>();
			if (!found || found.password_hash !== (await sha256(`${found.password_salt}:${data.password}`))) return json({ error: "Invalid credentials" }, { status: 401 });
			const token = crypto.randomUUID() + crypto.randomUUID();
			await env.DB.prepare("INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, datetime('now', '+14 days'), datetime('now'))")
				.bind(crypto.randomUUID(), found.id, await sha256(token))
				.run();
			await audit(env, found.id, "user.login", "user", found.id, {});
			return json({ ok: true, role: found.role }, { headers: { "set-cookie": `sv_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=1209600` } });
		}

		if (path === "/api/logout" && request.method === "POST") {
			return json({ ok: true }, { headers: { "set-cookie": "sv_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0" } });
		}

		if (path === "/api/applications" && request.method === "POST") {
			const data = (await request.json()) as Record<string, unknown>;
			requireFields(data, ["first_name", "last_name", "artist_name", "legal_name", "email", "phone", "city_state", "genre"]);
			if (!data.consent) throw new Error("Consent is required");
			if (data.epk && !safeFile(data.epk as { name: string; type: string; size: number }, EPK_TYPES, 25)) throw new Error("EPK must be PDF, ZIP, JPG, or PNG under 25MB");
			const id = crypto.randomUUID();
			await env.DB.prepare(`INSERT INTO applications (id, first_name, last_name, artist_name, legal_name, email, phone, city_state, genre, spotify_link, apple_music_link, youtube_link, instagram, tiktok, website, current_distributor, monthly_listeners, monthly_streaming_revenue, number_of_releases, upcoming_release_date, signed_to_label, owns_masters, needs_publishing_help, needs_sync_help, needs_marketing_help, notes, epk_file_name, status, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', datetime('now'))`)
				.bind(id, data.first_name, data.last_name, data.artist_name, data.legal_name, String(data.email).toLowerCase(), data.phone, data.city_state, data.genre, data.spotify_link, data.apple_music_link, data.youtube_link, data.instagram, data.tiktok, data.website, data.current_distributor, data.monthly_listeners, data.monthly_streaming_revenue, data.number_of_releases, data.upcoming_release_date, data.signed_to_label ? 1 : 0, data.owns_masters ? 1 : 0, data.needs_publishing_help ? 1 : 0, data.needs_sync_help ? 1 : 0, data.needs_marketing_help ? 1 : 0, data.notes, (data.epk as { name?: string })?.name || null)
				.run();
			await audit(env, null, "application.submitted", "application", id, { artist_name: data.artist_name });
			await sendEmail(env, String(data.email), "1SV Distribution application received", `<p>Thanks for applying to 1SV Distribution. Our team will review your submission.</p>`);
			return json({ ok: true, id }, { status: 201 });
		}

		if (path === "/api/applications" && request.method === "GET") {
			requireRole(user, ["admin", "super_admin"]);
			const { results } = await env.DB.prepare("SELECT * FROM applications ORDER BY created_at DESC LIMIT 100").all();
			return json(results || []);
		}

		if (path.match(/^\/api\/applications\/[^/]+\/decision$/) && request.method === "POST") {
			requireRole(user, ["admin", "super_admin"]);
			const id = path.split("/")[3];
			const data = (await request.json()) as { status: "approved" | "rejected"; note?: string };
			await env.DB.prepare("UPDATE applications SET status = ?, admin_decision_note = ?, reviewed_by = ?, reviewed_at = datetime('now') WHERE id = ?")
				.bind(data.status, data.note || null, user!.user_id, id)
				.run();
			if (data.status === "approved") {
				const app = await env.DB.prepare("SELECT * FROM applications WHERE id = ?").bind(id).first<Record<string, string>>();
				if (app) {
					const profileId = crypto.randomUUID();
					await env.DB.prepare("INSERT OR IGNORE INTO artist_profiles (id, application_id, artist_name, legal_name, city_state, genre, onboarding_status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'approved', datetime('now'))")
						.bind(profileId, id, app.artist_name, app.legal_name, app.city_state, app.genre)
						.run();
				}
			}
			await audit(env, user!.user_id, "application.decision", "application", id, data);
			return json({ ok: true });
		}

		if (path === "/api/releases" && request.method === "GET") {
			requireRole(user, ["artist", "label_manager", "admin", "super_admin"]);
			const admin = ["admin", "super_admin"].includes(user!.role);
			const stmt = admin ? env.DB.prepare("SELECT * FROM releases ORDER BY created_at DESC LIMIT 100") : env.DB.prepare("SELECT * FROM releases WHERE owner_user_id = ? ORDER BY created_at DESC LIMIT 100").bind(user!.user_id);
			const { results } = await stmt.all();
			return json(results || []);
		}

		if (path === "/api/releases" && request.method === "POST") {
			requireRole(user, ["artist", "label_manager", "admin", "super_admin"]);
			const data = (await request.json()) as Record<string, unknown>;
			requireFields(data, ["release_type", "release_title", "primary_artist", "label_name", "copyright_owner", "phonographic_copyright_owner", "release_date", "genre", "language"]);
			if (data.audio_file && !safeFile(data.audio_file as { name: string; type: string; size: number }, AUDIO_TYPES, 250)) throw new Error("Audio must be WAV under 250MB");
			if (data.cover_art && !safeFile(data.cover_art as { name: string; type: string; size: number }, ART_TYPES, 25)) throw new Error("Cover art must be JPG or PNG under 25MB");
			const id = crypto.randomUUID();
			await env.DB.prepare(`INSERT INTO releases (id, owner_user_id, release_type, release_title, primary_artist, featured_artists, label_name, copyright_owner, phonographic_copyright_owner, release_date, presave_date, genre, subgenre, language, explicit_content, cover_art_file_name, audio_file_name, stores_json, youtube_content_id_opt_in, sync_licensing_opt_in, territory_restrictions, status, admin_notes, artist_notes, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`)
				.bind(id, user!.user_id, data.release_type, data.release_title, data.primary_artist, data.featured_artists, data.label_name, data.copyright_owner, data.phonographic_copyright_owner, data.release_date, data.presave_date, data.genre, data.subgenre, data.language, data.explicit_content ? 1 : 0, (data.cover_art as { name?: string })?.name || null, (data.audio_file as { name?: string })?.name || null, JSON.stringify(data.stores || []), data.youtube_content_id_opt_in ? 1 : 0, data.sync_licensing_opt_in ? 1 : 0, data.territory_restrictions, data.submit ? "submitted" : "draft", data.admin_notes || null, data.artist_notes || null)
				.run();
			const tracks = Array.isArray(data.tracks) ? data.tracks as Record<string, unknown>[] : [];
			for (const [index, track] of tracks.entries()) {
				await env.DB.prepare(`INSERT INTO tracks (id, release_id, sequence_number, track_title, isrc, songwriter_names, producer_names, publisher_info, pro_affiliation, split_percentages_json, lyrics, lyrics_explicit, clip_start_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`)
					.bind(crypto.randomUUID(), id, index + 1, track.track_title, track.isrc, track.songwriter_names, track.producer_names, track.publisher_info, track.pro_affiliation, JSON.stringify(track.split_percentages || []), track.lyrics, track.lyrics_explicit ? 1 : 0, track.clip_start_time)
					.run();
			}
			await audit(env, user!.user_id, "release.created", "release", id, { status: data.submit ? "submitted" : "draft" });
			return json({ ok: true, id }, { status: 201 });
		}

		if (path.match(/^\/api\/releases\/[^/]+\/status$/) && request.method === "POST") {
			requireRole(user, ["admin", "super_admin"]);
			const id = path.split("/")[3];
			const data = (await request.json()) as Record<string, string>;
			await env.DB.prepare("UPDATE releases SET status = ?, admin_notes = ?, artist_notes = ?, backend_distributor_id = ?, delivery_status = ?, delivery_notes = ?, delivery_date = ?, dsp_issue_flag = ?, content_id_status = ?, royalty_import_source = ?, updated_at = datetime('now') WHERE id = ?")
				.bind(data.status, data.admin_notes || null, data.artist_notes || null, data.backend_distributor_id || null, data.delivery_status || null, data.delivery_notes || null, data.delivery_date || null, data.dsp_issue_flag ? 1 : 0, data.content_id_status || null, data.royalty_import_source || null, id)
				.run();
			await audit(env, user!.user_id, "release.status_changed", "release", id, data);
			return json({ ok: true });
		}

		if (path.match(/^\/api\/releases\/[^/]+\/export$/) && request.method === "GET") {
			requireRole(user, ["admin", "super_admin"]);
			const id = path.split("/")[3];
			const rel = await env.DB.prepare("SELECT * FROM releases WHERE id = ?").bind(id).first<Record<string, string>>();
			const { results: tracks } = await env.DB.prepare("SELECT * FROM tracks WHERE release_id = ? ORDER BY sequence_number").bind(id).all();
			if (!rel) return json({ error: "Not found" }, { status: 404 });
			const header = ["release_title", "primary_artist", "label_name", "release_date", "genre", "track_title", "isrc", "songwriters", "producers"].join(",");
			const rows = (tracks || []).map((t: any) => [rel.release_title, rel.primary_artist, rel.label_name, rel.release_date, rel.genre, t.track_title, t.isrc || "REQUEST", t.songwriter_names || "", t.producer_names || ""].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));
			return new Response([header, ...rows].join("\n"), { headers: { "content-type": "text/csv", "content-disposition": `attachment; filename="${id}-metadata.csv"` } });
		}

		if (path === "/api/royalties" && request.method === "GET") {
			requireRole(user, ["artist", "label_manager", "admin", "super_admin"]);
			const admin = ["admin", "super_admin"].includes(user!.role);
			const stmt = admin ? env.DB.prepare("SELECT rr.* FROM royalty_rows rr ORDER BY reporting_period DESC LIMIT 200") : env.DB.prepare("SELECT rr.* FROM royalty_rows rr JOIN royalty_statements rs ON rs.id = rr.statement_id WHERE rs.artist_user_id = ? ORDER BY rr.reporting_period DESC LIMIT 200").bind(user!.user_id);
			const { results } = await stmt.all();
			return json(results || []);
		}

		if (path === "/api/royalties" && request.method === "POST") {
			requireRole(user, ["admin", "super_admin"]);
			const data = (await request.json()) as Record<string, any>;
			requireFields(data, ["artist_user_id", "reporting_period", "source"]);
			const statementId = crypto.randomUUID();
			await env.DB.prepare("INSERT INTO royalty_statements (id, artist_user_id, reporting_period, source, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))")
				.bind(statementId, data.artist_user_id, data.reporting_period, data.source, user!.user_id)
				.run();
			for (const row of data.rows || []) {
				await env.DB.prepare("INSERT INTO royalty_rows (id, statement_id, reporting_period, dsp_source, track_title, streams, gross_revenue, fees, net_payable, paid_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', datetime('now'))")
					.bind(crypto.randomUUID(), statementId, data.reporting_period, row.dsp_source || data.source, row.track_title, row.streams || 0, row.gross_revenue || 0, row.fees || 0, row.net_payable || 0)
					.run();
			}
			await audit(env, user!.user_id, "royalty_statement.uploaded", "royalty_statement", statementId, data);
			return json({ ok: true, statementId }, { status: 201 });
		}

		if (path === "/api/payouts" && request.method === "POST") {
			requireRole(user, ["artist", "label_manager"]);
			const data = (await request.json()) as Record<string, unknown>;
			const id = crypto.randomUUID();
			await env.DB.prepare("INSERT INTO payout_requests (id, artist_user_id, amount, method, status, notes, created_at) VALUES (?, ?, ?, ?, 'requested', ?, datetime('now'))")
				.bind(id, user!.user_id, data.amount || 0, data.method || "bank_transfer", data.notes || null)
				.run();
			await audit(env, user!.user_id, "payout.requested", "payout", id, data);
			return json({ ok: true, id }, { status: 201 });
		}

		if (path === "/api/checkout" && request.method === "POST") {
			requireRole(user, ["artist", "label_manager", "admin", "super_admin"]);
			const data = (await request.json()) as { purchase_type: string; description?: string };
			const priceMap: Record<string, string | undefined> = { application_fee: env.STRIPE_PRICE_APPLICATION_FEE, setup_fee: env.STRIPE_PRICE_SETUP_FEE, monthly_plan: env.STRIPE_PRICE_MONTHLY_PLAN, add_on: env.STRIPE_PRICE_ADD_ON };
			if (!env.STRIPE_SECRET_KEY || !priceMap[data.purchase_type]) return json({ error: "Stripe is not configured for this purchase type" }, { status: 503 });
			const params = new URLSearchParams({ mode: data.purchase_type === "monthly_plan" ? "subscription" : "payment", success_url: env.STRIPE_SUCCESS_URL || `${url.origin}/dashboard?paid=1`, cancel_url: env.STRIPE_CANCEL_URL || `${url.origin}/pricing`, "line_items[0][price]": priceMap[data.purchase_type]!, "line_items[0][quantity]": "1", client_reference_id: user!.user_id });
			const res = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "content-type": "application/x-www-form-urlencoded" }, body: params });
			const session = await res.json();
			return json(session as ApiResponse, { status: res.status });
		}

		if (path === "/api/admin/overview" && request.method === "GET") {
			requireRole(user, ["admin", "super_admin"]);
			const counts = await Promise.all(["applications", "artist_profiles", "releases", "payout_requests", "service_orders"].map((t) => env.DB.prepare(`SELECT COUNT(*) count FROM ${t}`).first<{ count: number }>()));
			return json({ applications: counts[0]?.count || 0, artists: counts[1]?.count || 0, releases: counts[2]?.count || 0, payout_requests: counts[3]?.count || 0, service_orders: counts[4]?.count || 0 });
		}

		return json({ error: "Not found" }, { status: 404 });
	} catch (error) {
		if (error instanceof Response) return error;
		return json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 400 });
	}
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		if (url.pathname.startsWith("/api/")) return api(request, env as EnvWithSecrets, url.pathname);
		return new Response(renderHtml(), { headers: { "content-type": "text/html; charset=utf-8", "x-frame-options": "DENY", "referrer-policy": "strict-origin-when-cross-origin", "permissions-policy": "camera=(), microphone=(), geolocation=()" } });
	},
} satisfies ExportedHandler<EnvWithSecrets>;
