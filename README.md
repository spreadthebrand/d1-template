# 1SV Fast Trade AI

1SV Fast Trade AI is a mobile-first PWA for manually analyzing Pocket Option-style binary-options chart context, generating disciplined **CALL / PUT / WAIT / NO TRADE / LOCKED** signals, and journaling outcomes. It is built as a Cloudflare Worker single-page app with TypeScript, LocalStorage persistence, install support, optional Telegram alerts, and no real-money execution.

> **Educational trading assistant only. Trading is risky. This app does not provide financial advice and does not guarantee results.**

## Safety boundaries

- The app **does not auto-place trades**.
- The app **does not connect to brokers**.
- The app **does not request or store Pocket Option credentials**.
- The app **does not currently pull live Pocket Option, broker candle, payout, balance, or live-trader-view data**. Current signals are based on manual inputs and optional screenshot capture prep only.
- Telegram bot token and chat ID are optional and stored locally in the browser only.
- Signal logic can return `LOCKED` whenever hard risk rules are hit.
- Binary options, especially very short expiries, can lose money quickly; offshore or unregulated brokers can add custody, pricing, payout, and withdrawal risks.

## Core features

- Premium black/gold mobile command-center UI with large thumb-friendly controls.
- Home dashboard with status, daily P/L, target, max loss, trade count, streaks, selected model, latest signal, confidence, expiry, reason, checklist, next action, and a clear data-source status card.
- Manual signal input for trend, candles, ZigZag, stochastic, EMA, Bollinger Band, support/resistance, trendline, momentum, and wick context.
- Five switchable trading models:
  - **Model A:** 1SV ZigZag Stochastic Scalper.
  - **Model B:** 1SV 3-Second Flick Model.
  - **Model C:** 1SV Slide Pullback Model.
  - **Model D:** 1SV Reversal Reach Model.
  - **Model E:** 1SV Elon Mode / Systems Mode.
- Risk control engine with daily target, max loss, max trades, max loss streak, pause-after-win-streak, no martingale guidance, no doubling after losses, and trade-size guide.
- Trade journal with daily/weekly win rate, best/worst model, best asset, average P/L, loss warnings, optional screenshot filename, notes, and CSV export.
- Visual education cards for Flick, Slide, Reach, and Choppy market states.
- Optional Telegram alerts for High confidence manual-input signals only, plus a settings test button.
- PWA manifest and service worker for install/offline fallback.

## Tech stack

- Cloudflare Workers
- TypeScript
- Vanilla single-page app served from the Worker
- LocalStorage persistence
- PWA manifest + service worker
- Optional Telegram Bot API integration

## Getting started

Install dependencies:

```bash
npm install
```

Run the local Worker dev server:

```bash
npm run dev
```

Run type-check and Cloudflare dry-run validation:

```bash
npm run check
```

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## Configuration

The Admin / Settings screen lets you adjust:

- Profit target
- Max daily loss
- Max trades per day
- Max loss streak
- Pause after win streak
- Account balance used for recommended trade size
- Preferred timeframe
- Preferred expiry
- Enabled models
- Telegram bot token and chat ID
- Telegram test alert
- Current live-data connector status
- Daily reset
- CSV export through the journal screen

## Signal discipline

The current version is **manual-data mode**: it does not receive live Pocket Option or broker data. The signal engine deliberately combines model-specific setup logic with the risk-control engine. A model setup can be valid and still be overridden by `WAIT`, `NO TRADE`, or `LOCKED` if the market is extended, choppy, missing confirmation, or outside the configured daily risk plan.

Every signal returns:

- Signal: `CALL`, `PUT`, `WAIT`, `NO TRADE`, or `LOCKED`
- Confidence: `Low`, `Medium`, or `High`
- Expiry recommendation
- Plain-English reason
- Checklist for trend, candle, stochastic, ZigZag, support/resistance, and risk status
- Next action: `ENTER`, `WAIT`, `STOP`, or `DEMO ONLY`

## Deployment notes

The app uses browser LocalStorage for the trading journal and settings. The Worker configuration has no database binding and is deployable to Cloudflare Workers without Supabase, D1, or broker integration.

## Live data roadmap

Right now, alerts are generated only after the user enters chart context manually. A future Pocket Option-compatible connector, screenshot vision parser, or approved market-data feed can provide inputs to the same signal engine, but it should still avoid storing broker credentials and must not auto-execute real-money trades.
