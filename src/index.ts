import { renderHtml } from "./renderHtml";

type AppEnv = Env & {
	STRIPE_SECRET_KEY?: string;
	STRIPE_PRICE_ID?: string;
	STRIPE_WEBHOOK_SECRET?: string;
	STRIPE_PORTAL_RETURN_URL?: string;
};

type Collaborator = {
	id?: string;
	name?: string;
	legalName?: string;
	email?: string;
	role?: string;
	contribution?: string;
	pro?: string;
	ipi?: string;
	publisher?: string;
	publisherIpi?: string;
	masterPercent?: number;
	publishingPercent?: number;
	signed?: boolean;
};

type SheetPayload = {
	id?: string;
	title?: string;
	artist?: string;
	isrc?: string;
	creationDate?: string;
	splitType?: string;
	status?: string;
	collaborators?: Collaborator[];
};

const FREE_SHEET_LIMIT = 2;
const jsonHeaders = { "content-type": "application/json; charset=UTF-8" };

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		try {
			if (url.pathname.startsWith("/api/")) {
				return await handleApi(request, env, url);
			}

			return withUserCookie(request, renderPage(url.pathname));
		} catch (error) {
			console.error(error);
			return json({ error: "Something went wrong. Please try again." }, 500);
		}
	},
} satisfies ExportedHandler<AppEnv>;

async function handleApi(request: Request, env: AppEnv, url: URL): Promise<Response> {
	const userId = getOrCreateUserId(request);

	if (request.method === "GET" && url.pathname === "/api/bootstrap") {
		const bootstrap = await getBootstrap(env, userId);
		return withUserCookie(request, json(bootstrap), userId);
	}

	if (request.method === "POST" && url.pathname === "/api/sheets") {
		const payload = (await request.json()) as SheetPayload;
		const saved = await saveSheet(env, userId, payload);
		const status = "paywall" in saved ? 402 : "error" in saved ? 400 : 200;
		return withUserCookie(request, json(saved, status), userId);
	}

	if (request.method === "DELETE" && url.pathname.startsWith("/api/sheets/")) {
		const id = decodeURIComponent(url.pathname.replace("/api/sheets/", ""));
		await env.DB.prepare("DELETE FROM sheets WHERE id = ? AND user_id = ?").bind(id, userId).run();
		return withUserCookie(request, json(await getBootstrap(env, userId)), userId);
	}

	if (request.method === "POST" && url.pathname === "/api/billing/checkout") {
		const body = (await request.json().catch(() => ({}))) as { email?: string };
		return withUserCookie(request, json(await createCheckoutSession(env, request, userId, body.email)), userId);
	}

	if (request.method === "POST" && url.pathname === "/api/billing/portal") {
		return withUserCookie(request, json(await createBillingPortalSession(env, request, userId)), userId);
	}

	if (request.method === "POST" && url.pathname === "/api/stripe/webhook") {
		return handleStripeWebhook(request, env);
	}

	return json({ error: "Not found" }, 404);
}

function renderPage(pathname: string): Response {
	return new Response(renderHtml({ showAccount: pathname === "/account" }), {
		headers: { "content-type": "text/html; charset=UTF-8" },
	});
}

async function getBootstrap(env: AppEnv, userId: string) {
	const subscription = await getSubscription(env, userId);
	const rows = await env.DB.prepare(
		"SELECT * FROM sheets WHERE user_id = ? ORDER BY updated_at DESC",
	)
		.bind(userId)
		.all<Record<string, unknown>>();
	const sheets = (rows.results ?? []).map(mapSheetRow);
	const isPro = isSubscriptionActive(subscription.status);

	return {
		userId,
		freeLimit: FREE_SHEET_LIMIT,
		freeRemaining: isPro ? null : Math.max(FREE_SHEET_LIMIT - sheets.length, 0),
		isPro,
		subscription,
		sheets,
	};
}

