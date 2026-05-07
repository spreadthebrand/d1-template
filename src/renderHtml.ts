export type SubmissionView = {
	name?: string;
	email?: string;
	role?: string;
	social?: string;
	notes?: string;
	fileName?: string;
	sponsorshipInterest?: string;
	mediaConsent?: string;
	sponsorName?: string;
	sponsorLevel?: string;
};

export type EmailStatus = "sent" | "sent-to-dashboard" | "failed";

export type SubmissionStatus =
	| { kind: "success"; email: EmailStatus }
	| { kind: "error"; missingFields?: string[]; database?: "failed" };

const defaultOrganizerEmail = "freegameproductions@gmail.com";

const escapeHtml = (value = "") =>
	value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");

const selected = (current: string | undefined, value: string) => (current === value ? " selected" : "");
const checked = (value?: string) => (value === "Yes" ? " checked" : "");

const submissionNotice = (submission?: SubmissionView, status?: SubmissionStatus, organizerEmail = defaultOrganizerEmail) => {
	if (!submission || !status) return "";

	const name = escapeHtml(submission.name);
	const email = escapeHtml(submission.email);
	const role = escapeHtml(submission.role || "creative");
	const fileName = escapeHtml(submission.fileName || "No file attached");
	const sponsorship = escapeHtml(submission.sponsorshipInterest || "No");
	const mediaConsent = escapeHtml(submission.mediaConsent || "No");

	if (status.kind === "success") {
		const emailMessage =
			status.email === "sent-to-dashboard"
				? "The form was also sent to the FlowForm/FoxFlow dashboard with the uploaded file attached when supported by your plan."
				: status.email === "sent"
					? `The form was also forwarded to <strong>${organizerEmail}</strong> with the uploaded file attached when supported by the provider.`
					: `Your request was saved, but the form provider did not confirm delivery. Please also email <strong>${organizerEmail}</strong> so nothing is missed.`;

		return `<div class="notice ${status.email === "failed" ? "warning" : "success"}" role="status">
			<strong>Thank you${name ? `, ${name}` : ""}!</strong>
			<span>Your request has been received. ${emailMessage}</span>
			<small>Email: ${email || "provided"} · Lane: ${role} · Upload: ${fileName} · Sponsorship: ${sponsorship} · Media consent: ${mediaConsent}</small>
		</div>`;
	}

	const details = status.missingFields?.length
		? `Please complete: ${escapeHtml(status.missingFields.join(", "))}.`
		: "The request could not be saved right now. Please try again or email Freegame Productions directly.";

	return `<div class="notice error" role="alert">
		<strong>Almost there.</strong>
		<span>${details}</span>
	</div>`;
};

