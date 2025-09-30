use async_std::sync::{Arc, Mutex};

use axum::{routing::get, Router};
use tower::ServiceBuilder;
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use tracing::info;

use crate::cache::Cache;
use crate::uses::{
    headshots, health_check, play_by_play, schedule, team_profile, teams, UseCaseState,
};

pub struct Server {
    cache: Arc<Mutex<Cache>>,
}

impl Server {
    pub fn new(cache: Arc<Mutex<Cache>>) -> Self {
        Self { cache }
    }

    pub fn build(self) -> Router {
        let use_case_state = UseCaseState::new(self.cache);

        Router::new()
            .route("/health", get(health_check))
            .route("/api/team-profile", get(team_profile))
            .route("/api/v1/teams", get(teams))
            .route("/api/v1/schedule", get(schedule))
            .route("/api/v1/headshots", get(headshots))
            .route("/api/v1/play-by-play", get(play_by_play))
            .layer(
                ServiceBuilder::new()
                    .layer(TraceLayer::new_for_http())
                    .layer(CorsLayer::permissive()),
            )
            .with_state(use_case_state)
    }

    pub async fn run(self) -> Result<(), Box<dyn std::error::Error>> {
        let app = self.build();

        let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await?;
        info!("Server starting on http://0.0.0.0:8000");

        axum::serve(listener, app).await?;

        Ok(())
    }
}
