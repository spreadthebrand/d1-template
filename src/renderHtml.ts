export type SubmissionView = {
	name?: string;
	email?: string;
	role?: string;
	fileName?: string;
	sponsorshipInterest?: string;
	mediaConsent?: string;
};

const escapeHtml = (value = "") =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");

export function renderHtml(submission?: SubmissionView) {
	const submittedName = escapeHtml(submission?.name);
	const submittedEmail = escapeHtml(submission?.email);
	const submittedRole = escapeHtml(submission?.role);
	const submittedFile = escapeHtml(submission?.fileName || "No file attached");
	const sponsorshipInterest = escapeHtml(submission?.sponsorshipInterest || "Not selected");
	const mediaConsent = escapeHtml(submission?.mediaConsent || "Not selected");

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>The Girls Room Creative Lock In | Houston, TX</title>
	<style>
		:root {
			color-scheme: dark;
			--ink: #180f12;
			--espresso: #241514;
			--rose: #f2a7bd;
			--rose-deep: #d86491;
			--cream: #fff5ee;
			--champagne: #d7b889;
			--sage: #7f8b68;
			--glass: rgba(255, 245, 238, 0.12);
			--line: rgba(255, 245, 238, 0.22);
			font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		}

		* { box-sizing: border-box; }

		body {
			margin: 0;
			min-height: 100vh;
			background:
				radial-gradient(circle at 16% 12%, rgba(242, 167, 189, 0.24), transparent 32rem),
				radial-gradient(circle at 88% 18%, rgba(215, 184, 137, 0.18), transparent 24rem),
				linear-gradient(135deg, rgba(24, 15, 18, 0.85), rgba(36, 21, 20, 0.96)),
				url("https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1800&q=80");
			background-attachment: fixed;
			background-size: cover;
			background-position: center;
			color: var(--cream);
		}

		body::before {
			content: "";
			position: fixed;
			inset: 0;
			pointer-events: none;
			background-image: linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
			background-size: 72px 72px;
			mask-image: linear-gradient(to bottom, rgba(0,0,0,.65), transparent 80%);
		}

		a { color: inherit; }

		.page {
			width: min(1180px, calc(100% - 32px));
			margin: 0 auto;
			padding: 24px 0 48px;
		}

		.nav {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
			padding: 14px 0 36px;
			text-transform: uppercase;
			letter-spacing: .16em;
			font-size: .78rem;
			color: rgba(255, 245, 238, .76);
		}

		.brand {
			display: inline-flex;
			align-items: center;
			gap: 12px;
			font-weight: 800;
		}

		.mark {
			width: 40px;
			height: 40px;
			border: 1px solid var(--line);
			border-radius: 50%;
			display: grid;
			place-items: center;
			background: rgba(255, 245, 238, .08);
			box-shadow: 0 0 36px rgba(242, 167, 189, .18);
			color: var(--rose);
			font-family: Georgia, serif;
			font-size: 1.15rem;
		}

		.nav-links { display: flex; gap: 18px; flex-wrap: wrap; }

		.nav-links a {
			text-decoration: none;
			padding-bottom: 6px;
			border-bottom: 1px solid transparent;
		}

		.nav-links a:hover { border-color: var(--rose); }

		.hero {
			display: grid;
			grid-template-columns: minmax(0, 1.06fr) minmax(320px, .94fr);
			gap: 28px;
			align-items: stretch;
		}

		.card {
			border: 1px solid var(--line);
			background: linear-gradient(145deg, rgba(24, 15, 18, .82), rgba(36, 21, 20, .70));
			box-shadow: 0 28px 90px rgba(0, 0, 0, .42);
			backdrop-filter: blur(18px);
			border-radius: 32px;
			overflow: hidden;
		}

		.hero-copy {
			padding: clamp(28px, 5vw, 58px);
			position: relative;
			min-height: 760px;
		}

		.eyebrow {
			display: inline-flex;
			align-items: center;
			gap: 10px;
			color: var(--rose);
			letter-spacing: .34em;
			text-transform: uppercase;
			font-size: .78rem;
			font-weight: 800;
		}

		.eyebrow::before, .eyebrow::after {
			content: "";
			width: 34px;
			height: 1px;
			background: var(--rose);
		}

		h1 {
			font-family: Georgia, "Times New Roman", serif;
			font-size: clamp(4rem, 11vw, 8.8rem);
			line-height: .82;
			letter-spacing: -.07em;
			margin: 28px 0 18px;
			font-weight: 400;
			text-wrap: balance;
		}

		h1 em {
			display: block;
			font-style: italic;
			color: var(--cream);
			text-shadow: 0 14px 40px rgba(0,0,0,.48);
		}

		.tagline {
			color: var(--rose);
			letter-spacing: .19em;
			text-transform: uppercase;
			font-size: .92rem;
			font-weight: 800;
			margin: 0 0 22px;
		}

		.description {
			max-width: 620px;
			font-family: Georgia, serif;
			font-size: clamp(1.1rem, 2.2vw, 1.55rem);
			font-style: italic;
			line-height: 1.58;
			color: rgba(255, 245, 238, .84);
		}

		.event-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 1px;
			margin: 36px 0;
			border: 1px solid var(--line);
			background: var(--line);
			border-radius: 22px;
			overflow: hidden;
		}

		.detail {
			background: rgba(255, 245, 238, .07);
			padding: 20px;
		}

		.detail span {
			display: block;
			color: var(--rose);
			text-transform: uppercase;
			letter-spacing: .22em;
			font-size: .74rem;
			font-weight: 900;
			margin-bottom: 8px;
		}

		.detail strong {
			display: block;
			font-size: .98rem;
			line-height: 1.45;
			font-weight: 700;
		}

		.pill-row {
			display: flex;
			flex-wrap: wrap;
			gap: 10px;
			margin-bottom: 34px;
		}

		.pill {
			border: 1px solid rgba(242, 167, 189, .38);
			border-radius: 999px;
			padding: 10px 14px;
			background: rgba(242, 167, 189, .09);
			color: rgba(255, 245, 238, .88);
			font-size: .88rem;
		}

		.cta-row { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }

		.button {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 10px;
			border: 0;
			border-radius: 999px;
			padding: 14px 22px;
			background: linear-gradient(135deg, var(--rose), var(--rose-deep));
			color: #2a121b;
			font-weight: 900;
			text-decoration: none;
			box-shadow: 0 18px 50px rgba(216, 100, 145, .34);
			cursor: pointer;
		}

		.secondary {
			background: rgba(255, 245, 238, .09);
			color: var(--cream);
			border: 1px solid var(--line);
			box-shadow: none;
		}

		.photo-strip {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 14px;
			margin-top: 34px;
		}

		.photo {
			min-height: 150px;
			border-radius: 24px;
			border: 1px solid var(--line);
			background-size: cover;
			background-position: center;
			position: relative;
			overflow: hidden;
		}

		.photo::after {
			content: attr(data-label);
			position: absolute;
			left: 14px;
			bottom: 14px;
			padding: 8px 11px;
			border-radius: 999px;
			background: rgba(24, 15, 18, .64);
			border: 1px solid var(--line);
			font-size: .72rem;
			text-transform: uppercase;
			letter-spacing: .13em;
		}

		.photo.one { background-image: linear-gradient(rgba(24,15,18,.28), rgba(24,15,18,.55)), url("https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=900&q=80"); }
		.photo.two { background-image: linear-gradient(rgba(24,15,18,.18), rgba(24,15,18,.55)), url("https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80"); }

		.form-card { padding: clamp(24px, 4vw, 38px); }

		h2 {
			font-family: Georgia, serif;
			font-size: clamp(2.2rem, 4vw, 3.2rem);
			line-height: .95;
			margin: 0 0 12px;
			font-weight: 400;
		}

		.form-card p { color: rgba(255, 245, 238, .72); line-height: 1.65; margin-top: 0; }

		.notice {
			border: 1px solid rgba(127, 139, 104, .5);
			background: rgba(127, 139, 104, .18);
			border-radius: 20px;
			padding: 16px;
			margin: 0 0 20px;
		}

		.notice strong { color: #dbe7c7; }

		form { display: grid; gap: 15px; }

		.field { display: grid; gap: 8px; }

		label {
			font-size: .78rem;
			font-weight: 900;
			letter-spacing: .16em;
			text-transform: uppercase;
			color: rgba(255, 245, 238, .78);
		}

		input, select, textarea {
			width: 100%;
			border: 1px solid var(--line);
			border-radius: 16px;
			background: rgba(255, 245, 238, .09);
			color: var(--cream);
			padding: 14px 15px;
			font: inherit;
			outline: none;
		}

		select option { color: var(--ink); }
		textarea { min-height: 104px; resize: vertical; }
		input::file-selector-button {
			border: 0;
			border-radius: 999px;
			background: var(--cream);
			color: var(--ink);
			font-weight: 800;
			padding: 9px 12px;
			margin-right: 12px;
		}

		.two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

		.checks {
			border: 1px solid var(--line);
			border-radius: 20px;
			padding: 16px;
			background: rgba(255, 245, 238, .06);
		}

		.check-line {
			display: flex;
			align-items: flex-start;
			gap: 11px;
			margin-top: 10px;
			color: rgba(255, 245, 238, .82);
			line-height: 1.5;
		}

		.check-line input { width: auto; margin-top: 5px; }

		.footer-note {
			margin-top: 18px;
			font-size: .86rem;
			color: rgba(255, 245, 238, .58);
		}

		@media (max-width: 900px) {
			.hero { grid-template-columns: 1fr; }
			.hero-copy { min-height: auto; }
			.event-grid { grid-template-columns: 1fr; }
			.nav { align-items: flex-start; flex-direction: column; }
		}

		@media (max-width: 620px) {
			.page { width: min(100% - 22px, 1180px); padding-top: 14px; }
			.two, .photo-strip { grid-template-columns: 1fr; }
			h1 { font-size: clamp(3.45rem, 22vw, 5rem); }
			.nav-links { font-size: .68rem; gap: 11px; }
		}
	</style>
</head>
<body>
	<div class="page">
		<nav class="nav" aria-label="Event navigation">
			<div class="brand"><span class="mark">GR</span><span>The Girls Room</span></div>
			<div class="nav-links">
				<a href="#details">Details</a>
				<a href="#apply">Upload</a>
				<a href="#sponsor">Sponsors</a>
			</div>
		</nav>

		<main class="hero">
			<section class="card hero-copy" id="details">
				<div class="eyebrow">Houston, TX</div>
				<h1>Creative <em>Lock In</em></h1>
				<p class="tagline">Women led. Creative. Collaborative.</p>
				<p class="description">A women-led creative experience bringing together female producers, artists, DJs, engineers, videographers, photographers and content creators for a night of collaboration, music, content creation and community.</p>

				<div class="event-grid" aria-label="Event information">
					<div class="detail"><span>When</span><strong>Sunday, June 20, 2026<br />7:00PM – 12:00AM</strong></div>
					<div class="detail"><span>Where</span><strong>1SoundVibe Studios<br />Houston, TX</strong></div>
					<div class="detail"><span>Access</span><strong>Invitation Only<br />DM for more info</strong></div>
				</div>

				<div class="pill-row" aria-label="Event features">
					<span class="pill">Networking</span>
					<span class="pill">Studio Sessions</span>
					<span class="pill">Content Creation</span>
					<span class="pill">Good Music</span>
					<span class="pill">Good Food</span>
					<span class="pill">Good Energy</span>
				</div>

				<div class="cta-row">
					<a class="button" href="#apply">Request Invite + Upload</a>
					<a class="button secondary" href="https://instagram.com/freegameproductions" rel="noreferrer" target="_blank">@freegameproductions</a>
				</div>

				<div class="photo-strip" aria-label="Creative event inspiration photos">
					<div class="photo one" data-label="Collaborate"></div>
					<div class="photo two" data-label="Create"></div>
				</div>
			</section>

			<aside class="card form-card" id="apply">
				${submission ? `<div class="notice"><strong>Thank you${submittedName ? `, ${submittedName}` : ""}!</strong><br />Your request has been received and emailed to Freegame Productions. We logged ${submittedEmail || "your email"}, role: ${submittedRole || "creative"}, upload: ${submittedFile}, sponsorship: ${sponsorshipInterest}, media consent: ${mediaConsent}.</div>` : ""}
				<h2>Request your invitation</h2>
				<p>Tell us who you are, upload a sample or flyer, and let us know if you or your brand would like to support the room.</p>

				<form method="POST" enctype="multipart/form-data">
					<div class="two">
						<div class="field">
							<label for="name">Full name</label>
							<input id="name" name="name" autocomplete="name" required placeholder="Your name" />
						</div>
						<div class="field">
							<label for="email">Email</label>
							<input id="email" name="email" type="email" autocomplete="email" required placeholder="you@example.com" />
						</div>
					</div>

					<div class="two">
						<div class="field">
							<label for="role">Creative lane</label>
							<select id="role" name="role" required>
								<option value="">Select one</option>
								<option>Artist / Songwriter</option>
								<option>Producer</option>
								<option>DJ</option>
								<option>Engineer</option>
								<option>Photographer / Videographer</option>
								<option>Content Creator</option>
								<option>Brand / Sponsor</option>
							</select>
						</div>
						<div class="field">
							<label for="social">Instagram / website</label>
							<input id="social" name="social" placeholder="@yourhandle" />
						</div>
					</div>

					<div class="field">
						<label for="upload">Upload sample, EPK, flyer or portfolio</label>
						<input id="upload" name="upload" type="file" accept="image/*,.pdf,.mp3,.wav,.mp4" />
					</div>

					<div class="field">
						<label for="notes">What do you want to create in the room?</label>
						<textarea id="notes" name="notes" placeholder="Share your collaboration idea, goals, or what you can contribute."></textarea>
					</div>

					<div class="checks">
						<label>Media release & recording consent</label>
						<div class="check-line"><input id="media-consent" name="mediaConsent" type="checkbox" value="Yes" required /> <span>I agree to be photographed, filmed, livestreamed, and/or recorded at The Girls Room Creative Lock In.</span></div>
						<p class="footer-note"><strong>Media disclaimer:</strong> By attending or submitting this request, you grant Freegame Productions, The Girls Room, event partners, sponsors, and approved media teams the right to capture, edit, publish, distribute, and use your image, voice, likeness, performances, interviews, and submitted media for event documentation, recap content, marketing, social media, press, sponsorship materials, and future promotional use without additional approval or compensation. All event media rights are reserved by the event organizers.</p>
					</div>

					<div class="checks" id="sponsor">
						<label>Sponsorship interest</label>
						<div class="check-line"><input id="sponsor-check" name="sponsorshipInterest" type="checkbox" value="Yes" /> <span>I am interested in sponsoring, partnering, providing products, food, services, or supporting a creator scholarship.</span></div>
						<div class="two" style="margin-top: 14px;">
							<input name="sponsorName" placeholder="Brand / company name" aria-label="Brand or company name" />
							<select name="sponsorLevel" aria-label="Sponsorship level">
								<option value="">Sponsorship level</option>
								<option>Product / in-kind</option>
								<option>Food & beverage</option>
								<option>Studio session sponsor</option>
								<option>Content sponsor</option>
								<option>Presenting sponsor</option>
							</select>
						</div>
					</div>

					<button class="button" type="submit">Submit request</button>
				</form>
				<p class="footer-note">Freegame Productions will receive each active form submission at freegameproductions@gmail.com, review requests, and follow up with invitation and sponsorship details.</p>
			</aside>
		</main>
	</div>
</body>
</html>`;
}
