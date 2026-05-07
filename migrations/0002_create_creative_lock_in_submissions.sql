-- Store invite requests and sponsorship interest for The Girls Room Creative Lock In.
CREATE TABLE IF NOT EXISTS creative_lock_in_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    social TEXT,
    notes TEXT,
    upload_file_name TEXT,
    sponsorship_interest TEXT NOT NULL DEFAULT 'No',
    sponsor_name TEXT,
    sponsor_level TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
