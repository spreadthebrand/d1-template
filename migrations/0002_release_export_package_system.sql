-- Migration number: 0002  2026-05-09T00:00:00.000Z
-- Internal 1SV release export package system for Vydia/manual backend delivery.

ALTER TABLE releases ADD COLUMN backend_distributor TEXT;
ALTER TABLE releases ADD COLUMN backend_account TEXT;
ALTER TABLE releases ADD COLUMN delivered_by TEXT REFERENCES users(id);
ALTER TABLE releases ADD COLUMN dsp_issue_notes TEXT;
ALTER TABLE releases ADD COLUMN dsp_restrictions TEXT;
ALTER TABLE releases ADD COLUMN upc TEXT;
ALTER TABLE releases ADD COLUMN live_links_json TEXT;
ALTER TABLE releases ADD COLUMN cover_width INTEGER;
ALTER TABLE releases ADD COLUMN cover_height INTEGER;
ALTER TABLE releases ADD COLUMN explicit_choice_selected INTEGER NOT NULL DEFAULT 1;
ALTER TABLE releases ADD COLUMN content_id_choice_selected INTEGER NOT NULL DEFAULT 1;
ALTER TABLE releases ADD COLUMN sync_choice_selected INTEGER NOT NULL DEFAULT 1;
ALTER TABLE releases ADD COLUMN executive_producer TEXT;

ALTER TABLE contributors ADD COLUMN ownership_percentage REAL;
ALTER TABLE contributors ADD COLUMN publishing_percentage REAL;
ALTER TABLE contributors ADD COLUMN pro TEXT;
ALTER TABLE contributors ADD COLUMN email TEXT;
ALTER TABLE contributors ADD COLUMN phone TEXT;
ALTER TABLE contributors ADD COLUMN payment_notes TEXT;

CREATE TABLE IF NOT EXISTS export_logs (
  id TEXT PRIMARY KEY,
  release_id TEXT NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  exported_by TEXT NOT NULL REFERENCES users(id),
  export_type TEXT NOT NULL,
  backend_distributor TEXT,
  export_file_url TEXT,
  created_at TEXT NOT NULL,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_export_logs_release ON export_logs(release_id, created_at);

UPDATE backend_distributors SET name = 'Virgin Music Group' WHERE name = 'Virgin';
INSERT OR IGNORE INTO backend_distributors (id, name, is_active, public_disclosure_allowed, operational_notes, created_at) VALUES
('bd-manual-other','Manual / Other',1,0,'Internal manual delivery workflow; hidden from artists by default.',datetime('now'));

UPDATE releases
SET backend_distributor = COALESCE(backend_distributor, (SELECT name FROM backend_distributors WHERE backend_distributors.id = releases.backend_distributor_id)),
    backend_account = COALESCE(backend_account, '1 Soundvibe Entertainment internal delivery account'),
    delivery_status = COALESCE(delivery_status, 'Ready for Export'),
    upc = COALESCE(upc, 'REQUEST'),
    cover_width = COALESCE(cover_width, 3000),
    cover_height = COALESCE(cover_height, 3000)
WHERE backend_distributor IS NULL OR delivery_status IS NULL;

INSERT OR IGNORE INTO contributors (id, track_id, name, role, split_percentage, ownership_percentage, publishing_percentage, pro, ipi_cae, email, phone, payment_notes, created_at)
VALUES ('demo-contributor-writer', 'demo-track', 'Demo Artist', 'Songwriter', 100, 100, 100, 'BMI', '', 'artist@1sv.test', '', 'Payable through artist account', datetime('now'));

UPDATE releases
SET audio_file_name = COALESCE(audio_file_name, 'gold_frequency_master.wav'),
    cover_art_file_name = COALESCE(cover_art_file_name, 'gold_frequency_cover.jpg')
WHERE id = 'demo-release';
