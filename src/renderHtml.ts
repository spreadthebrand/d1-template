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

type PageData = {
	artists: Artist[];
	categories: string[];
	selectedCategory?: string;
	submitted?: boolean;
	error?: string;
	scoreArtist?: (artist: Pick<Artist, "weeklySpins" | "digitalSignals" | "fanVotes" | "venueReports">) => number;
};

function escapeHtml(value: unknown) {
	return String(value ?? "")
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

function safeLink(url: string, label: string) {
	if (!url) return "";
	return `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${label}</a>`;
}

function localScore(artist: Pick<Artist, "weeklySpins" | "digitalSignals" | "fanVotes" | "venueReports">) {
	return Math.round(artist.weeklySpins + artist.digitalSignals * 2.5 + artist.fanVotes * 0.75 + artist.venueReports * 12);
}

export function renderHtml(data: PageData) {
	const score = data.scoreArtist ?? localScore;
	const topArtists = data.artists.slice(0, 30);
	const maxScore = Math.max(...topArtists.map(score), 1);
	const categoryOptions = data.categories
		.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
		.join("");
	const categoryLinks = [`<a class="chip ${!data.selectedCategory ? "active" : ""}" href="/">All Houston</a>`, ...data.categories.map((category) => `<a class="chip ${data.selectedCategory === category ? "active" : ""}" href="/?category=${encodeURIComponent(category)}">${escapeHtml(category)}</a>`)].join("");
	const rows = topArtists.map((artist, index) => {
		const artistScore = score(artist);
		const width = Math.max(6, Math.round((artistScore / maxScore) * 100));
		return `
			<article class="artist-card">
				<div class="rank">${index + 1}</div>
				<div class="artist-main">
					<div class="artist-heading">
						<div>
							<p class="eyebrow">${escapeHtml(artist.category)} • ${escapeHtml(artist.neighborhood)}</p>
							<h3>${escapeHtml(artist.name)}</h3>
							<p class="song">${escapeHtml(artist.song)}</p>
						</div>
						${artist.isPaid ? `<span class="paid">$4.99 member</span>` : `<span class="organic">organic</span>`}
					</div>
					<p>${escapeHtml(artist.bio)}</p>
					<div class="links">
						${safeLink(artist.website, "Site")}
						${safeLink(artist.instagram, "Instagram")}
						${safeLink(artist.spotify, "Spotify")}
						${safeLink(artist.youtube, "YouTube")}
						${safeLink(artist.tiktok, "TikTok")}
					</div>
					<div class="meter"><span style="width:${width}%"></span></div>
					<div class="signals">
						<span><strong>${artist.weeklySpins}</strong> weekly spins</span>
						<span><strong>${artist.digitalSignals}</strong> digital signals</span>
						<span><strong>${artist.fanVotes}</strong> fan votes</span>
						<span><strong>${artist.venueReports}</strong> venue reports</span>
					</div>
				</div>
				<div class="score"><strong>${artistScore}</strong><span>chart score</span></div>
			</article>`;
	}).join("");

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Houston Next 30 Chart</title>
	<style>
		:root { color-scheme: dark; --bg: #080a12; --panel: #111827; --panel-2: #172033; --text: #f8fafc; --muted: #a7b0c0; --gold: #facc15; --red: #ff4d6d; --cyan: #22d3ee; --green: #34d399; }
		* { box-sizing: border-box; }
		body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: radial-gradient(circle at top left, #1f2a44 0, transparent 34rem), var(--bg); color: var(--text); }
		a { color: inherit; }
		.hero { padding: 56px min(6vw, 80px) 32px; display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(280px, .6fr); gap: 32px; align-items: center; }
		.badge, .eyebrow { color: var(--cyan); font-size: .78rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; margin: 0 0 10px; }
		h1 { font-size: clamp(3rem, 9vw, 6.7rem); line-height: .85; margin: 0 0 22px; letter-spacing: -.08em; }
		.hero p { color: var(--muted); font-size: 1.1rem; line-height: 1.7; max-width: 780px; }
		.hero-panel, .form-panel, .method-panel { background: linear-gradient(145deg, rgba(34, 211, 238, .12), rgba(250, 204, 21, .08)), rgba(17, 24, 39, .86); border: 1px solid rgba(255,255,255,.1); border-radius: 28px; padding: 24px; box-shadow: 0 24px 80px rgba(0,0,0,.35); }
		.hero-panel strong { display: block; font-size: 3.4rem; color: var(--gold); }
		.toolbar { position: sticky; top: 0; z-index: 5; display: flex; gap: 10px; overflow-x: auto; padding: 16px min(6vw, 80px); background: rgba(8, 10, 18, .82); backdrop-filter: blur(18px); border-block: 1px solid rgba(255,255,255,.08); }
		.chip { white-space: nowrap; text-decoration: none; border: 1px solid rgba(255,255,255,.12); border-radius: 999px; padding: 10px 16px; color: var(--muted); }
		.chip.active, .chip:hover { color: #08111c; background: var(--gold); border-color: var(--gold); }
		.layout { display: grid; grid-template-columns: minmax(0, 1fr) 420px; gap: 28px; padding: 32px min(6vw, 80px) 80px; }
		.chart, .side { display: grid; gap: 18px; align-content: start; }
		.artist-card { display: grid; grid-template-columns: 58px minmax(0, 1fr) 110px; gap: 18px; padding: 20px; border-radius: 24px; background: rgba(17, 24, 39, .88); border: 1px solid rgba(255,255,255,.08); }
		.rank { width: 58px; height: 58px; display: grid; place-items: center; border-radius: 18px; background: #fff; color: #080a12; font-size: 1.6rem; font-weight: 950; }
		.artist-heading { display: flex; gap: 14px; justify-content: space-between; align-items: flex-start; }
		h2, h3 { margin: 0; } h3 { font-size: 1.55rem; } .song { margin: 4px 0 10px; color: var(--gold); font-weight: 800; }
		.artist-main p:not(.eyebrow):not(.song) { color: var(--muted); line-height: 1.55; }
		.paid, .organic { white-space: nowrap; border-radius: 999px; padding: 7px 10px; font-size: .72rem; font-weight: 900; text-transform: uppercase; }
		.paid { background: rgba(250, 204, 21, .14); color: var(--gold); } .organic { background: rgba(52, 211, 153, .12); color: var(--green); }
		.links { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; } .links a { text-decoration: none; font-size: .86rem; padding: 7px 10px; border-radius: 999px; background: rgba(255,255,255,.07); color: var(--muted); }
		.meter { height: 10px; overflow: hidden; border-radius: 999px; background: rgba(255,255,255,.08); } .meter span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--red), var(--gold), var(--cyan)); }
		.signals { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 12px; color: var(--muted); font-size: .8rem; } .signals strong { color: var(--text); }
		.score { display: grid; place-items: center; align-content: center; text-align: center; border-left: 1px solid rgba(255,255,255,.08); } .score strong { color: var(--gold); font-size: 2rem; } .score span { color: var(--muted); font-size: .72rem; text-transform: uppercase; font-weight: 800; }
		form { display: grid; gap: 12px; } label { display: grid; gap: 6px; color: var(--muted); font-size: .88rem; font-weight: 750; } input, select, textarea { width: 100%; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.05); color: var(--text); border-radius: 14px; padding: 12px 13px; font: inherit; } textarea { min-height: 96px; resize: vertical; } option { color: #08111c; }
		.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; } .radio { display: flex; gap: 12px; align-items: center; padding: 10px; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; } .radio input { width: auto; }
		button { border: 0; border-radius: 16px; padding: 14px 18px; background: var(--gold); color: #080a12; font-weight: 950; cursor: pointer; }
		.notice { padding: 13px 16px; border-radius: 16px; background: rgba(52, 211, 153, .12); border: 1px solid rgba(52, 211, 153, .3); color: var(--green); } .error { background: rgba(255, 77, 109, .12); border-color: rgba(255, 77, 109, .3); color: #ff9eb0; }
		.formula { display: grid; gap: 12px; color: var(--muted); line-height: 1.55; } .formula code { color: var(--gold); }
		footer { padding: 0 min(6vw, 80px) 40px; color: var(--muted); }
		@media (max-width: 1050px) { .hero, .layout { grid-template-columns: 1fr; } .side { grid-row: 1; } }
		@media (max-width: 720px) { .artist-card { grid-template-columns: 44px minmax(0, 1fr); } .score { grid-column: 1 / -1; border-left: 0; border-top: 1px solid rgba(255,255,255,.08); padding-top: 12px; } .signals, .grid-2 { grid-template-columns: 1fr 1fr; } .rank { width: 44px; height: 44px; } }
	</style>
</head>
<body>
	<section class="hero">
		<div>
			<p class="badge">Houston Next 30 • independent artist discovery</p>
			<h1>Organic charts for Houston artists.</h1>
			<p>Track the top 30 non-mainstream artists in Houston, TX with a transparent spin calculator that blends weekly spins, digital proof, fan demand, and venue/DJ reports. Paid artist profiles help cover hosting, but the ranking is calculated from activity signals instead of pay-to-play placement.</p>
		</div>
		<aside class="hero-panel">
			<p class="eyebrow">Current chart</p>
			<strong>Top 30</strong>
			<p>Filter by category, submit an artist, and update the spin signals that power the chart score.</p>
		</aside>
	</section>
	<nav class="toolbar">${categoryLinks}</nav>
	<main class="layout">
		<section class="chart">
			${data.submitted ? `<div class="notice">Artist submitted. The profile is now included in the organic chart calculation.</div>` : ""}
			${data.error ? `<div class="notice error">${escapeHtml(data.error)}</div>` : ""}
			${rows || `<div class="artist-card"><div class="artist-main"><h3>No artists yet</h3><p>Submit the first artist for this category.</p></div></div>`}
		</section>
		<aside class="side">
			<section class="form-panel">
				<h2>Submit an artist</h2>
				<p class="formula">Artists can join free or choose the optional $4.99/month profile. Payment status is shown, but it does not boost the chart score.</p>
				<form method="post" action="/artists">
					<label>Artist name<input name="name" required placeholder="Artist or group name"></label>
					<div class="grid-2"><label>Category<select name="category">${categoryOptions}</select></label><label>Houston area<input name="neighborhood" required placeholder="Third Ward, Alief..."></label></div>
					<label>Featured song<input name="song" required placeholder="Track title"></label>
					<label>Bio<textarea name="bio" placeholder="What makes the movement organic?"></textarea></label>
					<div class="grid-2"><label>Weekly spins<input name="weeklySpins" type="number" min="0" value="0"></label><label>Digital signals<input name="digitalSignals" type="number" min="0" value="0"></label></div>
					<div class="grid-2"><label>Fan votes<input name="fanVotes" type="number" min="0" value="0"></label><label>Venue/DJ reports<input name="venueReports" type="number" min="0" value="0"></label></div>
					<label>Website<input name="website" placeholder="https://"></label>
					<div class="grid-2"><label>Instagram<input name="instagram" placeholder="https://instagram.com/"></label><label>Spotify<input name="spotify" placeholder="https://open.spotify.com/"></label></div>
					<div class="grid-2"><label>YouTube<input name="youtube" placeholder="https://youtube.com/"></label><label>TikTok<input name="tiktok" placeholder="https://tiktok.com/"></label></div>
					<label class="radio"><input type="radio" name="plan" value="free" checked> Free organic listing</label>
					<label class="radio"><input type="radio" name="plan" value="paid"> $4.99/month enhanced profile</label>
					<button type="submit">Add to Houston chart</button>
				</form>
			</section>
			<section class="method-panel">
				<h2>Spin calculator</h2>
				<div class="formula">
					<p><code>score = weekly spins + digital signals × 2.5 + fan votes × 0.75 + venue/DJ reports × 12</code></p>
					<p><strong>Weekly spins</strong> can represent verified radio, DJ, playlist, or in-app plays. <strong>Digital signals</strong> can include public links, saves, shares, reposts, and video proof. <strong>Venue reports</strong> carry more weight because real-world Houston support is harder to fake.</p>
					<p>Next integration step: connect payment checkout and trusted data sources such as station logs, venue submissions, playlist APIs, and social verification queues.</p>
				</div>
			</section>
		</aside>
	</main>
	<footer>Built for Houston discovery. Keep the chart independent by reviewing submissions and source links before promoting them.</footer>
</body>
</html>`;
}
