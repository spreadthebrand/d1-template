-- Migration number: 0003 2026-05-06T00:00:00.000Z
ALTER TABLE sheets ADD COLUMN creation_date TEXT NOT NULL DEFAULT '';

UPDATE sheets
SET creation_date = release_date
WHERE creation_date = '' AND release_date != '';
