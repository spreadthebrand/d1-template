-- 1SV Content Engine Supabase-ready schema
-- Run this in Supabase SQL editor for Postgres projects. The Worker demo remains usable with mock data.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('Owner', 'Admin', 'Team Member', 'Client');
CREATE TYPE post_status AS ENUM ('Draft', 'Scheduled', 'Published', 'Failed');
CREATE TYPE lead_status AS ENUM ('New', 'Contacted', 'Booked', 'Lost');
CREATE TYPE billing_interval AS ENUM ('trial', 'monthly', 'annual', 'lifetime');

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    default_role user_role NOT NULL DEFAULT 'Owner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    booking_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'Team Member',
    UNIQUE (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS brand_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    brand_colors JSONB NOT NULL DEFAULT '{}',
    tone_of_voice TEXT,
    target_audience TEXT,
    main_offer TEXT,
    social_profiles JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    source_content TEXT,
    content_goal TEXT,
    audience TEXT,
    offer_cta TEXT,
    tone TEXT,
    platform TEXT,
    content_type TEXT,
    generated_outputs JSONB NOT NULL DEFAULT '{}',
    ai_credit_cost INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scheduled_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    content_item_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
    platform TEXT NOT NULL,
    caption TEXT NOT NULL,
    media_urls JSONB NOT NULL DEFAULT '[]',
    scheduled_for TIMESTAMPTZ,
    cta TEXT,
    campaign_tag TEXT,
    status post_status NOT NULL DEFAULT 'Draft',
    external_post_id TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    keyword_trigger TEXT NOT NULL,
    platform TEXT NOT NULL,
    comment_reply_message TEXT,
    dm_message TEXT,
    follow_up_message TEXT,
    booking_link TEXT,
    lead_tag TEXT,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    compliance_note TEXT NOT NULL DEFAULT 'Use only with connected accounts and platform-approved permissions.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS automation_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID NOT NULL REFERENCES automation_flows(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_type TEXT NOT NULL,
    message TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    phone TEXT,
    instagram_handle TEXT,
    source_platform TEXT,
    trigger_keyword TEXT,
    interested_service TEXT,
    status lead_status NOT NULL DEFAULT 'New',
    notes TEXT,
    assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    follow_up_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS link_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    template_name TEXT NOT NULL,
    profile_image_url TEXT,
    bio_text TEXT,
    theme_colors JSONB NOT NULL DEFAULT '{}',
    social_links JSONB NOT NULL DEFAULT '{}',
    qr_code_url TEXT,
    vcard_payload JSONB NOT NULL DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS link_buttons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_page_id UUID NOT NULL REFERENCES link_pages(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    button_type TEXT NOT NULL DEFAULT 'custom',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS analytics_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    snapshot_date DATE NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workspace_id, platform, snapshot_date)
);

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    goal TEXT,
    start_date DATE,
    end_date DATE,
    offer TEXT,
    target_audience TEXT,
    platforms TEXT[] NOT NULL DEFAULT '{}',
    content_frequency TEXT,
    ai_generated_content_plan JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    body TEXT NOT NULL,
    variables JSONB NOT NULL DEFAULT '[]',
    is_system_template BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    stripe_price_id TEXT,
    price_cents INTEGER NOT NULL DEFAULT 0,
    interval billing_interval NOT NULL DEFAULT 'monthly',
    included_ai_credits INTEGER NOT NULL DEFAULT 0,
    workspace_limit INTEGER,
    features JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    level TEXT NOT NULL DEFAULT 'info',
    event TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO billing_plans (name, price_cents, interval, included_ai_credits, workspace_limit, features)
VALUES
    ('Free Trial', 0, 'trial', 25, 1, '["Planning tools", "Mock AI outputs"]'),
    ('Creator Plan', 2900, 'monthly', 1000, 3, '["Exports", "Link pages", "Calendar"]'),
    ('Pro Plan', 7900, 'monthly', 5000, 10, '["Automation builder", "Team seats", "CRM"]'),
    ('Agency Plan', 19900, 'monthly', 20000, NULL, '["Client workspaces", "Admin reporting", "Advanced exports"]'),
    ('Lifetime Deal', 99700, 'lifetime', 50000, NULL, '["Founder access", "Annual credit bundle"]')
ON CONFLICT (name) DO NOTHING;

INSERT INTO templates (category, name, body, is_system_template)
VALUES
    ('Studio promo captions', 'Studio booking CTA', 'Your next record deserves a room with the right sound, workflow, and vibe. Book your session today.', TRUE),
    ('DM scripts', 'Studio keyword response', 'Thanks for reaching out. Here is the booking link: {{booking_link}}. What date are you looking for?', TRUE),
    ('Email templates', 'Campaign launch email', 'Subject: {{campaign_name}} is live\n\nHere is why it matters and what to do next: {{cta}}', TRUE)
ON CONFLICT DO NOTHING;
