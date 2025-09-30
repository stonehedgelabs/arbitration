use async_std::sync::{Arc, Mutex};
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::Json,
};
use base64::{engine::general_purpose, Engine as _};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Instant;
use strum::{Display, EnumString};
use url::Url;

use crate::cache::Cache;
use crate::error::Result;
use crate::schema::nfl::{headshots::Headshot, schedule::Schedule, teams::Team};

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

#[derive(Debug, Deserialize)]
pub struct DataQuery {
    pub league: String,
    pub k: String,
    #[serde(flatten)]
    pub filters: HashMap<String, String>,
}

#[derive(Debug, Deserialize)]
pub struct PlayByPlayQuery {
    pub league: String,
    pub k: String,
    pub game_id: String,
    #[serde(default)]
    pub last_timestamp: Option<String>,
    #[serde(default)]
    pub delta_minutes: Option<u32>,
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

#[derive(Debug, Serialize)]
pub struct DataResponse {
    pub league: String,
    pub data_type: String,
    pub data: serde_json::Value,
    pub filtered_count: usize,
    pub total_count: usize,
}

#[derive(Debug, Serialize)]
pub struct PlayByPlayResponse {
    pub league: String,
    pub game_id: String,
    pub data: serde_json::Value,
    pub new_events_count: usize,
    pub total_events_count: usize,
    pub last_timestamp: Option<String>,
    pub is_delta: bool,
}

#[derive(Clone)]
pub struct UseCaseState {
    pub cache: Arc<Mutex<Cache>>,
    pub start_time: Instant,
}

impl UseCaseState {
    pub fn new(cache: Arc<Mutex<Cache>>) -> Self {
        Self {
            cache,
            start_time: Instant::now(),
        }
    }
}

pub async fn health_check(
    State(mut use_case_state): State<UseCaseState>,
) -> Result<Json<HealthResponse>> {
    let uptime = use_case_state.start_time.elapsed().as_secs();

    let redis_connected = use_case_state.cache.lock().await.ping().await.is_ok();
    let cache_size = use_case_state
        .cache
        .lock()
        .await
        .get_size()
        .await
        .unwrap_or(0);

    Ok(Json(HealthResponse {
        uptime_seconds: uptime,
        redis_connected,
        cache_size,
    }))
}

pub async fn team_profile(
    State(mut use_case_state): State<UseCaseState>,
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

    let data = use_case_state
        .cache
        .lock()
        .await
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

pub async fn teams(
    State(mut use_case_state): State<UseCaseState>,
    Query(params): Query<DataQuery>,
) -> Result<Json<DataResponse>> {
    handle_data_request(use_case_state, params, "teams").await
}

pub async fn schedule(
    State(mut use_case_state): State<UseCaseState>,
    Query(params): Query<DataQuery>,
) -> Result<Json<DataResponse>> {
    handle_data_request(use_case_state, params, "schedule").await
}

pub async fn headshots(
    State(mut use_case_state): State<UseCaseState>,
    Query(params): Query<DataQuery>,
) -> Result<Json<DataResponse>> {
    handle_data_request(use_case_state, params, "headshots").await
}

pub async fn play_by_play(
    State(mut use_case_state): State<UseCaseState>,
    Query(params): Query<PlayByPlayQuery>,
) -> Result<Json<PlayByPlayResponse>> {
    handle_play_by_play_request(use_case_state, params).await
}

async fn handle_data_request(
    mut use_case_state: UseCaseState,
    params: DataQuery,
    data_type: &str,
) -> Result<Json<DataResponse>> {
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

    let cache_key = format!("{}:{}:{}", data_type, league, params.k);

    let data = use_case_state
        .cache
        .lock()
        .await
        .get_or_set_with_ttl(&cache_key, 3600, || async {
            tracing::info!(
                "Cache miss for {} data, fetching from API: {}",
                data_type,
                api_url
            );
            fetch_data_from_api(&api_url, &league, data_type).await
        })
        .await
        .map_err(|e| {
            tracing::error!("Failed to get {} data: {}", data_type, e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let json_data: serde_json::Value = serde_json::from_str(&data).map_err(|e| {
        tracing::error!("Failed to parse JSON data: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let (filtered_data, filtered_count, total_count) = if params.filters.is_empty() {
        (json_data.clone(), 0, 0)
    } else {
        filter_data_by_params(json_data.clone(), &params.filters)?
    };

    Ok(Json(DataResponse {
        league: league.to_string(),
        data_type: data_type.to_string(),
        data: filtered_data,
        filtered_count,
        total_count,
    }))
}

fn filter_data_by_params(
    data: serde_json::Value,
    filters: &HashMap<String, String>,
) -> Result<(serde_json::Value, usize, usize)> {
    let array = data.as_array().ok_or_else(|| {
        tracing::error!("Expected array data for filtering");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let total_count = array.len();
    let mut filtered_items = Vec::new();

    for item in array {
        let mut matches = true;

        for (key, value) in filters {
            if let Some(field_value) = item.get(key) {
                let field_str = match field_value {
                    serde_json::Value::String(s) => s.to_lowercase(),
                    serde_json::Value::Number(n) => n.to_string(),
                    serde_json::Value::Bool(b) => b.to_string(),
                    _ => continue,
                };

                if !field_str.contains(&value.to_lowercase()) {
                    matches = false;
                    break;
                }
            } else {
                matches = false;
                break;
            }
        }

        if matches {
            filtered_items.push(item.clone());
        }
    }

    let filtered_count = filtered_items.len();
    let filtered_data = serde_json::Value::Array(filtered_items);

    Ok((filtered_data, filtered_count, total_count))
}

async fn handle_play_by_play_request(
    mut use_case_state: UseCaseState,
    params: PlayByPlayQuery,
) -> Result<Json<PlayByPlayResponse>> {
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

    // Determine if this is a delta request or full request
    let is_delta = params.last_timestamp.is_some() || params.delta_minutes.is_some();
    let cache_key = if is_delta {
        format!(
            "playbyplay_delta:{}:{}:{}",
            league,
            params.game_id,
            params.last_timestamp.as_deref().unwrap_or("initial")
        )
    } else {
        format!("playbyplay:{}:{}", league, params.game_id)
    };

    let data = use_case_state
        .cache
        .lock()
        .await
        .get_or_set_with_ttl(&cache_key, 60, || async {
            tracing::info!(
                "Cache miss for play-by-play data, fetching from API: {} (delta: {})",
                api_url,
                is_delta
            );
            fetch_play_by_play_from_api(
                &api_url,
                &league,
                &params.game_id,
                is_delta,
                params.delta_minutes,
            )
            .await
        })
        .await
        .map_err(|e| {
            tracing::error!("Failed to get play-by-play data: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let json_data: serde_json::Value = serde_json::from_str(&data).map_err(|e| {
        tracing::error!("Failed to parse JSON data: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // Extract events and calculate counts
    let (events, new_events_count, total_events_count, last_timestamp) =
        extract_play_by_play_events(json_data, &params.last_timestamp)?;

    Ok(Json(PlayByPlayResponse {
        league: league.to_string(),
        game_id: params.game_id,
        data: events,
        new_events_count,
        total_events_count,
        last_timestamp,
        is_delta,
    }))
}

fn extract_play_by_play_events(
    data: serde_json::Value,
    last_timestamp: &Option<String>,
) -> Result<(serde_json::Value, usize, usize, Option<String>)> {
    // Try to extract plays/events from the response
    let plays = data
        .get("Plays")
        .or_else(|| data.get("plays"))
        .or_else(|| data.get("events"))
        .and_then(|v| v.as_array())
        .unwrap_or(&serde_json::Value::Array(vec![]));

    let total_events_count = plays.len();
    let mut new_events = Vec::new();
    let mut latest_timestamp = last_timestamp.clone();

    // Filter events based on timestamp if provided
    if let Some(last_ts) = last_timestamp {
        for play in plays {
            if let Some(play_timestamp) = play
                .get("Timestamp")
                .or_else(|| play.get("timestamp"))
                .or_else(|| play.get("Time"))
                .and_then(|v| v.as_str())
            {
                if play_timestamp > last_ts {
                    new_events.push(play.clone());
                    latest_timestamp = Some(play_timestamp.to_string());
                }
            }
        }
    } else {
        // First request - return all events
        new_events = plays.clone();
        // Find the latest timestamp
        for play in plays {
            if let Some(play_timestamp) = play
                .get("Timestamp")
                .or_else(|| play.get("timestamp"))
                .or_else(|| play.get("Time"))
                .and_then(|v| v.as_str())
            {
                if latest_timestamp.is_none()
                    || play_timestamp > latest_timestamp.as_ref().unwrap()
                {
                    latest_timestamp = Some(play_timestamp.to_string());
                }
            }
        }
    }

    let new_events_count = new_events.len();
    let events_json = serde_json::Value::Array(new_events);

    Ok((
        events_json,
        new_events_count,
        total_events_count,
        latest_timestamp,
    ))
}

async fn fetch_data_from_api(
    api_url: &str,
    league: &League,
    data_type: &str,
) -> Result<String> {
    let _parsed_url = Url::parse(api_url)?;

    tracing::info!("Fetching {} data from API: {}", data_type, api_url);

    // For now, return mock data since we're pre-loading from JSON files
    // In a real implementation, this would make actual HTTP requests to the API
    let mock_data = match (league, data_type) {
        (League::Nfl, "teams") => serde_json::json!([
            {"TeamID": 1, "Key": "ARI", "City": "Arizona", "Name": "Cardinals", "Conference": "NFC", "Division": "West"},
            {"TeamID": 2, "Key": "ATL", "City": "Atlanta", "Name": "Falcons", "Conference": "NFC", "Division": "South"},
            {"TeamID": 3, "Key": "BAL", "City": "Baltimore", "Name": "Ravens", "Conference": "AFC", "Division": "North"}
        ]),
        (League::Nfl, "schedule") => serde_json::json!([
            {"GameKey": "202510126", "AwayTeam": "DAL", "HomeTeam": "PHI", "Date": "2025-09-04T20:20:00", "Week": 1},
            {"GameKey": "202510127", "AwayTeam": "KC", "HomeTeam": "BUF", "Date": "2025-09-05T20:20:00", "Week": 1}
        ]),
        (League::Nfl, "headshots") => serde_json::json!([
            {"PlayerID": 549, "Name": "Matt Prater", "Position": "K", "Team": "BUF"},
            {"PlayerID": 611, "Name": "Joe Flacco", "Position": "QB", "Team": "CLE"}
        ]),
        (League::Mlb, "teams") => serde_json::json!([
            {"TeamID": 1, "Name": "New York Yankees", "City": "New York", "League": "AL", "Division": "East"},
            {"TeamID": 2, "Name": "Boston Red Sox", "City": "Boston", "League": "AL", "Division": "East"}
        ]),
        (League::Mlb, "schedule") => serde_json::json!([
            {"GameID": 1, "AwayTeam": "NYY", "HomeTeam": "BOS", "Date": "2025-04-01T19:10:00", "Season": 2025}
        ]),
        (League::Mlb, "headshots") => serde_json::json!([
            {"PlayerID": 1, "Name": "Aaron Judge", "Position": "OF", "Team": "NYY"}
        ]),
        (League::Nba, "teams") => serde_json::json!([
            {"TeamID": 1, "Name": "Los Angeles Lakers", "City": "Los Angeles", "Conference": "Western", "Division": "Pacific"},
            {"TeamID": 2, "Name": "Boston Celtics", "City": "Boston", "Conference": "Eastern", "Division": "Atlantic"}
        ]),
        (League::Nba, "schedule") => serde_json::json!([
            {"GameID": 1, "AwayTeam": "LAL", "HomeTeam": "BOS", "Date": "2025-10-01T20:00:00", "Season": 2025}
        ]),
        (League::Nba, "headshots") => serde_json::json!([
            {"PlayerID": 1, "Name": "LeBron James", "Position": "SF", "Team": "LAL"}
        ]),
        (League::Nhl, "teams") => serde_json::json!([
            {"TeamID": 1, "Name": "Tampa Bay Lightning", "City": "Tampa Bay", "Conference": "Eastern", "Division": "Atlantic"},
            {"TeamID": 2, "Name": "Colorado Avalanche", "City": "Denver", "Conference": "Western", "Division": "Central"}
        ]),
        (League::Nhl, "schedule") => serde_json::json!([
            {"GameID": 1, "AwayTeam": "TBL", "HomeTeam": "COL", "Date": "2025-10-01T20:00:00", "Season": 2025}
        ]),
        (League::Nhl, "headshots") => serde_json::json!([
            {"PlayerID": 1, "Name": "Nikita Kucherov", "Position": "RW", "Team": "TBL"}
        ]),
        _ => serde_json::json!([]),
    };

    Ok(serde_json::to_string(&mock_data)?)
}

async fn fetch_play_by_play_from_api(
    api_url: &str,
    league: &League,
    game_id: &str,
    is_delta: bool,
    delta_minutes: Option<u32>,
) -> Result<String> {
    let _parsed_url = Url::parse(api_url)?;

    tracing::info!(
        "Fetching play-by-play data from API: {} (delta: {}, game_id: {})",
        api_url,
        is_delta,
        game_id
    );

    // Mock play-by-play data with timestamps for delta testing
    let mock_data = match league {
        League::Nfl => {
            let base_plays = vec![
                serde_json::json!({
                    "PlayID": 1,
                    "Timestamp": "2025-09-04T20:20:00Z",
                    "Quarter": 1,
                    "TimeRemaining": "15:00",
                    "Down": 1,
                    "YardLine": 25,
                    "Description": "Kickoff returned to 25 yard line",
                    "AwayTeam": "DAL",
                    "HomeTeam": "PHI"
                }),
                serde_json::json!({
                    "PlayID": 2,
                    "Timestamp": "2025-09-04T20:21:30Z",
                    "Quarter": 1,
                    "TimeRemaining": "14:30",
                    "Down": 1,
                    "YardLine": 25,
                    "Description": "Pass complete for 8 yards",
                    "AwayTeam": "DAL",
                    "HomeTeam": "PHI"
                }),
                serde_json::json!({
                    "PlayID": 3,
                    "Timestamp": "2025-09-04T20:22:45Z",
                    "Quarter": 1,
                    "TimeRemaining": "13:15",
                    "Down": 2,
                    "YardLine": 33,
                    "Description": "Run for 3 yards",
                    "AwayTeam": "DAL",
                    "HomeTeam": "PHI"
                }),
            ];

            if is_delta {
                // For delta requests, simulate newer events
                let delta_plays = vec![
                    serde_json::json!({
                        "PlayID": 4,
                        "Timestamp": "2025-09-04T20:25:00Z",
                        "Quarter": 1,
                        "TimeRemaining": "10:00",
                        "Down": 3,
                        "YardLine": 36,
                        "Description": "Pass incomplete",
                        "AwayTeam": "DAL",
                        "HomeTeam": "PHI"
                    }),
                    serde_json::json!({
                        "PlayID": 5,
                        "Timestamp": "2025-09-04T20:25:30Z",
                        "Quarter": 1,
                        "TimeRemaining": "09:30",
                        "Down": 4,
                        "YardLine": 36,
                        "Description": "Punt for 45 yards",
                        "AwayTeam": "DAL",
                        "HomeTeam": "PHI"
                    }),
                ];
                serde_json::json!({
                    "GameID": game_id,
                    "Plays": delta_plays
                })
            } else {
                serde_json::json!({
                    "GameID": game_id,
                    "Plays": base_plays
                })
            }
        }
        League::Mlb => {
            let base_plays = vec![
                serde_json::json!({
                    "PlayID": 1,
                    "Timestamp": "2025-04-01T19:10:00Z",
                    "Inning": 1,
                    "Half": "Top",
                    "Description": "Strikeout swinging",
                    "AwayTeam": "NYY",
                    "HomeTeam": "BOS"
                }),
                serde_json::json!({
                    "PlayID": 2,
                    "Timestamp": "2025-04-01T19:12:30Z",
                    "Inning": 1,
                    "Half": "Top",
                    "Description": "Single to center field",
                    "AwayTeam": "NYY",
                    "HomeTeam": "BOS"
                }),
            ];

            if is_delta {
                let delta_plays = vec![serde_json::json!({
                    "PlayID": 3,
                    "Timestamp": "2025-04-01T19:15:00Z",
                    "Inning": 1,
                    "Half": "Top",
                    "Description": "Home run to left field!",
                    "AwayTeam": "NYY",
                    "HomeTeam": "BOS"
                })];
                serde_json::json!({
                    "GameID": game_id,
                    "Plays": delta_plays
                })
            } else {
                serde_json::json!({
                    "GameID": game_id,
                    "Plays": base_plays
                })
            }
        }
        _ => serde_json::json!({
            "GameID": game_id,
            "Plays": []
        }),
    };

    Ok(serde_json::to_string(&mock_data)?)
}