async function saveSheet(env: AppEnv, userId: string, payload: SheetPayload) {
	const collaborators = normalizeCollaborators(payload.collaborators ?? []);
	const creditedCollaborators = collaborators.filter((person) => person.name || person.legalName || person.email);
	if (!creditedCollaborators.length) {
		return {
			error: true,
			message: "Add at least one collaborator with an IPI / CAE number before saving.",
			...(await getBootstrap(env, userId)),
		};
	}
	const missingIpi = creditedCollaborators.find((person) => !person.ipi);
	if (missingIpi) {
		return {
			error: true,
			message: `IPI / CAE number is required before saving. Add it for ${missingIpi.name || missingIpi.legalName || missingIpi.email}.`,
			...(await getBootstrap(env, userId)),
		};
	}
	const masterTotal = roundTotal(collaborators.reduce((sum, person) => sum + (person.masterPercent ?? 0), 0));
	const publishingTotal = roundTotal(collaborators.reduce((sum, person) => sum + (person.publishingPercent ?? 0), 0));
	const subscription = await getSubscription(env, userId);
	const isPro = isSubscriptionActive(subscription.status);
	const id = payload.id?.trim() || crypto.randomUUID();
	const existing = await env.DB.prepare("SELECT id FROM sheets WHERE id = ? AND user_id = ?")
		.bind(id, userId)
		.first<{ id: string }>();

	if (!existing && !isPro) {
		const countRow = await env.DB.prepare("SELECT COUNT(*) as count FROM sheets WHERE user_id = ?")
			.bind(userId)
			.first<{ count: number }>();
		if ((countRow?.count ?? 0) >= FREE_SHEET_LIMIT) {
			return {
				paywall: true,
				message: "You have used your 2 free split sheets. Upgrade to Pro to create unlimited sheets.",
				...(await getBootstrap(env, userId)),
			};
		}
	}

	const title = sanitizeText(payload.title, "Untitled Split Sheet");
	const artist = sanitizeText(payload.artist);
	const isrc = sanitizeText(payload.isrc).toUpperCase();
	const creationDate = sanitizeText(payload.creationDate);
	const splitType = ["master", "publishing", "both"].includes(payload.splitType ?? "") ? payload.splitType! : "both";
	const status = ["draft", "ready", "signed"].includes(payload.status ?? "") ? payload.status! : "draft";
	const now = new Date().toISOString();

	await env.DB.prepare(
		`INSERT INTO sheets (id, user_id, title, artist, isrc, creation_date, split_type, status, collaborators_json, master_total, publishing_total, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		 ON CONFLICT(id) DO UPDATE SET
		 title = excluded.title,
		 artist = excluded.artist,
		 isrc = excluded.isrc,
		 creation_date = excluded.creation_date,
		 split_type = excluded.split_type,
		 status = excluded.status,
		 collaborators_json = excluded.collaborators_json,
		 master_total = excluded.master_total,
		 publishing_total = excluded.publishing_total,
		 updated_at = excluded.updated_at
		 WHERE user_id = excluded.user_id`,
	)
		.bind(
			id,
			userId,
			title,
			artist,
			isrc,
			creationDate,
			splitType,
			status,
			JSON.stringify(collaborators),
			masterTotal,
			publishingTotal,
			now,
			now,
		)
		.run();

	return { saved: true, activeSheetId: id, ...(await getBootstrap(env, userId)) };
}

function normalizeCollaborators(collaborators: Collaborator[]): Required<Collaborator>[] {
	const source = collaborators.length ? collaborators : [{ name: "", role: "", masterPercent: 0, publishingPercent: 0 }];
	return source.slice(0, 40).map((person) => ({
		id: person.id || crypto.randomUUID(),
		name: sanitizeText(person.name),
		legalName: sanitizeText(person.legalName),
		email: sanitizeText(person.email).toLowerCase(),
		role: sanitizeText(person.role),
		contribution: sanitizeText(person.contribution),
		pro: sanitizeText(person.pro),
		ipi: sanitizeText(person.ipi),
		publisher: sanitizeText(person.publisher),
		publisherIpi: sanitizeText(person.publisherIpi),
		masterPercent: clampPercent(person.masterPercent),
		publishingPercent: clampPercent(person.publishingPercent),
		signed: Boolean(person.signed),
	}));
}

async function getSubscription(env: AppEnv, userId: string) {
	const row = await env.DB.prepare("SELECT * FROM subscriptions WHERE user_id = ?")
		.bind(userId)
		.first<Record<string, string | null>>();
	return {
		status: row?.status ?? "free",
		stripeCustomerId: row?.stripe_customer_id ?? null,
		stripeSubscriptionId: row?.stripe_subscription_id ?? null,
		currentPeriodEnd: row?.current_period_end ?? null,
	};
}

async function createCheckoutSession(env: AppEnv, request: Request, userId: string, email?: string) {
	if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID) {
		return {
			configurationRequired: true,
			message: "Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID Worker secrets to enable live checkout.",
		};
	}

	const origin = new URL(request.url).origin;
	const params = new URLSearchParams({
		mode: "subscription",
		"line_items[0][price]": env.STRIPE_PRICE_ID,
		"line_items[0][quantity]": "1",
		success_url: `${origin}/account?checkout=success`,
		cancel_url: `${origin}/?checkout=cancelled`,
		client_reference_id: userId,
		"metadata[userId]": userId,
	});
	if (email) params.set("customer_email", email);

	const session = await stripeRequest<{ id: string; url: string }>(env, "/v1/checkout/sessions", params);
	return { checkoutUrl: session.url, sessionId: session.id };
}

async function createBillingPortalSession(env: AppEnv, request: Request, userId: string) {
	if (!env.STRIPE_SECRET_KEY) {
		return { configurationRequired: true, message: "Add STRIPE_SECRET_KEY to enable subscription management." };
	}
	const subscription = await getSubscription(env, userId);
	if (!subscription.stripeCustomerId) {
		return { needsCheckout: true, message: "No Stripe customer is connected yet. Upgrade to Pro first." };
	}

	const origin = new URL(request.url).origin;
	const params = new URLSearchParams({
		customer: subscription.stripeCustomerId,
		return_url: env.STRIPE_PORTAL_RETURN_URL || `${origin}/account`,
	});
	const session = await stripeRequest<{ url: string }>(env, "/v1/billing_portal/sessions", params);
	return { portalUrl: session.url };
}

