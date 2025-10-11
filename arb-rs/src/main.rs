use async_std::sync::{Arc, Mutex};
use clap::Parser;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

pub mod cache;
pub mod config;
pub mod error;
pub mod path;
pub mod schema;
pub mod server;
pub mod services;
pub mod uses;
pub mod zero_copy;

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
    let args = Args::parse();
    dotenv::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "arb=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("Starting arbitration proxy server...");

    let config = ArbConfig::from_file(&args.config);

    let cache = Arc::new(Mutex::new(Cache::new(config.cache.clone()).await?));

    info!("Server config: {}", config);

    let server = Server::new(cache, config);
    server
        .run()
        .await
        .map_err(|e| crate::error::Error::Server(e.to_string()))?;

    Ok(())
}
