type RenderOptions = {
	showAccount?: boolean;
};

export function renderHtml(options: RenderOptions = {}) {
	const initialView = options.showAccount ? "account" : "builder";
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
	<meta name="theme-color" content="#7c3aed" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<title>SplitSheet — Build Music Split Agreements</title>
	<meta name="description" content="Create editable music split sheets, calculate collaborator percentages, and upgrade to Pro when your free sheets are used." />
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
			--red: #f04438;
			--amber: #f59e0b;
			--shadow: 0 24px 80px rgba(16, 24, 40, 0.14);
		}

		* { box-sizing: border-box; }
		body {
			margin: 0;
			font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
			color: var(--ink);
			background:
				radial-gradient(circle at 8% 2%, rgba(124, 58, 237, 0.18), transparent 29rem),
				radial-gradient(circle at 86% 0%, rgba(236, 72, 153, 0.16), transparent 24rem),
				linear-gradient(180deg, #fff 0%, var(--bg) 45%, #eef2ff 100%);
			min-height: 100vh;
		}
		a { color: inherit; text-decoration: none; }
		button, input, select { font: inherit; }
		input, select, textarea { font-size: 16px; }
		button { cursor: pointer; }
		.shell { width: min(1440px, calc(100% - 36px)); margin: 0 auto; }
		.nav { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 14px 0; background: rgba(255,255,255,.82); backdrop-filter: blur(16px); }
		.logo { display: inline-flex; align-items: center; gap: 10px; font-size: 1.34rem; font-weight: 950; letter-spacing: -0.04em; }
		.logo-mark { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 15px; color: #fff; background: linear-gradient(135deg, var(--purple), var(--pink)); box-shadow: 0 14px 28px rgba(124,58,237,0.28); }
		.nav-links { display: flex; align-items: center; gap: 12px; color: #475467; font-weight: 800; }
		.nav-link { border: 0; border-radius: 999px; padding: 10px 14px; color: inherit; background: transparent; font-weight: 850; }
		.nav-link.active, .nav-link:hover { color: var(--purple-dark); background: #f4ebff; }
		.button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 0; border-radius: 999px; padding: 12px 18px; font-weight: 900; transition: transform .2s ease, box-shadow .2s ease; }
		.button:hover { transform: translateY(-1px); }
		.button-primary { color: #fff; background: linear-gradient(135deg, var(--purple), var(--pink)); box-shadow: 0 16px 32px rgba(124,58,237,.25); }
		.button-secondary { color: var(--ink); background: #fff; border: 1px solid var(--line); box-shadow: 0 10px 24px rgba(16,24,40,.06); }
		.button-danger { color: #b42318; background: #fef3f2; border: 1px solid #fecdca; }
		.hero { display: grid; grid-template-columns: 1fr; gap: 24px; align-items: stretch; padding: 26px 0 34px; }
		.hero-intro { max-width: 860px; }
		.eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 8px 13px; border: 1px solid rgba(124,58,237,.18); border-radius: 999px; background: rgba(255,255,255,.76); color: var(--purple-dark); font-size: .82rem; font-weight: 900; }
		h1 { margin: 20px 0 18px; font-size: clamp(2.7rem, 6.2vw, 5.7rem); line-height: .91; letter-spacing: -.075em; }
		.gradient { background: linear-gradient(135deg, var(--purple), var(--pink) 58%, var(--cyan)); -webkit-background-clip: text; background-clip: text; color: transparent; }
		.hero-copy { margin: 0; color: var(--muted); font-size: 1.12rem; line-height: 1.72; }
		.hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
		.stat-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 22px; }
		.stat { padding: 15px; border: 1px solid rgba(228,231,236,.86); border-radius: 20px; background: rgba(255,255,255,.76); }
		.stat strong { display: block; font-size: 1.28rem; letter-spacing: -.04em; }
		.stat span { color: var(--muted); font-size: .8rem; font-weight: 800; }
		.card { border: 1px solid rgba(228,231,236,.92); border-radius: 30px; background: rgba(255,255,255,.88); box-shadow: var(--shadow); }
		.app-card { overflow: hidden; }
		.mobile-helper { display: none; color: var(--muted); font-size: .86rem; font-weight: 800; line-height: 1.5; }
		.app-topbar { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 18px 20px; border-bottom: 1px solid var(--line); background: rgba(249,250,251,.9); }
		.badge { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 7px 11px; color: #027a48; background: #ecfdf3; font-size: .78rem; font-weight: 950; }
		.badge.warn { color: #b54708; background: #fffaeb; }
		.badge.pro { color: #fff; background: linear-gradient(135deg, var(--purple), var(--pink)); }
		.workspace { display: grid; grid-template-columns: 280px minmax(0, 1fr); min-height: 590px; }
		.sidebar { min-width: 0; padding: 18px; border-right: 1px solid var(--line); background: #fbfcff; }
		.sidebar-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
		.sidebar-head h2, .panel h2 { margin: 0; font-size: 1.15rem; letter-spacing: -.035em; }
		.sheet-list { display: grid; gap: 10px; }
		.sheet-item { width: 100%; text-align: left; border: 1px solid var(--line); border-radius: 18px; padding: 13px; background: #fff; }
		.sheet-item.active { border-color: rgba(124,58,237,.45); box-shadow: 0 0 0 4px rgba(124,58,237,.09); }
		.sheet-item strong { display: block; margin-bottom: 4px; overflow-wrap: anywhere; }
		.sheet-item span { display: block; color: var(--muted); font-size: .78rem; font-weight: 800; overflow-wrap: anywhere; }
		.free-meter { margin-top: 16px; padding: 14px; border-radius: 18px; background: #f4ebff; color: #4c1d95; font-weight: 800; line-height: 1.5; }
		.panel { min-width: 0; padding: 22px; }
		.editor-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; margin-top: 18px; }
		.field { display: grid; gap: 7px; }
		.field.full { grid-column: 1 / -1; }
		.field.double { grid-column: span 2; }
		label { color: #344054; font-size: .8rem; font-weight: 950; }
		input, select { width: 100%; border: 1px solid var(--line); border-radius: 14px; padding: 11px 12px; color: var(--ink); background: #fff; font-weight: 700; outline: none; }
		input:focus, select:focus { border-color: rgba(124,58,237,.5); box-shadow: 0 0 0 4px rgba(124,58,237,.11); }
		.collab-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin: 24px 0 12px; }
		.split-tools { display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 14px; padding: 12px; border: 1px solid var(--line); border-radius: 18px; background: #fbfcff; }
		.signature-tools { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 12px 0 0; padding: 12px; border: 1px dashed rgba(124,58,237,.35); border-radius: 16px; background: #f8f5ff; }
		.signature-tools .field { flex: 1 1 220px; }
		.signature-stamp { color: #4c1d95; font-size: .82rem; font-weight: 900; }
		.tool-note { flex: 1 1 260px; color: var(--muted); font-size: .86rem; font-weight: 750; line-height: 1.45; }
		.collab-table { display: grid; gap: 12px; }
		.collab-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; align-items: end; padding: 14px; border: 1px solid var(--line); border-radius: 18px; background: #fff; }
		.remove { width: 100%; min-width: 42px; height: 42px; border: 0; border-radius: 12px; color: #b42318; background: #fef3f2; font-weight: 950; }
		.totals { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 12px; margin-top: 18px; }
		.total-card { padding: 16px; border: 1px solid var(--line); border-radius: 18px; background: #fff; }
		.total-card strong { display: block; font-size: 1.45rem; letter-spacing: -.05em; }
		.total-card span { color: var(--muted); font-weight: 800; font-size: .82rem; }
		.total-card.good { border-color: #abefc6; background: #f6fef9; }
		.total-card.bad { border-color: #fecdca; background: #fffbfa; }
		.status-line { min-height: 22px; margin-top: 14px; color: var(--muted); font-weight: 800; }
		.feature-section { padding: 72px 0; }
		.section-heading { max-width: 760px; margin: 0 auto 28px; text-align: center; }
		.section-heading h2 { margin: 0 0 12px; font-size: clamp(2rem, 4vw, 3.2rem); line-height: 1; letter-spacing: -.06em; }
		.section-heading p { margin: 0; color: var(--muted); line-height: 1.65; }
		.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap: 16px; }
		.feature { padding: 22px; border: 1px solid rgba(228,231,236,.86); border-radius: 24px; background: rgba(255,255,255,.82); box-shadow: 0 16px 38px rgba(16,24,40,.06); }
		.feature b { display: block; margin: 14px 0 8px; font-size: 1.06rem; }
		.feature p { margin: 0; color: var(--muted); line-height: 1.58; }
		.account-view { display: none; padding: 34px 0 80px; }
		.account-card { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; padding: 22px; }
		.account-box { padding: 22px; border-radius: 24px; background: #fff; border: 1px solid var(--line); }
		.account-box h2 { margin: 0 0 10px; }
		.account-box p { margin: 0 0 18px; color: var(--muted); line-height: 1.65; }
		.modal-backdrop { position: fixed; inset: 0; display: none; place-items: center; padding: 20px; background: rgba(15,23,42,.56); z-index: 30; }
		.modal { width: min(540px, 100%); padding: 28px; border-radius: 30px; background: #fff; box-shadow: 0 24px 90px rgba(0,0,0,.24); }
		.modal h2 { margin: 0 0 10px; font-size: 2rem; letter-spacing: -.05em; }
		.modal p { margin: 0 0 18px; color: var(--muted); line-height: 1.65; }
		.price { display: flex; align-items: baseline; gap: 8px; margin: 16px 0; }
		.price strong { font-size: 2.5rem; letter-spacing: -.06em; }
		.modal-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; margin-top: 22px; }
		.helper-text { color: var(--muted); font-size: .78rem; font-weight: 750; line-height: 1.35; }
		.toast { position: fixed; left: 50%; bottom: 18px; transform: translateX(-50%); display: none; max-width: min(560px, calc(100% - 28px)); padding: 13px 16px; border-radius: 999px; color: #fff; background: #101828; font-weight: 850; box-shadow: 0 18px 44px rgba(16,24,40,.22); z-index: 40; }
		.footer { display: flex; justify-content: space-between; gap: 18px; padding: 28px 0 42px; color: var(--muted); font-weight: 800; }
		body[data-view="account"] .main-view { display: none; }
		body[data-view="account"] .account-view { display: block; }

		@media (max-width: 980px) {
			.workspace, .account-card { grid-template-columns: 1fr; }
			.sidebar { border-right: 0; border-bottom: 1px solid var(--line); }
		}
		@media (max-width: 640px) {
			.shell { width: min(100% - 24px, 1440px); }
			.nav { align-items: flex-start; flex-direction: column; }
			h1 { font-size: clamp(2.35rem, 15vw, 4rem); }
			.nav-links { width: 100%; overflow-x: auto; padding-bottom: 4px; }
			.mobile-helper { display: block; }
			.app-card { border-radius: 22px; margin-inline: -4px; }
			.app-topbar { align-items: flex-start; flex-direction: column; }
			.stat-row, .editor-grid, .totals, .features { grid-template-columns: 1fr; }
			.field.double { grid-column: 1 / -1; }
			.collab-row { grid-template-columns: 1fr; padding: 12px; }
			.hero-actions.action-bar { position: sticky; bottom: 0; z-index: 15; margin: 20px -22px -22px; padding: 12px; background: rgba(255,255,255,.94); border-top: 1px solid var(--line); backdrop-filter: blur(12px); }
			.hero-actions.action-bar .button { flex: 1 1 100%; }
			.footer { flex-direction: column; }
		}
	</style>
</head>
<body data-view="${initialView}">
	<div class="shell">
		<nav class="nav" aria-label="Main navigation">
			<a class="logo" href="/" data-view-link="builder" aria-label="SplitSheet home"><span class="logo-mark">S</span><span>SplitSheet</span></a>
			<div class="nav-links">
				<button class="nav-link active" data-view-link="builder" type="button">Builder</button>
				<a class="nav-link" href="#features">Features</a>
				<button class="nav-link" data-view-link="account" type="button">Subscription</button>
				<button class="button button-primary" id="navUpgrade" type="button">Upgrade to Pro</button>
			</div>
		</nav>

		<main class="main-view">
			<section class="hero" aria-labelledby="hero-title">
				<div class="hero-intro">
					<span class="eyebrow">♪ Editable splits, live totals, D1-backed saves</span>
					<h1 id="hero-title">Build the actual <span class="gradient">split sheet.</span></h1>
					<p class="hero-copy">Create song metadata, choose each person's role, capture PRO/IPI/publisher details, auto-equalize or customize master and publishing percentages, and save a clean agreement before release day.</p>
					<div class="hero-actions">
						<button class="button button-primary" id="heroNewSheet" type="button">Create a new sheet →</button>
						<button class="button button-secondary" data-view-link="account" type="button">Manage subscription</button>
					</div>
					<div class="stat-row" aria-label="Plan limits">
						<div class="stat"><strong id="statUsed">0</strong><span>sheets created</span></div>
						<div class="stat"><strong id="statRemaining">2</strong><span>free sheets left</span></div>
						<div class="stat"><strong id="statPlan">Free</strong><span>current plan</span></div>
					</div>
				</div>

				<section class="card app-card" aria-label="Split sheet builder">
					<div class="app-topbar">
						<div><strong>SplitSheet Studio</strong><div class="mobile-helper">Mobile-friendly builder: add people, equalize splits, save, then download a clean copy.</div><div class="status-line" id="saveStatus">Loading your workspace…</div></div>
						<span class="badge" id="planBadge">Free plan</span>
					</div>
					<div class="workspace">
						<aside class="sidebar">
							<div class="sidebar-head"><h2>Your sheets</h2><button class="button button-secondary" id="newSheet" type="button">New</button></div>
							<div class="sheet-list" id="sheetList"></div>
							<div class="free-meter" id="freeMeter">Create 2 sheets for free. Pro unlocks unlimited split sheets.</div>
						</aside>

						<section class="panel" aria-labelledby="editor-title">
							<h2 id="editor-title">Agreement details</h2>
							<div class="editor-grid">
								<div class="field double"><label for="title">Song title</label><input id="title" placeholder="Midnight Session" /></div>
								<div class="field double"><label for="artist">Primary artist</label><input id="artist" placeholder="Aria Rivers" /></div>
								<div class="field"><label for="isrc">ISRC <span class="helper-text">(optional, add later)</span></label><input id="isrc" placeholder="US-ABC-26-00001" /></div>
								<div class="field"><label for="creationDate">Creation date</label><input id="creationDate" type="date" /></div>
								<div class="field"><label for="splitType">Split type</label><select id="splitType"><option value="both">Master + publishing</option><option value="master">Master only</option><option value="publishing">Publishing only</option></select></div>
								<div class="field"><label for="status">Status</label><select id="status"><option value="draft">Draft</option><option value="ready">Ready for signature</option><option value="signed">Fully signed</option></select></div>
							</div>

							<div class="collab-head"><h2>Collaborators</h2><button class="button button-secondary" id="addCollaborator" type="button">+ Add collaborator</button></div>
							<div class="split-tools" aria-label="Split calculation tools">
								<button class="button button-secondary" id="equalBoth" type="button">Equalize both</button>
								<button class="button button-secondary" id="equalMaster" type="button">Equal master</button>
								<button class="button button-secondary" id="equalPublishing" type="button">Equal publishing</button>
								<button class="button button-secondary" id="copyMasterToPublishing" type="button">Copy master → publishing</button>
								<button class="button button-secondary" id="addSavedPerson" type="button">Add saved person</button>
								<span class="tool-note">Use equal splits when everyone agrees to the same share, or edit any percentage manually for custom deals. Totals stay live.</span>
							</div>
							<div class="collab-table" id="collaborators"></div>

							<div class="totals">
								<div class="total-card" id="masterCard"><span>Master total</span><strong id="masterTotal">0%</strong></div>
								<div class="total-card" id="publishingCard"><span>Publishing total</span><strong id="publishingTotal">0%</strong></div>
								<div class="total-card" id="signatureCard"><span>Signed collaborators</span><strong id="signedTotal">0 / 0</strong></div>
							</div>

							<div class="hero-actions action-bar">
								<button class="button button-primary" id="saveSheet" type="button">Save split sheet</button>
								<button class="button button-secondary" id="saveDownloadSheet" type="button">Save + download</button>
								<button class="button button-secondary" id="downloadForSigning" type="button">Download to sign</button>
								<button class="button button-secondary" id="emailForSigning" type="button">Send to sign</button>
								<button class="button button-secondary" id="downloadSheet" type="button">Download finished</button>
								<button class="button button-secondary" id="duplicateSheet" type="button">Duplicate as new</button>
								<button class="button button-danger" id="deleteSheet" type="button">Delete</button>
							</div>
						</section>
					</div>
				</section>
			</section>

			<section class="feature-section" id="features" aria-labelledby="features-title">
				<div class="section-heading">
					<h2 id="features-title">Finished product workflow included.</h2>
					<p>The page now includes the editable split-sheet builder, backend persistence, live calculations, a free-plan limit, Stripe checkout hooks, an upgrade modal, and subscription management.</p>
				</div>
				<div class="features">
					<article class="feature"><span>✅</span><b>2 free sheets</b><p>New sheet creation is blocked after two saved sheets unless the visitor has an active Pro subscription.</p></article>
					<article class="feature"><span>✅</span><b>Stripe subscriptions</b><p>Checkout, Customer Portal, and webhook endpoints are ready for real Stripe secrets and price IDs.</p></article>
					<article class="feature"><span>✅</span><b>Upgrade modal</b><p>The modal appears when users click Upgrade or hit the free-sheet paywall.</p></article>
					<article class="feature"><span>✅</span><b>Management page</b><p>The Subscription view links to Stripe's billing portal when a customer exists.</p></article>
				</div>
			</section>
		</main>

		<section class="account-view" aria-labelledby="account-title">
			<div class="section-heading">
				<h1 id="account-title">Subscription management</h1>
				<p>Review your current plan, open Stripe billing management, or upgrade to Pro for unlimited split sheets.</p>
			</div>
			<div class="card account-card">
				<div class="account-box">
					<h2>Current plan</h2>
					<p id="accountPlanText">Loading subscription…</p>
					<button class="button button-primary" id="accountUpgrade" type="button">Upgrade to Pro</button>
				</div>
				<div class="account-box">
					<h2>Stripe billing portal</h2>
					<p>Manage payment method, invoices, cancellation, and renewal details in Stripe's hosted portal.</p>
					<button class="button button-secondary" id="manageBilling" type="button">Open subscription management</button>
				</div>
			</div>
		</section>

		<footer class="footer">
			<span>© 2026 SplitSheet. Agreements, signatures, royalty clarity.</span>
			<span>D1 + Workers + Stripe-ready subscriptions</span>
		</footer>
	</div>

	<div class="modal-backdrop" id="upgradeModal" role="dialog" aria-modal="true" aria-labelledby="upgradeTitle">
		<div class="modal">
			<span class="badge pro">Upgrade required</span>
			<h2 id="upgradeTitle">Upgrade to Pro</h2>
			<p id="upgradeMessage">You get 2 free split sheets. Upgrade to Pro to create unlimited sheets and manage your subscription in Stripe.</p>
			<div class="price"><strong>$9</strong><span>/ month</span></div>
			<div class="field"><label for="billingEmail">Billing email</label><input id="billingEmail" type="email" placeholder="you@example.com" /></div>
			<div class="modal-actions">
				<button class="button button-secondary" id="closeUpgrade" type="button">Maybe later</button>
				<button class="button button-primary" id="startCheckout" type="button">Continue to Stripe</button>
			</div>
		</div>
	</div>
	<div class="toast" id="toast" role="status" aria-live="polite"></div>

	<script>
		const state = {
			bootstrap: null,
			activeSheetId: null,
			draft: blankSheet(),
		};

		const el = (id) => document.getElementById(id);
		const fields = ['title', 'artist', 'isrc', 'creationDate', 'splitType', 'status'];
		const roleOptions = ['Primary Artist / Performer', 'Featured Artist', 'Songwriter - Lyrics', 'Songwriter - Melody', 'Composer', 'Topliner', 'Producer', 'Co-Producer', 'Beatmaker', 'Instrumentalist', 'Arranger', 'Recording Engineer', 'Mix Engineer', 'Mastering Engineer', 'Publisher', 'Label / Master Owner', 'Sample Owner', 'Manager / Admin'];
		const proOptions = ['ASCAP', 'BMI', 'SESAC', 'GMR', 'AllTrack', 'SOCAN', 'PRS', 'PPL', 'SACEM', 'GEMA', 'APRA AMCOS', 'KODA', 'SIAE', 'SAYCO', 'JASRAC', 'Other / Not sure'];
		const contributionOptions = ['Vocals', 'Lyrics', 'Melody', 'Topline', 'Composition', 'Beat', 'Production', 'Co-production', 'Arrangement', 'Guitar', 'Bass', 'Drums', 'Keys / Piano', 'Strings', 'Horns', 'Sample', 'Recording', 'Mix', 'Master', 'Publishing admin', 'Master owner', 'Other'];

		document.addEventListener('DOMContentLoaded', () => {
			bindEvents();
			loadBootstrap();
		});

		function bindEvents() {
			document.querySelectorAll('[data-view-link]').forEach((button) => {
				button.addEventListener('click', (event) => {
					event.preventDefault();
					setView(button.dataset.viewLink);
				});
			});
			el('newSheet').addEventListener('click', newSheet);
			el('heroNewSheet').addEventListener('click', newSheet);
			el('addCollaborator').addEventListener('click', () => { state.draft.collaborators.push(blankCollaborator()); renderCollaborators(); calculateTotals(); });
			el('addSavedPerson').addEventListener('click', addSavedPerson);
			el('equalBoth').addEventListener('click', () => equalizeSplits('both'));
			el('equalMaster').addEventListener('click', () => equalizeSplits('master'));
			el('equalPublishing').addEventListener('click', () => equalizeSplits('publishing'));
			el('copyMasterToPublishing').addEventListener('click', copyMasterToPublishing);
			el('saveSheet').addEventListener('click', () => saveSheet(false));
			el('saveDownloadSheet').addEventListener('click', () => saveSheet(false, true));
			el('downloadForSigning').addEventListener('click', () => { syncDraftFromForm(); downloadSheetFile(state.draft, 'signing'); });
			el('emailForSigning').addEventListener('click', sendForSigning);
			el('downloadSheet').addEventListener('click', () => { syncDraftFromForm(); if (!allSigned(state.draft)) { toast('Final download unlocks after every collaborator signs. Use Download to sign first.'); return; } downloadSheetFile(state.draft, 'final'); });
			el('duplicateSheet').addEventListener('click', () => saveSheet(true));
			el('deleteSheet').addEventListener('click', deleteActiveSheet);
			el('navUpgrade').addEventListener('click', () => openUpgrade());
			el('accountUpgrade').addEventListener('click', () => openUpgrade());
			el('closeUpgrade').addEventListener('click', closeUpgrade);
			el('startCheckout').addEventListener('click', startCheckout);
			el('manageBilling').addEventListener('click', manageBilling);
			fields.forEach((field) => el(field).addEventListener('input', syncDraftFromForm));
		}

		async function loadBootstrap() {
			const response = await fetch('/api/bootstrap');
			state.bootstrap = await response.json();
			const firstSheet = state.bootstrap.sheets[0];
			loadSheet(firstSheet || blankSheet());
			renderShell();
		}

		function renderShell() {
			const data = state.bootstrap;
			const sheets = data.sheets || [];
			el('statUsed').textContent = String(sheets.length);
			el('statRemaining').textContent = data.isPro ? '∞' : String(data.freeRemaining);
			el('statPlan').textContent = data.isPro ? 'Pro' : 'Free';
			el('planBadge').textContent = data.isPro ? 'Pro plan' : 'Free plan';
			el('planBadge').className = data.isPro ? 'badge pro' : 'badge';
			el('freeMeter').textContent = data.isPro ? 'Pro is active. You can create unlimited split sheets.' : 'Free plan: ' + data.freeRemaining + ' of ' + data.freeLimit + ' free sheets remaining.';
			el('accountPlanText').textContent = data.isPro ? 'You are on Pro. Subscription status: ' + data.subscription.status + '.' : 'You are on the Free plan. Create 2 sheets, then upgrade to continue.';
			renderSheetList();
			calculateTotals();
		}

		function renderSheetList() {
			const sheets = state.bootstrap.sheets || [];
			el('sheetList').innerHTML = '';
			if (!sheets.length) {
				const empty = document.createElement('div');
				empty.className = 'sheet-item';
				empty.innerHTML = '<strong>No sheets yet</strong><span>Create your first agreement.</span>';
				el('sheetList').appendChild(empty);
				return;
			}
			sheets.forEach((sheet) => {
				const button = document.createElement('button');
				button.type = 'button';
				button.className = 'sheet-item' + (sheet.id === state.activeSheetId ? ' active' : '');
				button.innerHTML = '<strong>' + escapeHtml(sheet.title) + '</strong><span>' + escapeHtml(sheet.artist || 'No artist') + ' • Master ' + sheet.masterTotal + '% / Pub ' + sheet.publishingTotal + '%</span>';
				button.addEventListener('click', () => loadSheet(sheet));
				el('sheetList').appendChild(button);
			});
		}

		function loadSheet(sheet) {
			state.activeSheetId = sheet.id || null;
			state.draft = JSON.parse(JSON.stringify(sheet));
			if (!state.draft.collaborators || !state.draft.collaborators.length) state.draft.collaborators = [blankCollaborator(), blankCollaborator()];
			fields.forEach((field) => { el(field).value = state.draft[field] || (field === 'splitType' ? 'both' : field === 'status' ? 'draft' : ''); });
			renderCollaborators();
			calculateTotals();
			renderSheetList();
			el('saveStatus').textContent = state.activeSheetId ? 'Editing saved sheet.' : 'New unsaved split sheet.';
		}

		function renderCollaborators() {
			const container = el('collaborators');
			container.innerHTML = '';
			state.draft.collaborators.forEach((person, index) => {
				const row = document.createElement('div');
				row.className = 'collab-row';
				row.innerHTML = savedPersonMarkup(index) + inputMarkup(index, 'name', 'Stage / credit name', person.name, 'Aria Rivers') + inputMarkup(index, 'legalName', 'Legal name', person.legalName, 'Aria Johnson') + inputMarkup(index, 'email', 'Email', person.email, 'aria@example.com') + selectMarkup(index, 'role', 'Role / perspective', person.role, roleOptions, 'Choose role') + selectMarkup(index, 'contribution', 'Contribution', person.contribution, contributionOptions, 'Choose contribution') + selectMarkup(index, 'pro', 'PRO', person.pro, proOptions, 'Choose PRO') + inputMarkup(index, 'ipi', 'IPI / CAE # required', person.ipi, '00000000000') + inputMarkup(index, 'publisher', 'Publisher / admin', person.publisher, 'Self-published') + inputMarkup(index, 'publisherIpi', 'Publisher IPI', person.publisherIpi, 'Optional') + inputMarkup(index, 'masterPercent', 'Master %', person.masterPercent, '0', 'number') + inputMarkup(index, 'publishingPercent', 'Publishing %', person.publishingPercent, '0', 'number') + signatureMarkup(index, person) + '<button class="remove" type="button" aria-label="Remove collaborator">×</button>';
				row.querySelectorAll('input, select').forEach((input) => input.addEventListener('input', (event) => updateCollaborator(index, event.target.dataset.key, event.target.value)));
				row.querySelector('.remove').addEventListener('click', () => { state.draft.collaborators.splice(index, 1); if (!state.draft.collaborators.length) state.draft.collaborators.push(blankCollaborator()); renderCollaborators(); calculateTotals(); });
				row.querySelector('.sign-person').addEventListener('click', () => signCollaborator(index));
				row.querySelector('.clear-signature').addEventListener('click', () => clearSignature(index));
				container.appendChild(row);
			});
		}

		function signatureMarkup(index, person) {
			const signed = person.signed && person.signatureName;
			return '<div class="signature-tools field full"><div class="field"><label>Typed signature</label><input data-index="' + index + '" data-key="signatureName" value="' + escapeHtml(person.signatureName || '') + '" placeholder="Type legal signature" /></div><button class="button button-primary sign-person" type="button">Sign now</button><button class="button button-secondary clear-signature" type="button">Clear</button><span class="signature-stamp">' + (signed ? 'Signed ' + escapeHtml(person.signedAt || '') : 'Not signed yet') + '</span></div>';
		}

		function inputMarkup(index, key, label, value, placeholder, type = 'text') {
			const numeric = type === 'number' ? ' min="0" max="100" step="0.01"' : '';
			return '<div class="field"><label>' + label + '</label><input data-index="' + index + '" data-key="' + key + '" type="' + type + '"' + numeric + ' value="' + escapeHtml(value == null ? '' : String(value)) + '" placeholder="' + placeholder + '" /></div>';
		}

		function selectMarkup(index, key, label, value, optionsList, placeholder) {
			const options = ['<option value="">' + placeholder + '</option>'].concat(optionsList.map((item) => '<option value="' + escapeHtml(item) + '"' + (item === value ? ' selected' : '') + '>' + escapeHtml(item) + '</option>')).join('');
			return '<div class="field"><label>' + label + '</label><select data-index="' + index + '" data-key="' + key + '">' + options + '</select></div>';
		}

		function savedPersonMarkup(index) {
			const people = getSavedPeople();
			const options = ['<option value="">Load previous person</option>'].concat(people.map((person, personIndex) => '<option value="' + personIndex + '">' + escapeHtml(person.name || person.legalName || person.email || 'Saved person') + (person.ipi ? ' • IPI ' + escapeHtml(person.ipi) : '') + '</option>')).join('');
			return '<div class="field full"><label>Previous collaborators</label><select data-index="' + index + '" data-key="savedPerson">' + options + '</select></div>';
		}

		function signCollaborator(index) {
			const person = state.draft.collaborators[index];
			if (!person.signatureName || !person.signatureName.trim()) { toast('Type the legal signature first.'); return; }
			person.signed = true;
			person.signedAt = new Date().toLocaleString();
			renderCollaborators();
			calculateTotals();
			toast('Signature captured. Save the sheet to keep it on the profile.');
		}

		function clearSignature(index) {
			state.draft.collaborators[index].signed = false;
			state.draft.collaborators[index].signatureName = '';
			state.draft.collaborators[index].signedAt = '';
			renderCollaborators();
			calculateTotals();
		}

		function updateCollaborator(index, key, value) {
			if (key === 'savedPerson') {
				applySavedPerson(index, value);
				return;
			}
			state.draft.collaborators[index][key] = key.includes('Percent') ? Number(value || 0) : value;
			calculateTotals();
		}

		function getSavedPeople() {
			const people = [];
			const seen = new Set();
			((state.bootstrap && state.bootstrap.sheets) || []).forEach((sheet) => {
				(sheet.collaborators || []).forEach((person) => {
					const key = (person.email || person.ipi || person.legalName || person.name || '').toLowerCase();
					if (!key || seen.has(key)) return;
					seen.add(key);
					people.push(person);
				});
			});
			return people;
		}

		function applySavedPerson(index, personIndex) {
			const person = getSavedPeople()[Number(personIndex)];
			if (!person) return;
			const current = state.draft.collaborators[index] || blankCollaborator();
			state.draft.collaborators[index] = { ...blankCollaborator(), ...person, masterPercent: current.masterPercent || person.masterPercent || 0, publishingPercent: current.publishingPercent || person.publishingPercent || 0 };
			renderCollaborators();
			calculateTotals();
			toast('Saved collaborator loaded.');
		}

		function addSavedPerson() {
			const person = getSavedPeople()[0];
			if (!person) { toast('Save a sheet first, then previous collaborators will appear here.'); return; }
			state.draft.collaborators.push({ ...blankCollaborator(), ...person, masterPercent: 0, publishingPercent: 0 });
			renderCollaborators();
			calculateTotals();
			toast('Previous collaborator added.');
		}

		function equalizeSplits(target) {
			const collaborators = state.draft.collaborators || [];
			if (!collaborators.length) return;
			const shares = getEqualShares(collaborators.length);
			collaborators.forEach((person, index) => {
				if (target === 'both' || target === 'master') person.masterPercent = shares[index];
				if (target === 'both' || target === 'publishing') person.publishingPercent = shares[index];
			});
			renderCollaborators();
			calculateTotals();
			toast('Equal splits applied. You can still customize any person manually.');
		}

		function copyMasterToPublishing() {
			(state.draft.collaborators || []).forEach((person) => { person.publishingPercent = Number(person.masterPercent || 0); });
			renderCollaborators();
			calculateTotals();
			toast('Publishing splits copied from master splits.');
		}

		function getEqualShares(count) {
			const base = Math.floor((100 / count) * 100) / 100;
			const shares = Array(count).fill(base);
			shares[count - 1] = round(100 - base * (count - 1));
			return shares;
		}

		function syncDraftFromForm() {
			fields.forEach((field) => { state.draft[field] = el(field).value; });
		}

		function calculateTotals() {
			syncDraftFromForm();
			const collaborators = state.draft.collaborators || [];
			const master = round(collaborators.reduce((sum, person) => sum + Number(person.masterPercent || 0), 0));
			const publishing = round(collaborators.reduce((sum, person) => sum + Number(person.publishingPercent || 0), 0));
			const signed = collaborators.filter((person) => person.signed).length;
			el('masterTotal').textContent = master + '%';
			el('publishingTotal').textContent = publishing + '%';
			el('signedTotal').textContent = signed + ' / ' + collaborators.length;
			setTotalClass('masterCard', master, state.draft.splitType !== 'publishing');
			setTotalClass('publishingCard', publishing, state.draft.splitType !== 'master');
			el('saveStatus').textContent = totalsMessage(master, publishing);
		}

		function setTotalClass(id, value, required) {
			el(id).className = 'total-card ' + (!required ? '' : value === 100 ? 'good' : 'bad');
		}

		function totalsMessage(master, publishing) {
			const type = state.draft.splitType;
			const issues = [];
			if (type !== 'publishing' && master !== 100) issues.push('master needs ' + round(100 - master) + '%');
			if (type !== 'master' && publishing !== 100) issues.push('publishing needs ' + round(100 - publishing) + '%');
			return issues.length ? 'Totals are editable. To finalize, ' + issues.join(' and ') + '.' : 'Totals are balanced at 100%. Ready to save.';
		}

		async function saveSheet(duplicate, downloadAfter = false) {
			syncDraftFromForm();
			const payload = JSON.parse(JSON.stringify(state.draft));
			if (duplicate) delete payload.id;
			if (!payload.title) payload.title = 'Untitled Split Sheet';
			const validation = validateSheet(payload);
			if (validation) { toast(validation); el('saveStatus').textContent = validation; return; }
			const response = await fetch('/api/sheets', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
			const data = await response.json();
			if (response.status === 402 || data.paywall) {
				state.bootstrap = data;
				renderShell();
				openUpgrade(data.message);
				return;
			}
			if (!response.ok || data.error) {
				toast(data.message || 'Please fix the split sheet before saving.');
				el('saveStatus').textContent = data.message || 'Please fix the split sheet before saving.';
				return;
			}
			state.bootstrap = data;
			state.activeSheetId = data.activeSheetId;
			const saved = data.sheets.find((sheet) => sheet.id === data.activeSheetId);
			loadSheet(saved || payload);
			renderShell();
			if (downloadAfter) downloadSheetFile(saved || payload);
			toast(downloadAfter ? 'Split sheet saved and downloaded.' : 'Split sheet saved.');
		}

		function allSigned(sheet) {
			const credited = (sheet.collaborators || []).filter((person) => person.name || person.legalName || person.email);
			return credited.length > 0 && credited.every((person) => person.signed && person.signatureName);
		}

		function sendForSigning() {
			syncDraftFromForm();
			const subject = encodeURIComponent('SplitSheet ready for signature: ' + (state.draft.title || 'Untitled Split Sheet'));
			const body = encodeURIComponent('Please review and sign this split sheet for ' + (state.draft.title || 'this song') + '. Open the SplitSheet app, type your signature in your collaborator row, click Sign now, then save.');
			window.location.href = 'mailto:?subject=' + subject + '&body=' + body;
			toast('Email draft opened. After everyone signs in the app, save and download the finished split sheet.');
		}

		function validateSheet(sheet) {
			if (!sheet.title || !sheet.title.trim()) return 'Add a song title before saving.';
			const credited = (sheet.collaborators || []).filter((person) => person.name || person.legalName || person.email);
			if (!credited.length) return 'Add at least one collaborator with an IPI / CAE number before saving.';
			const missingIpi = credited.find((person) => !person.ipi);
			if (missingIpi) return 'IPI / CAE number is required for ' + (missingIpi.name || missingIpi.legalName || missingIpi.email) + ' before saving.';
			return '';
		}

		function downloadSheetFile(sheet, mode = 'final') {
			if (mode === 'final' && !allSigned(sheet)) { toast('Final download unlocks after every collaborator signs.'); return; }
			const html = buildDownloadHtml(sheet, mode);
			const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
			const link = document.createElement('a');
			link.href = URL.createObjectURL(blob);
			link.download = slugify('SplitSheet-' + (mode === 'final' ? 'signed-' : 'to-sign-') + (sheet.title || 'split-sheet')) + '.html';
			document.body.appendChild(link);
			link.click();
			link.remove();
			setTimeout(() => URL.revokeObjectURL(link.href), 1000);
		}

		function buildDownloadHtml(sheet, mode) {
			const collaborators = sheet.collaborators || [];
			const statusLabel = mode === 'final' ? 'SIGNED FINAL SPLIT SHEET' : 'READY TO SIGN';
			const rows = collaborators.map((person) => '<tr><td>' + escapeHtml(person.name || '') + '</td><td>' + escapeHtml(person.legalName || '') + '</td><td>' + escapeHtml(person.role || '') + '</td><td>' + escapeHtml(person.contribution || '') + '</td><td>' + escapeHtml(person.pro || '') + '</td><td>' + escapeHtml(person.ipi || '') + '</td><td>' + escapeHtml(person.publisher || '') + '</td><td>' + escapeHtml(String(person.masterPercent || 0)) + '%</td><td>' + escapeHtml(String(person.publishingPercent || 0)) + '%</td><td>' + (person.signed ? '<strong>' + escapeHtml(person.signatureName || '') + '</strong><br><small>' + escapeHtml(person.signedAt || '') + '</small>' : '<span class="line"></span>') + '</td></tr>').join('');
			return '<!doctype html><html><head><meta charset="utf-8"><title>SplitSheet - ' + escapeHtml(sheet.title || 'Split Sheet') + '</title><style>:root{--purple:#7c3aed;--pink:#ec4899;--ink:#101828;--line:#d0d5dd}body{font-family:Inter,Arial,sans-serif;margin:0;color:var(--ink);background:#f8fafc}.wrap{max-width:1120px;margin:28px auto;padding:28px;background:#fff;border:1px solid #e4e7ec;border-radius:28px}.brand{display:flex;justify-content:space-between;gap:20px;align-items:center;border-bottom:4px solid var(--purple);padding-bottom:18px}.logo{font-size:28px;font-weight:900;letter-spacing:-.04em}.mark{display:inline-grid;place-items:center;width:38px;height:38px;border-radius:14px;color:#fff;background:linear-gradient(135deg,var(--purple),var(--pink));margin-right:8px}.pill{padding:8px 12px;border-radius:999px;color:#fff;background:linear-gradient(135deg,var(--purple),var(--pink));font-weight:800}h1{margin:26px 0 6px;font-size:34px}.meta{color:#667085;font-weight:700}table{width:100%;border-collapse:collapse;margin-top:24px}th{background:#f4ebff;color:#4c1d95}th,td{border:1px solid var(--line);padding:10px;text-align:left;font-size:12px;vertical-align:top}.line{display:block;height:32px;border-bottom:2px solid #111827}.footer{margin-top:24px;color:#667085;font-size:12px}</style></head><body><div class="wrap"><div class="brand"><div class="logo"><span class="mark">S</span>SplitSheet</div><div class="pill">' + statusLabel + '</div></div><h1>' + escapeHtml(sheet.title || 'Untitled Split Sheet') + '</h1><p class="meta">Artist: ' + escapeHtml(sheet.artist || '') + ' • Creation date: ' + escapeHtml(sheet.creationDate || '') + ' • ISRC: ' + escapeHtml(sheet.isrc || 'Add later') + '</p><table><thead><tr><th>Credit name</th><th>Legal name</th><th>Role</th><th>Contribution</th><th>PRO</th><th>IPI / CAE</th><th>Publisher</th><th>Master</th><th>Publishing</th><th>Signature</th></tr></thead><tbody>' + rows + '</tbody></table><p class="footer">Generated by SplitSheet. Signed copies can be saved to the creator profile and downloaded after every collaborator signs. Confirm legal terms with counsel before distribution.</p></div></body></html>';
		}

		function slugify(value) { return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'split-sheet'; }

		async function deleteActiveSheet() {
			if (!state.activeSheetId) { newSheet(); return; }
			if (!confirm('Delete this split sheet?')) return;
			const response = await fetch('/api/sheets/' + encodeURIComponent(state.activeSheetId), { method: 'DELETE' });
			state.bootstrap = await response.json();
			loadSheet(state.bootstrap.sheets[0] || blankSheet());
			renderShell();
			toast('Split sheet deleted.');
		}

		function newSheet() {
			if (state.bootstrap && !state.bootstrap.isPro && state.bootstrap.sheets.length >= state.bootstrap.freeLimit) {
				openUpgrade('You have used your 2 free split sheets. Upgrade to Pro to create unlimited sheets.');
				return;
			}
			loadSheet(blankSheet());
		}

		async function startCheckout() {
			const response = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: el('billingEmail').value }) });
			const data = await response.json();
			if (data.checkoutUrl) window.location.href = data.checkoutUrl;
			else toast(data.message || 'Stripe checkout is not configured yet.');
		}

		async function manageBilling() {
			const response = await fetch('/api/billing/portal', { method: 'POST' });
			const data = await response.json();
			if (data.portalUrl) window.location.href = data.portalUrl;
			else if (data.needsCheckout) openUpgrade(data.message);
			else toast(data.message || 'Stripe billing portal is not configured yet.');
		}

		function openUpgrade(message) {
			if (message) el('upgradeMessage').textContent = message;
			el('upgradeModal').style.display = 'grid';
		}

		function closeUpgrade() { el('upgradeModal').style.display = 'none'; }

		function setView(view) {
			document.body.dataset.view = view === 'account' ? 'account' : 'builder';
			document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'));
			document.querySelectorAll('[data-view-link="' + document.body.dataset.view + '"]').forEach((item) => item.classList.add('active'));
			history.replaceState(null, '', document.body.dataset.view === 'account' ? '/account' : '/');
		}

		function blankSheet() {
			return { title: '', artist: '', isrc: '', creationDate: new Date().toISOString().slice(0, 10), splitType: 'both', status: 'draft', collaborators: [blankCollaborator(), blankCollaborator()] };
		}
		function blankCollaborator() { return { name: '', legalName: '', email: '', role: '', contribution: '', pro: '', ipi: '', publisher: '', publisherIpi: '', masterPercent: 0, publishingPercent: 0, signed: false, signatureName: '', signedAt: '' }; }
		function round(value) { return Math.round(value * 100) / 100; }
		function escapeHtml(value) { return String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char])); }
		function toast(message) { el('toast').textContent = message; el('toast').style.display = 'block'; setTimeout(() => { el('toast').style.display = 'none'; }, 3200); }
	</script>
</body>
</html>`;
}
