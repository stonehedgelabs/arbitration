/**
 * Application configuration
 */

/**
 * Debug configuration
 */
export const DEBUG = {
  enabled: (import.meta as any).env?.MODE === 'development' || (import.meta as any).env?.VITE_DEBUG === 'true' || true,
};

/**
 * React Strict Mode configuration
 */
export const USE_STRICT_MODE = (import.meta as any).env?.VITE_USE_STRICT_MODE === 'true' || false;

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
  SCORES = 'scores',
}

/**
 * Game status enum
 */
export enum GameStatus {
  LIVE = 'Live',
  FINAL = 'Final',
  UPCOMING = 'Upcoming',
  CANCELLED = 'Cancelled',
  IN_PROGRESS = 'InProgress',
  NOT_NECESSARY = 'NotNecessary',
  COMPLETED = 'Completed',
  SCHEDULED = 'Scheduled',
  POSTPONED = 'Postponed',
  OTHER = 'Other',
}


/**
 * API Configuration
 */
export const API_CONFIG = {
  baseUrl: window.location.hostname === 'arbi.gg' || window.location.hostname === 'www.arbi.gg' ? 'https://api.arbi.gg' : 'https://728b8ecb8758.ngrok.app',
  endpoints: {
    scores: '/api/v1/scores',
    boxScoreFinal: '/api/v1/box-score-final',
    schedule: '/api/v1/schedule',
    headshots: '/api/v1/headshots',
    playByPlay: '/api/v1/play-by-play',
    teamProfile: '/api/team-profile',
    standings: '/api/v1/standings',
    health: '/health',
  },
} as const;

/**
 * Sports Configuration
 */
export const SPORTS_CONFIG = {
  supportedLeagues: Object.values(League),
  defaultLeague: League.MLB,
  initLeague: League.MLB,
} as const;

/**
 * Postseason Configuration
 */
export const POSTSEASON_CONFIG = {
  [League.MLB]: {
    startDate: '10-01-2025', // MM-DD-YYYY format
    seasonIdentifier: '2025POST',
  },
  [League.NFL]: {
    startDate: '01-01-2026', // MM-DD-YYYY format
    seasonIdentifier: '2025POST',
  },
  [League.NBA]: {
    startDate: '04-01-2027', // MM-DD-YYYY format
    seasonIdentifier: '2026POST',
  },
  [League.NHL]: {
    startDate: '04-01-2027', // MM-DD-YYYY format
    seasonIdentifier: '2026POST',
  },
  [League.MLS]: {
    startDate: '10-01-2025', // MM-DD-YYYY format
    seasonIdentifier: '2025POST',
  },
} as const;


/**
 * Play-by-Play Configuration
 */
export const PLAY_BY_PLAY_CONFIG = {
  // Refresh interval in milliseconds
  refreshInterval: 30 * 1000, // 30 seconds
  
  // API interval for fetching data
  apiInterval: "1min",
  
  // Maximum number of events to display
  maxEventsDisplay: 25,
  
  // Maximum number of events to keep in memory
  maxEventsInMemory: 25,
  
  // Whether to auto-scroll to newest events
  autoScrollToTop: true,
  
  // Supported leagues for play-by-play
  supportedLeagues: [League.NFL, League.MLB, League.NBA, League.NHL] as const,
} as const;

/**
 * Unified Game Feed Configuration
 */
export const UNIFIED_FEED_CONFIG = {
  // Auto-refresh interval in milliseconds
  autoRefreshInterval: 10 * 1000, // 10 seconds
  
  // Reddit thread refresh interval in milliseconds
  redditThreadRefreshInterval: 10 * 1000, // 10 seconds
  
  // Whether to enable auto-refresh
  enableAutoRefresh: true,
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
  
  // Delay for Reddit events in milliseconds (30 seconds)
  eventDelay: 30 * 1000,
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
 * Check if a date is in postseason for a given league
 */
export const isPostseasonDate = (league: League, dateString: string): boolean => {
  const config = POSTSEASON_CONFIG[league];
  if (!config) return false;
  
  try {
    const date = new Date(dateString);
    // Parse the full MM-DD-YYYY format
    const [month, day, year] = config.startDate.split('-');
    const postseasonStartDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return date >= postseasonStartDate;
  } catch {
    return false;
  }
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
    case 'f/ot':
      return GameStatus.FINAL;
    case 'scheduled':
    case 'upcoming':
      return GameStatus.UPCOMING;
    case 'postponed':
    case 'cancelled':
    case 'notnecessary':
      return GameStatus.CANCELLED;
    default:
      return GameStatus.OTHER; // Default to upcoming for unknown statuses
  }
};

