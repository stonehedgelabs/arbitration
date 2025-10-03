use chrono::Datelike;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Configuration for the Arbitration API server
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArbConfig {
    /// Server configuration
    pub server: ServerConfig,
    /// Redis cache configuration
    pub cache: CacheConfig,
    /// Sports seasons configuration
    pub seasons: SeasonsConfig,
    /// API configuration
    pub api: ApiConfig,
}

/// Server configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerConfig {
    /// Host to bind the server to
    pub host: String,
    /// Port to bind the server to
    pub port: u16,
    /// CORS origins (comma-separated)
    pub cors_origins: String,
}

/// Redis cache configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheConfig {
    /// Whether caching is enabled globally
    pub enabled: bool,
    /// Redis connection URL
    pub redis_url: String,
    /// Default cache TTL in seconds
    pub default_ttl: u64,
    /// Cache TTL for different data types
    pub ttl: CacheTtlConfig,
}

/// Cache TTL configuration for different data types
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheTtlConfig {
    /// TTL for team profiles (in seconds)
    pub team_profiles: u64,
    /// TTL for schedule data (in seconds)
    pub schedule: u64,
    /// TTL for postseason schedule data (in seconds)
    pub postseason_schedule: u64,
    /// TTL for scores data (in seconds)
    pub scores: u64,
    /// TTL for play-by-play data (in seconds)
    pub play_by_play: u64,
    /// TTL for box scores (in seconds)
    pub box_scores: u64,
    /// TTL for stadiums data (in seconds)
    pub stadiums: u64,
    /// TTL for Twitter search results (in seconds)
    pub twitter_search: u64,
}

/// Sports seasons configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeasonsConfig {
    /// Current seasons for each sport
    pub current_seasons: HashMap<String, SeasonInfo>,
}

/// Season information for a sport
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SeasonInfo {
    /// Regular season identifier (e.g., "2025")
    pub regular: String,
    /// Postseason identifier (e.g., "2026POST")
    pub postseason: String,
    /// Postseason start date (MM-DD format, e.g., "10-01")
    pub postseason_start: String,
}

/// API configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiConfig {
    /// SportsData.io API base URL
    pub sportsdata_base_url: String,
    /// Twitter API base URL
    pub twitter_base_url: String,
    /// Request timeout in seconds
    pub request_timeout: u64,
}

impl Default for ArbConfig {
    fn default() -> Self {
        let mut current_seasons = HashMap::new();

        // MLB configuration
        current_seasons.insert(
            "mlb".to_string(),
            SeasonInfo {
                regular: "2025".to_string(),
                postseason: "2025POST".to_string(),
                postseason_start: "10-01".to_string(),
            },
        );

        // NFL configuration
        current_seasons.insert(
            "nfl".to_string(),
            SeasonInfo {
                regular: "2025".to_string(),
                postseason: "2025POST".to_string(),
                postseason_start: "01-01".to_string(),
            },
        );

        // NBA configuration
        current_seasons.insert(
            "nba".to_string(),
            SeasonInfo {
                regular: "2025".to_string(),
                postseason: "2025POST".to_string(),
                postseason_start: "04-01".to_string(),
            },
        );

        // NHL configuration
        current_seasons.insert(
            "nhl".to_string(),
            SeasonInfo {
                regular: "2025".to_string(),
                postseason: "2025POST".to_string(),
                postseason_start: "04-01".to_string(),
            },
        );

        Self {
            server: ServerConfig {
                host: "0.0.0.0".to_string(),
                port: 3000,
                cors_origins: "http://localhost:5173,http://localhost:3000".to_string(),
            },
            cache: CacheConfig {
                enabled: true,
                redis_url: "redis://localhost:6379".to_string(),
                default_ttl: 3600, // 1 hour
                ttl: CacheTtlConfig {
                    team_profiles: 3600,       // 1 hour
                    schedule: 1800,            // 30 minutes
                    postseason_schedule: 1800, // 30 minutes
                    scores: 120,               // 2 minutes
                    play_by_play: 20,          // 20 seconds
                    box_scores: 1800,          // 30 minutes
                    stadiums: 7200,            // 2 hours
                    twitter_search: 60,        // 1 minute
                },
            },
            seasons: SeasonsConfig { current_seasons },
            api: ApiConfig {
                sportsdata_base_url: "https://api.sportsdata.io/v3".to_string(),
                twitter_base_url: "https://api.twitterapi.io".to_string(),
                request_timeout: 30,
            },
        }
    }
}

impl ArbConfig {
    /// Load configuration from TOML file and environment variables with fallback to defaults
    pub fn from_env() -> Self {
        let mut config = Self::default();

        // Try to load from config.toml first
        if let Ok(toml_content) = std::fs::read_to_string("config.toml") {
            if let Ok(toml_config) = toml::from_str::<ArbConfig>(&toml_content) {
                config = toml_config;
            }
        }

        // Override with environment variables if present
        if let Ok(host) = std::env::var("ARB_HOST") {
            config.server.host = host;
        }

        if let Ok(port) = std::env::var("ARB_PORT") {
            if let Ok(port_num) = port.parse::<u16>() {
                config.server.port = port_num;
            }
        }

        if let Ok(redis_url) = std::env::var("REDIS_URL") {
            config.cache.redis_url = redis_url;
        }

        if let Ok(cache_enabled) = std::env::var("CACHE_ENABLED") {
            config.cache.enabled = cache_enabled.to_lowercase() == "true";
        }

        if let Ok(cors_origins) = std::env::var("CORS_ORIGINS") {
            config.server.cors_origins = cors_origins;
        }

        // Override seasons from environment variables
        for (sport, season_info) in &mut config.seasons.current_seasons {
            let env_key = format!("{}_REGULAR_SEASON", sport.to_uppercase());
            if let Ok(regular) = std::env::var(&env_key) {
                season_info.regular = regular;
            }

            let env_key = format!("{}_POSTSEASON", sport.to_uppercase());
            if let Ok(postseason) = std::env::var(&env_key) {
                season_info.postseason = postseason;
            }

            let env_key = format!("{}_POSTSEASON_START", sport.to_uppercase());
            if let Ok(postseason_start) = std::env::var(&env_key) {
                season_info.postseason_start = postseason_start;
            }
        }

        config
    }

    /// Get season information for a specific sport
    pub fn get_season_info(&self, sport: &str) -> Option<&SeasonInfo> {
        self.seasons.current_seasons.get(sport)
    }

    /// Check if a date is in the postseason for a specific sport
    pub fn is_postseason_date(&self, sport: &str, date: &str) -> bool {
        if let Some(season_info) = self.get_season_info(sport) {
            // Parse the date and check if it's on or after the postseason start date
            if let Ok(parsed_date) = chrono::NaiveDate::parse_from_str(date, "%Y-%m-%d") {
                let month = parsed_date.month();
                let day = parsed_date.day();

                // Parse postseason start date (MM-DD format)
                if let Ok(postseason_start) = chrono::NaiveDate::parse_from_str(
                    &format!("{}-{}", season_info.postseason_start, parsed_date.year()),
                    "%m-%d-%Y",
                ) {
                    return parsed_date >= postseason_start;
                }
            }
        }
        false
    }

    /// Get the appropriate season identifier for a sport and date
    pub fn get_season_identifier(&self, sport: &str, date: &str) -> Option<String> {
        if let Some(season_info) = self.get_season_info(sport) {
            if self.is_postseason_date(sport, date) {
                Some(season_info.postseason.clone())
            } else {
                Some(season_info.regular.clone())
            }
        } else {
            None
        }
    }
}
