use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod cache;
mod error;
mod schema;
mod server;
mod uses;

use cache::Cache;
use error::Result;
use server::Server;

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "arb-rs=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("Starting arbitration proxy server...");

    let redis_url = std::env::var("REDIS_URL")
        .unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());
    let cache = Cache::new(&redis_url).await?;

    let server = Server::new(cache);
    server
        .run()
        .await
        .map_err(|e| crate::error::Error::Server(e.to_string()))?;

    Ok(())
}
