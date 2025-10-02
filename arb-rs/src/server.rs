use async_std::sync::{Arc, Mutex};

use axum::{routing::get, Router};
use tower::ServiceBuilder;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing::info;

use crate::cache::Cache;
use crate::uses::{
    box_score, game_by_date, headshots, health_check, play_by_play_handler, schedule,
    scores, stadiums, team_profile, teams, twitter_search, UseCaseState,
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
            .route("/api/v1/play-by-play", get(play_by_play_handler))
            .route("/api/v1/scores", get(scores))
            .route("/api/v1/box-score", get(box_score))
            .route("/api/v1/scores-by-date", get(game_by_date))
            .route("/api/v1/venues", get(stadiums))
            .route("/api/v1/twitter-search", get(twitter_search))
            .layer(
                ServiceBuilder::new()
                    .layer(TraceLayer::new_for_http())
                    .layer(
                        CorsLayer::new()
                            .allow_origin(Any)
                            .allow_methods(Any)
                            .allow_headers(Any),
                    ),
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
