/**
 * Application configuration
 */

/**
 * Debug configuration
 */
export const DEBUG = {
  enabled: process.env.NODE_ENV === 'development' || process.env.REACT_APP_DEBUG === 'true' || true,
};

/**
 * Supported leagues enum
 */
export enum League {
  MLB = 'mlb',
  NBA = 'nba',
  NFL = 'nfl',
  NHL = 'nhl',
  MLS = 'mls',
}

/**
 * Navigation tabs enum
 */
export enum Tab {
  FOR_YOU = 'for-you',
  SCORES = 'scores',
  LIVE = 'live',
  SOCIAL = 'social',
  BET = 'bet',
}

/**
 * League type for type safety
 */
export type LeagueType = `${League}`;

/**
 * Cache data types for type safety
 */
export type CacheDataType = keyof typeof CACHE_CONFIG.ttlValues;

/**
 * Game status enum
 */
export enum GameStatus {
  LIVE = 'live',
  FINAL = 'final',
  UPCOMING = 'upcoming',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
  SCHEDULED = 'Scheduled',
  POSTPONED = 'Postponed',
}

/**
 * Game status type for type safety
 */
export type GameStatusType = `${GameStatus}`;

/**
 * Quarter/Period types for different sports
 */
export enum QuarterType {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
  OT = 'OT',
  TOP = 'Top',
  BOT = 'Bot',
  INNING = 'Inning',
}

/**
 * Quarter type for type safety
 */
export type QuarterTypeType = `${QuarterType}`;

/**
 * View types enum
 */
export enum ViewType {
  MAIN = 'main',
  BOXSCORE = 'boxscore',
  PLAYBYPLAY = 'playbyplay',
  SCORESV2 = 'scoresv2',
  GAMEDETAILV2 = 'gamedetailv2',
  BoxScore = 'BoxScore',
}

/**
 * View type for type safety
 */
export type ViewTypeType = `${ViewType}`;

/**
 * Environment Variables
 */
export const ENV = {
  TWITTERAPIIO_API_KEY: (import.meta as any).env?.VITE_TWITTERAPIIO_API_KEY,
  REDDIT_CLIENT_ID: (import.meta as any).env?.VITE_REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET: (import.meta as any).env?.VITE_REDDIT_CLIENT_SECRET,
} as const;

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseUrl: 'https://4dd5da027203.ngrok.app', // Rust backend URL
  endpoints: {
    scores: '/api/v1/scores',
    boxScoreFinal: '/api/v1/box-score-final',
    teams: '/api/v1/teams',
    schedule: '/api/v1/schedule',
    headshots: '/api/v1/headshots',
    playByPlay: '/api/v1/play-by-play',
    teamProfile: '/api/team-profile',
    health: '/health',
  },
} as const;

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  name: 'Arbitration',
  version: '1.0.0',
  description: 'Your Sports Universe',
} as const;

/**
 * Sports Configuration
 */
export const SPORTS_CONFIG = {
  supportedLeagues: Object.values(League),
  defaultLeague: League.MLB,
} as const;

/**
 * Postseason Configuration
 */
export const POSTSEASON_CONFIG = {
  [League.MLB]: {
    startDate: '10-01', // MM-DD format
    seasonIdentifier: '2025POST',
  },
  [League.NFL]: {
    startDate: '01-01', // MM-DD format
    seasonIdentifier: '2025POST',
  },
  [League.NBA]: {
    startDate: '04-01', // MM-DD format
    seasonIdentifier: '2025POST',
  },
  [League.NHL]: {
    startDate: '04-01', // MM-DD format
    seasonIdentifier: '2025POST',
  },
} as const;

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  // Default TTL in milliseconds
  ttl: 5 * 60 * 1000, // 5 minutes in milliseconds
  maxRetries: 3,
  
  // Specific TTL values matching backend config (in milliseconds)
  ttlValues: {
    team_profiles: 3600 * 1000,      // 1 hour
    schedule: 3600 * 1000,           // 1 hour
    postseason_schedule: 3600 * 1000, // 1 hour
    scores: 60 * 1000,               // 1 minute
    play_by_play: 60 * 1000,         // 1 minute
    box_scores: 60 * 1000,           // 1 minute
    stadiums: 21600 * 1000,          // 6 hours
    twitter_search: 60 * 1000,       // 1 minute
    reddit_thread: 600 * 1000,       // 10 minutes
    reddit_thread_comments: 60 * 1000, // 1 minute
    odds: 3600 * 1000,               // 1 hour
    user_auth: 604800 * 1000,        // 1 week (7 days)
  },
} as const;

/**
 * Play-by-Play Configuration
 */
export const PLAY_BY_PLAY_CONFIG = {
  // Refresh interval in milliseconds
  refreshInterval: 60000, // 1 minute
  
  // API interval for fetching data
  apiInterval: "1min",
  
  // Maximum number of events to display
  maxEventsDisplay: 100,
  
  // Maximum number of events to keep in memory
  maxEventsInMemory: 50,
  
  // Whether to auto-scroll to newest events
  autoScrollToTop: true,
  
  // Supported leagues for play-by-play
  supportedLeagues: ['mlb'] as const,
} as const;

