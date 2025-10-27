use redis::{aio::MultiplexedConnection, Client};
use std::fmt;

use crate::config::CacheConfig;
use crate::error::Result;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Provider {
    Sportradar,
    RollingInsights,
}

impl Provider {
    pub fn as_str(&self) -> &'static str {
        match self {
            Provider::Sportradar => "sportradar",
            Provider::RollingInsights => "rolling_insights",
        }
    }
}

impl fmt::Display for Provider {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

#[derive(Clone)]
pub struct Cache {
    #[allow(dead_code)]
    client: Client,
    connection: MultiplexedConnection,
    config: CacheConfig,
}

impl Cache {
    pub async fn new(config: CacheConfig) -> Result<Self> {
        let client = Client::open(config.redis_url.as_str())?;
        let connection = client.get_multiplexed_async_connection().await?;

        Ok(Self {
            client,
            connection,
            config,
        })
    }

    /// Basic Redis SETEX with expiry argument, or SET for infinite caching
    pub async fn setx(
        &mut self,
        key: impl AsRef<str>,
        value: &str,
        expiry_seconds: u64,
    ) -> Result<()> {
        if !self.config.enabled {
            return Ok(());
        }

        match self.config.mode {
            crate::config::CacheMode::Infinite => {
                redis::cmd("SET")
                    .arg(key.as_ref())
                    .arg(value)
                    .exec_async(&mut self.connection)
                    .await?;
            }
            crate::config::CacheMode::TtlBased => {
                redis::cmd("SETEX")
                    .arg(key.as_ref())
                    .arg(expiry_seconds)
                    .arg(value)
                    .exec_async(&mut self.connection)
                    .await?;
            }
        }
        Ok(())
    }

    /// Lua script that sets the key and sets the expiry per the config
    pub async fn setx_slide(&mut self, key: impl AsRef<str>, value: &str) -> Result<()> {
        if !self.config.enabled {
            return Ok(());
        }

        match self.config.mode {
            crate::config::CacheMode::Infinite => {
                redis::cmd("SET")
                    .arg(key.as_ref())
                    .arg(value)
                    .exec_async(&mut self.connection)
                    .await?;
            }
            crate::config::CacheMode::TtlBased => {
                let script = r#"
                local val = redis.call("GET", KEYS[1])
                if val then
                    redis.call("EXPIRE", KEYS[1], ARGV[2])
                else
                    redis.call("SETEX", KEYS[1], ARGV[2], ARGV[1])
                end
                return val
                "#;

                redis::cmd("EVAL")
                    .arg(script)
                    .arg(1)
                    .arg(key.as_ref())
                    .arg(value)
                    .arg(self.config.default_ttl)
                    .exec_async(&mut self.connection)
                    .await?;
            }
        }

        Ok(())
    }

    /// Simple Redis GET
    pub async fn get(&mut self, key: impl AsRef<str>) -> Result<Option<String>> {
        if !self.config.enabled {
            return Ok(None);
        }

        let result: Option<String> = redis::cmd("GET")
            .arg(key.as_ref())
            .query_async(&mut self.connection)
            .await?;

        Ok(result)
    }

    /// Lua script that gets the key and sets the expiry
    pub async fn get_sliding(&mut self, key: impl AsRef<str>) -> Result<Option<String>> {
        if !self.config.enabled {
            return Ok(None);
        }

        let script = r#"
        local val = redis.call("GET", KEYS[1])
        if val then
            redis.call("EXPIRE", KEYS[1], ARGV[1])
        end
        return val
        "#;

        let result: Option<String> = redis::cmd("EVAL")
            .arg(script)
            .arg(1)
            .arg(key.as_ref())
            .arg(self.config.default_ttl)
            .query_async(&mut self.connection)
            .await?;

        Ok(result)
    }

    pub async fn ping(&mut self) -> Result<()> {
        if !self.config.enabled {
            return Ok(());
        }

        redis::cmd("PING").exec_async(&mut self.connection).await?;
        Ok(())
    }

