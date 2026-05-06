import { renderHtml } from "./renderHtml";

type Artist = {
	id: number;
	name: string;
	category: string;
	neighborhood: string;
	song: string;
	bio: string;
	website: string;
	instagram: string;
	spotify: string;
	youtube: string;
	tiktok: string;
	isPaid: number;
	weeklySpins: number;
	digitalSignals: number;
	fanVotes: number;
	venueReports: number;
	lastUpdated: string;
};

type ArtistInput = Omit<Artist, "id" | "lastUpdated">;

const CATEGORIES = ["Hip-Hop", "R&B", "Latin", "Country", "Rock/Alternative", "Gospel", "DJ/Producer"];

const seedArtists: ArtistInput[] = [
	{ name: "Bayou City Bria", category: "R&B", neighborhood: "Third Ward", song: "Neon Rain", bio: "Soul-forward vocalist building a Houston-first fan base through live rooms and weekly drops.", website: "https://example.com/bayou-city-bria", instagram: "https://instagram.com/", spotify: "https://open.spotify.com/", youtube: "https://youtube.com/", tiktok: "https://tiktok.com/", isPaid: 0, weeklySpins: 238, digitalSignals: 71, fanVotes: 188, venueReports: 9 },
	{ name: "Northside Nico", category: "Hip-Hop", neighborhood: "Northside", song: "610 Loop", bio: "Independent rapper with freestyles, block-party clips, and steady college-radio movement.", website: "https://example.com/northside-nico", instagram: "https://instagram.com/", spotify: "https://open.spotify.com/", youtube: "https://youtube.com/", tiktok: "https://tiktok.com/", isPaid: 1, weeklySpins: 267, digitalSignals: 64, fanVotes: 146, venueReports: 8 },
	{ name: "Magnolia Mireya", category: "Latin", neighborhood: "Magnolia Park", song: "Luna En Navigation", bio: "Bilingual indie-pop artist pairing cumbia rhythms with bedroom-pop hooks.", website: "https://example.com/magnolia-mireya", instagram: "https://instagram.com/", spotify: "https://open.spotify.com/", youtube: "https://youtube.com/", tiktok: "https://tiktok.com/", isPaid: 0, weeklySpins: 219, digitalSignals: 69, fanVotes: 165, venueReports: 7 },
	{ name: "H-Town Halo", category: "Gospel", neighborhood: "Sunnyside", song: "Sunday Light", bio: "Contemporary gospel collective gaining traction from choir reels and community events.", website: "https://example.com/h-town-halo", instagram: "https://instagram.com/", spotify: "https://open.spotify.com/", youtube: "https://youtube.com/", tiktok: "https://tiktok.com/", isPaid: 0, weeklySpins: 196, digitalSignals: 57, fanVotes: 201, venueReports: 10 },
	{ name: "Cypress June", category: "Country", neighborhood: "Cypress", song: "Dust On 290", bio: "Texas country songwriter drawing organic demand from acoustic sessions and dancehall sets.", website: "https://example.com/cypress-june", instagram: "https://instagram.com/", spotify: "https://open.spotify.com/", youtube: "https://youtube.com/", tiktok: "https://tiktok.com/", isPaid: 1, weeklySpins: 185, digitalSignals: 61, fanVotes: 132, venueReports: 11 },
	{ name: "Montrose Static", category: "Rock/Alternative", neighborhood: "Montrose", song: "Westheimer After 2", bio: "Alt-rock four piece with local playlist adds, basement-show footage, and strong merch signals.", website: "https://example.com/montrose-static", instagram: "https://instagram.com/", spotify: "https://open.spotify.com/", youtube: "https://youtube.com/", tiktok: "https://tiktok.com/", isPaid: 0, weeklySpins: 172, digitalSignals: 54, fanVotes: 121, venueReports: 6 },
	{ name: "DJ Spur 5", category: "DJ/Producer", neighborhood: "East End", song: "Warehouse Bounce", bio: "Producer moving club edits through DJ pools, pop-ups, and livestream sets.", website: "https://example.com/dj-spur-5", instagram: "https://instagram.com/", spotify: "https://open.spotify.com/", youtube: "https://youtube.com/", tiktok: "https://tiktok.com/", isPaid: 0, weeklySpins: 211, digitalSignals: 73, fanVotes: 98, venueReports: 13 },
	{ name: "Alief Anthem", category: "Hip-Hop", neighborhood: "Alief", song: "Bellaire Blvd", bio: "Melodic rapper earning social shares from car-performance clips and local blogs.", website: "https://example.com/alief-anthem", instagram: "https://instagram.com/", spotify: "https://open.spotify.com/", youtube: "https://youtube.com/", tiktok: "https://tiktok.com/", isPaid: 0, weeklySpins: 191, digitalSignals: 66, fanVotes: 118, venueReports: 5 },
	{ name: "Pearland Poet", category: "R&B", neighborhood: "Pearland", song: "Slow Drip", bio: "DIY singer-songwriter converting open-mic demand into playlist saves and email subscribers.", website: "https://example.com/pearland-poet", instagram: "https://instagram.com/", spotify: "https://open.spotify.com/", youtube: "https://youtube.com/", tiktok: "https://tiktok.com/", isPaid: 0, weeklySpins: 164, digitalSignals: 52, fanVotes: 111, venueReports: 6 },
	{ name: "Katy Camino", category: "Latin", neighborhood: "Katy", song: "Cinco Ranch Nights", bio: "Regional Mexican and pop crossover act growing through family festivals and creator duets.", website: "https://example.com/katy-camino", instagram: "https://instagram.com/", spotify: "https://open.spotify.com/", youtube: "https://youtube.com/", tiktok: "https://tiktok.com/", isPaid: 1, weeklySpins: 177, digitalSignals: 58, fanVotes: 104, venueReports: 8 },
	{ name: "Heights Haze", category: "Rock/Alternative", neighborhood: "The Heights", song: "Porch Light", bio: "Shoegaze-leaning band with college radio interest and steady local venue reporting.", website: "https://example.com/heights-haze", instagram: "https://instagram.com/", spotify: "https://open.spotify.com/", youtube: "https://youtube.com/", tiktok: "https://tiktok.com/", isPaid: 0, weeklySpins: 142, digitalSignals: 48, fanVotes: 94, venueReports: 9 },
	{ name: "South Park Psalm", category: "Gospel", neighborhood: "South Park", song: "Lift Up", bio: "Uplifting vocalist whose church-performance videos are translating into repeat local spins.", website: "https://example.com/south-park-psalm", instagram: "https://instagram.com/", spotify: "https://open.spotify.com/", youtube: "https://youtube.com/", tiktok: "https://tiktok.com/", isPaid: 0, weeklySpins: 151, digitalSignals: 45, fanVotes: 128, venueReports: 7 },
];

