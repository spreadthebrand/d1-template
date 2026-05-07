CREATE TABLE IF NOT EXISTS lead_searches (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  search_type TEXT NOT NULL,
  query TEXT NOT NULL,
  connector TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ready for connector',
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

INSERT OR IGNORE INTO message_drafts (id, workspace_id, lead_id, campaign_id, channel, body, risk_level, approval_status)
VALUES
  ('msg_001', 'ws_1sv', 'ld_001', 'cmp_002', 'Instagram DM via approved workflow', 'Hey Maya, your R&B clips feel polished. 1 Soundvibe has a vocal-friendly room in Houston — want me to send a session link?', 'Low', 'Pending'),
  ('msg_002', 'ws_1sv', 'ld_002', 'cmp_003', 'Manual DM approval', 'Yo Corey, your keys and drums caught our ear. We are curating producer collabs at 1 Soundvibe — open to details?', 'Low', 'Pending'),
  ('msg_003', 'ws_1sv', 'ld_004', 'cmp_004', 'Instagram DM via approved workflow', 'Hey Tasha, your live clips have the right energy for Vibe Check Thursday. Want the performer details?', 'Low', 'Pending');

INSERT OR IGNORE INTO conversations (id, workspace_id, lead_id, channel, direction, body, sentiment)
VALUES
  ('conv_001', 'ws_1sv', 'ld_001', 'Instagram', 'outbound', 'Shared studio tour link after manual approval.', 'Neutral'),
  ('conv_002', 'ws_1sv', 'ld_001', 'Instagram', 'inbound', 'This looks good. Do you have evening times?', 'Positive'),
  ('conv_003', 'ws_1sv', 'ld_002', 'Instagram', 'inbound', 'Send me more info about the producer collab.', 'Neutral');

INSERT OR IGNORE INTO booking_links (id, workspace_id, label, provider, url, is_default)
VALUES
  ('book_001', 'ws_1sv', 'Studio Tour', 'Calendly', 'https://calendly.com/1soundvibe/studio-tour', 1),
  ('book_002', 'ws_1sv', 'Recording Session', 'Custom URL', 'https://1soundvibe.com/book-session', 1),
  ('book_003', 'ws_1sv', 'Podcast Room', 'Wix Booking', 'https://1soundvibe.com/podcast-room', 0);

INSERT OR IGNORE INTO automation_rules (id, workspace_id, trigger_name, action_name, requires_approval, enabled)
VALUES
  ('rule_001', 'ws_1sv', 'Lead replies yes', 'Move to Interested', 0, 1),
  ('rule_002', 'ws_1sv', 'Lead asks price', 'Queue pricing template for approval', 1, 1),
  ('rule_003', 'ws_1sv', 'Tour booked webhook', 'Move to Booked Tour', 0, 1),
  ('rule_004', 'ws_1sv', 'No reply after 3 days', 'Queue follow-up for approval', 1, 1),
  ('rule_005', 'ws_1sv', 'Lead says stop', 'Mark Do Not Contact', 0, 1);

INSERT OR IGNORE INTO audit_logs (id, workspace_id, actor_id, action, target_type, target_id)
VALUES
  ('audit_001', 'ws_1sv', 'tm_va', 'Local D1 live workflows activated.', 'workspace', 'ws_1sv'),
  ('audit_002', 'ws_1sv', 'tm_sales', 'Approval queue seeded with safe draft messages.', 'message_draft', 'msg_001');
