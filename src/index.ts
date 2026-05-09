import { renderHtml } from "./renderHtml";

type Role = "artist" | "label_manager" | "admin" | "super_admin";
type ApiResponse = Record<string, unknown> | unknown[];
type CurrentUser = { user_id: string; email: string; role: Role; full_name: string; artist_profile_id: string | null } | null;
type DbRow = Record<string, any>;

type ReleaseBundle = {
	release: DbRow;
	tracks: DbRow[];
	contributors: DbRow[];
	files: DbRow[];
	backendDistributor: string;
};

const DELIVERY_STATUSES = ["Ready for Export", "Export Generated", "Sent to Backend Distributor", "Delivered", "Live", "Issue Flagged", "Takedown Requested", "Archived"];
const BACKEND_DISTRIBUTORS = ["Vydia", "Too Lost", "Symphonic", "FUGA", "Virgin Music Group", "Manual / Other"];
const BAD_EXTENSIONS = /\.(exe|js|mjs|sh|bat|cmd|php|html?)$/i;
const AUDIO_TYPES = ["audio/wav", "audio/x-wav", "audio/wave"];
const ART_TYPES = ["image/jpeg", "image/png"];
const EPK_TYPES = ["application/pdf", "application/zip", "image/jpeg", "image/png"];

const encoder = new TextEncoder();

const json = (body: ApiResponse, init: ResponseInit = {}) =>
	new Response(JSON.stringify(body), {
		...init,
		headers: { "content-type": "application/json", "cache-control": "no-store", ...(init.headers || {}) },
	});

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
	SUPABASE_URL?: string;
	SUPABASE_SERVICE_ROLE_KEY?: string;
	SUPABASE_EXPORT_BUCKET?: string;
	SUPABASE_ASSET_BUCKET?: string;
}