async function handleStripeWebhook(request: Request, env: AppEnv) {
	if (!env.STRIPE_WEBHOOK_SECRET) {
		return json({ error: "Webhook secret is not configured." }, 400);
	}
	const signature = request.headers.get("stripe-signature") ?? "";
	const payload = await request.text();
	const valid = await verifyStripeSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET);
	if (!valid) return json({ error: "Invalid Stripe signature." }, 400);

	const event = JSON.parse(payload) as {
		type: string;
		data: { object: Record<string, unknown> };
	};
	const object = event.data.object;
	const userId = String((object.metadata as Record<string, string> | undefined)?.userId || object.client_reference_id || "");

	if (event.type === "checkout.session.completed" && userId) {
		await upsertSubscription(env, userId, {
			stripeCustomerId: String(object.customer || ""),
			stripeSubscriptionId: String(object.subscription || ""),
			status: "active",
		});
	}

	if (event.type.startsWith("customer.subscription.")) {
		const subscriptionId = String(object.id || "");
		const status = String(object.status || "free");
		const periodEnd = object.current_period_end ? new Date(Number(object.current_period_end) * 1000).toISOString() : null;
		await env.DB.prepare(
			"UPDATE subscriptions SET status = ?, current_period_end = ?, updated_at = ? WHERE stripe_subscription_id = ?",
		)
			.bind(status, periodEnd, new Date().toISOString(), subscriptionId)
			.run();
	}

	return json({ received: true });
}

async function upsertSubscription(
	env: AppEnv,
	userId: string,
	data: { stripeCustomerId?: string; stripeSubscriptionId?: string; status: string; currentPeriodEnd?: string | null },
) {
	const now = new Date().toISOString();
	await env.DB.prepare(
		`INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status, current_period_end, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?)
		 ON CONFLICT(user_id) DO UPDATE SET
		 stripe_customer_id = COALESCE(excluded.stripe_customer_id, stripe_customer_id),
		 stripe_subscription_id = COALESCE(excluded.stripe_subscription_id, stripe_subscription_id),
		 status = excluded.status,
		 current_period_end = excluded.current_period_end,
		 updated_at = excluded.updated_at`,
	)
		.bind(userId, data.stripeCustomerId ?? null, data.stripeSubscriptionId ?? null, data.status, data.currentPeriodEnd ?? null, now, now)
		.run();
}

async function stripeRequest<T>(env: AppEnv, path: string, params: URLSearchParams): Promise<T> {
	const response = await fetch(`https://api.stripe.com${path}`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
			"content-type": "application/x-www-form-urlencoded",
		},
		body: params,
	});
	const data = await response.json<Record<string, unknown>>();
	if (!response.ok) {
		throw new Error(String((data.error as { message?: string } | undefined)?.message || "Stripe request failed"));
	}
	return data as T;
}

async function verifyStripeSignature(payload: string, header: string, secret: string) {
	const parts = Object.fromEntries(header.split(",").map((part) => part.split("=", 2)));
	const timestamp = parts.t;
	const signature = parts.v1;
	if (!timestamp || !signature) return false;
	const signedPayload = `${timestamp}.${payload}`;
	const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
	const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
	return timingSafeEqual(toHex(digest), signature);
}

function mapSheetRow(row: Record<string, unknown>) {
	return {
		id: row.id,
		title: row.title,
		artist: row.artist,
		isrc: row.isrc,
		creationDate: row.creation_date || row.release_date,
		splitType: row.split_type,
		status: row.status,
		collaborators: JSON.parse(String(row.collaborators_json || "[]")),
		masterTotal: row.master_total,
		publishingTotal: row.publishing_total,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

function getOrCreateUserId(request: Request) {
	const match = request.headers.get("cookie")?.match(/(?:^|;\s*)splitsheet_user=([^;]+)/);
	return match?.[1] || crypto.randomUUID();
}

function withUserCookie(request: Request, response: Response, userId = getOrCreateUserId(request)) {
	if (!request.headers.get("cookie")?.includes("splitsheet_user=")) {
		response.headers.append("set-cookie", `splitsheet_user=${userId}; Path=/; Max-Age=31536000; SameSite=Lax; HttpOnly`);
	}
	return response;
}

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data), { status, headers: jsonHeaders });
}

function sanitizeText(value: unknown, fallback = "") {
	return String(value ?? fallback).trim().slice(0, 240) || fallback;
}

function clampPercent(value: unknown) {
	const number = Number(value);
	if (!Number.isFinite(number)) return 0;
	return Math.min(Math.max(Math.round(number * 100) / 100, 0), 100);
}

function roundTotal(value: number) {
	return Math.round(value * 100) / 100;
}

function isSubscriptionActive(status: string) {
	return ["active", "trialing", "past_due"].includes(status);
}

function toHex(buffer: ArrayBuffer) {
	return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string) {
	if (a.length !== b.length) return false;
	let mismatch = 0;
	for (let index = 0; index < a.length; index += 1) {
		mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
	}
	return mismatch === 0;
}
