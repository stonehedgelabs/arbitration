-- Sports Hub App Database Schema

-- Users table for authentication and user management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    auth_provider VARCHAR(20) NOT NULL CHECK (auth_provider IN ('guest', 'apple', 'google')),
    provider_id VARCHAR(255), -- Apple/Google user ID
    display_name VARCHAR(100),
    avatar_url TEXT,
    has_seen_welcome BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sports leagues (NFL, NBA, MLB, NHL, MLS)
CREATE TABLE leagues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL UNIQUE,
    logo_url TEXT,
    primary_color VARCHAR(7), -- Hex color
    secondary_color VARCHAR(7), -- Hex color
    season_start_month INTEGER, -- 1-12
    season_end_month INTEGER, -- 1-12
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams within leagues
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    logo_url TEXT,
    primary_color VARCHAR(7), -- Hex color
    secondary_color VARCHAR(7), -- Hex color
    conference VARCHAR(50), -- AFC/NFC, Eastern/Western, etc.
    division VARCHAR(50), -- North/South/East/West
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(league_id, abbreviation)
);

-- Games/matches between teams
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id UUID NOT NULL REFERENCES leagues(id),
    home_team_id UUID NOT NULL REFERENCES teams(id),
    away_team_id UUID NOT NULL REFERENCES teams(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'halftime', 'final', 'postponed', 'cancelled')),
    period INTEGER DEFAULT 0, -- Quarter, inning, period
    time_remaining VARCHAR(10), -- "12:34", "End", etc.
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    attendance INTEGER,
    venue VARCHAR(200),
    weather_conditions TEXT,
    broadcast_info JSONB, -- TV channels, streaming
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Play-by-play events for games
CREATE TABLE play_by_play_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    period INTEGER NOT NULL,
    time_remaining VARCHAR(10),
    team_id UUID REFERENCES teams(id), -- Team responsible for play
    event_type VARCHAR(50) NOT NULL, -- 'touchdown', 'field_goal', 'fumble', 'penalty', etc.
    description TEXT NOT NULL,
    yards_gained INTEGER,
    down_number INTEGER, -- For football
    yards_to_go INTEGER, -- For football
    field_position VARCHAR(10), -- "NYG 25", "50", etc.
    score_change BOOLEAN DEFAULT FALSE,
    home_score INTEGER,
    away_score INTEGER,
    player_names TEXT[], -- Array of player names involved
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video highlights and content
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    video_url TEXT NOT NULL,
    duration_seconds INTEGER,
    game_id UUID REFERENCES games(id), -- Can be null for general content
    team_ids UUID[], -- Array of team IDs featured
    league_id UUID REFERENCES leagues(id),
    video_type VARCHAR(50) DEFAULT 'highlight' CHECK (video_type IN ('highlight', 'recap', 'interview', 'analysis', 'live_stream')),
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social media posts from teams and sports networks
CREATE TABLE social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('twitter', 'instagram', 'facebook', 'tiktok')),
    platform_post_id VARCHAR(255) NOT NULL,
    author_handle VARCHAR(100) NOT NULL,
    author_name VARCHAR(100),
    author_avatar_url TEXT,
    author_verified BOOLEAN DEFAULT FALSE,
    content TEXT NOT NULL,
    media_urls TEXT[], -- Array of image/video URLs
    game_id UUID REFERENCES games(id), -- Can be null
    team_ids UUID[], -- Array of team IDs mentioned
    league_id UUID REFERENCES leagues(id),
    hashtags TEXT[],
    mentions TEXT[],
    like_count INTEGER DEFAULT 0,
    repost_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    post_url TEXT,
    posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(platform, platform_post_id)
);

-- User's favorite teams
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, team_id)
);

-- User preferences and settings
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_leagues UUID[], -- Array of league IDs
    notification_settings JSONB DEFAULT '{}', -- Push notification preferences
    theme VARCHAR(20) DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    time_zone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Betting odds and lines (for BetSection component)
CREATE TABLE betting_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    sportsbook VARCHAR(50) NOT NULL,
    bet_type VARCHAR(50) NOT NULL, -- 'moneyline', 'spread', 'over_under'
    home_odds INTEGER, -- American odds format (+150, -110)
    away_odds INTEGER,
    spread_points DECIMAL(4,1), -- Point spread
    over_under_points DECIMAL(4,1), -- Total points
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_games_league_scheduled ON games(league_id, scheduled_at);
CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_teams ON games(home_team_id, away_team_id);
CREATE INDEX idx_play_by_play_game ON play_by_play_events(game_id, sequence_number);
CREATE INDEX idx_videos_league_published ON videos(league_id, published_at);
CREATE INDEX idx_videos_game ON videos(game_id);
CREATE INDEX idx_social_posts_league_posted ON social_posts(league_id, posted_at);
CREATE INDEX idx_social_posts_teams ON social_posts USING GIN(team_ids);
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_team ON user_favorites(team_id);

-- Insert sample leagues
INSERT INTO leagues (name, abbreviation, logo_url, primary_color, secondary_color, season_start_month, season_end_month) VALUES
('National Football League', 'NFL', '/logos/nfl.png', '#013369', '#D50A0A', 9, 2),
('National Basketball Association', 'NBA', '/logos/nba.png', '#C8102E', '#1D428A', 10, 6),
('Major League Baseball', 'MLB', '/logos/mlb.png', '#132448', '#C8102E', 3, 10),
('National Hockey League', 'NHL', '/logos/nhl.png', '#000000', '#C8102E', 10, 6),
('Major League Soccer', 'MLS', '/logos/mls.png', '#005DAA', '#C8102E', 2, 11);

-- Sample teams (just a few examples)
INSERT INTO teams (league_id, name, abbreviation, city, primary_color, secondary_color, conference, division) VALUES
((SELECT id FROM leagues WHERE abbreviation = 'NFL'), 'Kansas City Chiefs', 'KC', 'Kansas City', '#E31837', '#FFB81C', 'AFC', 'West'),
((SELECT id FROM leagues WHERE abbreviation = 'NFL'), 'New York Giants', 'NYG', 'New York', '#0B2265', '#A71930', 'NFC', 'East'),
((SELECT id FROM leagues WHERE abbreviation = 'NBA'), 'Los Angeles Lakers', 'LAL', 'Los Angeles', '#552583', '#FDB927', 'Western', 'Pacific'),
((SELECT id FROM leagues WHERE abbreviation = 'NBA'), 'Boston Celtics', 'BOS', 'Boston', '#007A33', '#BA9653', 'Eastern', 'Atlantic'),
((SELECT id FROM leagues WHERE abbreviation = 'MLB'), 'New York Yankees', 'NYY', 'New York', '#132448', '#C4CED4', 'American', 'East'),
((SELECT id FROM leagues WHERE abbreviation = 'MLB'), 'Los Angeles Dodgers', 'LAD', 'Los Angeles', '#005A9C', '#EF3E42', 'National', 'West');