async function sha256(value: string) {
	const bytes = encoder.encode(value);
	const hash = await crypto.subtle.digest("SHA-256", bytes);
	return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function cookie(request: Request, name: string) {
	return request.headers.get("cookie")?.split(";").map((v) => v.trim()).find((v) => v.startsWith(`${name}=`))?.split("=")[1];
}

async function currentUser(request: Request, env: EnvWithSecrets): Promise<CurrentUser> {
	const token = cookie(request, "sv_session");
	if (!token) return null;
	const tokenHash = await sha256(token);
	return env.DB.prepare(
		`SELECT s.user_id, u.email, u.role, u.full_name, u.artist_profile_id
		 FROM sessions s JOIN users u ON u.id = s.user_id
		 WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND u.status = 'active'`,
	)
		.bind(tokenHash)
		.first<NonNullable<CurrentUser>>();
}

function requireFields(data: Record<string, unknown>, fields: string[]) {
	const missing = fields.filter((f) => !String(data[f] ?? "").trim());
	if (missing.length) throw new Error(`Missing required fields: ${missing.join(", ")}`);
}

function requireRole(user: CurrentUser, roles: Role[]) {
	if (!user || !roles.includes(user.role)) throw new Response("Unauthorized", { status: 401 });
}

function safeFile(file: { name?: string; type?: string; size?: number }, allowedTypes: string[], maxMb: number) {
	if (!file?.name || BAD_EXTENSIONS.test(file.name)) return false;
	if (!allowedTypes.includes(file.type || "")) return false;
	return Number(file.size || 0) <= maxMb * 1024 * 1024;
}

function csvEscape(value: unknown) {
	return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function makeCsv(headers: string[], rows: unknown[][]) {
	return [headers.map(csvEscape).join(","), ...rows.map((row) => row.map(csvEscape).join(","))].join("\n");
}

function slug(value: string) {
	return (value || "release").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80) || "release";
}

function bytes(value: string | Uint8Array) {
	return typeof value === "string" ? encoder.encode(value) : value;
}

function concat(parts: Uint8Array[]) {
	const total = parts.reduce((sum, part) => sum + part.length, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const part of parts) {
		out.set(part, offset);
		offset += part.length;
	}
	return out;
}

function u16(value: number) {
	const out = new Uint8Array(2);
	new DataView(out.buffer).setUint16(0, value, true);
	return out;
}

function u32(value: number) {
	const out = new Uint8Array(4);
	new DataView(out.buffer).setUint32(0, value >>> 0, true);
	return out;
}

const crcTable = new Uint32Array(256).map((_, n) => {
	let c = n;
	for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	return c >>> 0;
});

function crc32(data: Uint8Array) {
	let c = 0xffffffff;
	for (const byte of data) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
	return (c ^ 0xffffffff) >>> 0;
}

function createZip(files: { path: string; data: string | Uint8Array }[]) {
	const locals: Uint8Array[] = [];
	const centrals: Uint8Array[] = [];
	let offset = 0;
	for (const file of files) {
		const name = bytes(file.path);
		const data = bytes(file.data);
		const crc = crc32(data);
		const local = concat([u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name, data]);
		locals.push(local);
		centrals.push(concat([u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]));
		offset += local.length;
	}
	const central = concat(centrals);
	return concat([...locals, central, u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(central.length), u32(offset), u16(0)]);
}

function escapePdf(value: string) {
	return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function createReleaseSummaryPdf(bundle: ReleaseBundle, exportedBy: CurrentUser) {
	const { release, tracks, backendDistributor } = bundle;
	const lines = [
		"1 Soundvibe Entertainment | 1SV Distribution",
		"INTERNAL RELEASE EXPORT SUMMARY",
		`Release: ${release.release_title}`,
		`Artist: ${release.primary_artist}`,
		`Release Date: ${release.release_date}`,
		`Release Type: ${release.release_type}`,
		`Label: ${release.label_name}`,
		`P-Line: ${release.phonographic_copyright_owner}`,
		`C-Line: ${release.copyright_owner}`,
		`Content ID Opt-In: ${release.youtube_content_id_opt_in ? "Yes" : "No"}`,
		`Sync Licensing Opt-In: ${release.sync_licensing_opt_in ? "Yes" : "No"}`,
		`Backend Distributor: ${backendDistributor || "Unassigned"} (INTERNAL ONLY)`,
		`Delivery Status: ${release.delivery_status || "Ready for Export"}`,
		`Admin Delivery Notes: ${release.delivery_notes || release.admin_notes || "None"}`,
		`Exported By: ${exportedBy?.full_name || "Unknown admin"}`,
		`Export Timestamp: ${new Date().toISOString()}`,
		"Tracklist:",
		...tracks.map((track) => `${track.sequence_number}. ${track.track_title} | ISRC: ${track.isrc || "REQUEST"} | Writers: ${track.songwriter_names || "MISSING"}`),
	];
	const content = ["0.06 0.04 0.02 rg 0 0 612 792 re f", "0.85 0.64 0.25 rg 36 735 540 30 re f", "1 1 1 rg", "/F1 17 Tf 48 745 Td (1SV DISTRIBUTION) Tj", "0.85 0.64 0.25 rg", "/F1 11 Tf 0 -34 Td (Release Export Package - Black/Gold Internal Summary) Tj", "1 1 1 rg", "/F1 10 Tf 0 -22 Td"].join("\n");
	let y = "";
	for (const line of lines) y += `(${escapePdf(line)}) Tj 0 -15 Td\n`;
	const stream = `BT\n${content}\n${y}ET`;
	const objects = [
		"<< /Type /Catalog /Pages 2 0 R >>",
		"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
		"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
		"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
		`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
	];
	let pdf = "%PDF-1.4\n";
	const offsets = [0];
	objects.forEach((obj, index) => {
		offsets.push(pdf.length);
		pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
	});
	const xref = pdf.length;
	pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
	for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
	pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
	return encoder.encode(pdf);
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

function artistRelease(row: DbRow) {
	return {
		id: row.id,
		release_title: row.release_title,
		primary_artist: row.primary_artist,
		release_date: row.release_date,
		status: row.status,
		artist_notes: row.artist_notes,
		live_links: row.live_links_json ? JSON.parse(row.live_links_json) : null,
	};
}

async function getReleaseBundle(env: EnvWithSecrets, releaseId: string): Promise<ReleaseBundle | null> {
	const release = await env.DB.prepare("SELECT * FROM releases WHERE id = ?").bind(releaseId).first<DbRow>();
	if (!release) return null;
	const [{ results: tracks }, { results: contributors }, { results: files }] = await Promise.all([
		env.DB.prepare("SELECT * FROM tracks WHERE release_id = ? ORDER BY sequence_number").bind(releaseId).all<DbRow>(),
		env.DB.prepare("SELECT c.* FROM contributors c JOIN tracks t ON t.id = c.track_id WHERE t.release_id = ? ORDER BY t.sequence_number, c.role, c.name").bind(releaseId).all<DbRow>(),
		env.DB.prepare("SELECT * FROM files WHERE entity_type = 'release' AND entity_id = ? ORDER BY purpose, file_name").bind(releaseId).all<DbRow>(),
	]);
	const bdRow = release.backend_distributor_id ? await env.DB.prepare("SELECT name FROM backend_distributors WHERE id = ?").bind(release.backend_distributor_id).first<{ name: string }>() : null;
	return { release, tracks: tracks || [], contributors: contributors || [], files: files || [], backendDistributor: release.backend_distributor || bdRow?.name || "" };
}

function metadataCsv(bundle: ReleaseBundle) {
	const { release, tracks } = bundle;
	const headers = ["Release title", "Release type", "Primary artist", "Featured artists", "Label name", "Copyright owner", "P-line", "C-line", "UPC", "ISRC", "Release date", "Pre-save date", "Genre", "Subgenre", "Language", "Explicit flag", "Track title", "Track number", "Writers", "Producers", "Publishers", "PRO affiliations", "Territories", "DSP restrictions", "TikTok/IG clip start time", "YouTube Content ID opt-in", "Sync licensing opt-in"];
	return makeCsv(headers, tracks.map((track) => [release.release_title, release.release_type, release.primary_artist, release.featured_artists, release.label_name, release.copyright_owner, release.phonographic_copyright_owner, release.copyright_owner, release.upc || track.upc || "REQUEST", track.isrc || "REQUEST", release.release_date, release.presave_date, release.genre, release.subgenre, release.language, release.explicit_content ? "Yes" : "No", track.track_title, track.sequence_number, track.songwriter_names, track.producer_names, track.publisher_info, track.pro_affiliation, release.territory_restrictions || "Worldwide", release.dsp_restrictions || "None", track.clip_start_time, release.youtube_content_id_opt_in ? "Yes" : "No", release.sync_licensing_opt_in ? "Yes" : "No"]));
}

function splitSheetCsv(bundle: ReleaseBundle) {
	const headers = ["Track title", "Contributor name", "Role", "Ownership percentage", "Publishing percentage", "PRO", "IPI/CAE", "Email", "Phone", "Payment notes"];
	const trackById = Object.fromEntries(bundle.tracks.map((t) => [t.id, t]));
	const contributorRows = bundle.contributors.map((c) => [trackById[c.track_id]?.track_title || "", c.name, c.role, c.split_percentage || c.ownership_percentage || "", c.publishing_percentage || "", c.pro || c.pro_affiliation || "", c.ipi_cae || "", c.email || "", c.phone || "", c.payment_notes || ""]);
	if (contributorRows.length) return makeCsv(headers, contributorRows);
	return makeCsv(headers, bundle.tracks.map((track) => [track.track_title, track.songwriter_names || "MISSING", "Songwriter", "", "", track.pro_affiliation || "", "", "", "", "Generated from track-level songwriter credits"]));
}

function contributorCreditsCsv(bundle: ReleaseBundle) {
	const headers = ["Artist", "Featured artist", "Producer", "Engineer", "Mixer", "Mastering engineer", "Songwriter", "Publisher", "Label", "Executive producer"];
	return makeCsv(headers, bundle.tracks.map((track) => [bundle.release.primary_artist, bundle.release.featured_artists || "", track.producer_names || "", "", "", "", track.songwriter_names || "", track.publisher_info || "", bundle.release.label_name, bundle.release.executive_producer || ""]));
}

function deliveryNotes(bundle: ReleaseBundle, exportedBy: CurrentUser) {
	const r = bundle.release;
	return `Release: ${r.release_title}\nArtist: ${r.primary_artist}\nUPC: ${r.upc || "REQUEST"}\nISRCs: ${bundle.tracks.map((t) => t.isrc || "REQUEST").join(", ")}\nBackend Distributor: ${bundle.backendDistributor || "Unassigned"}\nContent ID: ${r.youtube_content_id_opt_in ? "Opted in" : "Not opted in"}\nSync: ${r.sync_licensing_opt_in ? "Opted in" : "Not opted in"}\nTerritories: ${r.territory_restrictions || "Worldwide"}\nAdmin Notes: ${r.delivery_notes || r.admin_notes || "None"}\nFiles Prepared: metadata.csv, release_summary.pdf, audio, artwork, lyrics if available, split_sheet.csv, contributor_credits.csv\nExport Date: ${new Date().toISOString()}\nExported By: ${exportedBy?.full_name || "Unknown admin"}\n`;
}

function validateExport(bundle: ReleaseBundle) {
	const errors: string[] = [];
	const warnings: string[] = [];
	const r = bundle.release;
	const firstTrack = bundle.tracks[0];
	const coverName = String(r.cover_art_file_name || "");
	if (!r.audio_file_name && !bundle.files.some((f) => f.purpose === "audio")) errors.push("WAV file exists");
	if (!coverName && !bundle.files.some((f) => f.purpose === "artwork")) errors.push("Cover art exists");
	if (coverName && !/\.(jpe?g|png)$/i.test(coverName)) errors.push("Cover art is JPG/PNG");
	if (r.cover_width && r.cover_height && (Number(r.cover_width) !== 3000 || Number(r.cover_height) !== 3000)) warnings.push("Cover art is not 3000x3000");
	if (!r.cover_width || !r.cover_height) warnings.push("Cover art dimensions were not provided; confirm 3000x3000 before backend delivery");
	if (!r.release_date) errors.push("Release date exists");
	if (!r.primary_artist) errors.push("Artist name exists");
	if (!firstTrack?.track_title) errors.push("Track title exists");
	if (!firstTrack?.songwriter_names && !bundle.contributors.some((c) => String(c.role).toLowerCase().includes("writer"))) errors.push("Writer credits exist");
	if (!r.phonographic_copyright_owner) errors.push("P-line exists");
	if (!r.copyright_owner) errors.push("C-line exists");
	if (r.explicit_choice_selected === 0) errors.push("Explicit flag selected");
	if (r.content_id_choice_selected === 0) errors.push("Content ID choice selected");
	if (r.sync_choice_selected === 0) errors.push("Sync opt-in choice selected");
	return { ok: errors.length === 0, errors, warnings, checklist: ["WAV file exists", "Cover art exists", "Cover art is JPG/PNG", "Cover art is 3000x3000", "Release date exists", "Artist name exists", "Track title exists", "Writer credits exist", "P-line and C-line exist", "Explicit flag selected", "Content ID choice selected", "Sync opt-in choice selected"] };
}

async function storageFetch(env: EnvWithSecrets, path: string) {
	if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.SUPABASE_ASSET_BUCKET || !path) return null;
	const res = await fetch(`${env.SUPABASE_URL}/storage/v1/object/${env.SUPABASE_ASSET_BUCKET}/${path}`, { headers: { authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` } });
	return res.ok ? new Uint8Array(await res.arrayBuffer()) : null;
}

