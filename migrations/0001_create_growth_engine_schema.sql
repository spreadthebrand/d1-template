-- 1SV Growth Engine PostgreSQL/D1-compatible starter schema.
-- Production Next.js deployments should mirror this structure in Prisma.

CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  business_description TEXT,
  default_tone TEXT NOT NULL DEFAULT 'Friendly',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Owner', 'Manager', 'VA', 'Sales Rep')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  username TEXT,
  profile_url TEXT,
  email TEXT,
  phone TEXT,
  platform TEXT NOT NULL DEFAULT 'Instagram',
  source TEXT,
  tags TEXT,
  notes TEXT,
  status TEXT NOT NULL CHECK (status IN ('New','Contacted','Replied','Interested','Booked Tour','Booked Session','Not Interested','Do Not Contact')),
  city TEXT,
  profile_bio TEXT,
  last_contacted_at TEXT,
  assigned_member_id TEXT,
  consent_status TEXT NOT NULL DEFAULT 'unknown',
  do_not_contact INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (assigned_member_id) REFERENCES team_members(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_workspace_platform_username
  ON leads(workspace_id, platform, username);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  audience TEXT,
  message_step_1 TEXT NOT NULL,
  follow_up_1 TEXT,
  follow_up_2 TEXT,
  wait_time_hours INTEGER NOT NULL DEFAULT 72,
  stop_condition TEXT NOT NULL,
  daily_limit INTEGER NOT NULL DEFAULT 25,
  is_running INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS message_drafts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  lead_id TEXT NOT NULL,
  campaign_id TEXT,
  channel TEXT NOT NULL,
  body TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'Low',
  approval_status TEXT NOT NULL DEFAULT 'Pending',
  approved_by TEXT,
  approved_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
  FOREIGN KEY (approved_by) REFERENCES team_members(id)
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  lead_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
  body TEXT NOT NULL,
  sentiment TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

CREATE TABLE IF NOT EXISTS booking_links (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  label TEXT NOT NULL,
  provider TEXT NOT NULL,
  url TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS automation_rules (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  trigger_name TEXT NOT NULL,
  action_name TEXT NOT NULL,
  requires_approval INTEGER NOT NULL DEFAULT 1,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'placeholder',
  config_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  actor_id TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (actor_id) REFERENCES team_members(id)
);