function scoreArtist(artist: Pick<Artist, "weeklySpins" | "digitalSignals" | "fanVotes" | "venueReports">) {
	return Math.round(artist.weeklySpins * 1 + artist.digitalSignals * 2.5 + artist.fanVotes * 0.75 + artist.venueReports * 12);
}

function normalizeUrl(value: string) {
	const trimmed = value.trim();
	if (!trimmed) return "";
	return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function sanitize(value: unknown, maxLength = 220) {
	return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, maxLength);
}

async function ensureArtists(env: Env) {
	await env.DB.prepare(`CREATE TABLE IF NOT EXISTS artists (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		category TEXT NOT NULL,
		neighborhood TEXT NOT NULL,
		song TEXT NOT NULL,
		bio TEXT NOT NULL,
		website TEXT NOT NULL,
		instagram TEXT NOT NULL,
		spotify TEXT NOT NULL,
		youtube TEXT NOT NULL,
		tiktok TEXT NOT NULL,
		isPaid INTEGER NOT NULL DEFAULT 0,
		weeklySpins INTEGER NOT NULL DEFAULT 0,
		digitalSignals INTEGER NOT NULL DEFAULT 0,
		fanVotes INTEGER NOT NULL DEFAULT 0,
		venueReports INTEGER NOT NULL DEFAULT 0,
		lastUpdated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
	)`).run();

	const { count } = await env.DB.prepare("SELECT COUNT(*) as count FROM artists").first<{ count: number }>() ?? { count: 0 };
	if (count === 0) {
		const statement = env.DB.prepare(`INSERT INTO artists (name, category, neighborhood, song, bio, website, instagram, spotify, youtube, tiktok, isPaid, weeklySpins, digitalSignals, fanVotes, venueReports)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
		await env.DB.batch(seedArtists.map((artist) => statement.bind(
			artist.name,
			artist.category,
			artist.neighborhood,
			artist.song,
			artist.bio,
			artist.website,
			artist.instagram,
			artist.spotify,
			artist.youtube,
			artist.tiktok,
			artist.isPaid,
			artist.weeklySpins,
			artist.digitalSignals,
			artist.fanVotes,
			artist.venueReports,
		)));
	}
}

async function listArtists(env: Env, category?: string) {
	const base = "SELECT * FROM artists";
	const filter = category && CATEGORIES.includes(category) ? " WHERE category = ?" : "";
	const stmt = env.DB.prepare(`${base}${filter} ORDER BY (weeklySpins + digitalSignals * 2.5 + fanVotes * 0.75 + venueReports * 12) DESC, lastUpdated DESC LIMIT 30`);
	const { results } = filter ? await stmt.bind(category).all<Artist>() : await stmt.all<Artist>();
	return results;
}

async function handleSubmit(request: Request, env: Env) {
	const form = await request.formData();
	const artist: ArtistInput = {
		name: sanitize(form.get("name"), 80),
		category: CATEGORIES.includes(String(form.get("category"))) ? String(form.get("category")) : CATEGORIES[0],
		neighborhood: sanitize(form.get("neighborhood"), 80),
		song: sanitize(form.get("song"), 120),
		bio: sanitize(form.get("bio"), 500),
		website: normalizeUrl(sanitize(form.get("website"), 160)),
		instagram: normalizeUrl(sanitize(form.get("instagram"), 160)),
		spotify: normalizeUrl(sanitize(form.get("spotify"), 160)),
		youtube: normalizeUrl(sanitize(form.get("youtube"), 160)),
		tiktok: normalizeUrl(sanitize(form.get("tiktok"), 160)),
		isPaid: form.get("plan") === "paid" ? 1 : 0,
		weeklySpins: Number(form.get("weeklySpins")) || 0,
		digitalSignals: Number(form.get("digitalSignals")) || 0,
		fanVotes: Number(form.get("fanVotes")) || 0,
		venueReports: Number(form.get("venueReports")) || 0,
	};

	if (!artist.name || !artist.song || !artist.neighborhood) {
		return new Response(renderHtml({ artists: await listArtists(env), categories: CATEGORIES, error: "Artist name, song, and Houston area are required." }), { status: 400, headers: { "content-type": "text/html" } });
	}

	await env.DB.prepare(`INSERT INTO artists (name, category, neighborhood, song, bio, website, instagram, spotify, youtube, tiktok, isPaid, weeklySpins, digitalSignals, fanVotes, venueReports)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
		.bind(artist.name, artist.category, artist.neighborhood, artist.song, artist.bio, artist.website, artist.instagram, artist.spotify, artist.youtube, artist.tiktok, artist.isPaid, artist.weeklySpins, artist.digitalSignals, artist.fanVotes, artist.venueReports)
		.run();

	return Response.redirect(new URL("/?submitted=1", request.url).toString(), 303);
}

export default {
	async fetch(request, env) {
		await ensureArtists(env);
		const url = new URL(request.url);

		if (request.method === "POST" && url.pathname === "/artists") {
			return handleSubmit(request, env);
		}

		const category = url.searchParams.get("category") ?? undefined;
		const artists = await listArtists(env, category);
		return new Response(renderHtml({ artists, categories: CATEGORIES, selectedCategory: category, submitted: url.searchParams.has("submitted"), scoreArtist }), {
			headers: { "content-type": "text/html" },
		});
	},
} satisfies ExportedHandler<Env>;
