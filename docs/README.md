# Arbitration Sports Platform

A comprehensive sports data platform featuring a Rust-based API proxy server, React frontend, and native iOS app. The platform provides real-time sports data, live scores, play-by-play coverage, social media integration, and advanced caching strategies across multiple professional sports leagues.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Architecture Overview](#architecture-overview)
- [Backend (Rust API Server)](#backend-rust-api-server)
- [Frontend (React Web App)](#frontend-react-web-app)
- [iOS Native App](#ios-native-app)
- [Database Schema](#database-schema)
- [Configuration & Environment](#configuration--environment)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Performance & Optimization](#performance--optimization)
- [API Documentation](#api-documentation)

## 🚀 Quick Start

### Prerequisites
- **Rust** 1.70+ (for backend)
- **Node.js** 18+ (for frontend)
- **Xcode** 15+ (for iOS app)
- **Redis** (for caching)
- **PostgreSQL** (for database)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rashad/arbitration.git
   cd arbitration
   ```

2. **Backend Setup**
   ```bash
   cd arb-rs
   cargo build
   ```

3. **Frontend Setup**
   ```bash
   cd arb-www
   npm install
   npm run dev
   ```

4. **iOS App Setup**
   ```bash
   open arbitration.xcodeproj
   ```

## 🏗️ Architecture Overview

The Arbitration platform follows a **microservices architecture** with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   iOS App       │    │   React Web     │    │   External APIs │
│   (SwiftUI)     │    │   (TypeScript)  │    │   (SportsData)  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                Rust API Proxy Server                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Cache     │  │   Router    │  │   Data      │            │
│  │  (Redis)    │  │  (Axum)     │  │  Loader    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────┐
│   PostgreSQL    │
│   Database      │
└─────────────────┘
```

### Design Principles

- **Performance First**: Redis caching with intelligent TTL strategies
- **Type Safety**: Full TypeScript frontend with Rust backend
- **Mobile-First**: iOS-native design patterns and responsive web
- **Real-Time**: Live data updates with minimal latency
- **Scalable**: Microservices architecture with independent scaling

## 🔧 Backend (Rust API Server)

### Technology Stack
- **Framework**: Axum (async web framework)
- **Runtime**: Tokio (async runtime)
- **Caching**: Redis with custom TTL strategies
- **HTTP Client**: Reqwest for external API calls
- **Serialization**: Serde for JSON handling
- **Configuration**: TOML + environment variables

### Key Features

#### 1. **Intelligent Caching System**
```rust
// Optimized TTL strategies based on data volatility
pub struct CacheTtlConfig {
    pub team_profiles: u64,       // 1 hour - rarely changes
    pub schedule: u64,            // 1 hour - moderate updates
    pub postseason_schedule: u64, // 1 hour - playoff schedules
    pub scores: u64,              // 1 minute - frequent updates
    pub play_by_play: u64,        // 1 minute - real-time data
    pub box_scores: u64,          // 1 minute - game results
    pub stadiums: u64,            // 6 hours - rarely changes
    pub twitter_search: u64,      // 1 minute - social data
    pub reddit_thread: u64,       // 10 minutes - game threads
    pub reddit_thread_comments: u64, // 1 minute - live comments
    pub odds: u64,                // 1 hour - betting data
    pub user_auth: u64,           // 1 week - authentication
}
```

#### 2. **Multi-League Support**
- **NFL**: Regular season + playoffs
- **NBA**: Regular season + playoffs  
- **MLB**: Regular season + postseason
- **NHL**: Regular season + playoffs
- **MLS**: Regular season + playoffs

#### 3. **API Endpoints**
```
GET /api/v1/health                    # Health check
GET /api/v1/scores?league=mlb        # Historical scores (7 days back)
GET /api/v1/schedule?league=nfl      # Game schedules
GET /api/v1/play-by-play?game_id=123 # Live play-by-play
GET /api/v1/box-score?game_id=123    # Detailed box scores
GET /api/v1/teams?league=mlb         # Team information
GET /api/v1/odds-by-date?league=nfl  # Betting odds
GET /api/v1/twitter-search?query=nfl # Social media integration
GET /api/v1/reddit-thread?subreddit=phillies&league=mlb # Game threads
GET /api/v1/reddit-thread-comments?thread_id=123&cache=false # Comments
```

#### 4. **Social Media Integration**
- **Reddit Integration**: Game thread discovery and live comments
- **Twitter Integration**: Real-time sports tweets and discussions
- **Team-Specific Logic**: Dodgers use "Game Chat", others use "Game Thread"
- **Cache Bypass**: Fresh social data with `cache=false` parameter
- **Sort Options**: Top/Latest toggle for both Reddit and Twitter content

#### 5. **Error Handling & Resilience**
- Comprehensive error types with `thiserror`
- Graceful degradation when external APIs fail
- Request timeouts and retry logic
- Detailed logging with `tracing`

### Configuration Management

The backend uses a sophisticated configuration system:

```toml
# config.toml
[server]
host = "0.0.0.0"
port = 3000
cors_origins = "http://localhost:5173,http://localhost:3000"

[cache]
enabled = true
redis_url = "redis://localhost:6379"
default_ttl = 3600

[seasons.current_seasons.mlb]
regular = "2025"
postseason = "2025POST"
postseason_start = "10-01-2025"
```

## 🎨 Frontend (React Web App)

### Technology Stack
- **Framework**: React 18 with TypeScript
- **UI Library**: Chakra UI v3 (modern design system)
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v7
- **Styling**: Emotion (CSS-in-JS)
- **Animations**: Framer Motion
- **Build Tool**: Vite (fast development)

### Architecture Patterns

#### 1. **Component Architecture**
```
src/
├── components/           # Reusable UI components
│   ├── DatePicker.tsx   # Extracted date picker (performance)
│   ├── Scores.tsx       # Main scores component
│   ├── BoxScore.tsx     # Game details
│   └── ...
├── views/               # Page-level components
│   ├── Main.tsx        # Main app container
│   ├── Login.tsx       # Authentication
│   └── ...
├── store/              # Redux state management
│   ├── slices/         # Feature-based slices
│   └── hooks.ts        # Typed hooks
└── services/           # API integration
    └── Arb.ts          # Centralized API service
```

#### 2. **State Management Strategy**
- **Redux Toolkit**: Centralized state with generic multi-league support
- **Generic State Structure**: `leagueData[league].scores` instead of `mlbScores`
- **Feature Slices**: Organized by domain (auth, sports data, favorites)
- **Optimistic Updates**: Immediate UI updates with rollback on failure
- **Selective Re-rendering**: Memoized selectors prevent unnecessary renders
- **URL-Driven State**: League selection driven by URL parameters (`/scores/nba`)

#### 3. **Performance Optimizations**

**Date Picker Extraction**:
```typescript
// Before: Date picker re-rendered with entire component
// After: Independent component with stable scroll position
export function DatePicker({ selectedLeague }: DatePickerProps) {
  // Manages own scroll state and centering
  // Doesn't re-render when data loads
}
```

**Loading State Management**:
```typescript
// Only cards section shows loading, not entire screen
{isFetchingDateData || mlbScoresLoading ? (
  <CardsLoading />
) : (
  <GamesList />
)}
```

**Skeleton Loading States**:
```typescript
// Prevents layout shifts during data loading
const GameCardSkeleton = () => (
  <Card.Root variant="outline" size="sm">
    <Card.Body p="4">
      <VStack gap="3" align="stretch">
        <HStack justify="space-between">
          <Skeleton w="20" h="5" /> {/* Status */}
          <Skeleton w="16" h="4" />  {/* Time */}
        </HStack>
        <HStack justify="space-between">
          <HStack gap="3" flex="1">
            <SkeletonCircle size="8" /> {/* Team logo */}
            <Skeleton w="70%" h="4" />  {/* Team name */}
          </HStack>
          <HStack gap="2">
            <Skeleton w="6" h="6" />   {/* Score */}
            <Skeleton w="16" h="8" />  {/* Odds */}
          </HStack>
        </HStack>
      </VStack>
    </Card.Body>
  </Card.Root>
);
```

**Memoized Components**:
```typescript
const MemoizedGameCard = React.memo(GameCard);
const MemoizedDatePicker = React.memo(DatePicker);
```

#### 4. **Skeleton Loading Implementation**

The platform uses skeleton loading states throughout to prevent layout shifts and provide smooth loading experiences:

**Skeleton Component System**:
```typescript
// Reusable skeleton components
export const Skeleton: React.FC<SkeletonProps> = ({ w, h, borderRadius, children }) => (
  <Box w={w} h={h} borderRadius={borderRadius} animation={`${pulse} 1.5s infinite`}>
    {children}
  </Box>
);

export const SkeletonCircle: React.FC<SkeletonProps & { size?: string }> = ({ size = "8" }) => (
  <Skeleton w={size} h={size} borderRadius="full" />
);

export const SkeletonText: React.FC<SkeletonProps & { noOfLines?: number }> = ({ noOfLines = 1 }) => (
  <VStack align="start" spacing="1" w="full">
    {Array.from({ length: noOfLines }).map((_, i) => (
      <Skeleton key={i} h="3" w={i === noOfLines - 1 && noOfLines > 1 ? "70%" : "full"} />
    ))}
  </VStack>
);
```

**Implementation Patterns**:

1. **Game Cards**: Full card skeletons that match actual layout dimensions
2. **Play-by-Play Events**: Event item skeletons with proper spacing
3. **Live Games**: Live game card skeletons with team info placeholders
4. **Twitter Cards**: Tweet-sized skeletons for social content
5. **Box Score Details**: Table and stat skeletons for detailed views

**Responsive Skeleton Sizing**:
```typescript
// Skeletons adapt to container size using percentage-based widths
<Skeleton w="full" h="4" />        // Full width
<Skeleton w="70%" h="4" />         // 70% width (for text truncation)
<Skeleton w="30%" h="4" />         // 30% width (for short content)
<SkeletonCircle size="8" />        // Fixed size for avatars/logos
```

#### 5. **Mobile-First Design**
- **iOS-Style Components**: Native-feeling interactions
- **Touch Optimizations**: Proper touch targets and gestures
- **Responsive Breakpoints**: Seamless desktop/mobile experience
- **PWA Ready**: Offline support and installable

### Key Features

#### 1. **Real-Time Updates**
- Live scores with automatic refresh
- Play-by-play updates during games
- Social media integration (Reddit + Twitter)
- Betting odds updates
- Cache bypass for fresh social data

#### 2. **User Experience**
- **Splash Screen**: iOS-style app launch
- **Onboarding**: 3-screen welcome flow
- **Authentication**: Apple/Google/Guest options
- **Favorites**: Personalized team selection
- **Dark Mode**: Full theme support

#### 3. **Data Visualization**
- Interactive scoreboards
- Play-by-play timelines
- Team statistics
- Betting odds display
- Social media feeds (Reddit comments, Twitter posts)
- Live game threads with real-time updates

#### 4. **Social Media Features**
- **Reddit Integration**: 
  - Game thread discovery with team-specific logic
  - Live comment feeds with Top/Latest sorting
  - Refresh button for fresh comments
  - UTC timestamp formatting for accurate time display
- **Twitter Integration**:
  - Real-time sports tweets
  - Top/Latest sorting toggle
  - Team and league-specific searches

## 📱 iOS Native App

### Technology Stack
- **Framework**: SwiftUI
- **Data**: SwiftData (Core Data replacement)
- **Networking**: URLSession with async/await
- **Architecture**: MVVM pattern

### Key Features
- **Native Performance**: Optimized for iOS devices
- **Offline Support**: Local data persistence
- **Push Notifications**: Real-time game updates
- **Haptic Feedback**: Enhanced user experience
- **App Store Ready**: Full iOS integration

## 🗄️ Database Schema

### Core Tables

#### Users & Authentication
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    auth_provider VARCHAR(20) CHECK (auth_provider IN ('guest', 'apple', 'google')),
    provider_id VARCHAR(255),
    display_name VARCHAR(100),
    avatar_url TEXT,
    has_seen_welcome BOOLEAN DEFAULT FALSE
);
```

#### Sports Data
```sql
CREATE TABLE leagues (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    abbreviation VARCHAR(10) UNIQUE,
    logo_url TEXT,
    primary_color VARCHAR(7),
    season_start_month INTEGER,
    season_end_month INTEGER
);

CREATE TABLE teams (
    id UUID PRIMARY KEY,
    league_id UUID REFERENCES leagues(id),
    name VARCHAR(100) NOT NULL,
    abbreviation VARCHAR(10) NOT NULL,
    city VARCHAR(100) NOT NULL,
    conference VARCHAR(50),
    division VARCHAR(50)
);

CREATE TABLE games (
    id UUID PRIMARY KEY,
    league_id UUID REFERENCES leagues(id),
    home_team_id UUID REFERENCES teams(id),
    away_team_id UUID REFERENCES teams(id),
    game_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20),
    home_score INTEGER,
    away_score INTEGER
);
```

#### User Preferences
```sql
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    team_id UUID REFERENCES teams(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## ⚙️ Configuration & Environment

### Environment Variables

#### Backend (.env)
```bash
# Server Configuration
ARB_HOST=0.0.0.0
ARB_PORT=3000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Cache Configuration
REDIS_URL=redis://localhost:6379
CACHE_ENABLED=true

# API Configuration
SPORTSDATA_API_KEY=your_api_key_here
TWITTER_API_KEY=your_twitter_key_here

# Season Configuration
MLB_REGULAR_SEASON=2025
MLB_POSTSEASON=2025POST
MLB_POSTSEASON_START=10-01
```

#### Frontend (.env)
```bash
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Arbitration Sports
VITE_APP_VERSION=1.0.0
```

### Configuration Files

#### Backend (config.toml)
```toml
[server]
host = "0.0.0.0"
port = 3000

[cache]
enabled = true
redis_url = "redis://localhost:6379"
default_ttl = 3600

[cache.ttl]
team_profiles = 3600      # 1 hour
schedule = 3600           # 1 hour
postseason_schedule = 3600 # 1 hour
scores = 60               # 1 minute
play_by_play = 60         # 1 minute
box_scores = 60           # 1 minute
stadiums = 21600          # 6 hours
twitter_search = 60       # 1 minute
reddit_thread = 600       # 10 minutes
reddit_thread_comments = 60 # 1 minute
odds = 3600               # 1 hour
user_auth = 604800        # 1 week (7 days)

[seasons.current_seasons.mlb]
regular = "2025"
postseason = "2025POST"
postseason_start = "10-01-2025"
```

## 🔄 Development Workflow

### 1. **Backend Development**
```bash
cd arb-rs
cargo run                    # Start development server
cargo test                   # Run tests
cargo clippy                 # Lint code
cargo fmt                    # Format code
```

### 2. **Frontend Development**
```bash
cd arb-www
npm run dev                  # Start development server
npm run build               # Build for production
npm run lint                # Lint code
npm run pretty              # Format code
```

### 3. **iOS Development**
```bash
open arbitration.xcodeproj  # Open in Xcode
# Build and run in simulator
```

### 4. **Database Management**
```bash
# Start PostgreSQL
brew services start postgresql

# Create database
createdb arbitration

# Run migrations
psql arbitration < etc/schema/v1.sql
```

## 🚀 Deployment

### Backend Deployment
```bash
# Build optimized binary
cargo build --release

# Run with production config
ARB_PORT=8080 REDIS_URL=redis://prod-redis:6379 ./target/release/arb-rs
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Deploy to CDN/static hosting
# Files in dist/ directory
```

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM rust:1.70 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bullseye-slim
RUN apt-get update && apt-get install -y ca-certificates
COPY --from=builder /app/target/release/arb-rs /usr/local/bin/
EXPOSE 3000
CMD ["arb-rs"]
```

## ⚡ Performance & Optimization

### Backend Optimizations

#### 1. **Caching Strategy**
- **Redis**: In-memory caching with configurable TTL
- **Smart TTL**: Different cache times based on data volatility
- **Cache Warming**: Pre-load frequently accessed data
- **Cache Invalidation**: Intelligent invalidation on data updates

#### 2. **API Optimization**
- **Request Batching**: Combine multiple API calls
- **Connection Pooling**: Reuse HTTP connections
- **Timeout Management**: Prevent hanging requests
- **Rate Limiting**: Respect external API limits

#### 3. **Memory Management**
- **Arc<Mutex<>>**: Thread-safe shared state
- **Lazy Loading**: Load data only when needed
- **Memory Pooling**: Reuse objects where possible

### Frontend Optimizations

#### 1. **Rendering Performance**
- **React.memo**: Prevent unnecessary re-renders
- **useMemo/useCallback**: Memoize expensive calculations
- **Virtual Scrolling**: Handle large lists efficiently
- **Code Splitting**: Lazy load components

#### 2. **Bundle Optimization**
- **Tree Shaking**: Remove unused code
- **Dynamic Imports**: Load code on demand
- **Asset Optimization**: Compress images and fonts
- **CDN Integration**: Serve static assets from CDN

#### 3. **State Management**
- **Selective Subscriptions**: Only subscribe to needed data
- **Normalized State**: Flat state structure for efficiency
- **Optimistic Updates**: Immediate UI feedback

### Database Optimizations

#### 1. **Query Optimization**
- **Indexes**: Strategic indexing on frequently queried columns
- **Query Analysis**: Monitor and optimize slow queries
- **Connection Pooling**: Efficient database connections

#### 2. **Data Modeling**
- **Normalization**: Reduce data redundancy
- **Partitioning**: Partition large tables by date/league
- **Archiving**: Move old data to archive tables

## 🆕 Recent Updates & Features

### Multi-League State Management Refactor
- **Generic State Structure**: Migrated from league-specific state (`mlbScores`, `nbaScores`) to generic `leagueData[league].scores`
- **URL-Driven Navigation**: League selection now driven by URL parameters (`/scores/nba`, `/scores/mlb`)
- **Eliminated Code Duplication**: Removed duplicate fetch functions in favor of centralized `useArb()` service
- **Improved Caching**: Smart caching logic prevents unnecessary API calls while ensuring fresh data

### Social Media Integration
- **Reddit Game Threads**: Automatic discovery of game threads with team-specific search logic
- **Live Comments**: Real-time Reddit comment feeds with proper UTC timestamp handling
- **Twitter Integration**: Real-time sports tweets with Top/Latest sorting
- **Cache Bypass**: Fresh social data with configurable cache bypass for live updates

### Performance Optimizations
- **Skeleton Loading**: Comprehensive skeleton states prevent layout shifts during data loading
- **Memoized Components**: Strategic use of `React.memo` and `useCallback` for optimal re-rendering
- **Loading State Management**: Granular loading states prevent infinite refetches
- **Import Organization**: Clean, grouped imports without debug comments

### Developer Experience
- **Type Safety**: Full TypeScript coverage with proper enum usage (`Tab` enum for navigation)
- **Error Handling**: Comprehensive error states with retry mechanisms
- **Debug Cleanup**: Removed all debug console logs for production readiness
- **Code Organization**: Consistent patterns across components and services

### Cache Configuration
- **Optimized TTL Values**: Data-specific cache durations (1 minute for live data, 6 hours for static data)
- **Cache Bypass Support**: Configurable cache bypass for fresh data when needed
- **Redis Integration**: Efficient caching with intelligent invalidation strategies

## 📚 API Documentation

### Authentication
All API endpoints require authentication via API key in the header:
```
Authorization: Bearer your_api_key_here
```

### Rate Limiting
- **Free Tier**: 100 requests/hour
- **Pro Tier**: 1000 requests/hour
- **Enterprise**: Custom limits

### API Endpoint Purposes

#### Core Data Endpoints
- **`/api/v1/scores`**: Historical game scores for multiple days (default 7 days back)
- **`/api/v1/schedule`**: Game schedules for a specific date
- **`/api/v1/box-scores`**: Detailed box score data for a specific game
- **`/api/v1/play-by-play`**: Live play-by-play events for a game
- **`/api/v1/teams`**: Team information and profiles
- **`/api/v1/odds-by-date`**: Betting odds for games on a specific date

#### Social Media Endpoints
- **`/api/v1/reddit-thread`**: Find game threads in team subreddits
- **`/api/v1/reddit-thread-comments`**: Get comments from a specific thread
- **`/api/v1/twitter-search`**: Search for sports-related tweets

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "cached": true,
    "cache_ttl": 3600,
    "request_id": "uuid"
  }
}
```

### Error Handling
```json
{
  "success": false,
  "error": {
    "code": "INVALID_LEAGUE",
    "message": "League 'invalid' is not supported",
    "details": {
      "supported_leagues": ["nfl", "nba", "mlb", "nhl", "mls"]
    }
  }
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SportsData.io** for comprehensive sports data APIs
- **Chakra UI** for the excellent component library
- **Rust Community** for the amazing ecosystem
- **React Team** for the powerful frontend framework
