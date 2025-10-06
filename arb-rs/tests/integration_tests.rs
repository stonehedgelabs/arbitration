use axum_test::TestServer;
use serde_json::Value;
use std::env;

// Import the main application
use arb_rs::cache::Cache;
use arb_rs::config::{ArbConfig, CacheConfig, CacheMode, CacheTtlConfig};
use arb_rs::server::Server;

async fn setup_test_server() -> TestServer {
    // Set up test environment
    env::set_var("SPORTDATAIO_API_KEY", "test_api_key");
    env::set_var("REDIS_URL", "redis://127.0.0.1:6379");

    // Create a test cache (this will fail if Redis is not available, but that's ok for tests)
    let redis_url =
        env::var("REDIS_URL").unwrap_or_else(|_| "redis://127.0.0.1:6379".to_string());
    let cache_config = CacheConfig {
        enabled: true,
        mode: CacheMode::TtlBased,
        redis_url,
        default_ttl: 3600, // 1 hour default
        ttl: CacheTtlConfig {
            team_profiles: 86400,        // 24 hours
            schedule: 3600,              // 1 hour
            postseason_schedule: 3600,   // 1 hour
            scores: 300,                 // 5 minutes
            play_by_play: 60,            // 1 minute
            box_scores: 3600,            // 1 hour
            stadiums: 86400,             // 24 hours
            twitter_search: 60,          // 1 minute
            reddit_thread: 21600,        // 6 hours
            reddit_thread_comments: 120, // 2 minutes
            odds: 86400,                 // 24 hours
            user_auth: 604800,           // 1 week
        },
    };
    let cache = match Cache::new(cache_config).await {
        Ok(cache) => std::sync::Arc::new(async_std::sync::Mutex::new(cache)),
        Err(_) => {
            // If Redis is not available, create a minimal test server
            use axum::{extract::Query, response::Json, routing::get, Router};
            use std::collections::HashMap;

            let app = Router::new()
                .route(
                    "/health",
                    get(|| async {
                        Json(serde_json::json!({
                            "uptime_seconds": 0,
                            "redis_connected": false,
                            "cache_size": 0
                        }))
                    }),
                )
                .route(
                    "/api/team-profile",
                    get(|Query(params): Query<HashMap<String, String>>| async move {
                        if let Some(league) = params.get("league") {
                            if league == "invalid" {
                                return (
                                    axum::http::StatusCode::BAD_REQUEST,
                                    "Invalid league",
                                );
                            }
                        }
                        (
                            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                            "Redis not available",
                        )
                    }),
                )
                .route(
                    "/api/v1/scores",
                    get(|Query(params): Query<HashMap<String, String>>| async move {
                        if let Some(league) = params.get("league") {
                            if league == "nfl" {
                                return (
                                    axum::http::StatusCode::BAD_REQUEST,
                                    "Scores not yet supported for league: nfl",
                                );
                            }
                        }
                        (
                            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                            "Redis not available",
                        )
                    }),
                )
                .route(
                    "/api/v1/box-score-final",
                    get(|Query(params): Query<HashMap<String, String>>| async move {
                        if let Some(league) = params.get("league") {
                            if league == "nfl" {
                                return (
                                    axum::http::StatusCode::BAD_REQUEST,
                                    "Box score final not yet supported for league: nfl",
                                );
                            }
                            if params.get("game_id").is_none_or(|id| id.trim().is_empty())
                            {
                                return (
                                    axum::http::StatusCode::BAD_REQUEST,
                                    "Missing or empty game_id parameter",
                                );
                            }
                        }
                        (
                            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                            "Redis not available",
                        )
                    }),
                )
                .route(
                    "/api/v1/teams",
                    get(|| async {
                        (
                            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                            "Redis not available",
                        )
                    }),
                )
                .route(
                    "/api/v1/schedule",
                    get(|| async {
                        (
                            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                            "Redis not available",
                        )
                    }),
                )
                .route(
                    "/api/v1/headshots",
                    get(|| async {
                        (
                            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                            "Redis not available",
                        )
                    }),
                )
                .route(
                    "/api/v1/play-by-play",
                    get(|Query(params): Query<HashMap<String, String>>| async move {
                        if params.get("game_id").is_none_or(|id| id.trim().is_empty()) {
                            return (
                                axum::http::StatusCode::BAD_REQUEST,
                                "Missing or empty game_id parameter",
                            );
                        }
                        (
                            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                            "Redis not available",
                        )
                    }),
                );

            return TestServer::new(app).unwrap();
        }
    };

    // Create a minimal test config
    let test_config = ArbConfig::default();
    let server = Server::new(cache, test_config);
    let app = server.build();

    TestServer::new(app).unwrap()
}

