-- ============================================================================
-- Safe2Odds Nigeria — Production PostgreSQL Database Schema
-- Architecture for 5,000,000+ Registered Users & High Concurrency
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. USERS & PROFILES TABLE
-- ----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin', 'super_admin');
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'banned');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255), -- NULL if OAuth only
    role user_role NOT NULL DEFAULT 'user',
    account_status account_status NOT NULL DEFAULT 'active',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(512) DEFAULT '/src/assets/images/vip_club_crest_1791379729058.jpg',
    bio TEXT DEFAULT '',
    points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
    total_predictions INTEGER NOT NULL DEFAULT 0 CHECK (total_predictions >= 0),
    total_wins INTEGER NOT NULL DEFAULT 0 CHECK (total_wins >= 0),
    total_losses INTEGER NOT NULL DEFAULT 0 CHECK (total_losses >= 0),
    win_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00 CHECK (win_rate >= 0.00 AND win_rate <= 100.00),
    is_vip BOOLEAN NOT NULL DEFAULT FALSE,
    last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profiles indexes
CREATE INDEX idx_profiles_username ON profiles (username);
CREATE INDEX idx_profiles_points ON profiles (points DESC);
CREATE INDEX idx_profiles_win_rate ON profiles (win_rate DESC);
CREATE INDEX idx_profiles_last_active ON profiles (last_active DESC);

-- ----------------------------------------------------------------------------
-- 2. PREDICTIONS TABLE (COMMUNITY & OFFICIAL)
-- ----------------------------------------------------------------------------
CREATE TYPE prediction_status AS ENUM ('PENDING', 'WON', 'LOST', 'VOID', 'REMOVED');

CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sport VARCHAR(50) NOT NULL DEFAULT 'Football',
    league VARCHAR(100) NOT NULL,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    match_title VARCHAR(220) NOT NULL,
    prediction VARCHAR(150) NOT NULL,
    prediction_type VARCHAR(50) NOT NULL,
    odds NUMERIC(6,2) NOT NULL CHECK (odds >= 1.01 AND odds <= 100.00),
    analysis TEXT,
    event_datetime TIMESTAMPTZ,
    status prediction_status NOT NULL DEFAULT 'PENDING',
    likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
    dislikes_count INTEGER NOT NULL DEFAULT 0 CHECK (dislikes_count >= 0),
    report_count INTEGER NOT NULL DEFAULT 0 CHECK (report_count >= 0),
    is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- High-performance query indexes for feed, search, and admin verification
CREATE INDEX idx_predictions_author_created ON predictions (author_id, created_at DESC);
CREATE INDEX idx_predictions_status_created ON predictions (status, created_at DESC);
CREATE INDEX idx_predictions_league_created ON predictions (league, created_at DESC);
CREATE INDEX idx_predictions_sport_created ON predictions (sport, created_at DESC);
CREATE INDEX idx_predictions_created_cursor ON predictions (created_at DESC, id DESC);
CREATE INDEX idx_predictions_odds ON predictions (odds);

-- ----------------------------------------------------------------------------
-- 3. POINTS TRANSACTIONS (IMMUTABLE LEDGER)
-- ----------------------------------------------------------------------------
CREATE TYPE points_txn_type AS ENUM ('PREDICTION_WON', 'ADMIN_ADJUSTMENT', 'WEEKLY_PRIZE');

CREATE TABLE points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount <> 0),
    type points_txn_type NOT NULL,
    prediction_id UUID REFERENCES predictions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES users(id),
    -- Idempotency constraint: A prediction can only yield ONE won reward transaction
    CONSTRAINT uq_points_prediction_won UNIQUE (prediction_id, type)
);

CREATE INDEX idx_points_txns_user ON points_transactions (user_id, created_at DESC);
CREATE INDEX idx_points_txns_pred ON points_transactions (prediction_id);

-- ----------------------------------------------------------------------------
-- 4. WEEKLY LEADERBOARD MATERIALIZED VIEW / CACHE
-- ----------------------------------------------------------------------------
CREATE TABLE leaderboard_weekly (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(512),
    points_earned INTEGER NOT NULL DEFAULT 0,
    predictions_count INTEGER NOT NULL DEFAULT 0,
    wins_count INTEGER NOT NULL DEFAULT 0,
    win_rate NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    rank INTEGER NOT NULL,
    week_start DATE NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leaderboard_rank ON leaderboard_weekly (rank ASC);

-- ----------------------------------------------------------------------------
-- 5. REPORTS TABLE
-- ----------------------------------------------------------------------------
CREATE TYPE report_reason AS ENUM (
    'Spam', 'Scam', 'Offensive content', 'Misleading content', 'Abuse', 'Illegal content', 'Other'
);
CREATE TYPE report_status AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL, -- 'prediction', 'user', 'comment'
    target_id UUID NOT NULL,
    target_summary TEXT NOT NULL,
    reason report_reason NOT NULL,
    description TEXT,
    status report_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    -- Prevent duplicate reports for same target by same user
    CONSTRAINT uq_user_target_report UNIQUE (reporter_id, target_id)
);

CREATE INDEX idx_reports_status_created ON reports (status, created_at DESC);
CREATE INDEX idx_reports_target ON reports (target_id);

-- ----------------------------------------------------------------------------
-- 6. USER BLOCKS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE user_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_blocker_blocked UNIQUE (blocker_id, blocked_user_id),
    CONSTRAINT chk_no_self_block CHECK (blocker_id <> blocked_user_id)
);

CREATE INDEX idx_user_blocks_blocker ON user_blocks (blocker_id);

-- ----------------------------------------------------------------------------
-- 7. NOTIFICATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TYPE notification_type AS ENUM (
    'PREDICTION_WON', 'PREDICTION_LOST', 'POINTS_AWARDED', 'REPORT_REVIEWED', 'ACCOUNT_NOTICE', 'SYSTEM'
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'SYSTEM',
    read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_read ON notifications (user_id, read, created_at DESC);

-- ----------------------------------------------------------------------------
-- 8. ADMIN AUDIT LOGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id),
    admin_username VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_created ON admin_audit_logs (created_at DESC);
CREATE INDEX idx_audit_logs_admin ON admin_audit_logs (admin_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 9. PREDICTION VOTES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE prediction_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prediction_id UUID NOT NULL REFERENCES predictions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('LIKE', 'DISLIKE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pred_user_vote UNIQUE (prediction_id, user_id)
);

CREATE INDEX idx_pred_votes_pred ON prediction_votes (prediction_id);
