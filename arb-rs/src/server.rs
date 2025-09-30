use axum::{routing::get, Router};
use tower::ServiceBuilder;
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use tracing::info;

use crate::cache::Cache;
use crate::uses::{health_check, team_profile, UseCases};

pub struct Server {
    cache: Cache,
}

impl Server {
    pub fn new(cache: Cache) -> Self {
        Self { cache }
    }

    pub fn build(self) -> Router {
        let use_cases = UseCases::new(self.cache);

        Router::new()
            .route("/health", get(health_check))
            .route("/api/team-profile", get(team_profile))
            .layer(
                ServiceBuilder::new()
                    .layer(TraceLayer::new_for_http())
                    .layer(CorsLayer::permissive()),
            )
            .with_state(use_cases)
    }

    pub async fn run(self) -> Result<(), Box<dyn std::error::Error>> {
        let app = self.build();

        let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await?;
        info!("Server starting on http://0.0.0.0:8000");

        axum::serve(listener, app).await?;

        Ok(())
    }
}