async function storageUpload(env: EnvWithSecrets, path: string, body: Uint8Array, type: string) {
	if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.SUPABASE_EXPORT_BUCKET) return null;
	const res = await fetch(`${env.SUPABASE_URL}/storage/v1/object/${env.SUPABASE_EXPORT_BUCKET}/${path}`, { method: "POST", headers: { authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "content-type": type, "x-upsert": "true" }, body });
	if (!res.ok) throw new Error(`Supabase export upload failed (${res.status})`);
	return `${env.SUPABASE_EXPORT_BUCKET}/${path}`;
}

async function buildExportFiles(env: EnvWithSecrets, bundle: ReleaseBundle, exportedBy: CurrentUser, type: string) {
	const r = bundle.release;
	const root = "1SV_RELEASE_EXPORT";
	const files: { path: string; data: string | Uint8Array }[] = [];
	const addText = (path: string, data: string) => files.push({ path: `${root}/${path}`, data });
	addText("metadata/metadata.csv", metadataCsv(bundle));
	if (type === "metadata_csv") return { content: encoder.encode(metadataCsv(bundle)), contentType: "text/csv", filename: `${slug(r.release_title)}-metadata.csv`, files };
	addText("metadata/split_sheet.csv", splitSheetCsv(bundle));
	addText("metadata/contributor_credits.csv", contributorCreditsCsv(bundle));
	addText("admin/delivery_notes.txt", deliveryNotes(bundle, exportedBy));
	addText("admin/backend_distributor.txt", `${bundle.backendDistributor || "Unassigned"}\nINTERNAL ONLY - do not disclose to artist accounts unless platform visibility is explicitly enabled.`);
	addText("admin/content_id_opt_in.txt", r.youtube_content_id_opt_in ? "YES - Artist opted into YouTube Content ID review." : "NO - Artist did not opt into YouTube Content ID.");
	addText("admin/sync_opt_in.txt", r.sync_licensing_opt_in ? "YES - Artist opted into sync licensing review." : "NO - Artist did not opt into sync licensing review.");
	files.push({ path: `${root}/release_summary.pdf`, data: createReleaseSummaryPdf(bundle, exportedBy) });
	for (const track of bundle.tracks) {
		if (track.lyrics) addText(`lyrics/track_${String(track.sequence_number).padStart(2, "0")}_lyrics.txt`, track.lyrics);
	}
	const audioFiles = bundle.files.filter((f) => f.purpose === "audio");
	if (audioFiles.length) {
		for (const [index, file] of audioFiles.entries()) files.push({ path: `${root}/audio/track_${String(index + 1).padStart(2, "0")}_${slug(file.file_name)}.wav`, data: (await storageFetch(env, file.storage_path)) || `Secure storage pointer: ${file.storage_path || file.file_name}\n` });
	} else files.push({ path: `${root}/audio/track_01_${slug(bundle.tracks[0]?.track_title || r.release_title)}.wav`, data: `Secure audio asset pointer: ${r.audio_file_name || "missing"}\nUpload binary masters to the configured Supabase asset bucket before final backend handoff.\n` });
	const artworkFiles = bundle.files.filter((f) => f.purpose === "artwork");
	if (artworkFiles.length) {
		for (const file of artworkFiles) files.push({ path: `${root}/artwork/cover_art_3000x3000.${String(file.file_name).toLowerCase().endsWith(".png") ? "png" : "jpg"}`, data: (await storageFetch(env, file.storage_path)) || `Secure storage pointer: ${file.storage_path || file.file_name}\n` });
	} else files.push({ path: `${root}/artwork/cover_art_3000x3000.${r.cover_art_file_name && String(r.cover_art_file_name).toLowerCase().endsWith(".png") ? "png" : "jpg"}`, data: `Secure artwork asset pointer: ${r.cover_art_file_name || "missing"}\nUpload binary artwork to the configured Supabase asset bucket before final backend handoff.\n` });
	if (type === "audio_zip") return { content: createZip(files.filter((f) => f.path.includes("/audio/") || f.path.includes("delivery_notes"))), contentType: "application/zip", filename: `${slug(r.release_title)}-audio.zip`, files };
	if (type === "artwork_zip") return { content: createZip(files.filter((f) => f.path.includes("/artwork/") || f.path.includes("delivery_notes"))), contentType: "application/zip", filename: `${slug(r.release_title)}-artwork.zip`, files };
	return { content: createZip(files), contentType: "application/zip", filename: `${slug(r.release_title)}-1sv-release-export.zip`, files };
}

