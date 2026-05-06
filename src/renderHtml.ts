export function renderHtml() {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>SplitSheet — Music Split Agreements</title>
	<meta
		name="description"
		content="Create clean music split sheets, collect collaborator signatures, and keep ownership details organized."
	/>
	<style>
		:root {
			--ink: #101828;
			--muted: #667085;
			--line: #e4e7ec;
			--bg: #f8fafc;
			--paper: #ffffff;
			--purple: #7c3aed;
			--purple-dark: #5b21b6;
			--pink: #ec4899;
			--cyan: #06b6d4;
			--green: #12b76a;
			--amber: #f59e0b;
			--shadow: 0 24px 80px rgba(16, 24, 40, 0.14);
		}

		* { box-sizing: border-box; }

		body {
			margin: 0;
			font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
			color: var(--ink);
			background:
				radial-gradient(circle at top left, rgba(124, 58, 237, 0.2), transparent 30rem),
				radial-gradient(circle at 85% 8%, rgba(236, 72, 153, 0.16), transparent 24rem),
				linear-gradient(180deg, #ffffff 0%, var(--bg) 45%, #eef2ff 100%);
			min-height: 100vh;
		}

		a { color: inherit; text-decoration: none; }

		.page-shell {
			width: min(1180px, calc(100% - 40px));
			margin: 0 auto;
		}

		.nav {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 24px 0;
		}

		.logo {
			display: inline-flex;
			align-items: center;
			gap: 10px;
			font-weight: 900;
			font-size: 1.35rem;
			letter-spacing: -0.04em;
		}

		.logo-mark {
			width: 40px;
			height: 40px;
			display: grid;
			place-items: center;
			border-radius: 14px;
			color: #fff;
			background: linear-gradient(135deg, var(--purple), var(--pink));
			box-shadow: 0 14px 28px rgba(124, 58, 237, 0.28);
		}

		.nav-links {
			display: flex;
			align-items: center;
			gap: 28px;
			font-size: 0.95rem;
			font-weight: 700;
			color: #475467;
		}

		.button {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 8px;
			border: 0;
			border-radius: 999px;
			padding: 13px 22px;
			font-weight: 800;
			font-size: 0.95rem;
			cursor: pointer;
			transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
		}

		.button:hover { transform: translateY(-2px); }

		.button-primary {
			color: #fff;
			background: linear-gradient(135deg, var(--purple), var(--pink));
			box-shadow: 0 18px 34px rgba(124, 58, 237, 0.26);
		}

		.button-secondary {
			color: var(--ink);
			background: #fff;
			border: 1px solid var(--line);
			box-shadow: 0 12px 30px rgba(16, 24, 40, 0.08);
		}

		.hero {
			display: grid;
			grid-template-columns: 0.95fr 1.05fr;
			gap: 56px;
			align-items: center;
			padding: 54px 0 88px;
		}

		.eyebrow {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			padding: 8px 13px;
			border: 1px solid rgba(124, 58, 237, 0.18);
			border-radius: 999px;
			background: rgba(255, 255, 255, 0.76);
			color: var(--purple-dark);
			font-weight: 800;
			font-size: 0.82rem;
		}

		h1 {
			margin: 22px 0 20px;
			font-size: clamp(3rem, 7vw, 6.5rem);
			line-height: 0.9;
			letter-spacing: -0.075em;
		}

		.gradient-text {
			background: linear-gradient(135deg, var(--purple), var(--pink) 54%, var(--cyan));
			-webkit-background-clip: text;
			background-clip: text;
			color: transparent;
		}

		.hero-copy {
			margin: 0;
			max-width: 620px;
			font-size: 1.18rem;
			line-height: 1.75;
			color: var(--muted);
		}

		.hero-actions {
			display: flex;
			flex-wrap: wrap;
			gap: 14px;
			margin: 32px 0 28px;
		}

		.trust-row {
			display: grid;
			grid-template-columns: repeat(3, minmax(0, 1fr));
			gap: 14px;
			max-width: 520px;
		}

		.trust-card {
			padding: 16px;
			border: 1px solid rgba(228, 231, 236, 0.86);
			border-radius: 20px;
			background: rgba(255,255,255,0.75);
			backdrop-filter: blur(10px);
		}

		.trust-card strong { display: block; font-size: 1.35rem; letter-spacing: -0.04em; }
		.trust-card span { color: var(--muted); font-size: 0.82rem; font-weight: 700; }

		.app-preview {
			position: relative;
			padding: 16px;
			border-radius: 36px;
			background: linear-gradient(135deg, rgba(124,58,237,0.18), rgba(236,72,153,0.2));
			box-shadow: var(--shadow);
		}

		.window {
			overflow: hidden;
			border: 1px solid rgba(255, 255, 255, 0.8);
			border-radius: 28px;
			background: var(--paper);
		}

		.window-bar {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 17px 20px;
			border-bottom: 1px solid var(--line);
			background: rgba(248, 250, 252, 0.9);
		}

		.dots { display: flex; gap: 7px; }
		.dot { width: 11px; height: 11px; border-radius: 50%; background: #f04438; }
		.dot:nth-child(2) { background: #fdb022; }
		.dot:nth-child(3) { background: #12b76a; }
		.status-pill { border-radius: 999px; padding: 7px 12px; background: #ecfdf3; color: #027a48; font-size: 0.78rem; font-weight: 900; }

		.sheet-card { padding: 24px; }
		.sheet-header { display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; margin-bottom: 22px; }
		.sheet-title strong { display: block; font-size: 1.35rem; letter-spacing: -0.04em; }
		.sheet-title span { color: var(--muted); font-weight: 700; font-size: 0.9rem; }
		.percent-badge { display: grid; place-items: center; width: 82px; height: 82px; border-radius: 26px; color: #fff; background: linear-gradient(135deg, var(--purple), var(--cyan)); font-weight: 950; font-size: 1.45rem; }

		.collaborator-list { display: grid; gap: 12px; }
		.collaborator { display: grid; grid-template-columns: auto 1fr auto; gap: 14px; align-items: center; padding: 14px; border: 1px solid var(--line); border-radius: 18px; background: #fff; }
		.avatar { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 15px; color: #fff; font-weight: 900; background: linear-gradient(135deg, #111827, #475467); }
		.person strong { display: block; }
		.person span { color: var(--muted); font-size: 0.84rem; font-weight: 700; }
		.split { min-width: 62px; text-align: right; font-weight: 950; font-size: 1.15rem; }
		.progress { margin-top: 22px; height: 12px; border-radius: 999px; background: #f2f4f7; overflow: hidden; }
		.progress span { display: block; width: 100%; height: 100%; background: linear-gradient(90deg, var(--purple), var(--pink), var(--cyan)); }

		.float-card {
			position: absolute;
			right: -18px;
			bottom: 42px;
			width: 210px;
			padding: 18px;
			border: 1px solid rgba(255,255,255,0.72);
			border-radius: 24px;
			background: rgba(255,255,255,0.92);
			box-shadow: 0 20px 60px rgba(16,24,40,0.16);
			backdrop-filter: blur(12px);
		}
		.float-card strong { display: block; margin-bottom: 6px; }
		.float-card span { color: var(--muted); font-size: 0.86rem; line-height: 1.45; }

		.section { padding: 74px 0; }
		.section-heading { max-width: 740px; margin: 0 auto 36px; text-align: center; }
		.section-heading h2 { margin: 0 0 14px; font-size: clamp(2rem, 4vw, 3.4rem); line-height: 1; letter-spacing: -0.06em; }
		.section-heading p { margin: 0; color: var(--muted); font-size: 1.05rem; line-height: 1.7; }

		.features { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
		.feature-card { padding: 28px; border: 1px solid rgba(228,231,236,0.86); border-radius: 28px; background: rgba(255,255,255,0.82); box-shadow: 0 18px 45px rgba(16,24,40,0.06); }
		.icon { display: grid; place-items: center; width: 52px; height: 52px; margin-bottom: 22px; border-radius: 18px; background: #f4ebff; font-size: 1.35rem; }
		.feature-card h3 { margin: 0 0 10px; font-size: 1.2rem; letter-spacing: -0.03em; }
		.feature-card p { margin: 0; color: var(--muted); line-height: 1.65; }

		.builder {
			display: grid;
			grid-template-columns: 0.8fr 1.2fr;
			gap: 26px;
			align-items: stretch;
			padding: 20px;
			border: 1px solid rgba(228,231,236,0.95);
			border-radius: 34px;
			background: rgba(255,255,255,0.78);
			box-shadow: var(--shadow);
		}

		.panel { padding: 26px; border-radius: 26px; background: #fff; }
		.panel.dark { color: #fff; background: linear-gradient(145deg, #1f1147, #5b21b6 55%, #be185d); }
		.panel h3 { margin: 0 0 12px; font-size: 1.6rem; letter-spacing: -0.04em; }
		.panel p { margin: 0 0 24px; color: rgba(255,255,255,0.78); line-height: 1.7; }
		.check-list { display: grid; gap: 14px; margin: 0; padding: 0; list-style: none; }
		.check-list li { display: flex; align-items: center; gap: 10px; font-weight: 800; }
		.check { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: rgba(255,255,255,0.18); }

		.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
		.field { display: grid; gap: 7px; }
		.field.full { grid-column: 1 / -1; }
		label { color: #344054; font-size: 0.82rem; font-weight: 900; }
		input, select { width: 100%; border: 1px solid var(--line); border-radius: 16px; padding: 13px 14px; color: var(--ink); background: #fff; font: inherit; font-weight: 650; outline: none; }
		input:focus, select:focus { border-color: rgba(124,58,237,0.5); box-shadow: 0 0 0 4px rgba(124,58,237,0.11); }

		.split-table { margin-top: 20px; overflow: hidden; border: 1px solid var(--line); border-radius: 20px; }
		.split-row { display: grid; grid-template-columns: 1.2fr 0.8fr 0.5fr; gap: 12px; padding: 13px 16px; align-items: center; border-bottom: 1px solid var(--line); }
		.split-row:last-child { border-bottom: 0; }
		.split-row.header { color: #667085; background: #f9fafb; font-size: 0.78rem; font-weight: 950; text-transform: uppercase; letter-spacing: 0.08em; }
		.role { color: var(--muted); font-weight: 700; }
		.value { font-weight: 950; }

		.cta { margin: 70px 0 38px; padding: 50px; border-radius: 36px; color: #fff; text-align: center; background: linear-gradient(135deg, #111827, #5b21b6 58%, #db2777); box-shadow: var(--shadow); }
		.cta h2 { margin: 0 0 12px; font-size: clamp(2rem, 4vw, 3.35rem); letter-spacing: -0.06em; }
		.cta p { margin: 0 auto 28px; max-width: 640px; color: rgba(255,255,255,0.78); line-height: 1.7; }
		.cta .button { background: #fff; color: #3b0764; }

		.footer { display: flex; justify-content: space-between; gap: 20px; padding: 36px 0 46px; color: var(--muted); font-weight: 700; }

		@media (max-width: 900px) {
			.nav-links { display: none; }
			.hero, .builder { grid-template-columns: 1fr; }
			.features, .trust-row { grid-template-columns: 1fr; }
			.float-card { position: static; width: auto; margin-top: 16px; }
		}

		@media (max-width: 560px) {
			.page-shell { width: min(100% - 28px, 1180px); }
			.hero { padding-top: 28px; }
			.form-grid, .split-row { grid-template-columns: 1fr; }
			.cta { padding: 34px 22px; }
			.footer { flex-direction: column; }
		}
	</style>
</head>
<body>
	<div class="page-shell">
		<nav class="nav" aria-label="Main navigation">
			<a class="logo" href="#top" aria-label="SplitSheet home">
				<span class="logo-mark">S</span>
				<span>SplitSheet</span>
			</a>
			<div class="nav-links">
				<a href="#features">Features</a>
				<a href="#builder">Builder</a>
				<a href="#pricing">Pricing</a>
			</div>
			<a class="button button-secondary" href="#builder">Create sheet</a>
		</nav>

		<main id="top">
			<section class="hero" aria-labelledby="hero-title">
				<div>
					<span class="eyebrow">♪ Built for creators, producers & labels</span>
					<h1 id="hero-title">Split royalties <span class="gradient-text">without the chaos.</span></h1>
					<p class="hero-copy">
						Draft studio-ready split sheets, capture each collaborator's ownership percentage, and keep every signature in one polished place before the song leaves the room.
					</p>
					<div class="hero-actions">
						<a class="button button-primary" href="#builder">Start a split sheet →</a>
						<a class="button button-secondary" href="#features">See how it works</a>
					</div>
					<div class="trust-row" aria-label="SplitSheet stats">
						<div class="trust-card"><strong>100%</strong><span>ownership checks</span></div>
						<div class="trust-card"><strong>3 min</strong><span>average setup</span></div>
						<div class="trust-card"><strong>24/7</strong><span>cloud access</span></div>
					</div>
				</div>

				<div class="app-preview" aria-label="Split sheet application preview">
					<div class="window">
						<div class="window-bar">
							<div class="dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
							<span class="status-pill">Ready for signature</span>
						</div>
						<div class="sheet-card">
							<div class="sheet-header">
								<div class="sheet-title">
									<strong>Midnight Session</strong>
									<span>Master split • ISRC pending</span>
								</div>
								<div class="percent-badge">100%</div>
							</div>
							<div class="collaborator-list">
								<div class="collaborator"><span class="avatar">AR</span><span class="person"><strong>Aria Rivers</strong><span>Songwriter / Vocalist</span></span><span class="split">40%</span></div>
								<div class="collaborator"><span class="avatar">MK</span><span class="person"><strong>Mika Keys</strong><span>Producer</span></span><span class="split">35%</span></div>
								<div class="collaborator"><span class="avatar">JD</span><span class="person"><strong>Jules Day</strong><span>Composer</span></span><span class="split">25%</span></div>
							</div>
							<div class="progress" aria-hidden="true"><span></span></div>
						</div>
					</div>
					<div class="float-card">
						<strong>Auto-balanced splits</strong>
						<span>Spot missing ownership before anyone signs.</span>
					</div>
				</div>
			</section>

			<section class="section" id="features" aria-labelledby="features-title">
				<div class="section-heading">
					<h2 id="features-title">Everything a clean split needs.</h2>
					<p>Replace scattered notes, text threads, and mystery percentages with a focused workflow that makes collaborators confident.</p>
				</div>
				<div class="features">
					<article class="feature-card"><div class="icon">✍️</div><h3>Fast agreements</h3><p>Add the track, roles, publishers, PRO details, and master/publishing percentages from any device.</p></article>
					<article class="feature-card"><div class="icon">🧮</div><h3>Percentage guardrails</h3><p>Built-in totals help ensure the sheet reaches exactly 100% before you circulate it for approval.</p></article>
					<article class="feature-card"><div class="icon">🔐</div><h3>Signature trail</h3><p>Keep timestamps, signer names, and agreement status together so the final record is easy to find.</p></article>
				</div>
			</section>

			<section class="section" id="builder" aria-labelledby="builder-title">
				<div class="section-heading">
					<h2 id="builder-title">Build a shareable split sheet.</h2>
					<p>Use the demo builder to preview the kind of structured agreement SplitSheet creates for each song.</p>
				</div>
				<div class="builder">
					<div class="panel dark">
						<h3>From session idea to signed record.</h3>
						<p>Capture contribution details while the session is still fresh, then export a beautiful, collaborator-ready summary.</p>
						<ul class="check-list">
							<li><span class="check">✓</span> Song metadata</li>
							<li><span class="check">✓</span> Collaborator roles</li>
							<li><span class="check">✓</span> Master and publishing splits</li>
							<li><span class="check">✓</span> Signature status</li>
						</ul>
					</div>
					<div class="panel">
						<form class="form-grid">
							<div class="field full"><label for="song">Song title</label><input id="song" value="Midnight Session" /></div>
							<div class="field"><label for="artist">Primary artist</label><input id="artist" value="Aria Rivers" /></div>
							<div class="field"><label for="status">Status</label><select id="status"><option>Ready for signature</option><option>Draft</option><option>Completed</option></select></div>
						</form>
						<div class="split-table" aria-label="Example split rows">
							<div class="split-row header"><span>Collaborator</span><span>Role</span><span>Split</span></div>
							<div class="split-row"><strong>Aria Rivers</strong><span class="role">Writer / Vocal</span><span class="value">40%</span></div>
							<div class="split-row"><strong>Mika Keys</strong><span class="role">Producer</span><span class="value">35%</span></div>
							<div class="split-row"><strong>Jules Day</strong><span class="role">Composer</span><span class="value">25%</span></div>
						</div>
					</div>
				</div>
			</section>

			<section class="cta" id="pricing" aria-labelledby="cta-title">
				<h2 id="cta-title">Make the split official before release day.</h2>
				<p>Launch a professional split workflow for every track, keep collaborators aligned, and avoid ownership surprises later.</p>
				<a class="button" href="#builder">Create your first split sheet</a>
			</section>
		</main>

		<footer class="footer">
			<span>© 2026 SplitSheet. All rights reserved.</span>
			<span>Agreements • Signatures • Royalty clarity</span>
		</footer>
	</div>
</body>
</html>`;
}
