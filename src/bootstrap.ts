import { slugify } from "./security";

let bootstrapPromise: Promise<void> | null = null;

const schemaSql = `
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,password_hash TEXT,auth_provider_id TEXT,role TEXT NOT NULL DEFAULT 'admin',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS artists (id TEXT PRIMARY KEY,name TEXT NOT NULL,slug TEXT NOT NULL UNIQUE,bio TEXT NOT NULL,image_url TEXT NOT NULL,genre TEXT NOT NULL,city TEXT NOT NULL DEFAULT 'Houston',neighborhood TEXT NOT NULL,social_links TEXT NOT NULL DEFAULT '{}',streaming_links TEXT NOT NULL DEFAULT '{}',is_mainstream INTEGER NOT NULL DEFAULT 0,is_approved INTEGER NOT NULL DEFAULT 0,editorial_score INTEGER NOT NULL DEFAULT 0,local_relevance_score INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
CREATE INDEX IF NOT EXISTS idx_artists_approved ON artists(is_approved, is_mainstream);
CREATE TABLE IF NOT EXISTS songs (id TEXT PRIMARY KEY,artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,title TEXT NOT NULL,slug TEXT NOT NULL UNIQUE,audio_url TEXT,downloadable_file_url TEXT,cover_art_url TEXT,is_download_enabled INTEGER NOT NULL DEFAULT 0,download_count INTEGER NOT NULL DEFAULT 0,stream_count INTEGER NOT NULL DEFAULT 0,unique_listener_count INTEGER NOT NULL DEFAULT 0,external_click_count INTEGER NOT NULL DEFAULT 0,submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,approved_at TEXT,is_approved INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_songs_slug ON songs(slug);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_songs_approved ON songs(is_approved);
CREATE TABLE IF NOT EXISTS chart_entries (id TEXT PRIMARY KEY,artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,rank INTEGER NOT NULL,previous_rank INTEGER,movement TEXT NOT NULL DEFAULT 'new',score REAL NOT NULL,week_start_date TEXT NOT NULL,week_end_date TEXT NOT NULL,is_manual_override INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_chart_week ON chart_entries(week_start_date, week_end_date, rank);
CREATE INDEX IF NOT EXISTS idx_chart_artist_week ON chart_entries(artist_id, week_start_date);
CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY,artist_name TEXT NOT NULL,contact_email TEXT NOT NULL,song_title TEXT NOT NULL,genre TEXT NOT NULL,neighborhood TEXT NOT NULL,bio TEXT NOT NULL,social_links TEXT NOT NULL DEFAULT '{}',streaming_links TEXT NOT NULL DEFAULT '{}',audio_file TEXT,cover_art TEXT,permission_to_stream INTEGER NOT NULL DEFAULT 0,permission_to_download INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'pending',admin_notes TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status, created_at);
CREATE TABLE IF NOT EXISTS rss_sources (id TEXT PRIMARY KEY,name TEXT NOT NULL,url TEXT NOT NULL UNIQUE,category TEXT NOT NULL,is_active INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS rss_items (id TEXT PRIMARY KEY,title TEXT NOT NULL,source TEXT NOT NULL,link TEXT NOT NULL UNIQUE,description TEXT,image_url TEXT,published_at TEXT NOT NULL,category TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_rss_published ON rss_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_rss_category ON rss_items(category, published_at DESC);
CREATE TABLE IF NOT EXISTS stream_logs (id TEXT PRIMARY KEY,song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,session_id TEXT NOT NULL,ip_hash TEXT NOT NULL,user_agent_hash TEXT NOT NULL,listened_seconds INTEGER NOT NULL DEFAULT 0,counted INTEGER NOT NULL DEFAULT 0,is_suspicious INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_stream_logs_song_artist ON stream_logs(song_id, artist_id, created_at);
CREATE INDEX IF NOT EXISTS idx_stream_logs_session ON stream_logs(song_id, session_id, created_at);
CREATE TABLE IF NOT EXISTS download_logs (id TEXT PRIMARY KEY,song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,session_id TEXT NOT NULL,ip_hash TEXT NOT NULL,user_agent_hash TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_download_logs_song_artist ON download_logs(song_id, artist_id, created_at);
CREATE TABLE IF NOT EXISTS external_click_logs (id TEXT PRIMARY KEY,artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,song_id TEXT REFERENCES songs(id) ON DELETE SET NULL,platform TEXT NOT NULL,url TEXT NOT NULL,session_id TEXT NOT NULL,ip_hash TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_external_click_logs_platform ON external_click_logs(platform, created_at);
CREATE INDEX IF NOT EXISTS idx_external_click_logs_artist ON external_click_logs(artist_id, created_at);
`;

