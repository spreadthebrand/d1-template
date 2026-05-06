const enc = new TextEncoder();
export function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data, null, 2), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}
export function html(body: string, status = 200) {
	return new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}
export function redirect(url: string, status = 302) { return new Response(null, { status, headers: { location: url } }); }
export function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || crypto.randomUUID(); }
export function sanitize(value = "") { return value.replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c] ?? c); }
export function parseJson<T>(value: string | null | undefined, fallback: T): T { try { return value ? JSON.parse(value) as T : fallback; } catch { return fallback; } }
export async function sha256(input: string) { const hash = await crypto.subtle.digest("SHA-256", enc.encode(input)); return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join(""); }
export async function requestHashes(request: Request, secret = "dev-secret") {
	const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "local";
	const ua = request.headers.get("user-agent") || "unknown";
	const cookie = request.headers.get("cookie") || "";
	const match = /hi30_session=([^;]+)/.exec(cookie);
	const sessionId = match?.[1] || crypto.randomUUID();
	return { sessionId, ipHash: await sha256(`${secret}:${ip}`), userAgentHash: await sha256(`${secret}:${ua}`), setCookie: match ? null : `hi30_session=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000` };
}
export function assertAdmin(request: Request) {
	const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || new URL(request.url).searchParams.get("token");
	return token && token === "dev-admin-token";
}
export async function readBody(request: Request) {
	const type = request.headers.get("content-type") || "";
	if (type.includes("application/json")) return await request.json() as Record<string, unknown>;
	const form = await request.formData();
	return Object.fromEntries(form.entries()) as Record<string, unknown>;
}
export function str(v: unknown, max = 500) { return String(v ?? "").trim().slice(0, max); }
export function bool(v: unknown) { return v === true || v === "true" || v === "on" || v === "1"; }

export function uploadedAsset(value: unknown, allowedTypes: string[], prefix: string) {
	if (!value || typeof value !== "object" || !("name" in value) || !("type" in value) || !("size" in value)) return "";
	const file = value as { name: string; type: string; size: number };
	if (!file.name || file.size <= 0) return "";
	if (!allowedTypes.includes(file.type)) throw new Error(`${prefix} must be one of: ${allowedTypes.join(", ")}`);
	const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(0, 120);
	return `local-upload://${prefix}/${crypto.randomUUID()}-${safeName}`;
}
export function firstNonEmpty(...values: string[]) { return values.find((value) => value.trim().length > 0) || ""; }
