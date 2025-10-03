// Standard library imports
use std::collections::HashMap;
use std::time::Instant;

// Third-party library imports
use async_std::sync::{Arc, Mutex};
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::Json,
};
use serde::{Deserialize, Serialize};
use url::Url;

// Internal imports - api_paths
use crate::api_paths::{
    box_score_path, games_by_date_path, headshots_path, odds_by_date_path,
    play_by_play_path, postseason_schedule_path, schedule_path, scores_basic_final_path,
    scores_basic_path, stadiums_path, team_profile_path, teams_path, League,
};

// Internal imports - other modules
use crate::cache::Cache;
use crate::config::ArbConfig;
use crate::error::Result;

// Internal imports - schema
use crate::schema::mlb::box_score::{BoxScore, BoxScoreResponse};
use crate::schema::mlb::game_by_date::{GameByDate, GameByDateResponse};
use crate::schema::mlb::odds::{GameOdds, OddsByDateResponse};
use crate::schema::mlb::play_by_play::PlayByPlayResponse as SchemaPlayByPlayResponse;
use crate::schema::mlb::schedule::{MLBScheduleGame, MLBScheduleResponse};
use crate::schema::mlb::stadiums::{Stadium, StadiumsResponse};
use crate::schema::twitterapi::tweet::{TwitterSearchResponse, TwitterTweet};

#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct CacheKey(String);

impl From<String> for CacheKey {
    fn from(value: String) -> Self {
        CacheKey(value)
    }
}

impl From<&str> for CacheKey {
    fn from(value: &str) -> Self {
        CacheKey(value.to_string())
    }
}

impl Into<String> for CacheKey {
    fn into(self) -> String {
        self.0
    }
}

impl AsRef<str> for CacheKey {
    fn as_ref(&self) -> &str {
        &self.0
    }
}

impl CacheKey {
    pub fn new(value: impl Into<String>) -> Self {
        CacheKey(value.into())
    }

    // Helper methods for different cache key types
    pub fn team_profile(league: &League) -> Self {
        CacheKey::new(format!("team_profile:{}", league))
    }

    pub fn data_type(data_type: &str, league: &League) -> Self {
        CacheKey::new(format!("{}:{}", data_type, league))
    }

    pub fn play_by_play(league: &League, game_id: &str) -> Self {
        CacheKey::new(format!("playbyplay:{}:{}", league, game_id))
    }

    pub fn play_by_play_delta(
        league: &League,
        game_id: &str,
        last_timestamp: &str,
    ) -> Self {
        CacheKey::new(format!(
            "playbyplay_delta:{}:{}:{}",
            league, game_id, last_timestamp
        ))
    }

    pub fn scores(league: &League, date: &str) -> Self {
        CacheKey::new(format!("scores:{}:{}", league, date))
    }

    pub fn box_score(league: &League, game_id: &str) -> Self {
        CacheKey::new(format!("box_score:{}:{}", league, game_id))
    }

    pub fn odds_by_date(league: &League, date: &str) -> Self {
        CacheKey::new(format!("odds_by_date:{}:{}", league, date))
    }
}

#[derive(Debug, Deserialize)]
pub struct LeagueQuery {
    pub league: String,
}

#[derive(Debug, Deserialize)]
pub struct TeamProfileQuery {
    pub league: String,
}

#[derive(Debug, Deserialize)]
pub struct DataQuery {
    pub league: String,
    #[serde(default)]
    pub post: Option<bool>,
    #[serde(flatten)]
    pub filters: HashMap<String, String>,
}

#[derive(Debug, Deserialize)]
pub struct PlayByPlayQuery {
    pub league: String,
    pub game_id: String,
    #[serde(default)]
    pub last_timestamp: Option<String>,
    #[serde(default)]
    pub delta_minutes: Option<u32>,
    #[serde(default)]
    pub t: Option<i64>, // Unix timestamp as integer
}

#[derive(Debug, Deserialize)]
pub struct ScoresQuery {
    pub league: String,
    pub date: Option<String>,   // YYYY-MM-DD format
    pub days_back: Option<u32>, // Number of days to go back (default 3)
}

#[derive(Debug, Deserialize)]
pub struct BoxScoreQuery {
    pub league: String,
    pub game_id: String,
}

#[derive(Debug, Deserialize)]
pub struct OddsByDateQuery {
    pub league: String,
    pub date: String,
}

#[derive(Debug, Deserialize)]
pub struct CurrentGamesQuery {
    pub league: String,
    pub start: String, // YYYY-MM-DD format
    pub end: String,   // YYYY-MM-DD format
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

#[derive(Debug, Serialize)]
pub struct ScoresResponse {
    pub league: String,
    pub date: String,
    pub data: serde_json::Value,
    pub games_count: usize,
    pub live_games_count: usize,
    pub final_games_count: usize,
}

#[derive(Clone)]
pub struct UseCaseState {
    pub cache: Arc<Mutex<Cache>>,
    pub start_time: Instant,
    pub config: ArbConfig,
}

impl UseCaseState {
    pub fn new(cache: Arc<Mutex<Cache>>, config: ArbConfig) -> Self {
        Self {
            cache,
            start_time: Instant::now(),
            config,
        }
    }
}

pub async fn health_check(
    State(use_case_state): State<UseCaseState>,
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
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<TeamProfileQuery>,
) -> Result<Json<TeamProfileResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    let api_path = team_profile_path(league.clone());
    let api_url = api_path.to_string();

    let cache_key = CacheKey::team_profile(&league);

