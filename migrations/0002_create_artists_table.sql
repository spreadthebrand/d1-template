-- Houston Next 30 artist chart data.
CREATE TABLE IF NOT EXISTS artists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    song TEXT NOT NULL,
    bio TEXT NOT NULL,
    website TEXT NOT NULL,
    instagram TEXT NOT NULL,
    spotify TEXT NOT NULL,
    youtube TEXT NOT NULL,
    tiktok TEXT NOT NULL,
    isPaid INTEGER NOT NULL DEFAULT 0,
    weeklySpins INTEGER NOT NULL DEFAULT 0,
    digitalSignals INTEGER NOT NULL DEFAULT 0,
    fanVotes INTEGER NOT NULL DEFAULT 0,
    venueReports INTEGER NOT NULL DEFAULT 0,
    lastUpdated TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