/**
 * Unified Game Feed Configuration
 */
export const UNIFIED_FEED_CONFIG = {
  // Auto-refresh interval in milliseconds
  autoRefreshInterval: 5000, // 5 seconds
  
  // Reddit thread refresh interval in milliseconds
  redditThreadRefreshInterval: 300000, // 5 minutes
  
  // Whether to enable auto-refresh
  enableAutoRefresh: true,
} as const;

/**
 * Twitter Configuration
 */
export const TWITTER_CONFIG = {
  // Default number of tweets to fetch
  defaultTweetLimit: 10,
  
  // Maximum number of tweets to fetch in a single request
  maxTweetLimit: 100,
  
  // Default search filter
  defaultFilter: 'latest' as const,
  
  // Supported search filters
  supportedFilters: ['latest', 'top'] as const,
} as const;

/**
 * Reddit Configuration
 */
export const REDDIT_CONFIG = {
  // Default number of comments to fetch
  defaultCommentLimit: 20,
  
  // Maximum number of comments to fetch in a single request
  maxCommentLimit: 100,
  
  // Default search sort
  defaultSort: 'new' as const,
  
  // Supported search sorts
  supportedSorts: ['new', 'top', 'hot'] as const,
  
  // Cache bypass configuration
  bypassCacheOnRefresh: true,
} as const;

/**
 * Utility functions
 */

/**
 * Build a full API URL with query parameters
 */
export const buildApiUrl = (endpoint: string, params?: Record<string, string>): string => {
  const url = new URL(`${API_CONFIG.baseUrl}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  return url.toString();
};

/**
 * Get the full URL for a specific endpoint
 */
export const getApiUrl = (endpoint: keyof typeof API_CONFIG.endpoints): string => {
  return `${API_CONFIG.baseUrl}${API_CONFIG.endpoints[endpoint]}`;
};

/**
 * Check if a date is in postseason for a given league
 */
export const isPostseasonDate = (league: League, dateString: string): boolean => {
  const config = POSTSEASON_CONFIG[league];
  if (!config) return false;
  
  try {
    const date = new Date(dateString);
    const currentYear = date.getFullYear();
    const postseasonStartDate = new Date(`${currentYear}-${config.startDate}`);
    
    return date >= postseasonStartDate;
  } catch {
    return false;
  }
};

/**
 * Get postseason season identifier for a league and date
 */
export const getPostseasonSeasonIdentifier = (league: League, dateString: string): string | null => {
  if (isPostseasonDate(league, dateString)) {
    return POSTSEASON_CONFIG[league].seasonIdentifier;
  }
  return null;
};

/**
 * Get the appropriate season identifier for a league and date
 * Returns regular season identifier if not postseason, postseason identifier if postseason
 */
export const getSeasonIdentifier = (league: League, dateString: string): string => {
  if (isPostseasonDate(league, dateString)) {
    return POSTSEASON_CONFIG[league].seasonIdentifier;
  }
  // For regular season, we can derive the year from the date
  const year = new Date(dateString).getFullYear();
  return year.toString();
};

/**
 * Map API status strings to our standardized GameStatus enum
 */
export const mapApiStatusToGameStatus = (apiStatus: string): GameStatus => {
  switch (apiStatus?.toLowerCase()) {
    case 'inprogress':
    case 'live':
      return GameStatus.LIVE;
    case 'completed':
    case 'final':
      return GameStatus.FINAL;
    case 'scheduled':
    case 'upcoming':
      return GameStatus.UPCOMING;
    case 'postponed':
    case 'cancelled':
    case 'notnecessary':
      return GameStatus.CANCELLED;
    default:
      return GameStatus.UPCOMING; // Default to upcoming for unknown statuses
  }
};

/**
 * Get display-friendly status text
 */
export const getStatusDisplayText = (status: GameStatus): string => {
  switch (status) {
    case GameStatus.LIVE:
      return 'Live';
    case GameStatus.FINAL:
      return 'Final';
    case GameStatus.UPCOMING:
      return 'Upcoming';
    case GameStatus.CANCELLED:
      return 'Cancelled';
    case GameStatus.IN_PROGRESS:
      return 'In Progress';
    case GameStatus.COMPLETED:
      return 'Completed';
    case GameStatus.SCHEDULED:
      return 'Scheduled';
    case GameStatus.POSTPONED:
      return 'Postponed';
    default:
      return 'Unknown';
  }
};

/**
 * Get cache TTL for a specific data type
 */
export const getCacheTTL = (dataType: CacheDataType): number => {
  return CACHE_CONFIG.ttlValues[dataType];
};

/**
 * Get cache TTL in seconds (for API calls)
 */
export const getCacheTTLSeconds = (dataType: CacheDataType): number => {
  return CACHE_CONFIG.ttlValues[dataType] / 1000;
};
