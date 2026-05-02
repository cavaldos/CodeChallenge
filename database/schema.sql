
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- for gen_random_uuid()

-- ============================================================
-- ENUM types
-- ============================================================

CREATE TYPE campaign_status AS ENUM ('draft', 'sending', 'scheduled', 'sent');

CREATE TYPE recipient_status AS ENUM ('pending', 'sent', 'failed');

-- ============================================================
-- Tables
-- ============================================================

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Refresh tokens (for rotation + revoke)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    revoked_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaigns
CREATE TABLE campaigns (
    id           UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(255)     NOT NULL,
    subject      VARCHAR(500)     NOT NULL,
    body         TEXT             NOT NULL,
    status       campaign_status  NOT NULL DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,                                    -- must be future; enforced at app layer & CHECK below
    created_by   UUID             NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

-- scheduled_at is only meaningful when status is 'scheduled'
CONSTRAINT chk_scheduled_at_future
        CHECK (scheduled_at IS NULL OR scheduled_at > created_at)
);

-- Recipients (global list — not per campaign)
CREATE TABLE recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaign ↔ Recipient join table (tracks per-send state)

CREATE TABLE campaign_recipients (
    campaign_id  UUID             NOT NULL REFERENCES campaigns(id)  ON DELETE CASCADE,
    recipient_id UUID             NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
    status       recipient_status NOT NULL DEFAULT 'pending',
    sent_at      TIMESTAMPTZ,
    opened_at    TIMESTAMPTZ,

    PRIMARY KEY (campaign_id, recipient_id),

-- opened_at can only be set after sent_at
CONSTRAINT chk_opened_after_sent
        CHECK (opened_at IS NULL OR sent_at IS NOT NULL)
);

-- ============================================================
-- Indexes
-- ============================================================

-- campaigns: filter/sort by status and owner (most common list queries)
CREATE INDEX idx_campaigns_status ON campaigns (status);

CREATE INDEX idx_campaigns_created_by ON campaigns (created_by);

CREATE INDEX idx_campaigns_scheduled_at ON campaigns (scheduled_at)
WHERE
    scheduled_at IS NOT NULL;
-- composite: dashboard "my campaigns by status"
CREATE INDEX idx_campaigns_created_by_status ON campaigns (created_by, status);

-- campaign_recipients: aggregate stats per campaign (COUNT by status)
CREATE INDEX idx_cr_campaign_id ON campaign_recipients (campaign_id);
-- locate all campaigns a single recipient is part of
CREATE INDEX idx_cr_recipient_id ON campaign_recipients (recipient_id);
-- fast status-based aggregation within a campaign
CREATE INDEX idx_cr_campaign_status ON campaign_recipients (campaign_id, status);

-- recipients: login / lookup by email
CREATE INDEX idx_recipients_email ON recipients (email);

-- users: login lookup
CREATE INDEX idx_users_email ON users (email);

-- refresh token lookups and cleanup
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens (expires_at);
CREATE INDEX idx_refresh_tokens_active ON refresh_tokens (id)
WHERE
    revoked_at IS NULL;

-- ============================================================
-- updated_at auto-update trigger
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Helpful view: campaign stats
-- (mirrors the /stats response shape)
-- ============================================================

CREATE OR REPLACE VIEW campaign_stats AS
SELECT
    c.id AS campaign_id,
    c.name AS campaign_name,
    c.status AS campaign_status,
    COUNT(cr.recipient_id) AS total,
    COUNT(cr.recipient_id) FILTER (
        WHERE
            cr.status = 'sent'
    ) AS sent,
    COUNT(cr.recipient_id) FILTER (
        WHERE
            cr.status = 'failed'
    ) AS failed,
    COUNT(cr.recipient_id) FILTER (
        WHERE
            cr.opened_at IS NOT NULL
    ) AS opened,
    ROUND(
        COUNT(cr.recipient_id) FILTER (
            WHERE
                cr.opened_at IS NOT NULL
        )::NUMERIC / NULLIF(
            COUNT(cr.recipient_id) FILTER (
                WHERE
                    cr.status = 'sent'
            ),
            0
        ) * 100,
        2
    ) AS open_rate,
    ROUND(
        COUNT(cr.recipient_id) FILTER (
            WHERE
                cr.status = 'sent'
        )::NUMERIC / NULLIF(COUNT(cr.recipient_id), 0) * 100,
        2
    ) AS send_rate
FROM
    campaigns c
    LEFT JOIN campaign_recipients cr ON cr.campaign_id = c.id
GROUP BY
    c.id,
    c.name,
    c.status;

-- ============================================================
-- Seed data moved to: database/mock-data.sql
-- ============================================================