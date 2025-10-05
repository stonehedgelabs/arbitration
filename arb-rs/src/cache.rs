use redis::{aio::MultiplexedConnection, Client};

use crate::config::CacheConfig;
use crate::error::Result;
pub use crate::uses::CacheKey;

#[derive(Clone)]
pub struct Cache {
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
                // Cache indefinitely - use SET without expiration
                redis::cmd("SET")
                    .arg(key.as_ref())
                    .arg(value)
                    .exec_async(&mut self.connection)
                    .await?;
            }
            crate::config::CacheMode::TtlBased => {
                // Use custom TTL - use SETEX with expiration
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
                // Cache indefinitely - just use SET
                redis::cmd("SET")
                    .arg(key.as_ref())
                    .arg(value)
                    .exec_async(&mut self.connection)
                    .await?;
            }
            crate::config::CacheMode::TtlBased => {
                // Use sliding TTL logic
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
