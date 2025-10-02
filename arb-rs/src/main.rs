use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

pub mod api_paths;
pub mod cache;
pub mod data_loader;
pub mod error;
pub mod schema;
pub mod server;
pub mod uses;

use async_std::sync::{Arc, Mutex};

use cache::Cache;
use data_loader::DataLoader;
use error::Result;
use server::Server;

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

    let redis_url = std::env::var("REDIS_URL")
        .unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());
    let cache = Arc::new(Mutex::new(Cache::new(&redis_url).await?));

    info!("Starting server with real-time API data fetching...");
    // Data will be fetched from API as needed, no pre-loading from test files

    let server = Server::new(cache);
    server
        .run()
        .await
        .map_err(|e| crate::error::Error::Server(e.to_string()))?;

    Ok(())
}
