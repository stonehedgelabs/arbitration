use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::Json,
};
use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};
use std::time::Instant;
use strum::{Display, EnumString};
use url::Url;

use crate::cache::Cache;
use crate::error::Result;

#[derive(Debug, Display, EnumString, PartialEq, Clone)]
#[strum(serialize_all = "lowercase")]
pub enum League {
    Mlb,
    Nfl,
    Nba,
    Nhl,
    Soccer,
}

#[derive(Debug, Deserialize)]
pub struct TeamProfileQuery {
    pub league: String,
    pub k: String,
}

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub uptime_seconds: u64,
    pub redis_connected: bool,
    pub cache_size: usize,
}

#[derive(Debug, Serialize)]
pub struct TeamProfileResponse {
    pub league: String,
    pub data: serde_json::Value,
}

#[derive(Clone)]
pub struct UseCases {
    pub cache: Cache,
    pub start_time: Instant,
}

impl UseCases {
    pub fn new(cache: Cache) -> Self {
        Self {
            cache,
            start_time: Instant::now(),
        }
    }
}

pub async fn health_check(
    State(mut use_cases): State<UseCases>,
) -> Result<Json<HealthResponse>> {
    let uptime = use_cases.start_time.elapsed().as_secs();

    let redis_connected = use_cases.cache.ping().await.is_ok();
    let cache_size = use_cases.cache.get_size().await.unwrap_or(0);

    Ok(Json(HealthResponse {
        uptime_seconds: uptime,
        redis_connected,
        cache_size,
    }))
}

pub async fn team_profile(
    State(mut use_cases): State<UseCases>,
    Query(params): Query<TeamProfileQuery>,
) -> Result<Json<TeamProfileResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    let decoded_key = general_purpose::STANDARD.decode(&params.k).map_err(|_| {
        tracing::error!("Invalid base64 key: {}", params.k);
        StatusCode::BAD_REQUEST
    })?;

    let api_url = String::from_utf8(decoded_key).map_err(|_| {
        tracing::error!("Invalid UTF-8 in decoded key");
        StatusCode::BAD_REQUEST
    })?;

    let cache_key = format!("team_profile:{}:{}", league, params.k);

    let data = use_cases
        .cache
        .get_or_set_with_ttl(&cache_key, 3600, || async {
            tracing::info!(
                "Cache miss for team profile, fetching from API: {}",
                api_url
            );
            fetch_team_data_from_api(&api_url, &league).await
        })
        .await
        .map_err(|e| {
            tracing::error!("Failed to get team profile data: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let json_data: serde_json::Value = serde_json::from_str(&data).map_err(|e| {
        tracing::error!("Failed to parse JSON data: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(TeamProfileResponse {
        league: league.to_string(),
        data: json_data,
    }))
}

async fn fetch_team_data_from_api(api_url: &str, league: &League) -> Result<String> {
    let _parsed_url = Url::parse(api_url)?;

    let mock_data = match league {
        League::Mlb => serde_json::json!({
            "teams": [
                {"id": 1, "name": "New York Yankees", "city": "New York"},
                {"id": 2, "name": "Boston Red Sox", "city": "Boston"}
            ],
            "league": "MLB"
        }),
        League::Nfl => serde_json::json!({
            "teams": [
                {"id": 1, "name": "Kansas City Chiefs", "city": "Kansas City"},
                {"id": 2, "name": "Buffalo Bills", "city": "Buffalo"}
            ],
            "league": "NFL"
        }),
        League::Nba => serde_json::json!({
            "teams": [
                {"id": 1, "name": "Los Angeles Lakers", "city": "Los Angeles"},
                {"id": 2, "name": "Boston Celtics", "city": "Boston"}
            ],
            "league": "NBA"
        }),
        League::Nhl => serde_json::json!({
            "teams": [
                {"id": 1, "name": "Tampa Bay Lightning", "city": "Tampa Bay"},
                {"id": 2, "name": "Colorado Avalanche", "city": "Denver"}
            ],
            "league": "NHL"
        }),
        League::Soccer => serde_json::json!({
            "teams": [
                {"id": 1, "name": "Manchester United", "city": "Manchester"},
                {"id": 2, "name": "Real Madrid", "city": "Madrid"}
            ],
            "league": "SOCCER"
        }),
    };

    Ok(serde_json::to_string(&mock_data)?)
}
