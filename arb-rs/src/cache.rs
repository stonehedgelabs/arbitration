use crate::config::CacheConfig;
use crate::error::Result;
use redis::{aio::MultiplexedConnection, Client};

// Forward declaration - CacheKey is defined in uses.rs
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

    pub async fn set(&mut self, key: impl AsRef<str>, value: &str) -> Result<()> {
        if !self.config.enabled {
            return Ok(());
        }

        // Use slide_set_exp with default TTL for sliding window behavior
        self.slide_set_exp(key, value, self.config.default_ttl)
            .await
    }

    pub async fn get(&mut self, key: impl AsRef<str>) -> Result<Option<String>> {
        if !self.config.enabled {
            return Ok(None);
        }

        // Use slide_get_exp with default TTL for sliding window behavior
        self.slide_get_exp(key, self.config.default_ttl).await
    }

    pub async fn delete(&mut self, key: impl AsRef<str>) -> Result<()> {
        if !self.config.enabled {
            return Ok(());
        }

        redis::cmd("DEL")
            .arg(key.as_ref())
            .exec_async(&mut self.connection)
            .await?;
        Ok(())
    }

    pub async fn set_with_ttl(
        &mut self,
        key: impl AsRef<str>,
        value: &str,
        ttl_seconds: u64,
    ) -> Result<()> {
        if !self.config.enabled {
            return Ok(());
        }

        // Use slide_set_exp with specified TTL for sliding window behavior
        self.slide_set_exp(key, value, ttl_seconds).await
    }

    pub async fn get_or_set_with_ttl<F, Fut>(
        &mut self,
        key: impl AsRef<str>,
        ttl_seconds: u64,
        fetcher: F,
    ) -> Result<String>
    where
        F: FnOnce() -> Fut,
        Fut: std::future::Future<Output = Result<String>>,
    {
        if !self.config.enabled {
            // If caching is disabled, always fetch fresh data
            return fetcher().await;
        }

        // Use slide_get_exp to get value and extend TTL if it exists
        if let Some(cached) = self.slide_get_exp(&key, ttl_seconds).await? {
            return Ok(cached);
        }

        // If not found, fetch fresh data and set with sliding TTL
        let value = fetcher().await?;
        self.slide_set_exp(&key, &value, ttl_seconds).await?;
        Ok(value)
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

    pub async fn ping(&mut self) -> Result<()> {
        if !self.config.enabled {
            return Ok(());
        }

        redis::cmd("PING").exec_async(&mut self.connection).await?;
        Ok(())
    }

    /// Get a value and slide its expiration time (extend TTL if key exists)
    pub async fn slide_get_exp(
        &mut self,
        key: impl AsRef<str>,
        expiry_seconds: u64,
    ) -> Result<Option<String>> {
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
            .arg(expiry_seconds)
            .query_async(&mut self.connection)
            .await?;

        Ok(result)
    }

    /// Set a value with expiration and slide its expiration time (extend TTL if key exists)
    pub async fn slide_set_exp(
        &mut self,
        key: impl AsRef<str>,
        value: &str,
        expiry_seconds: u64,
    ) -> Result<()> {
        if !self.config.enabled {
            return Ok(());
        }

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
            .arg(expiry_seconds)
            .exec_async(&mut self.connection)
            .await?;

        Ok(())
    }
}