async function logExport(env: EnvWithSecrets, releaseId: string, user: CurrentUser, exportType: string, backendDistributor: string, exportFileUrl: string | null, notes: string | undefined) {
	const id = crypto.randomUUID();
	await env.DB.prepare("INSERT INTO export_logs (id, release_id, exported_by, export_type, backend_distributor, export_file_url, created_at, notes) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?)")
		.bind(id, releaseId, user!.user_id, exportType, backendDistributor || null, exportFileUrl, notes || null)
		.run();
	await audit(env, user!.user_id, "release.export_generated", "release", releaseId, { exportType, backendDistributor, exportFileUrl });
	return id;
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

		if (path === "/api/logout" && request.method === "POST") return json({ ok: true }, { headers: { "set-cookie": "sv_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0" } });

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
				const app = await env.DB.prepare("SELECT * FROM applications WHERE id = ?").bind(id).first<DbRow>();
				if (app) await env.DB.prepare("INSERT OR IGNORE INTO artist_profiles (id, application_id, artist_name, legal_name, city_state, genre, onboarding_status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'approved', datetime('now'))").bind(crypto.randomUUID(), id, app.artist_name, app.legal_name, app.city_state, app.genre).run();
			}
			await audit(env, user!.user_id, "application.decision", "application", id, data);
			return json({ ok: true });
		}

		if (path === "/api/releases" && request.method === "GET") {
			requireRole(user, ["artist", "label_manager", "admin", "super_admin"]);
			const admin = ["admin", "super_admin"].includes(user!.role);
			const stmt = admin ? env.DB.prepare("SELECT * FROM releases ORDER BY created_at DESC LIMIT 100") : env.DB.prepare("SELECT * FROM releases WHERE owner_user_id = ? ORDER BY created_at DESC LIMIT 100").bind(user!.user_id);
			const { results } = await stmt.all<DbRow>();
			return json(admin ? results || [] : (results || []).map(artistRelease));
		}

		if (path === "/api/releases" && request.method === "POST") {
			requireRole(user, ["artist", "label_manager", "admin", "super_admin"]);
			const data = (await request.json()) as Record<string, unknown>;
			requireFields(data, ["release_type", "release_title", "primary_artist", "label_name", "copyright_owner", "phonographic_copyright_owner", "release_date", "genre", "language"]);
			if (data.audio_file && !safeFile(data.audio_file as { name: string; type: string; size: number }, AUDIO_TYPES, 250)) throw new Error("Audio must be WAV under 250MB");
			if (data.cover_art && !safeFile(data.cover_art as { name: string; type: string; size: number }, ART_TYPES, 25)) throw new Error("Cover art must be JPG or PNG under 25MB");
			const id = crypto.randomUUID();
			await env.DB.prepare(`INSERT INTO releases (id, owner_user_id, release_type, release_title, primary_artist, featured_artists, label_name, copyright_owner, phonographic_copyright_owner, release_date, presave_date, genre, subgenre, language, explicit_content, cover_art_file_name, audio_file_name, stores_json, youtube_content_id_opt_in, sync_licensing_opt_in, territory_restrictions, status, artist_notes, explicit_choice_selected, content_id_choice_selected, sync_choice_selected, created_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 1, datetime('now'))`)
				.bind(id, user!.user_id, data.release_type, data.release_title, data.primary_artist, data.featured_artists, data.label_name, data.copyright_owner, data.phonographic_copyright_owner, data.release_date, data.presave_date, data.genre, data.subgenre, data.language, data.explicit_content ? 1 : 0, (data.cover_art as { name?: string })?.name || null, (data.audio_file as { name?: string })?.name || null, JSON.stringify(data.stores || []), data.youtube_content_id_opt_in ? 1 : 0, data.sync_licensing_opt_in ? 1 : 0, data.territory_restrictions, data.submit ? "submitted" : "draft", data.artist_notes || null)
				.run();
			for (const [index, track] of (Array.isArray(data.tracks) ? data.tracks as DbRow[] : []).entries()) {
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
			const data = (await request.json()) as DbRow;
			if (data.backend_distributor && !BACKEND_DISTRIBUTORS.includes(data.backend_distributor)) throw new Error("Unsupported backend distributor");
			if (data.delivery_status && !DELIVERY_STATUSES.includes(data.delivery_status)) throw new Error("Unsupported delivery status");
			await env.DB.prepare("UPDATE releases SET status = COALESCE(?, status), admin_notes = ?, artist_notes = ?, backend_distributor = ?, backend_account = ?, delivery_status = ?, delivery_notes = ?, delivery_date = ?, delivered_by = ?, dsp_issue_flag = ?, dsp_issue_notes = ?, content_id_status = ?, royalty_import_source = ?, live_links_json = ?, updated_at = datetime('now') WHERE id = ?")
				.bind(data.status || null, data.admin_notes || null, data.artist_notes || null, data.backend_distributor || null, data.backend_account || null, data.delivery_status || null, data.delivery_notes || null, data.delivery_date || null, data.delivery_status === "Delivered" ? user!.user_id : data.delivered_by || null, data.dsp_issue_flag ? 1 : 0, data.dsp_issue_notes || null, data.content_id_status || null, data.royalty_import_source || null, data.live_links ? JSON.stringify(data.live_links) : data.live_links_json || null, id)
				.run();
			await audit(env, user!.user_id, "release.delivery_status_updated", "release", id, data);
			return json({ ok: true });
		}

		const exportMatch = path.match(/^\/api\/releases\/([^/]+)\/export(?:\/([^/]+))?$/);
		if (exportMatch && request.method === "GET") {
			requireRole(user, ["admin", "super_admin"]);
			const bundle = await getReleaseBundle(env, exportMatch[1]);
			if (!bundle) return json({ error: "Not found" }, { status: 404 });
			if (exportMatch[2] === "validate") return json(validateExport(bundle));
			if (exportMatch[2] === "history") {
				const { results } = await env.DB.prepare("SELECT el.*, u.full_name exported_by_name FROM export_logs el LEFT JOIN users u ON u.id = el.exported_by WHERE release_id = ? ORDER BY created_at DESC").bind(exportMatch[1]).all();
				return json(results || []);
			}
			if (exportMatch[2] === "vydia-notes") return json({ notes: deliveryNotes({ ...bundle, backendDistributor: "Vydia" }, user), checklist: ["Confirm metadata", "Confirm audio WAV", "Confirm artwork", "Confirm ownership rights", "Confirm no uncleared samples", "Confirm explicit lyrics flag", "Confirm Content ID eligibility", "Confirm territory restrictions", "Confirm artist profile links", "Confirm release date window"] });
			const type = exportMatch[2] || "metadata_csv";
			const validation = validateExport(bundle);
			if (!validation.ok && !(user!.role === "super_admin" && url.searchParams.get("override") === "1")) return json({ error: "Export validation failed", validation }, { status: 422 });
			const generated = await buildExportFiles(env, bundle, user, type);
			const storagePath = await storageUpload(env, `releases/${exportMatch[1]}/${Date.now()}-${generated.filename}`, generated.content, generated.contentType);
			await logExport(env, exportMatch[1], user, type, bundle.backendDistributor, storagePath, validation.warnings.join("; "));
			await env.DB.prepare("UPDATE releases SET delivery_status = 'Export Generated', updated_at = datetime('now') WHERE id = ?").bind(exportMatch[1]).run();
			return new Response(generated.content, { headers: { "content-type": generated.contentType, "content-disposition": `attachment; filename="${generated.filename}"`, "x-1sv-export-storage-path": storagePath || "not-configured" } });
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
			const data = (await request.json()) as DbRow;
			requireFields(data, ["artist_user_id", "reporting_period", "source"]);
			const statementId = crypto.randomUUID();
			await env.DB.prepare("INSERT INTO royalty_statements (id, artist_user_id, reporting_period, source, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))").bind(statementId, data.artist_user_id, data.reporting_period, data.source, user!.user_id).run();
			for (const row of data.rows || []) await env.DB.prepare("INSERT INTO royalty_rows (id, statement_id, reporting_period, dsp_source, track_title, streams, gross_revenue, fees, net_payable, paid_status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid', datetime('now'))").bind(crypto.randomUUID(), statementId, data.reporting_period, row.dsp_source || data.source, row.track_title, row.streams || 0, row.gross_revenue || 0, row.fees || 0, row.net_payable || 0).run();
			await audit(env, user!.user_id, "royalty_statement.uploaded", "royalty_statement", statementId, data);
			return json({ ok: true, statementId }, { status: 201 });
		}

		if (path === "/api/payouts" && request.method === "POST") {
			requireRole(user, ["artist", "label_manager"]);
			const data = (await request.json()) as DbRow;
			const id = crypto.randomUUID();
			await env.DB.prepare("INSERT INTO payout_requests (id, artist_user_id, amount, method, status, notes, created_at) VALUES (?, ?, ?, ?, 'requested', ?, datetime('now'))").bind(id, user!.user_id, data.amount || 0, data.method || "bank_transfer", data.notes || null).run();
			await audit(env, user!.user_id, "payout.requested", "payout", id, data);
			return json({ ok: true, id }, { status: 201 });
		}

		if (path === "/api/checkout" && request.method === "POST") {
			requireRole(user, ["artist", "label_manager", "admin", "super_admin"]);
			const data = (await request.json()) as { purchase_type: string };
			const priceMap: Record<string, string | undefined> = { application_fee: env.STRIPE_PRICE_APPLICATION_FEE, setup_fee: env.STRIPE_PRICE_SETUP_FEE, monthly_plan: env.STRIPE_PRICE_MONTHLY_PLAN, add_on: env.STRIPE_PRICE_ADD_ON };
			if (!env.STRIPE_SECRET_KEY || !priceMap[data.purchase_type]) return json({ error: "Stripe is not configured for this purchase type" }, { status: 503 });
			const params = new URLSearchParams({ mode: data.purchase_type === "monthly_plan" ? "subscription" : "payment", success_url: env.STRIPE_SUCCESS_URL || `${url.origin}/dashboard?paid=1`, cancel_url: env.STRIPE_CANCEL_URL || `${url.origin}/pricing`, "line_items[0][price]": priceMap[data.purchase_type]!, "line_items[0][quantity]": "1", client_reference_id: user!.user_id });
			const res = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "content-type": "application/x-www-form-urlencoded" }, body: params });
			return json(await res.json() as ApiResponse, { status: res.status });
		}

		if (path === "/api/admin/overview" && request.method === "GET") {
			requireRole(user, ["admin", "super_admin"]);
			const counts = await Promise.all(["applications", "artist_profiles", "releases", "payout_requests", "service_orders", "export_logs"].map((t) => env.DB.prepare(`SELECT COUNT(*) count FROM ${t}`).first<{ count: number }>()));
			return json({ applications: counts[0]?.count || 0, artists: counts[1]?.count || 0, releases: counts[2]?.count || 0, payout_requests: counts[3]?.count || 0, service_orders: counts[4]?.count || 0, exports: counts[5]?.count || 0 });
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