const seedArtists = [
	["Bayou Neon", "Alt-R&B", "Third Ward"], ["Velvet Silo", "Indie Rock", "Heights"], ["Northside Static", "Punk Soul", "Northside"], ["Gulf Freeway Ghosts", "Dream Pop", "Southeast Houston"], ["Mango Curb", "Bedroom Pop", "Montrose"], ["Clutch City Bloom", "Hip-Hop", "South Park"], ["Buffalo Bay Synth", "Electronic", "EaDo"], ["Prairie View Drive", "Folk Rap", "Acres Homes"], ["Ship Channel Choir", "Industrial Pop", "Second Ward"], ["Sienna Afterhours", "Neo-Soul", "Missouri City"], ["Telegraph Oaks", "Garage Rock", "Garden Oaks"], ["Cullen Moon", "Alt-Country", "MacGregor"], ["Alief Frequencies", "Jersey Club", "Alief"], ["Magnolia Transit", "Latin Indie", "Magnolia Park"], ["Space City Velvet", "Synthwave", "Midtown"], ["Hobby Night Run", "Trap Jazz", "Gulfgate"], ["Brays Static", "Noise Pop", "Meyerland"], ["Westheimer Weather", "Indie Pop", "Upper Kirby"], ["Trillium Park", "Lo-Fi Rap", "Sharpstown"], ["Canal Street Aura", "Cumbia Fusion", "East End"], ["Kirby Chrome", "Hyperpop", "Rice Village"], ["Fondren Futures", "Afrobeat", "Fondren"], ["Sawyer Yards Signal", "Art Rock", "First Ward"], ["Greenpoint Cassette", "Shoegaze", "Greenspoint"], ["Lawndale Lanterns", "Soul", "Eastwood"], ["Clear Lake Mirage", "Ambient", "Clear Lake"], ["Mo City Relays", "Rap", "Southwest Houston"], ["Hiram Clarke Hymns", "Gospel Drill", "Hiram Clarke"], ["Emancipation Echo", "Spoken Word", "Third Ward"], ["Airline Drive AM", "Indie Folk", "Northline"]
];

export async function ensureDatabase(db: D1Database) {
	bootstrapPromise ??= bootstrap(db);
	return bootstrapPromise;
}

async function bootstrap(db: D1Database) {
	try {
		await db.prepare("SELECT 1 FROM artists LIMIT 1").first();
	} catch {
		await db.exec(schemaSql);
	}
	await db.exec(schemaSql);
	const artistCount = await db.prepare("SELECT COUNT(*) AS count FROM artists").first<{ count: number }>();
	if (Number(artistCount?.count || 0) > 0) return;
	const weekStart = "2026-05-04";
	const weekEnd = "2026-05-10";
	const statements: D1PreparedStatement[] = [db.prepare("INSERT OR IGNORE INTO users (id,email,password_hash,role) VALUES ('admin-1','admin@houstonindie30.local','demo-password-replace-with-auth-provider','admin')")];
	seedArtists.forEach(([name, genre, hood], index) => {
		const i = index + 1;
		const artistId = `artist-${String(i).padStart(2, "0")}`;
		const songId = `song-${String(i).padStart(2, "0")}`;
		const slug = slugify(name);
		const songTitle = i % 3 === 0 ? `Loop ${600 + i} Lights` : `${hood} After Midnight`;
		const streams = 1500 - i * 31;
		const downloads = 260 - i * 4;
		const listeners = 820 - i * 18;
		const clicks = 500 - i * 7;
		const editorial = 10 - (i % 5);
		const local = 10 - (i % 4);
		const recent = i < 10 ? 8 : i < 22 ? 5 : 3;
		const score = streams * 2 + downloads * 3 + listeners * 4 + recent * 5 + editorial * 10 + local * 8 + clicks;
		const previousRank = Math.max(1, i + (i % 4 === 0 ? 1 : i % 5 === 0 ? -1 : 0));
		const movement = previousRank === i ? "same" : previousRank > i ? "up" : "down";
		const links = JSON.stringify({ spotify: `https://open.spotify.com/search/${slug}`, youtube: `https://youtube.com/results?search_query=${slug}`, soundcloud: `https://soundcloud.com/${slug}`, bandcamp: `https://${slug}.bandcamp.com` });
		const socials = JSON.stringify({ instagram: `https://instagram.com/${slug}`, tiktok: `https://tiktok.com/@${slug}`, website: `https://example.com/${slug}` });
		statements.push(db.prepare("INSERT OR IGNORE INTO artists (id,name,slug,bio,image_url,genre,city,neighborhood,social_links,streaming_links,is_approved,editorial_score,local_relevance_score) VALUES (?, ?, ?, ?, ?, ?, 'Houston', ?, ?, ?, 1, ?, ?)").bind(artistId, name, slug, `A fictional Houston underground act channeling ${hood} block energy, DIY studio texture, and late-night Gulf Coast melodies.`, `https://placehold.co/640x640/111827/f97316?text=${slug.slice(0, 2).toUpperCase()}`, genre, hood, socials, links, editorial, local));
		statements.push(db.prepare("INSERT OR IGNORE INTO songs (id,artist_id,title,slug,audio_url,downloadable_file_url,cover_art_url,is_download_enabled,download_count,stream_count,unique_listener_count,external_click_count,approved_at,is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, CURRENT_TIMESTAMP, 1)").bind(songId, artistId, songTitle, slugify(`${name}-${songTitle}`), `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(i % 16) + 1}.mp3`, `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(i % 16) + 1}.mp3`, "https://placehold.co/640x640/0f172a/22d3ee?text=HI30", downloads, streams, listeners, clicks));
		statements.push(db.prepare("INSERT OR IGNORE INTO chart_entries (id,artist_id,rank,previous_rank,movement,score,week_start_date,week_end_date,is_manual_override) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)").bind(`chart-${String(i).padStart(2, "0")}`, artistId, i, previousRank, movement, score, weekStart, weekEnd));
	});
	statements.push(db.prepare("INSERT OR IGNORE INTO rss_items (id,title,source,link,description,image_url,published_at,category) VALUES ('rss-1','Sample Houston Music Brief','Houston Indie 30 Seed','https://example.com/rss/1','Placeholder RSS summary for local music discovery. Replace with public RSS feed content during refresh.','https://placehold.co/900x520/111827/f97316?text=News',CURRENT_TIMESTAMP,'houston')"));
	await db.batch(statements);
}
