-- Migration number: 0001  2026-05-09T00:00:00.000Z
-- 1SV Distribution production MVP schema and seed data for Cloudflare D1.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('artist','label_manager','admin','super_admin')),
  status TEXT NOT NULL DEFAULT 'active',
  artist_profile_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city_state TEXT NOT NULL,
  genre TEXT NOT NULL,
  spotify_link TEXT,
  apple_music_link TEXT,
  youtube_link TEXT,
  instagram TEXT,
  tiktok TEXT,
  website TEXT,
  current_distributor TEXT,
  monthly_listeners INTEGER,
  monthly_streaming_revenue REAL,
  number_of_releases INTEGER,
  upcoming_release_date TEXT,
  signed_to_label INTEGER DEFAULT 0,
  owns_masters INTEGER DEFAULT 0,
  needs_publishing_help INTEGER DEFAULT 0,
  needs_sync_help INTEGER DEFAULT 0,
  needs_marketing_help INTEGER DEFAULT 0,
  notes TEXT,
  epk_file_name TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  admin_decision_note TEXT,
  reviewed_by TEXT REFERENCES users(id),
  reviewed_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE TABLE IF NOT EXISTS artist_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  application_id TEXT REFERENCES applications(id),
  artist_name TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  city_state TEXT,
  genre TEXT,
  label_name TEXT,
  manager_name TEXT,
  onboarding_status TEXT NOT NULL DEFAULT 'pending',
  backend_visibility_enabled INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_artist_profiles_user ON artist_profiles(user_id);

