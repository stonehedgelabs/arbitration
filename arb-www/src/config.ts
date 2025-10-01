/**
 * Application configuration
 */

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
  supportedLeagues: ['mlb', 'nba', 'nfl', 'nhl'] as const,
  defaultLeague: 'mlb' as const,
} as const;

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  ttl: 5 * 60 * 1000, // 5 minutes in milliseconds
  maxRetries: 3,
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