    pub async fn get_size(&mut self) -> Result<usize> {
        if !self.config.enabled {
            return Ok(0);
        }

        let size: usize = redis::cmd("DBSIZE")
            .query_async(&mut self.connection)
            .await?;
        Ok(size)
    }
}

/// Trait for types that can be used as cache keys
pub trait CacheKeyType: fmt::Display + Copy {
    fn as_str(&self) -> &'static str;
}

/// A generic cache key that works with any DataType and League
#[derive(Debug, Clone)]
pub struct CacheKey(pub String);

impl From<String> for CacheKey {
    fn from(value: String) -> Self {
        CacheKey(value)
    }
}

impl From<&str> for CacheKey {
    fn from(value: &str) -> Self {
        CacheKey(value.to_string())
    }
}

impl From<CacheKey> for String {
    fn from(val: CacheKey) -> Self {
        val.0
    }
}

impl AsRef<str> for CacheKey {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

impl CacheKey {
    /// Create a new cache key from a string
    pub fn new(value: impl Into<String>) -> Self {
        CacheKey(value.into())
    }

    /// Create a provider-prefixed cache key
    pub fn with_provider(provider: Provider, key: impl AsRef<str>) -> Self {
        CacheKey::new(format!("{}:{}", provider.as_str(), key.as_ref()))
    }

    /// Generate a cache key for team profile data
    pub fn team_profile(provider: Provider, league: impl fmt::Display) -> Self {
        CacheKey::with_provider(provider, format!("team_profile:{}", league))
    }

    /// Generate a cache key for any data type
    pub fn data_type<D: CacheKeyType>(
        provider: Provider,
        data_type: &D,
        league: impl fmt::Display,
    ) -> Self {
        CacheKey::with_provider(provider, format!("{}:{}", data_type.as_str(), league))
    }

    /// Generate a cache key for play-by-play data
    pub fn play_by_play(
        provider: Provider,
        league: impl fmt::Display,
        game_id: &str,
    ) -> Self {
        CacheKey::with_provider(provider, format!("play_by_play:{}:{}", league, game_id))
    }

    /// Generate a cache key for play-by-play with delta tracking
    pub fn play_by_play_delta(
        provider: Provider,
        league: impl fmt::Display,
        game_id: &str,
        last_timestamp: &str,
    ) -> Self {
        CacheKey::with_provider(
            provider,
            format!(
                "play_by_play__delta:{}:{}:{}",
                league, game_id, last_timestamp
            ),
        )
    }

    /// Generate a cache key for box score data
    pub fn box_score(
        provider: Provider,
        league: impl fmt::Display,
        game_id: &str,
    ) -> Self {
        CacheKey::with_provider(provider, format!("box_score:{}:{}", league, game_id))
    }

    /// Generate a cache key for standings data
    pub fn standings(provider: Provider, league: impl fmt::Display, season: i32) -> Self {
        CacheKey::with_provider(provider, format!("standings:{}:{}", league, season))
    }

    /// Generate a cache key for stadiums data
    pub fn stadiums(provider: Provider, league: impl fmt::Display) -> Self {
        CacheKey::with_provider(provider, format!("stadiums:{}", league))
    }

    /// Generate a cache key for scores data
    pub fn scores(provider: Provider, league: impl fmt::Display, date: &str) -> Self {
        CacheKey::with_provider(provider, format!("scores:{}:{}", league, date))
    }

    /// Generate a cache key for odds by date data
    pub fn odds_by_date(
        provider: Provider,
        league: impl fmt::Display,
        date: &str,
    ) -> Self {
        CacheKey::with_provider(provider, format!("odds_by_date:{}:{}", league, date))
    }

    /// Generate a cache key for user data
    pub fn user(provider: Provider, email: &str) -> Self {
        CacheKey::with_provider(provider, format!("user:{}", email))
    }

    /// Generate a cache key for game by date data
    pub fn game_by_date(
        provider: Provider,
        league: impl fmt::Display,
        date: &str,
        game_id: &str,
    ) -> Self {
        CacheKey::with_provider(
            provider,
            format!("game_by_date:{}:{}:{}", league, date, game_id),
        )
    }
}