export function renderHtml(submission?: SubmissionView, status?: SubmissionStatus, organizerEmail = defaultOrganizerEmail) {
	const name = escapeHtml(submission?.name);
	const email = escapeHtml(submission?.email);
	const role = submission?.role;
	const sponsorshipInterest = checked(submission?.sponsorshipInterest);
	const mediaConsent = checked(submission?.mediaConsent);

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta name="description" content="Request an invitation, upload creative samples, and share sponsorship interest for The Girls Room Creative Lock In in Houston, Texas." />
	<title>The Girls Room Creative Lock In | Houston, TX</title>
	<style>
		:root {
			color-scheme: dark;
			--ink: #170d10;
			--espresso: #261514;
			--merlot: #5a1f32;
			--rose: #f4a7bd;
			--rose-deep: #d75f91;
			--cream: #fff5ee;
			--champagne: #dfbd85;
			--sage: #a8b487;
			--glass: rgba(255, 245, 238, 0.11);
			--line: rgba(255, 245, 238, 0.22);
			--shadow: rgba(0, 0, 0, 0.42);
			font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
		}

		* { box-sizing: border-box; }
		html { scroll-behavior: smooth; }
		body {
			margin: 0;
			min-height: 100vh;
			background:
				radial-gradient(circle at 12% 10%, rgba(244, 167, 189, .30), transparent 30rem),
				radial-gradient(circle at 92% 8%, rgba(223, 189, 133, .20), transparent 26rem),
				linear-gradient(130deg, rgba(23, 13, 16, .92), rgba(38, 21, 20, .94)),
				url("https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1800&q=80");
			background-attachment: fixed;
			background-position: center;
			background-size: cover;
			color: var(--cream);
		}
		body::before {
			content: "";
			position: fixed;
			inset: 0;
			pointer-events: none;
			background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px);
			background-size: 70px 70px;
			mask-image: linear-gradient(to bottom, rgba(0,0,0,.6), transparent 76%);
		}
		a { color: inherit; }
		.page { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 24px 0 48px; }
		.nav { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 14px 0 34px; position: relative; z-index: 1; }
		.brand { display: inline-flex; align-items: center; gap: 12px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; font-size: .78rem; color: rgba(255,245,238,.82); }
		.mark { width: 42px; height: 42px; display: grid; place-items: center; border-radius: 50%; border: 1px solid var(--line); background: rgba(255,245,238,.1); color: var(--rose); font-family: Georgia, serif; letter-spacing: 0; box-shadow: 0 0 40px rgba(244,167,189,.22); }
		.nav-links { display: flex; flex-wrap: wrap; gap: 12px; font-size: .76rem; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,245,238,.74); }
		.nav-links a { border: 1px solid transparent; border-radius: 999px; padding: 9px 12px; text-decoration: none; }
		.nav-links a:hover { border-color: var(--line); background: rgba(255,245,238,.08); }
		.hero { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(330px, .95fr); gap: 28px; align-items: start; }
		.card { border: 1px solid var(--line); background: linear-gradient(145deg, rgba(23,13,16,.86), rgba(38,21,20,.74)); box-shadow: 0 28px 90px var(--shadow); backdrop-filter: blur(18px); border-radius: 32px; overflow: hidden; position: relative; z-index: 1; }
		.hero-copy { padding: clamp(28px, 5vw, 58px); min-height: 760px; }
		.eyebrow { display: inline-flex; align-items: center; gap: 10px; color: var(--rose); letter-spacing: .34em; text-transform: uppercase; font-size: .78rem; font-weight: 900; }
		.eyebrow::before, .eyebrow::after { content: ""; width: 34px; height: 1px; background: var(--rose); }
		h1 { font-family: Georgia, "Times New Roman", serif; font-size: clamp(4rem, 11vw, 8.7rem); line-height: .82; letter-spacing: -.07em; margin: 28px 0 18px; font-weight: 400; text-wrap: balance; }
		h1 em { display: block; color: var(--cream); font-style: italic; text-shadow: 0 14px 40px rgba(0,0,0,.5); }
		.tagline { color: var(--rose); letter-spacing: .19em; text-transform: uppercase; font-size: .92rem; font-weight: 900; margin: 0 0 22px; }
		.description { max-width: 640px; font-family: Georgia, serif; font-size: clamp(1.1rem, 2.2vw, 1.55rem); font-style: italic; line-height: 1.58; color: rgba(255,245,238,.84); }
		.event-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin: 36px 0; border: 1px solid var(--line); background: var(--line); border-radius: 22px; overflow: hidden; }
		.detail { background: rgba(255,245,238,.07); padding: 20px; }
		.detail span { display: block; color: var(--rose); text-transform: uppercase; letter-spacing: .22em; font-size: .74rem; font-weight: 900; margin-bottom: 8px; }
		.detail strong { display: block; font-size: .98rem; line-height: 1.45; }
		.pill-row { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 34px; }
		.pill { border: 1px solid rgba(244,167,189,.38); border-radius: 999px; padding: 10px 14px; background: rgba(244,167,189,.09); color: rgba(255,245,238,.88); font-size: .88rem; }
		.cta-row { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
		.button { display: inline-flex; align-items: center; justify-content: center; gap: 10px; border: 0; border-radius: 999px; padding: 14px 22px; background: linear-gradient(135deg, var(--rose), var(--rose-deep)); color: #2a121b; font-weight: 900; text-decoration: none; box-shadow: 0 18px 50px rgba(216,100,145,.34); cursor: pointer; }
		.button:hover { transform: translateY(-1px); }
		.secondary { background: rgba(255,245,238,.09); color: var(--cream); border: 1px solid var(--line); box-shadow: none; }
		.photo-strip { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 34px; }
		.photo { min-height: 150px; border-radius: 24px; border: 1px solid var(--line); background-size: cover; background-position: center; position: relative; overflow: hidden; }
		.photo::after { content: attr(data-label); position: absolute; left: 14px; bottom: 14px; padding: 8px 11px; border-radius: 999px; background: rgba(23,13,16,.65); border: 1px solid var(--line); font-size: .72rem; text-transform: uppercase; letter-spacing: .13em; }
		.photo.one { background-image: linear-gradient(rgba(23,13,16,.24), rgba(23,13,16,.58)), url("https://images.unsplash.com/photo-1524650359799-842906ca1c06?auto=format&fit=crop&w=900&q=80"); }
		.photo.two { background-image: linear-gradient(rgba(23,13,16,.16), rgba(23,13,16,.58)), url("https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80"); }
		.form-card { padding: clamp(24px, 4vw, 38px); }
		h2 { font-family: Georgia, serif; font-size: clamp(2.2rem, 4vw, 3.2rem); line-height: .95; margin: 0 0 12px; font-weight: 400; }
		.form-card p { color: rgba(255,245,238,.72); line-height: 1.65; margin-top: 0; }
		.notice { border: 1px solid rgba(168,180,135,.56); background: rgba(168,180,135,.16); border-radius: 20px; padding: 16px; margin: 0 0 20px; display: grid; gap: 8px; line-height: 1.45; }
		.notice strong { color: #e7f1d5; }
		.notice small { color: rgba(255,245,238,.72); }
		.notice.warning { border-color: rgba(223,189,133,.64); background: rgba(223,189,133,.15); }
		.notice.error { border-color: rgba(244,167,189,.66); background: rgba(90,31,50,.36); }
		form { display: grid; gap: 15px; }
		.field { display: grid; gap: 8px; }
		label, .label { font-size: .78rem; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,245,238,.78); }
		input, select, textarea { width: 100%; border: 1px solid var(--line); border-radius: 16px; background: rgba(255,245,238,.09); color: var(--cream); padding: 14px 15px; font: inherit; outline: none; }
		input:focus, select:focus, textarea:focus { border-color: rgba(244,167,189,.72); box-shadow: 0 0 0 4px rgba(244,167,189,.14); }
		select option { color: var(--ink); }
		textarea { min-height: 104px; resize: vertical; }
		input::placeholder, textarea::placeholder { color: rgba(255,245,238,.42); }
		input::file-selector-button { border: 0; border-radius: 999px; background: var(--cream); color: var(--ink); font-weight: 800; padding: 9px 12px; margin-right: 12px; }
		.two { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
		.checks { border: 1px solid var(--line); border-radius: 20px; padding: 16px; background: rgba(255,245,238,.06); }
		.check-line { display: flex; align-items: flex-start; gap: 11px; margin-top: 10px; color: rgba(255,245,238,.82); line-height: 1.5; }
		.check-line input { width: auto; margin-top: 5px; accent-color: var(--rose); }
		.footer-note { margin: 18px 0 0; font-size: .86rem; color: rgba(255,245,238,.62); }
		@media (max-width: 900px) { .hero { grid-template-columns: 1fr; } .hero-copy { min-height: auto; } .event-grid { grid-template-columns: 1fr; } .nav { align-items: flex-start; flex-direction: column; } }
		@media (max-width: 620px) { .page { width: min(100% - 22px, 1180px); padding-top: 14px; } .two, .photo-strip { grid-template-columns: 1fr; } h1 { font-size: clamp(3.45rem, 22vw, 5rem); } .nav-links { font-size: .68rem; gap: 8px; } .hero-copy, .form-card { border-radius: 24px; } }
	</style>
</head>
<body>
	<div class="page">
		<nav class="nav" aria-label="Event navigation">
			<div class="brand"><span class="mark">GR</span><span>The Girls Room</span></div>
			<div class="nav-links">
				<a href="#details">Details</a>
				<a href="#apply">Apply</a>
				<a href="#sponsor">Sponsor</a>
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
					<a class="button secondary" href="mailto:${organizerEmail}">Email Freegame</a>
				</div>

				<div class="photo-strip" aria-label="Creative event inspiration photos">
					<div class="photo one" data-label="Collaborate"></div>
					<div class="photo two" data-label="Create"></div>
				</div>
			</section>

			<aside class="card form-card" id="apply">
				${submissionNotice(submission, status, organizerEmail)}
				<h2>Request your invitation</h2>
				<p>This active form saves requests to the event database and forwards the details to the connected form provider. Uploads are sent with the submission when the provider endpoint and plan support file attachments.</p>

				<form method="POST" enctype="multipart/form-data">
					<div class="two">
						<div class="field">
							<label for="name">Full name</label>
							<input id="name" name="name" autocomplete="name" required placeholder="Your name" value="${name}" />
						</div>
						<div class="field">
							<label for="email">Email</label>
							<input id="email" name="email" type="email" autocomplete="email" required placeholder="you@example.com" value="${email}" />
						</div>
					</div>

					<div class="two">
						<div class="field">
							<label for="role">Creative lane</label>
							<select id="role" name="role" required>
								<option value="">Select one</option>
								<option${selected(role, "Artist / Songwriter")}>Artist / Songwriter</option>
								<option${selected(role, "Producer")}>Producer</option>
								<option${selected(role, "DJ")}>DJ</option>
								<option${selected(role, "Engineer")}>Engineer</option>
								<option${selected(role, "Photographer / Videographer")}>Photographer / Videographer</option>
								<option${selected(role, "Content Creator")}>Content Creator</option>
								<option${selected(role, "Brand / Sponsor")}>Brand / Sponsor</option>
							</select>
						</div>
						<div class="field">
							<label for="social">Instagram / website</label>
							<input id="social" name="social" placeholder="@yourhandle" value="${escapeHtml(submission?.social)}" />
						</div>
					</div>

					<div class="field">
						<label for="upload">Upload sample, EPK, flyer or portfolio</label>
						<input id="upload" name="upload" type="file" accept="image/*,.pdf" />
					</div>

					<div class="field">
						<label for="notes">What do you want to create in the room?</label>
						<textarea id="notes" name="notes" placeholder="Share your collaboration idea, goals, or what you can contribute.">${escapeHtml(submission?.notes)}</textarea>
					</div>

					<div class="checks">
						<div class="label">Media release & recording consent</div>
						<div class="check-line"><input id="media-consent" name="mediaConsent" type="checkbox" value="Yes" required${mediaConsent} /> <label for="media-consent">I agree to be photographed, filmed, livestreamed, and/or recorded at The Girls Room Creative Lock In.</label></div>
						<p class="footer-note"><strong>Media disclaimer:</strong> By attending or submitting this request, you grant Freegame Productions, The Girls Room, event partners, sponsors, and approved media teams the right to capture, edit, publish, distribute, and use your image, voice, likeness, performances, interviews, and submitted media for event documentation, recap content, marketing, social media, press, sponsorship materials, and future promotional use without additional approval or compensation. All event media rights are reserved by the event organizers.</p>
					</div>

					<div class="checks" id="sponsor">
						<div class="label">Sponsorship interest</div>
						<div class="check-line"><input id="sponsor-check" name="sponsorshipInterest" type="checkbox" value="Yes"${sponsorshipInterest} /> <label for="sponsor-check">I am interested in sponsoring, partnering, providing products, food, services, or supporting a creator scholarship.</label></div>
						<div class="two" style="margin-top: 14px;">
							<input name="sponsorName" placeholder="Brand / company name" aria-label="Brand or company name" value="${escapeHtml(submission?.sponsorName)}" />
							<select name="sponsorLevel" aria-label="Sponsorship level">
								<option value="">Sponsorship level</option>
								<option${selected(submission?.sponsorLevel, "Product / in-kind")}>Product / in-kind</option>
								<option${selected(submission?.sponsorLevel, "Food & beverage")}>Food & beverage</option>
								<option${selected(submission?.sponsorLevel, "Studio session sponsor")}>Studio session sponsor</option>
								<option${selected(submission?.sponsorLevel, "Content sponsor")}>Content sponsor</option>
								<option${selected(submission?.sponsorLevel, "Presenting sponsor")}>Presenting sponsor</option>
							</select>
						</div>
					</div>

					<button class="button" type="submit">Submit request</button>
				</form>
				<p class="footer-note">For FlowForm/FoxFlow dashboard delivery, set a FLOWFORM_TOKEN or FLOWFORM_ENDPOINT secret on the Worker. If the form provider is not verified yet, this page still saves the request and asks applicants to email ${organizerEmail} directly as a backup.</p>
			</aside>
		</main>
	</div>
</body>
</html>`;
}
