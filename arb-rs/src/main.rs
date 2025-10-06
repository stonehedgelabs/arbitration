use async_std::sync::{Arc, Mutex};
use clap::Parser;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

// Module declarations
pub mod cache;
pub mod config;
pub mod error;
pub mod path;
pub mod schema;
pub mod server;
pub mod services;
pub mod uses;

use crate::{cache::Cache, config::ArbConfig, error::Result, server::Server};

/// Arbitration API Server - A proxy server for sports data with Redis caching
#[derive(Parser, Debug)]
#[command(author, version, about, long_about = None)]
struct Args {
    /// Path to the configuration file
    #[arg(short, long, default_value = "config.toml")]
    config: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Parse command line arguments
    let args = Args::parse();
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
    let config = ArbConfig::from_file(&args.config);

    let cache = Arc::new(Mutex::new(Cache::new(config.cache.clone()).await?));

    info!("Server config: {}", config);
    // Data will be fetched from API as needed, no pre-loading from test files

    let server = Server::new(cache, config);
    server
        .run()
        .await
        .map_err(|e| crate::error::Error::Server(e.to_string()))?;

    Ok(())
}
