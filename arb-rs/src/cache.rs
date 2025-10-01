use crate::error::Result;
use redis::{aio::MultiplexedConnection, Client};

// Forward declaration - CacheKey is defined in uses.rs
pub use crate::uses::CacheKey;

#[derive(Clone)]
pub struct Cache {
    client: Client,
    connection: MultiplexedConnection,
}

impl Cache {
    pub async fn new(redis_url: &str) -> Result<Self> {
        let client = Client::open(redis_url)?;
        let connection = client.get_multiplexed_async_connection().await?;

        Ok(Self { client, connection })
    }

    pub async fn set(&mut self, key: impl AsRef<str>, value: &str) -> Result<()> {
        redis::cmd("SET")
            .arg(key.as_ref())
            .arg(value)
            .exec_async(&mut self.connection)
            .await?;
        Ok(())
    }

    pub async fn get(&mut self, key: impl AsRef<str>) -> Result<Option<String>> {
        let result: Option<String> = redis::cmd("GET")
            .arg(key.as_ref())
            .query_async(&mut self.connection)
            .await?;
        Ok(result)
    }

    pub async fn delete(&mut self, key: impl AsRef<str>) -> Result<()> {
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
        redis::cmd("SETEX")
            .arg(key.as_ref())
            .arg(ttl_seconds)
            .arg(value)
            .exec_async(&mut self.connection)
            .await?;
        Ok(())
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
        if let Some(cached) = self.get(&key).await? {
            return Ok(cached);
        }

        let value = fetcher().await?;
        self.set_with_ttl(&key, &value, ttl_seconds).await?;
        Ok(value)
    }

    pub async fn get_size(&mut self) -> Result<usize> {
        let size: usize = redis::cmd("DBSIZE")
            .query_async(&mut self.connection)
            .await?;
        Ok(size)
    }

    pub async fn ping(&mut self) -> Result<()> {
        redis::cmd("PING").exec_async(&mut self.connection).await?;
        Ok(())
    }
}