CREATE TABLE IF NOT EXISTS backend_distributors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1,
  public_disclosure_allowed INTEGER NOT NULL DEFAULT 0,
  operational_notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS releases (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id),
  artist_profile_id TEXT REFERENCES artist_profiles(id),
  release_type TEXT NOT NULL CHECK (release_type IN ('Single','EP','Album')),
  release_title TEXT NOT NULL,
  primary_artist TEXT NOT NULL,
  featured_artists TEXT,
  label_name TEXT NOT NULL,
  copyright_owner TEXT NOT NULL,
  phonographic_copyright_owner TEXT NOT NULL,
  release_date TEXT NOT NULL,
  presave_date TEXT,
  genre TEXT NOT NULL,
  subgenre TEXT,
  language TEXT NOT NULL,
  explicit_content INTEGER NOT NULL DEFAULT 0,
  cover_art_file_name TEXT,
  audio_file_name TEXT,
  stores_json TEXT,
  youtube_content_id_opt_in INTEGER NOT NULL DEFAULT 0,
  sync_licensing_opt_in INTEGER NOT NULL DEFAULT 0,
  territory_restrictions TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','in_review','changes_requested','approved','delivered','live','rejected')),
  admin_notes TEXT,
  artist_notes TEXT,
  backend_distributor_id TEXT REFERENCES backend_distributors(id),
  delivery_status TEXT,
  delivery_notes TEXT,
  delivery_date TEXT,
  dsp_issue_flag INTEGER NOT NULL DEFAULT 0,
  content_id_status TEXT,
  royalty_import_source TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_releases_owner ON releases(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_releases_status ON releases(status);

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  release_id TEXT NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  sequence_number INTEGER NOT NULL,
  track_title TEXT NOT NULL,
  isrc TEXT,
  request_isrc INTEGER NOT NULL DEFAULT 0,
  upc TEXT,
  request_upc INTEGER NOT NULL DEFAULT 0,
  songwriter_names TEXT,
  producer_names TEXT,
  publisher_info TEXT,
  pro_affiliation TEXT,
  split_percentages_json TEXT,
  lyrics TEXT,
  lyrics_explicit INTEGER NOT NULL DEFAULT 0,
  clip_start_time TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contributors (
  id TEXT PRIMARY KEY,
  track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  split_percentage REAL,
  ipi_cae TEXT,
  publisher TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS royalty_statements (
  id TEXT PRIMARY KEY,
  artist_user_id TEXT NOT NULL REFERENCES users(id),
  reporting_period TEXT NOT NULL,
  source TEXT NOT NULL,
  file_name TEXT,
  uploaded_by TEXT REFERENCES users(id),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_royalty_artist ON royalty_statements(artist_user_id);

CREATE TABLE IF NOT EXISTS royalty_rows (
  id TEXT PRIMARY KEY,
  statement_id TEXT NOT NULL REFERENCES royalty_statements(id) ON DELETE CASCADE,
  reporting_period TEXT NOT NULL,
  dsp_source TEXT NOT NULL,
  track_title TEXT NOT NULL,
  streams INTEGER NOT NULL DEFAULT 0,
  gross_revenue REAL NOT NULL DEFAULT 0,
  fees REAL NOT NULL DEFAULT 0,
  net_payable REAL NOT NULL DEFAULT 0,
  paid_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (paid_status IN ('unpaid','processing','paid')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payout_requests (
  id TEXT PRIMARY KEY,
  artist_user_id TEXT NOT NULL REFERENCES users(id),
  amount REAL NOT NULL,
  method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','paid','rejected')),
  notes TEXT,
  approved_by TEXT REFERENCES users(id),
  paid_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS service_orders (
  id TEXT PRIMARY KEY,
  artist_user_id TEXT NOT NULL REFERENCES users(id),
  service_name TEXT NOT NULL,
  stripe_checkout_session_id TEXT,
  amount REAL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_user_id TEXT REFERENCES users(id),
  recipient_user_id TEXT REFERENCES users(id),
  release_id TEXT REFERENCES releases(id),
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'artist_admin',
  read_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_notes (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  admin_user_id TEXT NOT NULL REFERENCES users(id),
  note TEXT NOT NULL,
  internal_only INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_path TEXT,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_scan',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pricing_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  description TEXT NOT NULL,
  features_json TEXT NOT NULL,
  stripe_price_env_key TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'internal',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details_json TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);

INSERT OR IGNORE INTO users (id, email, password_hash, password_salt, full_name, role, status, created_at) VALUES
('demo-admin', 'admin@1sv.test', 'd50cfdf3fbf3fc90be3d96d7eb8c75bc18d524a3800cbdc97810ec2aaba5b19f', 'demo-admin-salt', '1SV Admin', 'super_admin', 'active', datetime('now')),
('demo-artist', 'artist@1sv.test', '0e1a0ce396e7c6f51c1fadc76cffae2c787061a335ee61acdc5d12fed4f2ec5a', 'demo-artist-salt', 'Demo Artist', 'artist', 'active', datetime('now'));

INSERT OR IGNORE INTO artist_profiles (id, user_id, artist_name, legal_name, city_state, genre, label_name, onboarding_status, created_at) VALUES
('demo-artist-profile', 'demo-artist', 'Demo Artist', 'Demo Artist LLC', 'Houston, TX', 'Hip-Hop/R&B', '1 Soundvibe Entertainment', 'approved', datetime('now'));
UPDATE users SET artist_profile_id = 'demo-artist-profile' WHERE id = 'demo-artist';

INSERT OR IGNORE INTO backend_distributors (id, name, is_active, public_disclosure_allowed, operational_notes, created_at) VALUES
('bd-vydia','Vydia',1,0,'Internal backend option; hidden from artists by default.',datetime('now')),
('bd-toolost','Too Lost',1,0,'Internal backend option; hidden from artists by default.',datetime('now')),
('bd-symphonic','Symphonic',1,0,'Internal backend option; hidden from artists by default.',datetime('now')),
('bd-fuga','FUGA',1,0,'Internal backend option; hidden from artists by default.',datetime('now')),
('bd-virgin','Virgin Music Group',1,0,'Internal backend option; hidden from artists by default.',datetime('now')),
('bd-other','Other',1,0,'Custom operational partner.',datetime('now'));

INSERT OR IGNORE INTO pricing_plans (id, name, plan_type, description, features_json, stripe_price_env_key, created_at) VALUES
('starter','Starter Distribution','package','Single release intake with DSP delivery support, metadata review, and basic royalty tracking.','["Single release intake","DSP delivery support","Metadata review","Basic royalty tracking"]','STRIPE_PRICE_SETUP_FEE',datetime('now')),
('pro','Pro Artist Rollout','package','Distribution plus release strategy, cover art review, YouTube monetization support, and playlist pitch prep.','["Distribution","Release strategy","Cover art review","YouTube monetization support","Playlist pitch prep"]','STRIPE_PRICE_MONTHLY_PLAN',datetime('now')),
('label','Label Services','package','Multiple artist support, royalty tracking, catalog management, admin support, and sync review.','["Multiple artist support","Royalty tracking","Catalog management","Admin support","Sync opportunity review"]',NULL,datetime('now')),
('addons','Add-ons','addon','Cover art design, video distribution, YouTube audit, EPK, press release, playlist pitching, studio booking, sync review, rollout, websites.','["Cover Art Design","Music Video Distribution","YouTube Channel Audit","EPK Creation","Press Release","Playlist Pitching","Studio Session Booking","Sync Licensing Review","Social Media Rollout","Website/Landing Page"]','STRIPE_PRICE_ADD_ON',datetime('now'));

INSERT OR IGNORE INTO releases (id, owner_user_id, artist_profile_id, release_type, release_title, primary_artist, label_name, copyright_owner, phonographic_copyright_owner, release_date, genre, language, stores_json, status, youtube_content_id_opt_in, sync_licensing_opt_in, backend_distributor_id, delivery_status, created_at) VALUES
('demo-release', 'demo-artist', 'demo-artist-profile', 'Single', 'Gold Frequency', 'Demo Artist', '1 Soundvibe Entertainment', 'Demo Artist LLC', 'Demo Artist LLC', '2026-06-21', 'Hip-Hop/R&B', 'English', '["Spotify","Apple Music","YouTube Music","TikTok","Instagram"]', 'in_review', 1, 1, 'bd-vydia', 'package_preparing', datetime('now'));
INSERT OR IGNORE INTO tracks (id, release_id, sequence_number, track_title, request_isrc, request_upc, songwriter_names, producer_names, publisher_info, pro_affiliation, split_percentages_json, lyrics_explicit, clip_start_time, created_at) VALUES
('demo-track', 'demo-release', 1, 'Gold Frequency', 1, 1, 'Demo Artist', '1SV Producer', 'Demo Publishing', 'BMI', '[{"name":"Demo Artist","split":100}]', 0, '00:45', datetime('now'));

INSERT OR IGNORE INTO royalty_statements (id, artist_user_id, reporting_period, source, uploaded_by, created_at) VALUES
('demo-statement', 'demo-artist', '2026-04', 'Manual Import', 'demo-admin', datetime('now'));
INSERT OR IGNORE INTO royalty_rows (id, statement_id, reporting_period, dsp_source, track_title, streams, gross_revenue, fees, net_payable, paid_status, created_at) VALUES
('demo-royalty-row', 'demo-statement', '2026-04', 'Spotify', 'Gold Frequency', 125000, 512.40, 76.86, 435.54, 'unpaid', datetime('now'));

INSERT OR REPLACE INTO platform_settings (key, value, visibility, updated_at) VALUES
('brand_name','1 Soundvibe Entertainment','public',datetime('now')),
('platform_name','1SV Distribution','public',datetime('now')),
('tagline','Connect. Create. Build. Distribute.','public',datetime('now')),
('backend_distributor_visibility','false','internal',datetime('now'));
