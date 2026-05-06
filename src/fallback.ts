import type { ChartRow, DbArtist, DbSong } from "./types";
import { slugify } from "./security";

const seedArtists = [
	["Bayou Neon", "Alt-R&B", "Third Ward"], ["Velvet Silo", "Indie Rock", "Heights"], ["Northside Static", "Punk Soul", "Northside"], ["Gulf Freeway Ghosts", "Dream Pop", "Southeast Houston"], ["Mango Curb", "Bedroom Pop", "Montrose"], ["Clutch City Bloom", "Hip-Hop", "South Park"], ["Buffalo Bay Synth", "Electronic", "EaDo"], ["Prairie View Drive", "Folk Rap", "Acres Homes"], ["Ship Channel Choir", "Industrial Pop", "Second Ward"], ["Sienna Afterhours", "Neo-Soul", "Missouri City"], ["Telegraph Oaks", "Garage Rock", "Garden Oaks"], ["Cullen Moon", "Alt-Country", "MacGregor"], ["Alief Frequencies", "Jersey Club", "Alief"], ["Magnolia Transit", "Latin Indie", "Magnolia Park"], ["Space City Velvet", "Synthwave", "Midtown"], ["Hobby Night Run", "Trap Jazz", "Gulfgate"], ["Brays Static", "Noise Pop", "Meyerland"], ["Westheimer Weather", "Indie Pop", "Upper Kirby"], ["Trillium Park", "Lo-Fi Rap", "Sharpstown"], ["Canal Street Aura", "Cumbia Fusion", "East End"], ["Kirby Chrome", "Hyperpop", "Rice Village"], ["Fondren Futures", "Afrobeat", "Fondren"], ["Sawyer Yards Signal", "Art Rock", "First Ward"], ["Greenpoint Cassette", "Shoegaze", "Greenspoint"], ["Lawndale Lanterns", "Soul", "Eastwood"], ["Clear Lake Mirage", "Ambient", "Clear Lake"], ["Mo City Relays", "Rap", "Southwest Houston"], ["Hiram Clarke Hymns", "Gospel Drill", "Hiram Clarke"], ["Emancipation Echo", "Spoken Word", "Third Ward"], ["Airline Drive AM", "Indie Folk", "Northline"]
];

export const fallbackChart: ChartRow[] = seedArtists.map(([name, genre, neighborhood], index) => {
	const rank = index + 1;
	const slug = slugify(name);
	const artistId = `fallback-artist-${String(rank).padStart(2, "0")}`;
	const songTitle = rank % 3 === 0 ? `Loop ${600 + rank} Lights` : `${neighborhood} After Midnight`;
	const songSlug = slugify(`${name}-${songTitle}`);
	const previousRank = Math.max(1, rank + (rank % 4 === 0 ? 1 : rank % 5 === 0 ? -1 : 0));
	const movement = previousRank === rank ? "same" : previousRank > rank ? "up" : "down";
	const streamCount = 1500 - rank * 31;
	const downloadCount = 260 - rank * 4;
	const uniqueListenerCount = 820 - rank * 18;
	const externalClickCount = 500 - rank * 7;
	const editorialScore = 10 - (rank % 5);
	const localRelevanceScore = 10 - (rank % 4);
	const score = streamCount * 2 + downloadCount * 3 + uniqueListenerCount * 4 + editorialScore * 10 + localRelevanceScore * 8 + externalClickCount;
	return {
		id: artistId,
		artist_id: artistId,
		name,
		slug,
		bio: `A fictional Houston underground act channeling ${neighborhood} block energy, DIY studio texture, and late-night Gulf Coast melodies.`,
		image_url: `https://placehold.co/640x640/111827/f97316?text=${slug.slice(0, 2).toUpperCase()}`,
		genre,
		city: "Houston",
		neighborhood,
		social_links: JSON.stringify({ instagram: `https://instagram.com/${slug}`, tiktok: `https://tiktok.com/@${slug}`, website: `https://example.com/${slug}` }),
		streaming_links: JSON.stringify({ spotify: `https://open.spotify.com/search/${slug}`, youtube: `https://youtube.com/results?search_query=${slug}`, soundcloud: `https://soundcloud.com/${slug}`, bandcamp: `https://${slug}.bandcamp.com` }),
		is_mainstream: 0,
		is_approved: 1,
		editorial_score: editorialScore,
		local_relevance_score: localRelevanceScore,
		created_at: "2026-05-06T00:00:00.000Z",
		updated_at: "2026-05-06T00:00:00.000Z",
		rank,
		previous_rank: previousRank,
		movement,
		score,
		week_start_date: "2026-05-04",
		week_end_date: "2026-05-10",
		song_id: `fallback-song-${String(rank).padStart(2, "0")}`,
		song_title: songTitle,
		song_slug: songSlug,
		title: songTitle,
		audio_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(rank % 16) + 1}.mp3`,
		downloadable_file_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(rank % 16) + 1}.mp3`,
		cover_art_url: "https://placehold.co/640x640/0f172a/22d3ee?text=HI30",
		is_download_enabled: 1,
		download_count: downloadCount,
		stream_count: streamCount,
		unique_listener_count: uniqueListenerCount,
		external_click_count: externalClickCount,
		submitted_at: "2026-05-06T00:00:00.000Z",
		approved_at: "2026-05-06T00:00:00.000Z"
	};
});

export function fallbackArtistBySlug(slug: string): { artist: DbArtist; songs: DbSong[] } | null {
	const row = fallbackChart.find((entry) => entry.slug === slug);
	if (!row) return null;
	return { artist: row, songs: [chartRowToSong(row)] };
}

export function fallbackSongBySlug(slug: string): Record<string, unknown> | null {
	const row = fallbackChart.find((entry) => entry.song_slug === slug);
	if (!row) return null;
	return { ...chartRowToSong(row), artist_name: row.name, artist_slug: row.slug, genre: row.genre, neighborhood: row.neighborhood, streaming_links: row.streaming_links, social_links: row.social_links };
}

export const fallbackNews = [
	{ id: "fallback-rss-1", title: "Houston Indie 30 preview mode", source: "Houston Indie 30", link: "https://example.com/rss/preview", description: "Preview content is showing while the D1 database is being initialized. Public RSS items will appear after feed refresh.", image_url: "https://placehold.co/900x520/111827/f97316?text=News", published_at: "2026-05-06T00:00:00.000Z", category: "houston" }
];

function chartRowToSong(row: ChartRow): DbSong {
	return {
		id: row.song_id,
		artist_id: row.artist_id,
		title: row.song_title,
		slug: row.song_slug,
		audio_url: row.audio_url,
		downloadable_file_url: row.downloadable_file_url,
		cover_art_url: row.cover_art_url,
		is_download_enabled: row.is_download_enabled,
		download_count: row.download_count,
		stream_count: row.stream_count,
		unique_listener_count: row.unique_listener_count,
		external_click_count: row.external_click_count,
		submitted_at: row.submitted_at,
		approved_at: row.approved_at,
		is_approved: row.is_approved,
		created_at: row.created_at,
		updated_at: row.updated_at
	};
}
