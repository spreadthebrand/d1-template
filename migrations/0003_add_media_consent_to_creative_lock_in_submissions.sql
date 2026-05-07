-- Track recording consent and media-rights acknowledgement for event attendees.
ALTER TABLE creative_lock_in_submissions
ADD COLUMN media_consent TEXT NOT NULL DEFAULT 'No';
