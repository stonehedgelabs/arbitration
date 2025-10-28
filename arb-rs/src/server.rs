use async_std::sync::{Arc, Mutex};
use axum::{
    routing::{get, post},
    Router,
};
use tower::ServiceBuilder;
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing::info;

use crate::{cache::Cache, config::ArbConfig};

pub struct Server {
    cache: Arc<Mutex<Cache>>,
    config: ArbConfig,
}

impl Server {
    pub fn new(cache: Arc<Mutex<Cache>>, config: ArbConfig) -> Self {
        Self { cache, config }
    }

    pub fn build(self) -> Router {
        let sportradar_state = crate::uses::sportradar::UseCaseState::new(
            self.cache.clone(),
            self.config.clone(),
        );
        let rolling_insights_state = crate::uses::rolling_insights::UseCaseState::new(
            self.cache.clone(),
            self.config.clone(),
        );

        let sportradar_router = Router::new()
            .route("/health", get(crate::uses::sportradar::health_check))
            .route(
                "/api/v1/team-profile",
                get(crate::uses::sportradar::team_profile),
            )
            .route("/api/v1/schedule", get(crate::uses::sportradar::schedule))
            .route(
                "/api/v1/current-games",
                get(crate::uses::sportradar::current_games),
            )
            .route("/api/v1/headshots", get(crate::uses::sportradar::headshots))
            .route(
                "/api/v1/play-by-play",
                get(crate::uses::sportradar::play_by_play_handler),
            )
            .route("/api/v1/scores", get(crate::uses::sportradar::scores))
            .route("/api/v1/box-score", get(crate::uses::sportradar::box_score))
            .route(
                "/api/v1/scores-by-date",
                get(crate::uses::sportradar::game_by_date),
            )
            .route("/api/v1/stadiums", get(crate::uses::sportradar::stadiums))
            .route("/api/v1/standings", get(crate::uses::sportradar::standings))
            .route(
                "/api/v1/odds-by-date",
                get(crate::uses::sportradar::odds_by_date),
            )
            .route(
                "/api/v1/twitter-search",
                get(crate::uses::sportradar::twitter_search),
            )
            .route(
                "/api/v1/reddit-thread",
                get(crate::uses::sportradar::reddit_thread),
            )
            .route(
                "/api/v1/reddit-thread-comments",
                get(crate::uses::sportradar::reddit_search),
            )
            .route(
                "/api/v1/signin/google",
                get(crate::uses::sportradar::handle_google_auth_redirect),
            )
            .route(
                "/api/v1/signin/google/callback",
                get(crate::uses::sportradar::handle_google_auth_callback),
            )
            .route(
                "/api/v1/signin/apple",
                get(crate::uses::sportradar::handle_apple_auth_redirect),
            )
            .route(
                "/api/v1/signin/apple/callback",
                post(crate::uses::sportradar::handle_apple_auth_callback),
            )
            .with_state(sportradar_state);

        let rolling_insights_router = Router::new()
            .route(
                "/api/v2/schedule",
                get(crate::uses::rolling_insights::schedule),
            )
            .route(
                "/api/v2/current-games",
                get(crate::uses::rolling_insights::current_games),
            )
            .route(
                "/api/v2/team-profiles",
                get(crate::uses::rolling_insights::team_profiles),
            )
            .route(
                "/api/v2/player-profiles",
                get(crate::uses::rolling_insights::player_profiles),
            )
            .route(
                "/api/v2/box-score",
                get(crate::uses::rolling_insights::box_score),
            )
            .with_state(rolling_insights_state);

        sportradar_router.merge(rolling_insights_router).layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(
                    CorsLayer::new()
                        .allow_origin(Any)
                        .allow_methods(Any)
                        .allow_headers(Any),
                ),
        )
    }

    pub async fn run(self) -> Result<(), Box<dyn std::error::Error>> {
        let app = self.build();

        let listener = tokio::net::TcpListener::bind("0.0.0.0:8000").await?;
        info!("Server starting on http://0.0.0.0:8000");

        axum::serve(listener, app).await?;

        Ok(())
    }
}