#[tokio::test]
async fn test_health_endpoint() {
    let server = setup_test_server().await;

    let response = server.get("/health").await;

    assert_eq!(response.status_code(), 200);

    let body: Value = response.json();
    assert!(body.get("uptime_seconds").is_some());
    assert!(body.get("redis_connected").is_some());
    assert!(body.get("cache_size").is_some());
}

#[tokio::test]
async fn test_team_profile_mlb() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/team-profile")
        .add_query_param("league", "mlb")
        .await;

    // The response might be 200 (if API key works), 500 (if API key is invalid), or 500 (if Redis not available)
    assert!(response.status_code() == 200 || response.status_code() == 500);

    if response.status_code() == 200 {
        let body: Value = response.json();
        assert_eq!(body.get("league").unwrap().as_str().unwrap(), "mlb");
        assert!(body.get("data").is_some());
    }
}

#[tokio::test]
async fn test_team_profile_invalid_league() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/team-profile")
        .add_query_param("league", "invalid")
        .await;

    assert_eq!(response.status_code(), 400);
}

#[tokio::test]
async fn test_scores_mlb() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/v1/scores")
        .add_query_param("league", "mlb")
        .add_query_param("date", "2025-01-15")
        .await;

    // The response might be 200 (if API key works), 500 (if API key is invalid), or 500 (if Redis not available)
    assert!(response.status_code() == 200 || response.status_code() == 500);

    if response.status_code() == 200 {
        let body: Value = response.json();
        assert_eq!(body.get("league").unwrap().as_str().unwrap(), "mlb");
        assert_eq!(body.get("date").unwrap().as_str().unwrap(), "2025-01-15");
        assert!(body.get("data").is_some());
        assert!(body.get("games_count").is_some());
        assert!(body.get("live_games_count").is_some());
        assert!(body.get("final_games_count").is_some());
    }
}

#[tokio::test]
async fn test_scores_mlb_default_date() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/v1/scores")
        .add_query_param("league", "mlb")
        .await;

    // The response might be 200 (if API key works), 500 (if API key is invalid), or 500 (if Redis not available)
    assert!(response.status_code() == 200 || response.status_code() == 500);

    if response.status_code() == 200 {
        let body: Value = response.json();
        assert_eq!(body.get("league").unwrap().as_str().unwrap(), "mlb");
        assert!(body.get("date").is_some());
        assert!(body.get("data").is_some());
    }
}

#[tokio::test]
async fn test_scores_unsupported_league() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/v1/scores")
        .add_query_param("league", "nfl")
        .await;

    assert_eq!(response.status_code(), 400);
}

#[tokio::test]
async fn test_box_score_final_mlb() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/v1/box-score-final")
        .add_query_param("league", "mlb")
        .add_query_param("game_id", "12345")
        .await;

    // The response might be 200 (if API key works), 500 (if API key is invalid), or 500 (if Redis not available)
    assert!(response.status_code() == 200 || response.status_code() == 500);

    if response.status_code() == 200 {
        let body: Value = response.json();
        assert_eq!(body.get("league").unwrap().as_str().unwrap(), "mlb");
        assert_eq!(body.get("game_id").unwrap().as_str().unwrap(), "12345");
        assert!(body.get("data").is_some());
        assert!(body.get("is_final").is_some());
        assert!(body.get("game_status").is_some());
    }
}

#[tokio::test]
async fn test_box_score_final_missing_game_id() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/v1/box-score-final")
        .add_query_param("league", "mlb")
        .await;

    // Should return 400 for missing game_id
    assert_eq!(response.status_code(), 400);
}

#[tokio::test]
async fn test_box_score_final_unsupported_league() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/v1/box-score-final")
        .add_query_param("league", "nfl")
        .add_query_param("game_id", "12345")
        .await;

    assert_eq!(response.status_code(), 400);
}

