use async_std::sync::{Arc, Mutex};
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

// Module declarations
pub mod api_paths;
pub mod cache;
pub mod config;
pub mod error;
pub mod schema;
pub mod server;
pub mod services;
pub mod uses;

use crate::{cache::Cache, config::ArbConfig, error::Result, server::Server};

#[tokio::main]
async fn main() -> Result<()> {
    // Load environment variables from .env file
    dotenv::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "arb=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("Starting arbitration proxy server...");

    // Load configuration
    let config = ArbConfig::from_env();

    let cache = Arc::new(Mutex::new(Cache::new(config.cache.clone()).await?));

    info!("Starting server with real-time API data fetching...");
    info!("Server config: {:?}", config);
    // Data will be fetched from API as needed, no pre-loading from test files

    let server = Server::new(cache, config);
    server
        .run()
        .await
        .map_err(|e| crate::error::Error::Server(e.to_string()))?;

    Ok(())
}