    let data = use_case_state
        .cache
        .lock()
        .await
        .get_or_set_with_ttl(cache_key, 3600, || async {
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

    // For MLB, make real API calls; for other leagues, use mock data for now
    match league {
        League::Mlb => {
            let api_key = std::env::var("SPORTDATAIO_API_KEY").map_err(|_| {
                tracing::error!("SPORTDATAIO_API_KEY environment variable not set");
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

            let client = reqwest::Client::new();

            tracing::info!("Making real API request for team profile: {}", api_url);

            let response = client
                .get(api_url)
                .query(&[("key", &api_key)])
                .send()
                .await
                .map_err(|e| {
                    tracing::error!("Failed to make HTTP request: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

            if !response.status().is_success() {
                let status = response.status();
                let error_text = response
                    .text()
                    .await
                    .unwrap_or_else(|_| "Unknown error".to_string());
                tracing::error!(
                    "API request failed with status {}: {}",
                    status,
                    error_text
                );
                return Err(StatusCode::from_u16(status.as_u16())
                    .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
                    .into());
            }

            let body = response.text().await.map_err(|e| {
                tracing::error!("Failed to read response body: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

            tracing::info!("Successfully fetched team profile data for MLB");
            Ok(body)
        }
        _ => {
            // Use mock data for other leagues for now
            let mock_data = match league {
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
                _ => serde_json::json!({}),
            };

            Ok(serde_json::to_string(&mock_data)?)
        }
    }
}

pub async fn teams(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<DataQuery>,
) -> Result<Json<DataResponse>> {
    handle_data_request(use_case_state, params, "teams").await
}

pub async fn schedule(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<DataQuery>,
) -> Result<Json<MLBScheduleResponse>> {
    handle_schedule_request(use_case_state, params).await
}

pub async fn current_games(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<CurrentGamesQuery>,
) -> Result<Json<MLBScheduleResponse>> {
    handle_current_games_request(use_case_state, params).await
}

pub async fn headshots(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<DataQuery>,
) -> Result<Json<DataResponse>> {
    handle_data_request(use_case_state, params, "headshots").await
}

pub async fn play_by_play_handler(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<PlayByPlayQuery>,
) -> Result<Json<PlayByPlayResponse>> {
    handle_play_by_play_request(use_case_state, params).await
}

pub async fn scores(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<ScoresQuery>,
) -> Result<Json<ScoresResponse>> {
    handle_scores_request(use_case_state, params).await
}

async fn handle_schedule_request(
    use_case_state: UseCaseState,
    params: DataQuery,
) -> Result<Json<MLBScheduleResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    // Only support MLB for now
    if league != League::Mlb {
        tracing::error!("Schedule not yet supported for league: {}", league);
        return Err(StatusCode::BAD_REQUEST.into());
    }

    // Check if a date filter is provided - if so, use GamesByDate endpoint for efficiency
    let date_filter = params.filters.get("date").cloned();

    let (api_url, cache_key) = if let Some(ref date) = date_filter {
        // Use GamesByDate endpoint for specific date - much more efficient
        let api_url = games_by_date_path(league.clone(), Some(date.clone())).to_string();
        let cache_key = CacheKey::new(format!("games_by_date_{}_{}", league, date));
        (api_url, cache_key)
    } else if params.post.unwrap_or(false) {
        // Use postseason schedule if post=true parameter is provided
        let api_url =
            postseason_schedule_path(league.clone(), use_case_state.config.clone())
                .to_string();
        let cache_key = CacheKey::data_type("postseason_schedule", &league);
        (api_url, cache_key)
    } else {
        // Fall back to full schedule (less efficient)
        let api_url = schedule_path(league.clone()).to_string();
        let cache_key = CacheKey::data_type("schedule", &league);
        (api_url, cache_key)
    };

    let data = use_case_state
        .cache
        .lock()
        .await
        .get_or_set_with_ttl(cache_key, 3600, || async {
            tracing::info!(
                "Cache miss for schedule data, fetching from API: {}",
                api_url
            );
            // Use appropriate fetch function based on endpoint
            if date_filter.is_some() {
                tracing::info!(
                    "Using GamesByDate endpoint for date: {}",
                    date_filter.as_ref().unwrap()
                );
                fetch_games_by_date_from_api(&api_url, &league).await
            } else {
                tracing::info!("Using full schedule endpoint");
                fetch_schedule_from_api(&api_url, &league, params.post.unwrap_or(false))
                    .await
            }
        })
        .await
        .map_err(|e| {
            tracing::error!("Failed to get schedule data: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let schedule_games: Vec<MLBScheduleGame> =
        serde_json::from_str(&data).map_err(|e| {
            tracing::error!("Failed to parse schedule JSON data: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let total_count = schedule_games.len();

    let (filtered_games, filtered_count) = if params.filters.is_empty() {
        (schedule_games, total_count)
    } else {
        // Apply filters if any
        let filtered_games = schedule_games
            .into_iter()
            .filter(|game| {
                params.filters.iter().all(|(key, value)| {
                    match key.as_str() {
                        "status" => game
                            .status
                            .as_ref()
                            .map(|s| s.to_lowercase().contains(&value.to_lowercase()))
                            .unwrap_or(false),
                        "away_team" => game
                            .away_team
                            .as_ref()
                            .map(|s| s.to_lowercase().contains(&value.to_lowercase()))
                            .unwrap_or(false),
                        "home_team" => game
                            .home_team
                            .as_ref()
                            .map(|s| s.to_lowercase().contains(&value.to_lowercase()))
                            .unwrap_or(false),
                        "date" => {
                            if let Some(day_str) = game.day.as_ref() {
                                // The day field is in format "2025-03-18T00:00:00", so we need to check if it starts with the date
                                day_str.starts_with(&format!("{}T", value))
                            } else {
                                false
                            }
                        }
                        _ => true,
                    }
                })
            })
            .collect::<Vec<_>>();
        let filtered_count = filtered_games.len();
        (filtered_games, filtered_count)
    };

    Ok(Json(MLBScheduleResponse {
        league: league.to_string(),
        data_type: "schedule".to_string(),
        data: filtered_games,
        filtered_count,
        total_count,
    }))
}

async fn handle_current_games_request(
    use_case_state: UseCaseState,
    params: CurrentGamesQuery,
) -> Result<Json<MLBScheduleResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    // Only support MLB for now
    if league != League::Mlb {
        tracing::error!("Current games not yet supported for league: {}", league);
        return Err(StatusCode::BAD_REQUEST.into());
    }

    // Parse start and end dates
    let start_date = chrono::NaiveDate::parse_from_str(&params.start, "%Y-%m-%d")
        .map_err(|_| {
            tracing::error!("Invalid start date format: {}", params.start);
            StatusCode::BAD_REQUEST
        })?;

    let end_date =
        chrono::NaiveDate::parse_from_str(&params.end, "%Y-%m-%d").map_err(|_| {
            tracing::error!("Invalid end date format: {}", params.end);
            StatusCode::BAD_REQUEST
        })?;

    // Validate date range
    if start_date > end_date {
        tracing::error!(
            "Start date {} is after end date {}",
            params.start,
            params.end
        );
        return Err(StatusCode::BAD_REQUEST.into());
    }

    // Generate all dates in the range (inclusive)
    let mut all_games = Vec::new();
    let mut current_date = start_date;

    while current_date <= end_date {
        let date_str = current_date.format("%Y-%m-%d").to_string();

        // Use GamesByDate endpoint for this specific date
        let api_url =
            games_by_date_path(league.clone(), Some(date_str.clone())).to_string();
        let cache_key = CacheKey::new(format!("games_by_date_{}_{}", league, date_str));

        let data = use_case_state
            .cache
            .lock()
            .await
            .get_or_set_with_ttl(cache_key, 3600, || async {
                tracing::info!(
                    "Cache miss for games by date, fetching from API: {} for date: {}",
                    api_url,
                    date_str
                );
                fetch_games_by_date_from_api(&api_url, &league).await
            })
            .await
            .map_err(|e| {
                tracing::error!("Failed to get games data for date {}: {}", date_str, e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        // Parse the JSON data and add games to our collection
        let json_data: serde_json::Value = serde_json::from_str(&data).map_err(|e| {
            tracing::error!("Failed to parse JSON data for date {}: {}", date_str, e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

        // Add games from this date to our collection
        if let Some(games_array) = json_data.as_array() {
            for game in games_array {
                all_games.push(game.clone());
            }
        }

        // Move to next date
        current_date = current_date.succ_opt().unwrap_or(current_date);
    }

    // Convert all games to MLBScheduleGame format
    let schedule_games: Vec<MLBScheduleGame> =
        serde_json::from_value(serde_json::Value::Array(all_games)).map_err(|e| {
            tracing::error!("Failed to parse games as MLBScheduleGame: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let total_count = schedule_games.len();

    Ok(Json(MLBScheduleResponse {
        league: league.to_string(),
        data_type: "current_games".to_string(),
        data: schedule_games,
        filtered_count: total_count,
        total_count,
    }))
}

async fn handle_data_request(
    use_case_state: UseCaseState,
    params: DataQuery,
    data_type: &str,
) -> Result<Json<DataResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    let api_url = match data_type {
        "teams" => teams_path(league.clone()).to_string(),
        "schedule" => schedule_path(league.clone()).to_string(),
        "headshots" => headshots_path(league.clone()).to_string(),
        _ => {
            tracing::error!("Unsupported data type: {}", data_type);
            return Err(StatusCode::BAD_REQUEST.into());
        }
    };

    let cache_key = CacheKey::data_type(data_type, &league);

    let data = use_case_state
        .cache
        .lock()
        .await
        .get_or_set_with_ttl(cache_key, 3600, || async {
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
    use_case_state: UseCaseState,
    params: PlayByPlayQuery,
) -> Result<Json<PlayByPlayResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    // Validate required game_id parameter
    if params.game_id.trim().is_empty() {
        tracing::error!("Missing or empty game_id parameter");
        return Err(StatusCode::BAD_REQUEST.into());
    }

    let api_url =
        play_by_play_path(league.clone(), Some(params.game_id.clone())).to_string();

    tracing::info!(
        "Constructed play-by-play API URL: {} for game_id: {}",
        api_url,
        params.game_id
    );

    // Determine if this is a delta request or full request
    let is_delta = params.last_timestamp.is_some() || params.delta_minutes.is_some();
    let cache_key = if is_delta {
        CacheKey::play_by_play_delta(
            &league,
            &params.game_id,
            params.last_timestamp.as_deref().unwrap_or("initial"),
        )
    } else {
        CacheKey::play_by_play(&league, &params.game_id)
    };

    let data = use_case_state
        .cache
        .lock()
        .await
        .get_or_set_with_ttl(cache_key, 60, || async {
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
        extract_play_by_play_events(json_data, &params.last_timestamp, params.t)?;

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

async fn handle_scores_request(
    use_case_state: UseCaseState,
    params: ScoresQuery,
) -> Result<Json<ScoresResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    // Determine the date range - default to 7 days back to match date picker range
    let days_back = params.days_back.unwrap_or(7);
    let today = chrono::Utc::now().date_naive();

    // Generate date range for the past N days
    let mut all_games = Vec::new();

    for i in 0..days_back {
        let target_date = today - chrono::Duration::days(i.into());
        let date_str = target_date.format("%Y-%m-%d").to_string();

        // For now, we'll focus on MLB and use the ScoresBasicFinal endpoint
        // This will be expanded to support other leagues
        let api_url = match league {
            League::Mlb => {
                scores_basic_final_path(league.clone(), Some(date_str.clone()))
                    .to_string()
            }
            _ => {
                tracing::error!("Scores not yet supported for league: {}", league);
                return Err(StatusCode::BAD_REQUEST.into());
            }
        };

        let cache_key = CacheKey::scores(&league, &date_str);

        let data = use_case_state
            .cache
            .lock()
            .await
            .get_or_set_with_ttl(cache_key, 300, || async {
                tracing::info!(
                    "Cache miss for scores data, fetching from API: {} for date: {}",
                    api_url,
                    date_str
                );
                fetch_scores_from_api(&api_url, &league, &date_str).await
            })
            .await
            .map_err(|e| {
                tracing::error!("Failed to get scores data for date {}: {}", date_str, e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        let json_data: serde_json::Value = serde_json::from_str(&data).map_err(|e| {
            tracing::error!("Failed to parse JSON data for date {}: {}", date_str, e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

        // Add games from this date to our collection
        if let Some(games_array) = json_data.as_array() {
            for game in games_array {
                all_games.push(game.clone());
            }
        }
    }

    // Process all collected games to count live vs final games
    let (games_count, live_games_count, final_games_count) =
        process_scores_data(&serde_json::Value::Array(all_games.clone()))?;

    Ok(Json(ScoresResponse {
        league: league.to_string(),
        date: format!("{} days back", days_back),
        data: serde_json::Value::Array(all_games),
        games_count,
        live_games_count,
        final_games_count,
    }))
}

fn extract_play_by_play_events(
    data: serde_json::Value,
    last_timestamp: &Option<String>,
    filter_timestamp: Option<i64>,
) -> Result<(serde_json::Value, usize, usize, Option<String>)> {
    // Try to extract plays/events from the response
    let binding = vec![];
    let plays = data
        .get("Plays")
        .or_else(|| data.get("plays"))
        .or_else(|| data.get("events"))
        .and_then(|v| v.as_array())
        .unwrap_or(&binding);

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
                if play_timestamp > last_ts.as_str() {
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
                    || play_timestamp > latest_timestamp.as_ref().unwrap().as_str()
                {
                    latest_timestamp = Some(play_timestamp.to_string());
                }
            }
        }
    }

    // Apply timestamp filtering if provided
    if let Some(filter_ts) = filter_timestamp {
        new_events.retain(|play| {
            if let Some(play_timestamp) = play
                .get("Updated")
                .or_else(|| play.get("updated"))
                .or_else(|| play.get("timestamp"))
                .and_then(|v| v.as_str())
            {
                // Parse the timestamp and convert to Unix timestamp
                if let Ok(parsed_time) =
                    chrono::DateTime::parse_from_rfc3339(play_timestamp)
                {
                    let play_unix_ts = parsed_time.timestamp();
                    play_unix_ts >= filter_ts
                } else {
                    true // Keep the event if we can't parse the timestamp
                }
            } else {
                true // Keep the event if no timestamp is found
            }
        });
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

async fn fetch_schedule_from_api(
    api_url: &str,
    league: &League,
    is_postseason: bool,
) -> Result<String> {
    let _parsed_url = Url::parse(api_url)?;

    let season_type = if is_postseason {
        "postseason"
    } else {
        "regular season"
    };
    tracing::info!(
        "Fetching {} schedule data from API: {}",
        season_type,
        api_url
    );

    match league {
        League::Mlb => {
            let api_key = std::env::var("SPORTDATAIO_API_KEY").map_err(|_| {
                tracing::error!("SPORTDATAIO_API_KEY environment variable not set");
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

            let client = reqwest::Client::new();

            tracing::info!("Making real API request for schedule: {}", api_url);

            let response = client
                .get(api_url)
                .query(&[("key", &api_key)])
                .send()
                .await
                .map_err(|e| {
                    tracing::error!("Failed to make HTTP request: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

            if !response.status().is_success() {
                let status = response.status();
                let error_text = response
                    .text()
                    .await
                    .unwrap_or_else(|_| "Unknown error".to_string());
                tracing::error!(
                    "API request failed with status {}: {}",
                    status,
                    error_text
                );
                return Err(StatusCode::from_u16(status.as_u16())
                    .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
                    .into());
            }

            let body = response.text().await.map_err(|e| {
                tracing::error!("Failed to read response body: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

            tracing::info!("Successfully fetched {} schedule data for MLB. Response length: {} characters", season_type, body.len());

            // Log first 500 characters for debugging
            let preview = if body.len() > 500 {
                format!("{}...", &body[..500])
            } else {
                body.clone()
            };
            tracing::info!("Response preview: {}", preview);

            // Check if response is valid JSON array
            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&body) {
                if let Some(array) = parsed.as_array() {
                    tracing::info!(
                        "Response is valid JSON array with {} items",
                        array.len()
                    );
                } else {
                    tracing::warn!(
                        "Response is valid JSON but not an array: {:?}",
                        parsed
                    );
                }
            } else {
                tracing::error!("Response is not valid JSON");
            }

            Ok(body)
        }
        _ => {
            tracing::error!("Schedule not supported for league: {}", league);
            Err(StatusCode::BAD_REQUEST.into())
        }
    }
}

async fn fetch_data_from_api(
    api_url: &str,
    league: &League,
    data_type: &str,
) -> Result<String> {
    let _parsed_url = Url::parse(api_url)?;

    tracing::info!("Fetching {} data from API: {}", data_type, api_url);

    // Return mock data since we're pre-loading from JSON files
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
    _delta_minutes: Option<u32>,
) -> Result<String> {
    let _parsed_url = Url::parse(api_url)?;

    tracing::info!(
        "Fetching play-by-play data from API: {} (delta: {}, game_id: {})",
        api_url,
        is_delta,
        game_id
    );

    // Get API key from environment
    let api_key = std::env::var("SPORTDATAIO_API_KEY").map_err(|_| {
        tracing::error!("SPORTDATAIO_API_KEY environment variable not set");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let client = reqwest::Client::new();

    tracing::info!(
        "Making real API request to: {} for league: {} game_id: {}",
        api_url,
        league,
        game_id
    );

    let response = client
        .get(api_url)
        .query(&[("key", &api_key)])
        .send()
        .await
        .map_err(|e| {
            tracing::error!("Failed to make HTTP request: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if !response.status().is_success() {
        let status = response.status();
        tracing::error!("API request failed with status: {}", status);
        return Err(StatusCode::INTERNAL_SERVER_ERROR.into());
    }

    let body = response.text().await.map_err(|e| {
        tracing::error!("Failed to read response body: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // Log the first 200 characters of the response to debug
    let preview = if body.len() > 200 {
        format!("{}...", &body[..200])
    } else {
        body.clone()
    };

    tracing::info!(
        "Successfully fetched play-by-play data from API. Response preview: {}",
        preview
    );

    // Check if the response looks like HTML (error page)
    if body.trim_start().starts_with("<!DOCTYPE")
        || body.trim_start().starts_with("<html")
    {
        tracing::error!("API returned HTML instead of JSON. Full response: {}", body);
        return Err(StatusCode::INTERNAL_SERVER_ERROR.into());
    }

    Ok(body)
}

async fn fetch_scores_from_api(
    api_url: &str,
    league: &League,
    date: &str,
) -> Result<String> {
    let _parsed_url = Url::parse(api_url)?;

    tracing::info!(
        "Fetching scores data from API: {} for date: {}",
        api_url,
        date
    );

    // For MLB, make real API calls; for other leagues, use mock data for now
    match league {
        League::Mlb => {
            let api_key = std::env::var("SPORTDATAIO_API_KEY").map_err(|_| {
                tracing::error!("SPORTDATAIO_API_KEY environment variable not set");
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

            let client = reqwest::Client::new();

            tracing::info!("Making real API request for scores: {}", api_url);

            let response = client
                .get(api_url)
                .query(&[("key", &api_key)])
                .send()
                .await
                .map_err(|e| {
                    tracing::error!("Failed to make HTTP request: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

            if !response.status().is_success() {
                let status = response.status();
                let error_text = response
                    .text()
                    .await
                    .unwrap_or_else(|_| "Unknown error".to_string());
                tracing::error!(
                    "API request failed with status {}: {}",
                    status,
                    error_text
                );
                return Err(StatusCode::from_u16(status.as_u16())
                    .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
                    .into());
            }

            let response_text = response.text().await.map_err(|e| {
                tracing::error!("Failed to read response body: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

            tracing::info!("Successfully fetched scores data for date: {}", date);
            Ok(response_text)
        }
        _ => {
            // For other leagues, return mock data for now
            let mock_data = serde_json::json!([
                {
                    "GameID": 1,
                    "DateTime": "2025-01-15T19:10:00",
                    "DateTimeUTC": "2025-01-16T00:10:00Z",
                    "Status": "Final",
                    "AwayTeam": "NYY",
                    "HomeTeam": "BOS",
                    "AwayTeamID": 1,
                    "HomeTeamID": 2,
                    "AwayTeamScore": 4,
                    "HomeTeamScore": 2,
                    "Inning": 9,
                    "InningHalf": "Bottom",
                    "IsClosed": true,
                    "GameEndDateTime": "2025-01-15T22:15:00",
                    "GameEndDateTimeUTC": "2025-01-16T03:15:00Z"
                },
                {
                    "GameID": 2,
                    "DateTime": "2025-01-15T20:05:00",
                    "DateTimeUTC": "2025-01-16T01:05:00Z",
                    "Status": "InProgress",
                    "AwayTeam": "LAD",
                    "HomeTeam": "SF",
                    "AwayTeamID": 3,
                    "HomeTeamID": 4,
                    "AwayTeamScore": 1,
                    "HomeTeamScore": 3,
                    "Inning": 6,
                    "InningHalf": "Top",
                    "IsClosed": false,
                    "GameEndDateTime": null,
                    "GameEndDateTimeUTC": null
                },
                {
                    "GameID": 3,
                    "DateTime": "2025-01-15T21:10:00",
                    "DateTimeUTC": "2025-01-16T02:10:00Z",
                    "Status": "Scheduled",
                    "AwayTeam": "HOU",
                    "HomeTeam": "OAK",
                    "AwayTeamID": 5,
                    "HomeTeamID": 6,
                    "AwayTeamScore": null,
                    "HomeTeamScore": null,
                    "Inning": null,
                    "InningHalf": null,
                    "IsClosed": false,
                    "GameEndDateTime": null,
                    "GameEndDateTimeUTC": null
                }
            ]);

            Ok(serde_json::to_string(&mock_data)?)
        }
    }
}

fn process_scores_data(data: &serde_json::Value) -> Result<(usize, usize, usize)> {
    let games = data.as_array().ok_or_else(|| {
        tracing::error!("Expected array data for scores processing");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let mut live_games_count = 0;
    let mut final_games_count = 0;

    for game in games {
        if let Some(status) = game.get("Status").and_then(|v| v.as_str()) {
            match status {
                "Final" | "Completed" => final_games_count += 1,
                "InProgress" | "Live" => live_games_count += 1,
                _ => {} // Scheduled, Postponed, etc.
            }
        }
    }

    let games_count = games.len();

    Ok((games_count, live_games_count, final_games_count))
}

fn extract_game_status(data: &serde_json::Value) -> Result<(bool, Option<String>)> {
    // Try to extract game status from various possible fields
    let status = data
        .get("Status")
        .or_else(|| data.get("status"))
        .or_else(|| data.get("GameStatus"))
        .or_else(|| data.get("gameStatus"))
        .and_then(|v| v.as_str());

    let is_final = match status {
        Some("Final") | Some("Completed") | Some("FINAL") | Some("COMPLETED") => true,
        Some("InProgress") | Some("Live") | Some("IN_PROGRESS") | Some("LIVE") => false,
        Some("Scheduled") | Some("Pre-Game") | Some("SCHEDULED") | Some("PRE_GAME") => {
            false
        }
        _ => {
            // Try to determine from other fields
            if let Some(quarters) = data.get("Quarters") {
                if quarters.is_array() {
                    let quarters_array = quarters.as_array().unwrap();
                    return Ok((
                        quarters_array.len() >= 4,
                        status.map(|s| s.to_string()),
                    ));
                }
            }
            false
        }
    };

    Ok((is_final, status.map(|s| s.to_string())))
}

#[derive(Debug, Deserialize)]
pub struct GameByDateQuery {
    pub league: String,
    pub date: String,
    pub game_id: String,
}

pub async fn handle_game_by_date_request(
    Query(params): Query<GameByDateQuery>,
    State(use_case_state): State<UseCaseState>,
) -> Result<Json<GameByDateResponse>> {
    let league = params.league.parse::<League>().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    if params.date.is_empty() {
        tracing::error!("Date parameter is required");
        return Err(StatusCode::BAD_REQUEST.into());
    }

    if params.game_id.is_empty() {
        tracing::error!("Game ID parameter is required");
        return Err(StatusCode::BAD_REQUEST.into());
    }

    let game_id = params.game_id.parse::<i64>().map_err(|_| {
        tracing::error!("Invalid game_id: {}", params.game_id);
        StatusCode::BAD_REQUEST
    })?;

    let api_path = games_by_date_path(league.clone(), Some(params.date.clone()));
    let api_url = api_path.to_string();

    let cache_key = CacheKey::from(format!(
        "game_by_date_{}_{}_{}",
        league, params.date, params.game_id
    ));

    // Check cache first
    {
        let mut cache = use_case_state.cache.lock().await;
        if let Some(cached_data) = cache.get(&cache_key).await? {
            tracing::info!(
                "Returning cached game by date data for game_id: {}",
                params.game_id
            );
            let response: GameByDateResponse = serde_json::from_str(&cached_data)
                .map_err(|e| {
                    tracing::error!("Failed to deserialize cached data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            return Ok(Json(response));
        }
    }

    // Fetch from API
    let raw_data = fetch_games_by_date_from_api(&api_url, &league).await?;

    // Parse the JSON response
    let games: Vec<serde_json::Value> = serde_json::from_str(&raw_data).map_err(|e| {
        tracing::error!("Failed to parse games by date JSON: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // Find the specific game by game_id
    let target_game = games.into_iter().find(|game| {
        game.get("GameID")
            .and_then(|v| v.as_i64())
            .map(|id| id == game_id)
            .unwrap_or(false)
    });

    let game_data = if let Some(game) = target_game {
        tracing::info!("Found game with ID {}", game_id);
        match serde_json::from_value::<GameByDate>(game) {
            Ok(parsed_game) => {
                tracing::info!("Successfully parsed game data");
                Some(parsed_game)
            }
            Err(e) => {
                tracing::error!("Failed to parse game data: {}", e);
                None
            }
        }
    } else {
        tracing::warn!("No game found with ID {}", game_id);
        None
    };

    let response = GameByDateResponse {
        data: game_data,
        date: params.date,
        game_id,
        league: league.to_string(),
    };

    {
        let mut cache = use_case_state.cache.lock().await;
        let serialized = serde_json::to_string(&response).map_err(|e| {
            tracing::error!("Failed to serialize response: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
        cache.set(&cache_key, &serialized).await?;
    }

    tracing::info!(
        "Successfully fetched and cached game by date for game_id: {}",
        params.game_id
    );
    Ok(Json(response))
}

async fn fetch_games_by_date_from_api(api_url: &str, league: &League) -> Result<String> {
    let api_key = std::env::var("SPORTDATAIO_API_KEY").map_err(|_| {
        tracing::error!("SPORTDATAIO_API_KEY environment variable not set");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let client = reqwest::Client::new();

    tracing::info!(
        "Making real API request to: {} for league: {}",
        api_url,
        league
    );

    let response = client
        .get(api_url)
        .query(&[("key", &api_key)])
        .send()
        .await
        .map_err(|e| {
            tracing::error!("Failed to make HTTP request: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if !response.status().is_success() {
        let status = response.status();
        tracing::error!("API request failed with status: {}", status);
        return Err(StatusCode::INTERNAL_SERVER_ERROR.into());
    }

    let body = response.text().await.map_err(|e| {
        tracing::error!("Failed to read response body: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    tracing::info!("Successfully fetched games by date data from API");
    Ok(body)
}

pub async fn handle_box_score_request(
    Query(params): Query<BoxScoreQuery>,
    State(use_case_state): State<UseCaseState>,
) -> Result<Json<BoxScoreResponse>> {
    let league = params.league.parse::<League>().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    let cache_key = CacheKey::box_score(&league, &params.game_id);

    // Check cache first
    {
        let mut cache = use_case_state.cache.lock().await;
        if let Some(cached_data) = cache.get(&cache_key).await? {
            tracing::info!("Returning cached box score for game_id: {}", params.game_id);
            let response: BoxScoreResponse =
                serde_json::from_str(&cached_data).map_err(|e| {
                    tracing::error!("Failed to deserialize cached data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            return Ok(Json(response));
        }
    }

    // Fetch from API
    let api_url = box_score_path(league.clone(), params.game_id.clone()).to_string();
    let raw_data = fetch_box_score_from_api(&api_url, &league).await?;

    // Parse the response
    let box_score: BoxScore = serde_json::from_str(&raw_data).map_err(|e| {
        tracing::error!("Failed to parse box score JSON: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let response = BoxScoreResponse {
        data: box_score,
        league: league.to_string(),
    };

    // Cache the response
    {
        let mut cache = use_case_state.cache.lock().await;
        let serialized = serde_json::to_string(&response).map_err(|e| {
            tracing::error!("Failed to serialize response: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
        cache.set(&cache_key, &serialized).await?;
    }

    tracing::info!(
        "Successfully fetched and cached box score for game_id: {}",
        params.game_id
    );
    Ok(Json(response))
}

async fn fetch_box_score_from_api(api_url: &str, league: &League) -> Result<String> {
    let api_key = std::env::var("SPORTDATAIO_API_KEY").map_err(|_| {
        tracing::error!("SPORTDATAIO_API_KEY environment variable not set");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let client = reqwest::Client::new();

    tracing::info!(
        "Making real API request to: {} for league: {}",
        api_url,
        league
    );

    let response = client
        .get(api_url)
        .query(&[("key", &api_key)])
        .send()
        .await
        .map_err(|e| {
            tracing::error!("Failed to make HTTP request: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if !response.status().is_success() {
        tracing::error!("API request failed with status: {}", response.status());
        return Err(StatusCode::INTERNAL_SERVER_ERROR.into());
    }

    let body = response.text().await.map_err(|e| {
        tracing::error!("Failed to read response body: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(body)
}

pub async fn handle_stadiums_request(
    Query(params): Query<LeagueQuery>,
    State(use_case_state): State<UseCaseState>,
) -> Result<Json<StadiumsResponse>> {
    let league = params.league.parse::<League>().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    let api_path = stadiums_path(league.clone());
    let api_url = api_path.to_string();

    let cache_key = CacheKey::from(format!("stadiums_{}", league));

    // Check cache first
    {
        let mut cache = use_case_state.cache.lock().await;
        if let Some(cached_data) = cache.get(&cache_key).await? {
            tracing::info!("Returning cached stadiums data for league: {}", league);
            let response: StadiumsResponse =
                serde_json::from_str(&cached_data).map_err(|e| {
                    tracing::error!("Failed to deserialize cached data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            return Ok(Json(response));
        }
    }

    // Fetch from API
    let raw_data = fetch_stadiums_from_api(&api_url, &league).await?;

    // Parse the JSON response
    let stadiums: Vec<Stadium> = serde_json::from_str(&raw_data).map_err(|e| {
        tracing::error!("Failed to parse stadiums JSON: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let response = StadiumsResponse {
        data: stadiums,
        league: league.to_string(),
    };

    // Cache the response
    {
        let mut cache = use_case_state.cache.lock().await;
        let serialized = serde_json::to_string(&response).map_err(|e| {
            tracing::error!("Failed to serialize response: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
        cache.set(&cache_key, &serialized).await?;
    }

    tracing::info!(
        "Successfully fetched and cached stadiums for league: {}",
        league
    );
    Ok(Json(response))
}

async fn fetch_stadiums_from_api(api_url: &str, league: &League) -> Result<String> {
    let api_key = std::env::var("SPORTDATAIO_API_KEY").map_err(|_| {
        tracing::error!("SPORTDATAIO_API_KEY environment variable not set");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let client = reqwest::Client::new();

    tracing::info!(
        "Making real API request to: {} for league: {}",
        api_url,
        league
    );

    let response = client
        .get(api_url)
        .query(&[("key", &api_key)])
        .send()
        .await
        .map_err(|e| {
            tracing::error!("Failed to make HTTP request: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if !response.status().is_success() {
        let status = response.status();
        tracing::error!("API request failed with status: {}", status);
        return Err(StatusCode::INTERNAL_SERVER_ERROR.into());
    }

    let body = response.text().await.map_err(|e| {
        tracing::error!("Failed to read response body: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    tracing::info!("Successfully fetched stadiums data from API");
    Ok(body)
}

// Twitter search functionality
#[derive(Debug, Deserialize)]
pub struct TwitterSearchQuery {
    pub query: String,
}

pub async fn handle_twitter_search_request(
    State(state): State<UseCaseState>,
    Query(params): Query<TwitterSearchQuery>,
) -> Result<Json<TwitterSearchResponse>> {
    tracing::info!("Twitter search request for query: {}", params.query);

    // Check cache first
    let cache_key = format!("twitter_search:{}", params.query);
    if let Ok(Some(cached_data)) = state.cache.lock().await.get(&cache_key).await {
        if let Ok(twitter_response) =
            serde_json::from_str::<TwitterSearchResponse>(&cached_data)
        {
            tracing::info!("Returning cached Twitter search result");
            return Ok(Json(twitter_response));
        }
    }

    let api_key = std::env::var("TWITTERAPIIO_API_KEY").map_err(|_| {
        tracing::error!("TWITTERAPIIO_API_KEY environment variable not set");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let url = format!(
        "https://api.twitterapi.io/twitter/tweet/advanced_search?query={}",
        urlencoding::encode(&params.query)
    );

    tracing::info!("Making request to Twitter API: {}", url);

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| {
            tracing::error!("Failed to create HTTP client: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    // Add a small delay to help prevent rate limiting
    tokio::time::sleep(std::time::Duration::from_millis(100)).await;

    let response = client
        .get(&url)
        .header("X-API-Key", &api_key)
        .header("Content-Type", "application/json")
        .header("User-Agent", "arbitration-app/1.0")
        .send()
        .await
        .map_err(|e| {
            tracing::error!("Failed to send request to Twitter API: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if !response.status().is_success() {
        let status = response.status();
        let error_body = response
            .text()
            .await
            .unwrap_or_else(|_| "Failed to read error body".to_string());
        tracing::error!(
            "Twitter API returned error status: {} - Body: {}",
            status,
            error_body
        );

        // Handle specific error cases
        match status {
            StatusCode::TOO_MANY_REQUESTS => {
                tracing::warn!("Twitter API rate limit exceeded");
                return Err(StatusCode::TOO_MANY_REQUESTS.into());
            }
            StatusCode::UNAUTHORIZED => {
                tracing::error!("Twitter API authentication failed - check API key");
                return Err(StatusCode::UNAUTHORIZED.into());
            }
            StatusCode::BAD_REQUEST => {
                tracing::error!(
                    "Twitter API bad request - check query format: {}",
                    error_body
                );
                return Err(StatusCode::BAD_REQUEST.into());
            }
            _ => {
                tracing::error!("Twitter API unknown error: {} - {}", status, error_body);
                return Err(StatusCode::INTERNAL_SERVER_ERROR.into());
            }
        }
    }

    let body = response.text().await.map_err(|e| {
        tracing::error!("Failed to read response body: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // Log the raw response for debugging
    tracing::info!("Twitter API raw response: {}", body);

    let twitter_response: TwitterSearchResponse =
        serde_json::from_str(&body).map_err(|e| {
            tracing::error!("Failed to parse Twitter API response: {}", e);
            tracing::error!("Response body: {}", body);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    tracing::info!(
        "Successfully fetched {} tweets from Twitter API",
        twitter_response.tweets.len()
    );

    // Cache the result for 5 minutes
    if let Ok(json_data) = serde_json::to_string(&twitter_response) {
        let _ = state
            .cache
            .lock()
            .await
            .set_with_ttl(&cache_key, &json_data, 300)
            .await;
    }

    Ok(Json(twitter_response))
}

pub async fn handle_odds_by_date_request(
    Query(params): Query<OddsByDateQuery>,
    State(use_case_state): State<UseCaseState>,
) -> Result<Json<OddsByDateResponse>> {
    let league = params.league.parse::<League>().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    if params.date.is_empty() {
        tracing::error!("Date parameter is required");
        return Err(StatusCode::BAD_REQUEST.into());
    }

    // Only support MLB for now
    if league != League::Mlb {
        tracing::error!("Odds not yet supported for league: {}", league);
        return Err(StatusCode::BAD_REQUEST.into());
    }

    let api_path = odds_by_date_path(league.clone(), Some(params.date.clone()));
    let api_url = api_path.to_string();

    let cache_key = CacheKey::odds_by_date(&league, &params.date);

    // Check cache first
    {
        let mut cache = use_case_state.cache.lock().await;
        if let Some(cached_data) = cache.get(&cache_key).await? {
            tracing::info!("Returning cached odds data for date: {}", params.date);
            let response: OddsByDateResponse = serde_json::from_str(&cached_data)
                .map_err(|e| {
                    tracing::error!("Failed to deserialize cached data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            return Ok(Json(response));
        }
    }

    // Fetch from API
    let raw_data = fetch_odds_by_date_from_api(&api_url, &league).await?;

    // Parse the JSON response
    let game_odds: Vec<GameOdds> = serde_json::from_str(&raw_data).map_err(|e| {
        tracing::error!("Failed to parse odds JSON: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let response = OddsByDateResponse {
        league: league.to_string(),
        date: params.date.clone(),
        data: game_odds,
        games_count: 0, // Will be set from data length
    };

    // Update games_count from actual data
    let response = OddsByDateResponse {
        games_count: response.data.len(),
        ..response
    };

    // Cache the response
    {
        let mut cache = use_case_state.cache.lock().await;
        let serialized = serde_json::to_string(&response).map_err(|e| {
            tracing::error!("Failed to serialize response: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
        cache.set(&cache_key, &serialized).await?;
    }

    tracing::info!(
        "Successfully fetched and cached odds for date: {}",
        params.date
    );
    Ok(Json(response))
}

async fn fetch_odds_by_date_from_api(api_url: &str, league: &League) -> Result<String> {
    let api_key = std::env::var("SPORTDATAIO_API_KEY").map_err(|_| {
        tracing::error!("SPORTDATAIO_API_KEY environment variable not set");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let client = reqwest::Client::new();

    tracing::info!(
        "Making real API request to: {} for league: {}",
        api_url,
        league
    );

    let response = client
        .get(api_url)
        .query(&[("key", &api_key)])
        .send()
        .await
        .map_err(|e| {
            tracing::error!("Failed to make HTTP request: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if !response.status().is_success() {
        let status = response.status();
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        tracing::error!("API request failed with status {}: {}", status, error_text);
        return Err(StatusCode::from_u16(status.as_u16())
            .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
            .into());
    }

    let body = response.text().await.map_err(|e| {
        tracing::error!("Failed to read response body: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    tracing::info!("Successfully fetched odds data from API");
    Ok(body)
}

// Function aliases for server routes
pub use handle_box_score_request as box_score;
pub use handle_game_by_date_request as game_by_date;
pub use handle_odds_by_date_request as odds_by_date;
pub use handle_stadiums_request as stadiums;
pub use handle_twitter_search_request as twitter_search;