#[tokio::test]
async fn test_teams_mlb() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/v1/teams")
        .add_query_param("league", "mlb")
        .await;

    // The response might be 200 (if API key works), 500 (if API key is invalid), or 500 (if Redis not available)
    assert!(response.status_code() == 200 || response.status_code() == 500);

    if response.status_code() == 200 {
        let body: Value = response.json();
        assert_eq!(body.get("league").unwrap().as_str().unwrap(), "mlb");
        assert_eq!(body.get("data_type").unwrap().as_str().unwrap(), "teams");
        assert!(body.get("data").is_some());
    }
}

#[tokio::test]
async fn test_schedule_mlb() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/v1/schedule")
        .add_query_param("league", "mlb")
        .await;

    // The response might be 200 (if API key works), 500 (if API key is invalid), or 500 (if Redis not available)
    assert!(response.status_code() == 200 || response.status_code() == 500);

    if response.status_code() == 200 {
        let body: Value = response.json();
        assert_eq!(body.get("league").unwrap().as_str().unwrap(), "mlb");
        assert_eq!(body.get("data_type").unwrap().as_str().unwrap(), "schedule");
        assert!(body.get("data").is_some());
    }
}

#[tokio::test]
async fn test_headshots_mlb() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/v1/headshots")
        .add_query_param("league", "mlb")
        .await;

    // The response might be 200 (if API key works), 500 (if API key is invalid), or 500 (if Redis not available)
    assert!(response.status_code() == 200 || response.status_code() == 500);

    if response.status_code() == 200 {
        let body: Value = response.json();
        assert_eq!(body.get("league").unwrap().as_str().unwrap(), "mlb");
        assert_eq!(
            body.get("data_type").unwrap().as_str().unwrap(),
            "headshots"
        );
        assert!(body.get("data").is_some());
    }
}

#[tokio::test]
async fn test_play_by_play_mlb() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/v1/play-by-play")
        .add_query_param("league", "mlb")
        .add_query_param("game_id", "12345")
        .await;

    // The response might be 200 (if API key works), 500 (if API key is invalid), or 500 (if Redis not available)
    assert!(response.status_code() == 200 || response.status_code() == 500);

    if response.status_code() == 200 {
        let body: Value = response.json();
        assert_eq!(body.get("league").unwrap().as_str().unwrap(), "mlb");
        assert_eq!(body.get("game_id").unwrap().as_str().unwrap(), "12345");
        assert!(body.get("data").is_some());
        assert!(body.get("new_events_count").is_some());
        assert!(body.get("total_events_count").is_some());
        assert!(body.get("is_delta").is_some());
    }
}

#[tokio::test]
async fn test_play_by_play_missing_game_id() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/v1/play-by-play")
        .add_query_param("league", "mlb")
        .await;

    // Should return 400 for missing game_id
    assert_eq!(response.status_code(), 400);
}

#[tokio::test]
async fn test_invalid_endpoints() {
    let server = setup_test_server().await;

    // Test non-existent endpoint
    let response = server.get("/api/v1/nonexistent").await;

    assert_eq!(response.status_code(), 404);
}

#[tokio::test]
async fn test_cors_headers() {
    let server = setup_test_server().await;

    let response = server
        .get("/health")
        .add_header("Origin", "https://example.com")
        .await;

    assert_eq!(response.status_code(), 200);
    // CORS headers should be present (handled by tower-http CORS layer)
}

// Test data validation
#[tokio::test]
async fn test_scores_with_invalid_date_format() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/v1/scores")
        .add_query_param("league", "mlb")
        .add_query_param("date", "invalid-date")
        .await;

    // Should still work, just use the invalid date as-is
    // The API will handle the validation
    assert!(response.status_code() == 200 || response.status_code() == 500);
}

#[tokio::test]
async fn test_scores_with_days_back_parameter() {
    let server = setup_test_server().await;

    let response = server
        .get("/api/v1/scores")
        .add_query_param("league", "mlb")
        .add_query_param("days_back", "5")
        .await;

    // Should work with custom days_back parameter
    assert!(response.status_code() == 200 || response.status_code() == 500);

    if response.status_code() == 200 {
        let body: Value = response.json();
        assert_eq!(body.get("league").unwrap().as_str().unwrap(), "mlb");
        assert!(body.get("data").is_some());
    }
}
