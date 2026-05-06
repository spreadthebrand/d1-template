-- Migration number: 0002 2026-05-06T00:00:00.000Z
CREATE TABLE IF NOT EXISTS sheets (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    artist TEXT NOT NULL DEFAULT '',
    isrc TEXT NOT NULL DEFAULT '',
    release_date TEXT NOT NULL DEFAULT '',
    split_type TEXT NOT NULL DEFAULT 'master',
    status TEXT NOT NULL DEFAULT 'draft',
    collaborators_json TEXT NOT NULL,
    master_total REAL NOT NULL DEFAULT 0,
    publishing_total REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sheets_user_updated ON sheets(user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS subscriptions (
    user_id TEXT PRIMARY KEY NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'free',
    current_period_end TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
