export function renderManifest() {
	return JSON.stringify({
		name: "1SV Fast Trade AI",
		short_name: "1SV Trade AI",
		description: "Mobile-first educational binary-options trade assistant with risk controls.",
		start_url: "/",
		display: "standalone",
		background_color: "#050505",
		theme_color: "#d6a84f",
		orientation: "portrait-primary",
		icons: [
			{
				src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'%3E%3Crect width='192' height='192' rx='40' fill='%23050505'/%3E%3Ctext x='96' y='86' font-size='50' text-anchor='middle' fill='%23d6a84f' font-family='Arial'%3E1SV%3C/text%3E%3Ctext x='96' y='132' font-size='28' text-anchor='middle' fill='white' font-family='Arial'%3EAI%3C/text%3E%3C/svg%3E",
				sizes: "192x192",
				type: "image/svg+xml",
			},
		],
	});
}

export function renderServiceWorker() {
	return `const CACHE = "1sv-fast-trade-ai-v1";
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(["/", "/manifest.webmanifest"])));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then((cached) => cached || caches.match("/"))));
});`;
}

export function renderHtml() {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#d6a84f" />
  <meta name="description" content="1SV Fast Trade AI is an educational manual trade assistant with binary-options risk controls." />
  <link rel="manifest" href="/manifest.webmanifest" />
  <title>1SV Fast Trade AI</title>
  <style>
    :root { color-scheme: dark; --gold:#d6a84f; --gold2:#ffe7a3; --bg:#050505; --panel:#101010; --panel2:#17120a; --muted:#a8a29a; --red:#ff5c5c; --green:#4ade80; --blue:#60a5fa; }
    * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body { margin:0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: radial-gradient(circle at top, #3b2a0d 0, #080808 42%, #000 100%); color:#fff; min-height:100vh; }
    button, input, select, textarea { font: inherit; }
    button { cursor:pointer; border:0; } button:disabled, input:disabled, select:disabled, textarea:disabled { opacity:.45; cursor:not-allowed; }
    .app { max-width: 520px; margin:0 auto; min-height:100vh; padding: 18px 14px 96px; }
    .hero { position:sticky; top:0; z-index:5; margin:-18px -14px 14px; padding:16px 14px 12px; background: linear-gradient(180deg, rgba(5,5,5,.98), rgba(5,5,5,.86)); backdrop-filter: blur(16px); border-bottom:1px solid rgba(214,168,79,.18); }
    .brand { display:flex; align-items:center; gap:12px; }
    .logo { width:50px; height:50px; border-radius:16px; display:grid; place-items:center; background:linear-gradient(145deg,#fff0b5,#8b611a 48%,#1b1204); color:#080808; font-weight:1000; letter-spacing:-1px; box-shadow:0 0 30px rgba(214,168,79,.28); }
    h1 { margin:0; font-size:1.35rem; line-height:1.05; letter-spacing:-.04em; }
    .sub { margin:4px 0 0; color:var(--muted); font-size:.78rem; }
    .risk-banner { margin-top:12px; padding:10px 12px; border:1px solid rgba(255,92,92,.35); background:rgba(80,10,10,.34); border-radius:16px; color:#ffd0d0; font-size:.78rem; line-height:1.35; }
    .grid { display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap:10px; }
    .card { border:1px solid rgba(214,168,79,.18); background:linear-gradient(180deg, rgba(22,18,10,.96), rgba(10,10,10,.96)); border-radius:22px; padding:14px; box-shadow:0 18px 44px rgba(0,0,0,.35); }
    .card.full { grid-column:1 / -1; }
    .label { color:var(--muted); font-size:.72rem; text-transform:uppercase; letter-spacing:.08em; }
    .value { margin-top:5px; font-size:1.25rem; font-weight:900; letter-spacing:-.03em; }
    .green { color:var(--green); } .red { color:var(--red); } .gold { color:var(--gold2); } .blue { color:var(--blue); }
    .signal { font-size:3.15rem; line-height:.95; font-weight:1000; letter-spacing:-.08em; }
    .pillrow { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
    .pill { border:1px solid rgba(214,168,79,.25); color:#f8e7b5; background:rgba(214,168,79,.1); padding:7px 10px; border-radius:999px; font-size:.78rem; font-weight:800; }
    .tabs { position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:min(520px,100%); display:grid; grid-template-columns:repeat(5,1fr); gap:6px; padding:9px 10px calc(9px + env(safe-area-inset-bottom)); background:rgba(5,5,5,.94); backdrop-filter: blur(18px); border-top:1px solid rgba(214,168,79,.2); z-index:10; }
    .tab { min-height:58px; border-radius:18px; color:#cfc7b8; background:#121212; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; font-size:.69rem; font-weight:900; }
    .tab.active { color:#050505; background:linear-gradient(145deg,var(--gold2),var(--gold)); }
    .screen { display:none; animation:fade .18s ease; } .screen.active { display:block; } @keyframes fade { from{opacity:.5; transform:translateY(4px)} to{opacity:1; transform:none} }
    .section-title { margin:18px 2px 10px; font-size:1.02rem; letter-spacing:-.03em; }
    .form { display:grid; gap:11px; }
    .field { display:grid; gap:6px; }
    .field label { color:#e8dcc2; font-size:.78rem; font-weight:800; }
    input, select, textarea { width:100%; min-height:48px; border-radius:15px; border:1px solid rgba(214,168,79,.22); color:#fff; background:#0d0d0d; padding:11px 12px; outline:none; }
    textarea { min-height:86px; resize:vertical; }
    .btn { min-height:54px; border-radius:18px; font-weight:1000; letter-spacing:-.02em; padding:0 16px; }
    .primary { background:linear-gradient(145deg,var(--gold2),var(--gold)); color:#080808; box-shadow:0 15px 32px rgba(214,168,79,.18); }
    .secondary { background:#181818; color:#f4e3b5; border:1px solid rgba(214,168,79,.24); }
    .danger { background:rgba(255,92,92,.16); color:#ffd1d1; border:1px solid rgba(255,92,92,.34); }
    .btnrow { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .checklist { display:grid; gap:8px; margin-top:12px; }
    .check { display:flex; justify-content:space-between; gap:12px; padding:9px 0; border-bottom:1px solid rgba(255,255,255,.06); font-size:.84rem; }
    .check b { color:#f8e7b5; }
    .model { margin-bottom:10px; border:1px solid rgba(214,168,79,.18); border-radius:20px; background:#101010; padding:13px; }
    .model.active { border-color:var(--gold); box-shadow:0 0 0 1px rgba(214,168,79,.2) inset; background:linear-gradient(180deg, rgba(60,43,12,.7), #101010); }
    .model-top { display:flex; justify-content:space-between; gap:12px; align-items:start; }
    .model h3 { margin:0; font-size:.98rem; } .model p { margin:6px 0 0; color:var(--muted); font-size:.8rem; line-height:1.38; }
    .journal { display:grid; gap:10px; }
    .trade { border-left:4px solid var(--gold); }
    .notice { padding:14px; border-radius:20px; background:rgba(96,165,250,.11); border:1px solid rgba(96,165,250,.22); color:#dbeafe; font-size:.83rem; line-height:1.45; }
    .warning-screen { position:fixed; inset:0; z-index:100; background:radial-gradient(circle at top,#402606,#030303 48%,#000); display:grid; place-items:center; padding:18px; overflow:auto; }
    .warning-box { width:min(500px, 100%); max-height:calc(100vh - 36px); overflow:auto; border:1px solid rgba(255,92,92,.4); background:rgba(10,10,10,.94); border-radius:28px; padding:22px; box-shadow:0 30px 80px rgba(0,0,0,.7); }
    .warning-box h2 { margin:0 0 10px; font-size:1.55rem; } .warning-box p, .warning-box li { color:#e7d7c2; line-height:1.45; }
    .hidden { display:none !important; }
    .empty { color:var(--muted); text-align:center; padding:20px; }
    .edu-icon { font-size:2rem; } .small { font-size:.75rem; color:var(--muted); line-height:1.4; }
    @media (min-width: 760px) { .app { max-width: 1060px; } .desktop { display:grid; grid-template-columns: 1fr 1fr; gap:12px; align-items:start; } .tabs { max-width:1060px; } }
  </style>
</head>
<body>
  <div id="riskWarning" class="warning-screen">
    <div class="warning-box">
      <div class="logo">1SV</div>
      <h2>Binary options risk warning</h2>
      <p><b>Educational trading assistant only. Trading is risky. This app does not provide financial advice and does not guarantee results.</b></p>
      <ul>
        <li>Binary options can lose money very quickly, especially 3-second and 5-second expiries.</li>
        <li>Offshore or unregulated brokers may add withdrawal, pricing, payout, and custody risks.</li>
        <li>This app never auto-places trades and never stores broker or Pocket Option credentials.</li>
      </ul>
      <button id="acceptRisk" class="btn primary" style="width:100%; margin-top:10px;">I understand — demo/manual use only</button>
      <button id="skipRiskStorage" class="btn secondary" style="width:100%; margin-top:10px;">Continue this session if storage is blocked</button>
    </div>
  </div>

  <main class="app">
    <header class="hero">
      <div class="brand"><div class="logo">1SV</div><div><h1>Fast Trade AI</h1><p class="sub">Manual signal desk • no execution • risk locked</p></div></div>
      <div class="risk-banner">Educational trading assistant only. Trading is risky. This app does not provide financial advice and does not guarantee results. Current data mode: manual inputs / screenshot prep only — no live Pocket Option feed yet.</div>
    </header>

    <section id="home" class="screen active">
      <div class="desktop">
        <div class="grid" id="dashboardCards"></div>
        <div class="card full" id="latestSignal"></div>
        <div class="card full" id="dataSourceCard"></div>
      </div>
      <h2 class="section-title">Next fastest actions</h2>
      <div class="btnrow"><button class="btn primary" data-nav="signal">New Signal</button><button class="btn secondary" data-nav="journal">Journal Result</button></div>
    </section>

    <section id="signal" class="screen">
      <h2 class="section-title">Signal Input</h2>
      <div class="card">
        <div class="form" id="signalForm"></div>
        <div class="btnrow" style="margin-top:14px;"><button id="generateSignal" class="btn primary">Generate Signal</button><button id="clearInput" class="btn secondary">Clear</button></div>
      </div>
    </section>

    <section id="models" class="screen">
      <h2 class="section-title">Model Switcher</h2>
      <div id="modelList"></div>
    </section>

    <section id="journal" class="screen">
      <h2 class="section-title">Trade Journal</h2>
      <div class="grid" id="statsCards"></div>
      <div class="card full" style="margin-top:10px;">
        <div class="form" id="journalForm"></div>
        <div class="btnrow" style="margin-top:14px;"><button id="saveTrade" class="btn primary">Save Trade</button><button id="exportCsv" class="btn secondary">Export CSV</button></div>
      </div>
      <h2 class="section-title">Recent Trades</h2><div class="journal" id="tradeList"></div>
    </section>

    <section id="education" class="screen">
      <h2 class="section-title">Visual Education</h2>
      <div class="grid" id="educationCards"></div>
      <h2 class="section-title">Telegram Alerts</h2>
      <div class="notice">Optional alerts are sent only for High confidence signals that come from manual inputs today. Tokens stay on this device and are never sent anywhere except Telegram's bot API when you press Test Telegram or generate a High signal.</div>
    </section>

    <section id="settings" class="screen">
      <h2 class="section-title">Admin / Settings</h2>
      <div class="card"><div class="form" id="settingsForm"></div><div class="btnrow" style="margin-top:14px;"><button id="saveSettings" class="btn primary">Save Settings</button><button id="resetDay" class="btn danger">Reset Daily Stats</button><button id="testTelegram" class="btn secondary" style="grid-column:1 / -1;">Test Telegram</button></div></div>
    </section>
  </main>

  <nav class="tabs">
    <button class="tab active" data-nav="home"><span>⌁</span>Home</button><button class="tab" data-nav="signal"><span>⚡</span>Signal</button><button class="tab" data-nav="models"><span>◈</span>Models</button><button class="tab" data-nav="journal"><span>▤</span>Journal</button><button class="tab" data-nav="settings"><span>⚙</span>Admin</button>
  </nav>

<script>
(function(){
  'use strict';
  var DISCLAIMER = 'Educational trading assistant only. Trading is risky. This app does not provide financial advice and does not guarantee results.';
  var memoryStore = {};
  function safeGet(key){ try { return localStorage.getItem(key); } catch(e){ return memoryStore[key] || null; } }
  function safeSet(key,value){ try { localStorage.setItem(key, value); } catch(e){ memoryStore[key] = value; } }
  function hideRiskWarning(){ document.getElementById('riskWarning').classList.add('hidden'); }
  var DATA_SOURCE = { mode:'Manual / Screenshot Prep', status:'No live broker feed connected', detail:'This version does not pull live Pocket Option, live trader view, broker candles, or account data. Signals and Telegram alerts are generated only after you enter chart context manually. A future API/vision connector can feed the same signal engine without storing broker credentials.' };
  var MODELS = {
    A:{name:'1SV ZigZag Stochastic Scalper', best:'30s expiry on 1m candles', risk:'Structure + stochastic confirmation.', max:'High'},
    B:{name:'1SV 3-Second Flick Model', best:'3s expiry only on 30s candles', risk:'Very risky. Demo or tiny $1 only.', max:'Medium'},
    C:{name:'1SV Slide Pullback Model', best:'30s or 1m expiry', risk:'Safest continuation pullback logic.', max:'High'},
    D:{name:'1SV Reversal Reach Model', best:'30s or 1m expiry', risk:'Reversal only with rejection confirmation.', max:'High'},
    E:{name:'1SV Elon Mode / Systems Mode', best:'First-principles capital protection', risk:'Blunt truth: no edge means no trade.', max:'High'}
  };
  var defaultSettings = { target:50, maxLoss:-8, maxTrades:10, maxLossStreak:2, pauseWinStreak:3, balance:100, preferredTimeframe:'1m', preferredExpiry:'30s', model:'C', enabledModels:['A','B','C','D','E'], botToken:'', chatId:'' };
  var defaultInput = { asset:'EUR/USD OTC', timeframe:'1m', expiry:'30s', direction:'Uptrend', current:'Strong Green', previous:'Weak', zigzag:'Higher Low', k:24, d:18, cross:'Cross Up', zone:'Oversold below 20', ema9:'Price above', ema50:'Price above', band:'middle', sr:'Yes', trendline:'Yes', momentum:'High', wick:'Clean / no long wick' };
  var defaultState = { settings: defaultSettings, input: defaultInput, trades: [], latest: null, lockedUntil: '', paused: false };
  var state = normalizeState(load('oneSvState', defaultState));
  if (!state.latest) state.latest = buildSignal('WAIT','Medium',state.settings.preferredExpiry,'Load the dashboard, confirm the market context, and only generate a signal when the chart is clean.','WAIT', checklist('Unknown','Waiting','Waiting','Structure only','Unknown','Ready'));

  function load(key, fallback){ try { return Object.assign({}, fallback, JSON.parse(safeGet(key) || '{}')); } catch(e){ return fallback; } }
  function normalizeState(value){
    var next = Object.assign({}, defaultState, value || {});
    next.settings = Object.assign({}, defaultSettings, (value && value.settings) || {});
    next.input = Object.assign({}, defaultInput, (value && value.input) || {});
    next.trades = Array.isArray(next.trades) ? next.trades : [];
    next.settings.enabledModels = Array.isArray(next.settings.enabledModels) && next.settings.enabledModels.length ? next.settings.enabledModels.filter(function(k){ return MODELS[k]; }) : defaultSettings.enabledModels.slice();
    if (!next.settings.enabledModels.length) next.settings.enabledModels = defaultSettings.enabledModels.slice();
    if (!MODELS[next.settings.model] || next.settings.enabledModels.indexOf(next.settings.model) === -1) next.settings.model = next.settings.enabledModels[0];
    return next;
  }
  function save(){ state = normalizeState(state); safeSet('oneSvState', JSON.stringify(state)); }
  function today(){ return new Date().toISOString().slice(0,10); }
  function money(n){ return (n >= 0 ? '+$' : '-$') + Math.abs(Number(n || 0)).toFixed(2); }
  function dailyTrades(){ return state.trades.filter(function(t){ return (t.date || '').slice(0,10) === today(); }); }
  function dailyPL(){ return dailyTrades().reduce(function(s,t){ return s + Number(t.pl || 0); }, 0); }
  function streak(kind){ var count=0; for (var i=state.trades.length-1;i>=0;i--){ if(state.trades[i].result===kind) count++; else if(state.trades[i].result==='Win'||state.trades[i].result==='Loss') break; } return count; }
  function riskStatus(){
    var pl=dailyPL(), trades=dailyTrades().filter(function(t){return t.result!=='Skip';}).length, losses=streak('Loss'), wins=streak('Win');
    var locked = state.lockedUntil === today() || pl >= Number(state.settings.target) || pl <= Number(state.settings.maxLoss) || trades >= Number(state.settings.maxTrades) || losses >= Number(state.settings.maxLossStreak);
    if (locked) { state.lockedUntil = today(); state.paused = false; }
    else if (wins >= Number(state.settings.pauseWinStreak)) state.paused = true;
    return { locked: locked, paused: state.paused, pl:pl, trades:trades, wins:wins, losses:losses, text: locked?'LOCKED':(state.paused?'PAUSED':'ACTIVE') };
  }
  function checklist(trend,candle,stoch,zigzag,sr,risk){ return {Trend:trend,Candle:candle,Stochastic:stoch,ZigZag:zigzag,'Support/Resistance':sr,'Risk Status':risk}; }
  function buildSignal(signal, confidence, expiry, reason, nextAction, checks){ return { signal:signal, confidence:confidence, expiry:expiry, reason:reason, nextAction:nextAction, checklist:checks, at:new Date().toISOString(), model:state.settings.model }; }
  function activeModel(){ return MODELS[state.settings.model] || MODELS.C; }
  function modelName(key){ return (MODELS[key] || activeModel()).name; }
  function cap(conf){ return activeModel().max === 'Medium' && conf === 'High' ? 'Medium' : conf; }
  function hasPullback(i){ return i.ema9==='crossing' || i.ema50==='crossing' || i.sr==='Yes' || i.trendline==='Yes'; }
  function cleanCandle(i){ return i.current.indexOf('Strong')===0 && i.wick !== 'Long wick / rejection'; }
  function extended(i){ return i.band==='Upper band' || i.band==='lower band' || i.band==='outside band'; }
  function riskTradeSize(){ var b=Number(state.settings.balance||0); if(b<100) return '$1'; if(b<=250) return '$1-$2'; if(b<=500) return '$2-$3'; return '≤ 1% per trade'; }
  function analyze(){
    // Signal logic is intentionally conservative: each model requires multiple independent
    // confirmations, and the risk engine can override every setup with LOCKED/WAIT.
    var r=riskStatus(), i=state.input, m=state.settings.model;
    if(r.locked) return buildSignal('LOCKED','Low',i.expiry,'A hard daily risk limit was hit. New signal entries are disabled until you manually reset on the next trading day.','STOP', checklist('Blocked','Blocked','Blocked','Blocked','Blocked','LOCKED'));
    if(r.paused) return buildSignal('WAIT','Low',i.expiry,'You reached the win-streak pause rule. Protect the day and wait before considering another manual trade.','WAIT', checklist('Paused','Paused','Paused','Paused','Paused','PAUSED'));
    var call=false, put=false, reason='No clean edge. Protect capital and wait for stronger alignment.', conf='Low', next='WAIT';
    if(m==='A'){
      call = i.direction==='Uptrend' && (i.zigzag==='Higher Low'||i.zigzag==='Higher High') && Number(i.k)<30 && i.cross==='Cross Up' && i.current==='Strong Green' && (i.sr==='Yes'||i.trendline==='Yes');
      put = i.direction==='Downtrend' && (i.zigzag==='Lower High'||i.zigzag==='Lower Low') && Number(i.k)>70 && i.cross==='Cross Down' && i.current==='Strong Red' && (i.sr==='Yes'||i.trendline==='Yes');
      if((call||put) && extended(i)){ return buildSignal('WAIT','Medium',i.expiry,'The setup aligns, but price is already extended at an outer band. Wait for a cleaner pullback instead of chasing.','WAIT', checklist(i.direction,i.current,i.cross,i.zigzag,i.sr,'Clear')); }
      conf = call||put ? 'High':'Low'; reason = call?'Uptrend structure, stochastic cross-up, green candle, and support/trendline agree. Manual CALL only if the live candle still confirms.': put?'Downtrend structure, stochastic cross-down, red candle, and resistance/trendline agree. Manual PUT only if the live candle still confirms.':reason;
    }
    if(m==='B'){
      if(i.current==='Mixed'||i.current==='Doji'||i.current==='Weak') return buildSignal('NO TRADE','Low','3s','3-second model rejects choppy, mixed, weak, or wick-heavy candles. Do not force a flick trade.','DEMO ONLY', checklist(i.direction,i.current,i.k+' / '+i.d,i.zigzag,i.sr,'Very risky'));
      call = i.momentum==='High' && i.previous==='Strong Green' && i.current==='Strong Green' && Number(i.k)>Number(i.d) && i.wick==='Clean / no long wick';
      put = i.momentum==='High' && i.previous==='Strong Red' && i.current==='Strong Red' && Number(i.k)<Number(i.d) && i.wick==='Clean / no long wick';
      conf = call||put ? 'Medium':'Low'; reason = call?'Upward micro-momentum is clean and K is above D. This remains noisy, so use demo or tiny size only.': put?'Downward micro-momentum is clean and K is below D. This remains noisy, so use demo or tiny size only.':reason;
    }
    if(m==='C'){
      call = i.direction==='Uptrend' && hasPullback(i) && Number(i.k)>=20 && Number(i.k)<=40 && i.cross==='Cross Up' && i.current==='Strong Green';
      put = i.direction==='Downtrend' && hasPullback(i) && Number(i.k)>=60 && Number(i.k)<=80 && i.cross==='Cross Down' && i.current==='Strong Red';
      conf = call||put ? 'High':'Low'; reason = call?'Slide pullback continuation is aligned: uptrend, pullback area, stochastic reset, and strong green confirmation.': put?'Slide pullback continuation is aligned: downtrend, pullback area, stochastic reset, and strong red confirmation.':reason;
    }
    if(m==='D'){
      call = (i.band==='lower band'||i.sr==='Yes') && Number(i.k)<20 && i.wick==='Long wick / rejection' && i.cross==='Cross Up';
      put = (i.band==='Upper band'||i.sr==='Yes') && Number(i.k)>80 && i.wick==='Long wick / rejection' && i.cross==='Cross Down';
      if(!call&&!put && i.wick!=='Long wick / rejection') return buildSignal('WAIT','Low',i.expiry,'Reach model needs a rejection wick. Never enter just because stochastic is overbought or oversold.','WAIT', checklist(i.direction,i.current,i.k+' / '+i.d,i.zigzag,i.sr,'Clear'));
      conf = call||put ? 'High':'Low'; reason = call?'Lower band/support reach has oversold stochastic plus bullish rejection confirmation.': put?'Upper band/resistance reach has overbought stochastic plus bearish rejection confirmation.':reason;
    }
    if(m==='E'){
      var edge = i.direction!=='Sideways' && cleanCandle(i) && i.cross!=='No Cross' && r.pl > Number(state.settings.maxLoss) && r.trades < Number(state.settings.maxTrades);
      if(!edge) return buildSignal('NO TRADE','Medium',i.expiry,'Blunt truth: the edge is unclear or the market is too random. No trade is a position; protect capital.','STOP', checklist(i.direction,i.current,i.cross,i.zigzag,i.sr,r.text));
      call = i.direction==='Uptrend' && i.current==='Strong Green' && i.cross==='Cross Up'; put = i.direction==='Downtrend' && i.current==='Strong Red' && i.cross==='Cross Down'; conf = call||put ? 'Medium':'Low'; reason = call?'There is a real aligned edge after risk-plan checks. Manual CALL only; skip if payout or spread is unattractive.': put?'There is a real aligned edge after risk-plan checks. Manual PUT only; skip if payout or spread is unattractive.':reason;
    }
    var signal = call?'CALL':(put?'PUT':(m==='B'?'NO TRADE':'WAIT'));
    next = signal==='CALL'||signal==='PUT' ? (m==='B'?'DEMO ONLY':'ENTER') : (signal==='NO TRADE'?'STOP':'WAIT');
    return buildSignal(signal, cap(conf), i.expiry, reason, next, checklist(i.direction,i.current,i.k+' / '+i.d+' '+i.cross,i.zigzag,i.sr,r.text));
  }
  function sendTelegram(sig, force){
    var s=state.settings; if(!s.botToken || !s.chatId || (!force && sig.confidence!=='High')) return;
    var text='1SV FAST TRADE ALERT\nModel: '+modelName(sig.model)+'\nSignal: '+sig.signal+'\nExpiry: '+sig.expiry+'\nConfidence: '+sig.confidence+'\nReason: '+sig.reason+'\nRisk Status: '+riskStatus().text+'\nReminder: Manual confirmation only.';
    return fetch('https://api.telegram.org/bot'+encodeURIComponent(s.botToken)+'/sendMessage',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({chat_id:s.chatId,text:text})}).catch(function(){});
  }
  function inputField(name,label,type,options){
    var val = state.input[name] == null ? '' : state.input[name];
    if(options) return '<div class="field"><label>'+label+'</label><select data-input="'+name+'">'+options.map(function(o){return '<option '+(o===val?'selected':'')+'>'+o+'</option>';}).join('')+'</select></div>';
    return '<div class="field"><label>'+label+'</label><input data-input="'+name+'" type="'+type+'" value="'+String(val).replace(/"/g,'&quot;')+'"></div>';
  }
  function renderSignalForm(){
    var f=[inputField('asset','Asset','text'),inputField('timeframe','Candle timeframe','text',['15s','30s','1m']),inputField('expiry','Expiry','text',['3s','5s','15s','30s','1m']),inputField('direction','Price direction','text',['Uptrend','Downtrend','Sideways']),inputField('current','Current candle','text',['Strong Green','Strong Red','Doji','Weak','Mixed']),inputField('previous','Previous candle','text',['Strong Green','Strong Red','Doji','Weak','Mixed']),inputField('zigzag','ZigZag direction','text',['Higher High','Higher Low','Lower High','Lower Low','Unknown']),inputField('k','Stochastic K value','number'),inputField('d','Stochastic D value','number'),inputField('cross','Stochastic cross','text',['Cross Up','Cross Down','No Cross']),inputField('zone','Stochastic zone','text',['Overbought above 80','Oversold below 20','Middle']),inputField('ema9','EMA 9 relation','text',['Price above','Price below','crossing']),inputField('ema50','EMA 50 relation','text',['Price above','Price below','crossing']),inputField('band','Bollinger Band position','text',['Upper band','middle','lower band','outside band']),inputField('sr','Support/resistance nearby','text',['Yes','No']),inputField('trendline','Trendline touch','text',['Yes','No']),inputField('momentum','Momentum strength','text',['Low','Medium','High']),inputField('wick','Wick / rejection','text',['Clean / no long wick','Long wick / rejection','Choppy wicks'])];
    document.getElementById('signalForm').innerHTML=f.join('');
  }
  function renderDashboard(){
    var r=riskStatus(), sig=state.latest;
    document.getElementById('dashboardCards').innerHTML = [
      card('Status',r.text,r.locked?'red':(r.paused?'blue':'green')), card('Daily P/L',money(r.pl),r.pl>=0?'green':'red'), card('Daily target',money(state.settings.target),'gold'), card('Daily loss stop',money(state.settings.maxLoss),'red'), card('Trades',r.trades+' / '+state.settings.maxTrades,''), card('Win / Loss streak',r.wins+'W • '+r.losses+'L',''), card('Model',activeModel().name,'gold'), card('Trade size',riskTradeSize(),'blue')
    ].join('');
    document.getElementById('latestSignal').innerHTML = '<div class="label">Latest Signal</div><div class="signal '+(sig.signal==='CALL'?'green':sig.signal==='PUT'?'red':sig.signal==='LOCKED'?'red':'gold')+'">'+sig.signal+'</div><div class="pillrow"><span class="pill">Confidence: '+sig.confidence+'</span><span class="pill">Expiry: '+sig.expiry+'</span><span class="pill">Next: '+sig.nextAction+'</span></div><p>'+sig.reason+'</p><div class="checklist">'+Object.keys(sig.checklist).map(function(k){return '<div class="check"><b>'+k+':</b><span>'+sig.checklist[k]+'</span></div>';}).join('')+'</div>';
    document.getElementById('dataSourceCard').innerHTML = '<div class="label">Data Source</div><div class="value blue">'+DATA_SOURCE.mode+'</div><div class="pillrow"><span class="pill">'+DATA_SOURCE.status+'</span><span class="pill">No auto-trading</span></div><p class="small">'+DATA_SOURCE.detail+'</p>';
  }
  function card(label,value,cls){ return '<div class="card"><div class="label">'+label+'</div><div class="value '+(cls||'')+'">'+value+'</div></div>'; }
  function renderModels(){ document.getElementById('modelList').innerHTML=Object.keys(MODELS).map(function(k){var m=MODELS[k], enabled=state.settings.enabledModels.indexOf(k)>-1; return '<div class="model '+(state.settings.model===k?'active':'')+'"><div class="model-top"><div><h3>MODEL '+k+': '+m.name+'</h3><p><b>Best for:</b> '+m.best+'</p><p>'+m.risk+'</p><div class="pillrow"><span class="pill">'+(enabled?'Enabled':'Disabled in settings')+'</span><span class="pill">Max confidence: '+m.max+'</span></div></div><button class="btn '+(state.settings.model===k?'primary':'secondary')+'" data-model="'+k+'" '+(!enabled?'disabled':'')+'>'+(state.settings.model===k?'Selected':'Use')+'</button></div></div>';}).join(''); }
  function renderStats(){ var trades=state.trades, wins=trades.filter(function(t){return t.result==='Win';}).length, losses=trades.filter(function(t){return t.result==='Loss';}).length, avg=trades.length?trades.reduce(function(s,t){return s+Number(t.pl||0);},0)/trades.length:0; document.getElementById('statsCards').innerHTML=[card('Daily win rate',rate(dailyTrades()),'green'),card('Weekly win rate',rate(trades.filter(function(t){return Date.now()-new Date(t.date).getTime()<7*864e5;})),'gold'),card('Best model',best('model'),'blue'),card('Worst model',worst('model'),'red'),card('Best asset',best('asset'),'green'),card('Average P/L',money(avg),avg>=0?'green':'red'),card('Wins / Losses',wins+' / '+losses,''),card('Loss warning',streak('Loss')>=1?streak('Loss')+' loss streak':'Clear',streak('Loss')?'red':'green')].join(''); }
  function rate(list){ var done=list.filter(function(t){return t.result==='Win'||t.result==='Loss';}); if(!done.length) return '0%'; return Math.round(done.filter(function(t){return t.result==='Win';}).length/done.length*100)+'%'; }
  function groupScore(field){ var map={}; state.trades.forEach(function(t){ var key=t[field]||'Unknown'; map[key]=(map[key]||0)+Number(t.pl||0); }); return map; }
  function best(field){ var m=groupScore(field), keys=Object.keys(m); if(!keys.length) return 'None'; return keys.sort(function(a,b){return m[b]-m[a];})[0]; }
  function worst(field){ var m=groupScore(field), keys=Object.keys(m); if(!keys.length) return 'None'; return keys.sort(function(a,b){return m[a]-m[b];})[0]; }
  function renderJournal(){ renderStats(); var sig=state.latest; document.getElementById('journalForm').innerHTML='<div class="field"><label>Result</label><select id="jResult"><option>Win</option><option>Loss</option><option>Skip</option><option>Pending</option></select></div><div class="field"><label>Profit/loss</label><input id="jPl" type="number" step="0.01" value="0"></div><div class="field"><label>Notes</label><textarea id="jNotes" placeholder="Screenshot observations, emotion, payout, execution quality"></textarea></div><div class="field"><label>Optional screenshot</label><input id="jShot" type="file" accept="image/*"></div><p class="small">Pre-filled from latest: '+sig.signal+' • '+modelName(sig.model)+' • '+(state.input.asset||'Asset')+'</p>'; document.getElementById('tradeList').innerHTML=state.trades.slice().reverse().slice(0,20).map(function(t){return '<div class="card trade"><div class="label">'+new Date(t.date).toLocaleString()+'</div><div class="value">'+t.signal+' • '+t.result+' • '+money(t.pl)+'</div><p class="small">'+modelName(t.model)+' · '+t.asset+' · '+t.timeframe+' / '+t.expiry+' · '+t.confidence+'</p><p>'+ (t.notes||'') +'</p></div>';}).join('') || '<div class="empty">No trades saved yet.</div>'; }
  function renderEducation(){ var cards=[['⚡','Flick','Quick burst candle. Enter only with confirmation. Very noisy; demo or tiny size only.'],['〽','Slide','Trend pullback continuation to EMA, trendline, or support/resistance. Safest 1SV model.'],['↺','Reach','Overbought/oversold band reach with rejection wick. Risky without confirmation.'],['✋','Choppy','Mixed candles, long wicks, sideways action. Stay out and protect capital.']]; document.getElementById('educationCards').innerHTML=cards.map(function(c){return '<div class="card"><div class="edu-icon">'+c[0]+'</div><div class="value gold">'+c[1]+'</div><p class="small">'+c[2]+'</p></div>';}).join(''); }
  function settingField(name,label,type,options){ var val=state.settings[name]; if(options) return '<div class="field"><label>'+label+'</label><select data-setting="'+name+'">'+options.map(function(o){return '<option '+(o===val?'selected':'')+'>'+o+'</option>';}).join('')+'</select></div>'; return '<div class="field"><label>'+label+'</label><input data-setting="'+name+'" type="'+type+'" value="'+String(val==null?'':val).replace(/"/g,'&quot;')+'"></div>'; }
  function renderSettings(){ var modelChecks='<div class="field"><label>Enabled models</label>'+Object.keys(MODELS).map(function(k){return '<label class="small" style="display:flex;align-items:center;gap:10px;background:#0d0d0d;border:1px solid rgba(214,168,79,.18);border-radius:14px;padding:10px;margin-bottom:6px;"><input style="width:auto;min-height:auto;" type="checkbox" data-enabled="'+k+'" '+(state.settings.enabledModels.indexOf(k)>-1?'checked':'')+'> MODEL '+k+' — '+MODELS[k].name+'</label>';}).join('')+'</div>'; document.getElementById('settingsForm').innerHTML=[settingField('target','Profit target','number'),settingField('maxLoss','Max daily loss','number'),settingField('maxTrades','Max trades','number'),settingField('maxLossStreak','Max loss streak','number'),settingField('pauseWinStreak','Pause after win streak','number'),settingField('balance','Account balance for size guide','number'),settingField('preferredTimeframe','Preferred timeframe','text',['15s','30s','1m']),settingField('preferredExpiry','Preferred expiry','text',['3s','5s','15s','30s','1m']),'<div class="notice"><b>Live data connector:</b> Not connected yet. This app currently uses manual chart inputs and optional screenshot capture only; it does not read Pocket Option, broker feeds, payouts, live trader view, or balances.</div>',modelChecks,settingField('botToken','Telegram Bot Token (local only)','password'),settingField('chatId','Telegram Chat ID (local only)','text')].join('')+'<p class="small">Broker logins and Pocket Option credentials are never requested or stored. No martingale. No doubling after losses.</p>'; }
  function refresh(){ renderDashboard(); renderSignalForm(); renderModels(); renderJournal(); renderEducation(); renderSettings(); var r=riskStatus(); var btn=document.getElementById('generateSignal'); if(btn){ btn.disabled=r.locked; btn.textContent=r.locked?'LOCKED — reset next day':'Generate Signal'; } document.querySelectorAll('#signalForm input,#signalForm select,#signalForm textarea').forEach(function(el){ el.disabled=r.locked; }); save(); }
  function nav(id){ document.querySelectorAll('.screen').forEach(function(e){e.classList.toggle('active', e.id===id);}); document.querySelectorAll('.tab').forEach(function(e){e.classList.toggle('active', e.getAttribute('data-nav')===id);}); }
  document.addEventListener('click', function(e){ var t=e.target.closest('button'); if(!t) return; var n=t.getAttribute('data-nav'); if(n){ nav(n); return; } var mdl=t.getAttribute('data-model'); if(mdl){ state.settings.model=mdl; state.latest=buildSignal('WAIT','Medium',state.settings.preferredExpiry,'Model switched. Generate a new signal with current chart inputs.','WAIT', checklist('Pending','Pending','Pending','Structure only','Pending',riskStatus().text)); refresh(); return; } });
  document.addEventListener('input', function(e){ var el=e.target; if(el.matches('[data-input]')){ state.input[el.getAttribute('data-input')]=el.value; save(); } if(el.matches('[data-setting]')){ state.settings[el.getAttribute('data-setting')]=el.value; save(); } if(el.matches('[data-enabled]')){ var k=el.getAttribute('data-enabled'); if(el.checked && state.settings.enabledModels.indexOf(k)===-1) state.settings.enabledModels.push(k); if(!el.checked) state.settings.enabledModels=state.settings.enabledModels.filter(function(x){return x!==k;}); if(!state.settings.enabledModels.length){ state.settings.enabledModels=[k]; el.checked=true; } if(state.settings.enabledModels.indexOf(state.settings.model)===-1) state.settings.model=state.settings.enabledModels[0]; save(); } });
  document.getElementById('generateSignal').onclick=function(){ state.latest=analyze(); sendTelegram(state.latest, false); refresh(); nav('home'); };
  document.getElementById('clearInput').onclick=function(){ state.input=Object.assign({}, defaultInput); refresh(); };
  document.getElementById('saveSettings').onclick=function(){ save(); refresh(); nav('home'); };
  document.getElementById('resetDay').onclick=function(){ state.lockedUntil=''; state.paused=false; state.trades=state.trades.filter(function(t){return (t.date||'').slice(0,10)!==today();}); state.latest=buildSignal('WAIT','Low',state.settings.preferredExpiry,'Daily stats reset manually. Confirm this is a new session/day before trading.','WAIT', checklist('Reset','Reset','Reset','Reset','Reset','ACTIVE')); refresh(); nav('home'); };
  document.getElementById('testTelegram').onclick=function(){ sendTelegram(buildSignal('WAIT','High',state.settings.preferredExpiry,'Telegram test from 1SV Fast Trade AI. Manual confirmation only; no live broker feed is connected.','WAIT', checklist('Test','Test','Test','Test','Test',riskStatus().text)), true); };
  document.getElementById('saveTrade').onclick=function(){ var sig=state.latest; var trade={ date:new Date().toISOString(), model:sig.model, asset:state.input.asset, timeframe:state.input.timeframe, expiry:sig.expiry, signal:sig.signal, confidence:sig.confidence, result:document.getElementById('jResult').value, pl:Number(document.getElementById('jPl').value||0), notes:document.getElementById('jNotes').value, screenshot:(document.getElementById('jShot').files[0]||{}).name||'' }; state.trades.push(trade); riskStatus(); refresh(); };
  document.getElementById('exportCsv').onclick=function(){ var rows=[['Date/time','Model used','Asset','Timeframe','Expiry','Signal','Confidence','Result','Profit/loss','Notes']].concat(state.trades.map(function(t){return [t.date,modelName(t.model),t.asset,t.timeframe,t.expiry,t.signal,t.confidence,t.result,t.pl,t.notes];})); var csv=rows.map(function(r){return r.map(function(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"';}).join(',');}).join('\n'); var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='1sv-trade-journal.csv'; a.click(); URL.revokeObjectURL(a.href); };
  document.getElementById('acceptRisk').onclick=function(){ safeSet('oneSvRiskAccepted','yes'); hideRiskWarning(); };
  document.getElementById('skipRiskStorage').onclick=function(){ hideRiskWarning(); };
  if(safeGet('oneSvRiskAccepted')==='yes') hideRiskWarning();
  if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function(){});
  refresh();
})();
</script>
</body>
</html>`;
}
