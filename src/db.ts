import type { ChartRow, DbArtist, DbSong } from "./types";
import { slugify } from "./security";

export async function currentChart(db: D1Database, limit = 30) {
	return (await db.prepare(`SELECT ce.rank, ce.previous_rank, ce.movement, ce.score, ce.week_start_date, ce.week_end_date,
		a.*, s.id AS song_id, s.title AS song_title, s.slug AS song_slug, s.audio_url, s.downloadable_file_url, s.cover_art_url,
		s.is_download_enabled, s.download_count, s.stream_count, s.unique_listener_count, s.external_click_count, s.is_approved
		FROM chart_entries ce
		JOIN artists a ON a.id = ce.artist_id
		LEFT JOIN songs s ON s.artist_id = a.id AND s.is_approved = 1
		WHERE ce.week_start_date = (SELECT MAX(week_start_date) FROM chart_entries) AND a.is_approved = 1 AND a.is_mainstream = 0
		GROUP BY a.id ORDER BY ce.rank ASC LIMIT ?`).bind(limit).all<ChartRow>()).results;
}
export async function artistBySlug(db: D1Database, slug: string) {
	const artist = await db.prepare("SELECT * FROM artists WHERE slug = ? AND is_approved = 1").bind(slug).first<DbArtist>();
	if (!artist) return null;
	const songs = (await db.prepare("SELECT * FROM songs WHERE artist_id = ? AND is_approved = 1 ORDER BY stream_count DESC").bind(artist.id).all<DbSong>()).results;
	return { artist, songs };
}
export async function songBySlug(db: D1Database, slug: string) {
	return await db.prepare(`SELECT s.*, a.name AS artist_name, a.slug AS artist_slug, a.genre, a.neighborhood, a.streaming_links, a.social_links
		FROM songs s JOIN artists a ON a.id = s.artist_id WHERE s.slug = ? AND s.is_approved = 1`).bind(slug).first<Record<string, unknown>>();
}
export async function createSubmission(db: D1Database, input: Record<string, string | boolean>) {
	const id = crypto.randomUUID();
	await db.prepare(`INSERT INTO submissions (id, artist_name, contact_email, song_title, genre, neighborhood, bio, social_links, streaming_links, audio_file, cover_art, permission_to_stream, permission_to_download, status)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`).bind(id, input.artistName, input.contactEmail, input.songTitle, input.genre, input.neighborhood, input.bio, input.socialLinks || "{}", input.streamingLinks || "{}", input.audioFile || null, input.coverArt || null, input.permissionToStream ? 1 : 0, input.permissionToDownload ? 1 : 0).run();
	return id;
}
export async function approveSubmission(db: D1Database, id: string, status: string, notes: string) {
	const sub = await db.prepare("SELECT * FROM submissions WHERE id = ?").bind(id).first<Record<string, string | number>>();
	if (!sub) return false;
	await db.prepare("UPDATE submissions SET status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(status, notes, id).run();
	if (status !== "approved") return true;
	const artistId = crypto.randomUUID(); const songId = crypto.randomUUID();
	const artistSlug = slugify(String(sub.artist_name)); const songSlug = slugify(`${sub.artist_name}-${sub.song_title}`);
	await db.batch([
		db.prepare(`INSERT OR IGNORE INTO artists (id,name,slug,bio,image_url,genre,city,neighborhood,social_links,streaming_links,is_approved,editorial_score,local_relevance_score)
			VALUES (?, ?, ?, ?, ?, ?, 'Houston', ?, ?, ?, 1, 5, 8)`).bind(artistId, sub.artist_name, artistSlug, sub.bio, sub.cover_art || "https://placehold.co/640x640/111827/f97316?text=HI30", sub.genre, sub.neighborhood, sub.social_links, sub.streaming_links),
		db.prepare(`INSERT OR IGNORE INTO songs (id,artist_id,title,slug,audio_url,downloadable_file_url,cover_art_url,is_download_enabled,is_approved,approved_at)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`).bind(songId, artistId, sub.song_title, songSlug, sub.audio_file, sub.permission_to_download ? sub.audio_file : null, sub.cover_art, sub.permission_to_download ? 1 : 0)
	]);
	return true;
}
export async function recalculateChart(db: D1Database) {
	const previous = (await db.prepare("SELECT artist_id, rank FROM chart_entries WHERE week_start_date = (SELECT MAX(week_start_date) FROM chart_entries)").all<{artist_id:string; rank:number}>()).results;
	const prevMap = new Map(previous.map((r) => [r.artist_id, r.rank]));
	const rows = (await db.prepare(`SELECT a.id, a.editorial_score, a.local_relevance_score, COALESCE(SUM(s.stream_count),0) streams, COALESCE(SUM(s.download_count),0) downloads,
		COALESCE(SUM(s.unique_listener_count),0) listeners, COALESCE(SUM(s.external_click_count),0) clicks,
		MAX(s.submitted_at) submitted_at
		FROM artists a JOIN songs s ON s.artist_id = a.id AND s.is_approved = 1
		WHERE a.is_approved = 1 AND a.is_mainstream = 0 GROUP BY a.id`).all<Record<string, number | string>>()).results;
	const ranked = rows.map((r) => {
		const days = Math.max(0, (Date.now() - Date.parse(String(r.submitted_at))) / 86400000);
		const recentActivityScore = Math.max(0, 10 - Math.floor(days / 14));
		const score = Number(r.streams) * 2 + Number(r.downloads) * 3 + Number(r.listeners) * 4 + recentActivityScore * 5 + Number(r.editorial_score) * 10 + Number(r.local_relevance_score) * 8 + Number(r.clicks);
		return { artistId: String(r.id), score };
	}).sort((a,b) => b.score - a.score).slice(0,30);
	const weekStart = new Date(); weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
	const weekEnd = new Date(weekStart); weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
	await db.prepare("DELETE FROM chart_entries WHERE week_start_date = ?").bind(weekStart.toISOString().slice(0,10)).run();
	for (const [i, r] of ranked.entries()) {
		const rank = i + 1; const previousRank = prevMap.get(r.artistId) ?? null;
		const movement = previousRank == null ? "new" : previousRank === rank ? "same" : previousRank > rank ? "up" : "down";
		await db.prepare(`INSERT INTO chart_entries (id,artist_id,rank,previous_rank,movement,score,week_start_date,week_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
			.bind(crypto.randomUUID(), r.artistId, rank, previousRank, movement, r.score, weekStart.toISOString().slice(0,10), weekEnd.toISOString().slice(0,10)).run();
	}
	return ranked.length;
}
