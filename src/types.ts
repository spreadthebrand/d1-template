export type DbArtist = {
	id: string; name: string; slug: string; bio: string; image_url: string; genre: string; city: string; neighborhood: string;
	social_links: string; streaming_links: string; is_mainstream: number; is_approved: number; editorial_score: number; local_relevance_score: number;
	created_at: string; updated_at: string;
};
export type DbSong = {
	id: string; artist_id: string; title: string; slug: string; audio_url: string | null; downloadable_file_url: string | null; cover_art_url: string | null;
	is_download_enabled: number; download_count: number; stream_count: number; unique_listener_count: number; external_click_count: number;
	submitted_at: string; approved_at: string | null; is_approved: number; created_at: string; updated_at: string;
};
export type ChartRow = DbArtist & DbSong & { artist_id: string; rank: number; previous_rank: number | null; movement: string; score: number; week_start_date: string; week_end_date: string; song_id: string; song_slug: string; song_title: string; };
export type PlatformLinks = Record<string, string>;
export type AppContext = { request: Request; env: Env; url: URL; sessionId: string; ipHash: string; userAgentHash: string };
