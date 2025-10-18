use std::{collections::HashMap, time::Instant};

use async_std::sync::{Arc, Mutex};
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::{Json, Redirect},
};
use serde::{Deserialize, Serialize};
use url::Url;
use urlencoding;

use crate::{
    cache::Cache,
    config::ArbConfig,
    error::{Error, Result},
    path::{
        box_score_path, games_by_date_path, headshots_path, odds_by_date_path,
        play_by_play_path, postseason_schedule_path, schedule_path, stadiums_path,
        team_profile_path, League,
    },
    schema::reddit::game_thread::{find_live_game_thread, RedditListing},
    schema::reddit::{
        RedditChild, RedditComment, RedditPost, RedditSearchQuery, RedditSearchResponse,
    },
    schema::{
        data_type::DataType,
        league_response::{LeagueData, LeagueResponse, MLBData, NBAData, NFLData},
        mlb::{
            game_by_date::{GameByDate, GameByDateResponse},
            odds::{GameOdds, OddsByDateResponse},
            schedule::MLBScheduleGame,
            stadiums::Stadium,
        },
        twitterapi::tweet::TwitterSearchResponse,
    },
    services::auth::{AppleOAuth, GoogleOAuth},
};

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

impl From<CacheKey> for String {
    fn from(val: CacheKey) -> Self {
        val.0
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

    pub fn team_profile(league: &League) -> Self {
        CacheKey::new(format!("team_profile:{}", league))
    }

    pub fn data_type(data_type: &DataType, league: &League) -> Self {
        CacheKey::new(format!("{}:{}", data_type.as_str(), league))
    }

    pub fn play_by_play(league: &League, game_id: &str) -> Self {
        CacheKey::new(format!("play_by_play:{}:{}", league, game_id))
    }

    pub fn play_by_play_delta(
        league: &League,
        game_id: &str,
        last_timestamp: &str,
    ) -> Self {
        CacheKey::new(format!(
            "play_by_play__delta:{}:{}:{}",
            league, game_id, last_timestamp
        ))
    }

    pub fn scores(league: &League, date: &str) -> Self {
        CacheKey::new(format!("scores:{}:{}", league, date))
    }

    pub fn box_score(league: &League, id: &str) -> Self {
        CacheKey::new(format!("box_score:{}:{}", league, id))
    }

    pub fn odds_by_date(league: &League, date: &str) -> Self {
        CacheKey::new(format!("odds_by_date:{}:{}", league, date))
    }

    pub fn user(email: &str) -> Self {
        CacheKey::new(format!("user:{}", email))
    }

    pub fn game_by_date(league: &League, date: &str, game_id: &str) -> Self {
        CacheKey::new(format!("game_by_date:{}:{}:{}", league, date, game_id))
    }

    pub fn stadiums(league: &League) -> Self {
        CacheKey::new(format!("stadiums:{}", league))
    }
}

#[derive(Debug, Deserialize)]
pub struct LeagueQuery {
    pub league: String,
    #[serde(default)]
    pub cache: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct TeamProfileQuery {
    pub league: String,
    #[serde(default)]
    pub cache: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct DataQuery {
    pub league: String,
    #[serde(default)]
    pub post: Option<bool>,
    #[serde(default)]
    pub cache: Option<bool>,
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
    #[serde(default)]
    pub cache: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct ScoresQuery {
    pub league: String,
    pub date: String, // YYYY-MM-DD format - always required
    #[serde(default)]
    pub cache: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct BoxScoreQuery {
    pub league: String,
    pub game_id: Option<String>,
    pub score_id: Option<String>,
    #[serde(default)]
    pub cache: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct OddsByDateQuery {
    pub league: String,
    pub date: String,
    #[serde(default)]
    pub cache: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct CurrentGamesQuery {
    pub league: String,
    pub start: String, // YYYY-MM-DD format
    pub end: String,   // YYYY-MM-DD format
    #[serde(default)]
    pub cache: Option<bool>,
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
    let use_cache = params.cache.unwrap_or(true);

    let data = {
        let mut cache = use_case_state.cache.lock().await;
        if use_cache {
            if let Some(cached_data) = cache.get(&cache_key).await.map_err(|e| {
                tracing::error!("Failed to get team profile data from cache: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })? {
                tracing::debug!(
                    "Returning cached team profile data for league: {}",
                    league
                );
                let json_data: serde_json::Value = serde_json::from_str(&cached_data)
                    .map_err(|e| {
                        tracing::error!(
                            "Failed to parse cached team profile data: {}",
                            e
                        );
                        StatusCode::INTERNAL_SERVER_ERROR
                    })?;
                return Ok(Json(TeamProfileResponse {
                    league: league.to_string(),
                    data: json_data,
                }));
            }
        } else {
            tracing::info!("Cache bypass requested - fetching fresh data from API");
        }

        tracing::info!("Fetching team profile data from API: {}", api_url);
        let fetched_data =
            fetch_team_data_from_api(&api_url, &league, &use_case_state.config)
                .await
                .map_err(|e| {
                    tracing::error!("Failed to fetch team profile data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

        cache
            .setx(
                &cache_key,
                &fetched_data,
                use_case_state.config.cache.ttl.team_profiles,
            )
            .await
            .map_err(|e| {
                tracing::error!("Failed to cache team profile data: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;
        fetched_data
    };

    let json_data: serde_json::Value = serde_json::from_str(&data).map_err(|e| {
        tracing::error!("Failed to parse JSON data: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(TeamProfileResponse {
        league: league.to_string(),
        data: json_data,
    }))
}

async fn fetch_team_data_from_api(
    api_url: &str,
    league: &League,
    config: &ArbConfig,
) -> Result<String> {
    let _parsed_url = Url::parse(api_url)?;

    match league {
        League::Mlb => {
            let api_key = &config.api.sportsdata_api_key;

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
        League::Nba => {
            let api_key = &config.api.sportsdata_api_key;

            let client = reqwest::Client::new();

            tracing::info!("Making real API request for NBA team profile: {}", api_url);

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

            tracing::info!("Successfully fetched team profile data for NBA");
            Ok(body)
        }
        League::Nfl => {
            let api_key = &config.api.sportsdata_api_key;

            let client = reqwest::Client::new();

            tracing::info!("Making real API request for NFL team profile: {}", api_url);

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

            tracing::info!("Successfully fetched team profile data for NFL");
            Ok(body)
        }
        _ => Err(Error::NotImplemented(format!(
            "Teams data for league: {:?}",
            league
        ))),
    }
}

pub async fn schedule(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<DataQuery>,
) -> Result<Json<LeagueResponse>> {
    handle_schedule_request(use_case_state, params).await
}

pub async fn current_games(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<CurrentGamesQuery>,
) -> Result<Json<LeagueResponse>> {
    handle_current_games_request(use_case_state, params).await
}

pub async fn headshots(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<DataQuery>,
) -> Result<Json<LeagueResponse>> {
    handle_headshots_request(use_case_state, params).await
}

pub async fn play_by_play_handler(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<PlayByPlayQuery>,
) -> Result<Json<LeagueResponse>> {
    handle_play_by_play_request(use_case_state, params).await
}

pub async fn scores(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<ScoresQuery>,
) -> Result<Json<LeagueResponse>> {
    handle_scores_request(use_case_state, params).await
}

async fn handle_schedule_request(
    use_case_state: UseCaseState,
    params: DataQuery,
) -> Result<Json<LeagueResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    if league != League::Mlb && league != League::Nfl && league != League::Nba {
        tracing::error!("Schedule not yet supported for league: {}", league);
        return Err(StatusCode::BAD_REQUEST.into());
    }

    let date_filter = params.filters.get("date").cloned();

    let (api_url, cache_key) = if let Some(ref date) = date_filter {
        let api_url = games_by_date_path(league.clone(), Some(date.clone())).to_string();
        let cache_key = CacheKey::scores(&league, date);
        (api_url, cache_key)
    } else {
        let api_url = schedule_path(league.clone(), use_case_state.config.clone()).to_string();
        let cache_key = CacheKey::data_type(&DataType::Schedule, &league);
        (api_url, cache_key)
    };

    let use_cache = params.cache.unwrap_or(true);

    // Attempt to use cache if requested
    let cached_data = if use_cache {
        let mut cache = use_case_state.cache.lock().await;
        match cache.get(&cache_key).await {
            Ok(Some(data)) => {
                tracing::debug!("Returning cached schedule data for league: {}", league);
                Some(data)
            }
            Ok(None) => {
                tracing::info!("No cached schedule data found for league {}, will fetch from origin", league);
                None
            }
            Err(e) => {
                tracing::error!("Failed to get schedule data from cache: {}", e);
                None
            }
        }
    } else {
        tracing::info!("Cache bypass requested — fetching fresh data from API");
        None
    };

    // Fetch from origin if no cache or cache disabled
    let data = if let Some(data) = cached_data {
        data
    } else {
        tracing::info!("Fetching schedule data from API: {}", api_url);

        let fetched_data = if let Some(ref date) = date_filter {
            tracing::info!("Using GamesByDate endpoint for date: {}", date);
            fetch_games_by_date_from_api(&api_url, &league, date, &use_case_state.config)
                .await
        } else {
            tracing::info!("Using full schedule endpoint");
            fetch_schedule_from_api(&api_url, &league, &use_case_state.config).await
        }
            .map_err(|e| {
                tracing::error!("Failed to fetch schedule data: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        // Cache fresh data
        if use_cache {
            let mut cache = use_case_state.cache.lock().await;
            if let Err(e) = cache
                .setx(
                    &cache_key,
                    &fetched_data,
                    use_case_state.config.cache.ttl.schedule,
                )
                .await
            {
                tracing::error!("Failed to cache schedule data: {}", e);
            }
        }

        fetched_data
    };

    let schedule_games: Vec<serde_json::Value> =
        serde_json::from_str(&data).map_err(|e| {
            tracing::error!("Failed to parse schedule JSON data: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let total_count = schedule_games.len();

    let (filtered_games, filtered_count) = if params.filters.is_empty() {
        (schedule_games, total_count)
    } else {
        let filtered_games = schedule_games
            .into_iter()
            .filter(|game| {
                params.filters.iter().all(|(key, value)| match key.as_str() {
                    "status" => game
                        .get("Status")
                        .and_then(|v| v.as_str())
                        .map(|s| s.to_lowercase().contains(&value.to_lowercase()))
                        .unwrap_or(false),
                    "away_team" => game
                        .get("AwayTeam")
                        .and_then(|v| v.as_str())
                        .map(|s| s.to_lowercase().contains(&value.to_lowercase()))
                        .unwrap_or(false),
                    "home_team" => game
                        .get("HomeTeam")
                        .and_then(|v| v.as_str())
                        .map(|s| s.to_lowercase().contains(&value.to_lowercase()))
                        .unwrap_or(false),
                    "date" => game
                        .get("Day")
                        .and_then(|v| v.as_str())
                        .map(|day| day.starts_with(&format!("{}T", value)))
                        .unwrap_or(false),
                    _ => true,
                })
            })
            .collect::<Vec<_>>();
        let filtered_count = filtered_games.len();
        (filtered_games, filtered_count)
    };

    let league_response = match league {
        League::Mlb => {
            let mlb_games: Vec<MLBScheduleGame> =
                serde_json::from_value(serde_json::Value::Array(filtered_games)).map_err(|e| {
                    tracing::error!("Failed to parse MLB schedule data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::Schedule,
                data: crate::schema::league_response::LeagueData::Mlb(Box::new(
                    crate::schema::league_response::MLBData::Schedule(mlb_games),
                )),
                filtered_count,
                total_count,
            }
        }
        League::Nfl => {
            let nfl_games: Vec<crate::schema::nfl::schedule::NFLScheduleGame> =
                serde_json::from_value(serde_json::Value::Array(filtered_games)).map_err(|e| {
                    tracing::error!("Failed to parse NFL schedule data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::Schedule,
                data: crate::schema::league_response::LeagueData::Nfl(Box::new(
                    crate::schema::league_response::NFLData::Schedule(nfl_games),
                )),
                filtered_count,
                total_count,
            }
        }
        League::Nba => {
            let nba_games: Vec<crate::schema::nba::schedule::NBAScheduleGame> =
                serde_json::from_value(serde_json::Value::Array(filtered_games)).map_err(|e| {
                    tracing::error!("Failed to parse NBA schedule data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::Schedule,
                data: crate::schema::league_response::LeagueData::Nba(Box::new(
                    crate::schema::league_response::NBAData::Schedule(nba_games),
                )),
                filtered_count,
                total_count,
            }
        }
        _ => {
            tracing::error!("Unsupported league for schedule: {}", league);
            return Err(StatusCode::BAD_REQUEST.into());
        }
    };

    Ok(Json(league_response))
}


async fn handle_current_games_request(
    use_case_state: UseCaseState,
    params: CurrentGamesQuery,
) -> Result<Json<LeagueResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    if league != League::Mlb && league != League::Nfl && league != League::Nba {
        tracing::error!("Current games not yet supported for league: {}", league);
        return Err(StatusCode::BAD_REQUEST.into());
    }

    let start_date = chrono::NaiveDate::parse_from_str(&params.start, "%Y-%m-%d")
        .map_err(|_| {
            tracing::error!("Invalid start date format: {}", params.start);
            StatusCode::BAD_REQUEST
        })?;

    let end_date = chrono::NaiveDate::parse_from_str(&params.end, "%Y-%m-%d").map_err(|_| {
        tracing::error!("Invalid end date format: {}", params.end);
        StatusCode::BAD_REQUEST
    })?;

    if start_date > end_date {
        tracing::error!(
            "Start date {} is after end date {}",
            params.start,
            params.end
        );
        return Err(StatusCode::BAD_REQUEST.into());
    }

    let use_cache = params.cache.unwrap_or(true);
    let mut all_games = Vec::new();
    let mut current_date = start_date;

    while current_date <= end_date {
        let date_str = current_date.format("%Y-%m-%d").to_string();
        let api_url = games_by_date_path(league.clone(), Some(date_str.clone())).to_string();
        let cache_key = CacheKey::scores(&league, &date_str);

        // Try cache first
        let cached_data = if use_cache {
            let mut cache = use_case_state.cache.lock().await;
            match cache.get(&cache_key).await {
                Ok(Some(data)) => {
                    tracing::debug!("Cache hit for {}: {}", league, date_str);
                    Some(data)
                }
                Ok(None) => {
                    tracing::info!("Cache miss for {} on {}", league, date_str);
                    None
                }
                Err(e) => {
                    tracing::error!("Cache error for {} on {}: {}", league, date_str, e);
                    None
                }
            }
        } else {
            tracing::info!("Cache bypass requested — fetching fresh data for {}", date_str);
            None
        };

        // If no cache, fetch and store
        let data = if let Some(data) = cached_data {
            data
        } else {
            tracing::info!("Fetching games from API: {} for date: {}", api_url, date_str);
            let fetched_data = fetch_games_by_date_from_api(
                &api_url,
                &league,
                &date_str,
                &use_case_state.config,
            )
                .await
                .map_err(|e| {
                    tracing::error!(
                    "Failed to fetch games data for date {}: {}",
                    date_str,
                    e
                );
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

            if use_cache {
                let mut cache = use_case_state.cache.lock().await;
                if let Err(e) = cache
                    .setx(
                        &cache_key,
                        &fetched_data,
                        use_case_state.config.cache.ttl.scores,
                    )
                    .await
                {
                    tracing::error!(
                        "Failed to cache games data for date {}: {}",
                        date_str,
                        e
                    );
                }
            }

            fetched_data
        };

        let json_data: serde_json::Value = serde_json::from_str(&data).map_err(|e| {
            tracing::error!("Failed to parse JSON data for date {}: {}", date_str, e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

        if let Some(games_array) = json_data.as_array() {
            all_games.extend(games_array.iter().cloned());
        }

        current_date = current_date.succ_opt().unwrap_or(current_date);
    }

    let total_count = all_games.len();

    let league_response = match league {
        League::Mlb => {
            let mlb_games: Vec<MLBScheduleGame> =
                serde_json::from_value(serde_json::Value::Array(all_games))
                    .map_err(|e| {
                        tracing::error!("Failed to parse MLB current games data: {}", e);
                        StatusCode::INTERNAL_SERVER_ERROR
                    })?;
            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::CurrentGames,
                data: crate::schema::league_response::LeagueData::Mlb(Box::new(
                    crate::schema::league_response::MLBData::CurrentGames(mlb_games),
                )),
                filtered_count: total_count,
                total_count,
            }
        }
        League::Nfl => {
            let nfl_games: Vec<crate::schema::nfl::schedule::NFLScheduleGame> =
                serde_json::from_value(serde_json::Value::Array(all_games))
                    .map_err(|e| {
                        tracing::error!("Failed to parse NFL current games data: {}", e);
                        StatusCode::INTERNAL_SERVER_ERROR
                    })?;
            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::CurrentGames,
                data: crate::schema::league_response::LeagueData::Nfl(Box::new(
                    crate::schema::league_response::NFLData::CurrentGames(nfl_games),
                )),
                filtered_count: total_count,
                total_count,
            }
        }
        League::Nba => {
            let nba_games: Vec<crate::schema::nba::schedule::NBAScheduleGame> =
                serde_json::from_value(serde_json::Value::Array(all_games))
                    .map_err(|e| {
                        tracing::error!("Failed to parse NBA current games data: {}", e);
                        StatusCode::INTERNAL_SERVER_ERROR
                    })?;
            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::CurrentGames,
                data: crate::schema::league_response::LeagueData::Nba(Box::new(
                    crate::schema::league_response::NBAData::CurrentGames(nba_games),
                )),
                filtered_count: total_count,
                total_count,
            }
        }
        _ => {
            tracing::error!("Unsupported league for current games: {}", league);
            return Err(StatusCode::BAD_REQUEST.into());
        }
    };

    Ok(Json(league_response))
}
async fn handle_headshots_request(
    use_case_state: UseCaseState,
    params: DataQuery,
) -> Result<Json<LeagueResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    if league != League::Nba && league != League::Nfl {
        tracing::error!("Headshots not yet supported for league: {}", league);
        return Err(StatusCode::BAD_REQUEST.into());
    }

    let api_url = headshots_path(league.clone()).to_string();
    let cache_key = CacheKey::data_type(&DataType::Headshots, &league);
    let use_cache = params.cache.unwrap_or(true);

    // Try cache first
    let cached_data = if use_cache {
        let mut cache = use_case_state.cache.lock().await;
        match cache.get(&cache_key).await {
            Ok(Some(data)) => {
                tracing::debug!("Cache hit for headshots data: {}", league);
                Some(data)
            }
            Ok(None) => {
                tracing::info!("Cache miss for headshots data: {}", league);
                None
            }
            Err(e) => {
                tracing::error!("Failed to get headshots data from cache: {}", e);
                None
            }
        }
    } else {
        tracing::info!("Cache bypass requested — fetching fresh headshots data");
        None
    };

    // Fetch if cache disabled or empty
    let data = if let Some(data) = cached_data {
        data
    } else {
        tracing::info!("Fetching headshots data from API: {}", api_url);
        let fetched_data = fetch_data_from_api(
            &api_url,
            &league,
            &DataType::Headshots,
            &use_case_state.config,
        )
            .await
            .map_err(|e| {
                tracing::error!("Failed to fetch headshots data: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        if use_cache {
            let mut cache = use_case_state.cache.lock().await;
            let ttl = use_case_state.config.cache.ttl.team_profiles; // same TTL used before
            if let Err(e) = cache.setx(&cache_key, &fetched_data, ttl).await {
                tracing::error!("Failed to cache headshots data: {}", e);
            }
        }

        fetched_data
    };

    // Parse the headshots data and return
    match league {
        League::Nba => {
            let headshots: Vec<crate::schema::nba::headshots::PlayerHeadshot> =
                serde_json::from_str(&data).map_err(|e| {
                    tracing::error!("Failed to parse NBA headshots JSON: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            let headshots_count = headshots.len();
            Ok(Json(LeagueResponse {
                league: league.to_string(),
                data_type: DataType::Headshots,
                data: LeagueData::Nba(Box::new(NBAData::Headshots(headshots))),
                filtered_count: headshots_count,
                total_count: headshots_count,
            }))
        }
        League::Nfl => {
            let headshots: Vec<crate::schema::nfl::headshots::NFLHeadshot> =
                serde_json::from_str(&data).map_err(|e| {
                    tracing::error!("Failed to parse NFL headshots JSON: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            let headshots_count = headshots.len();
            Ok(Json(LeagueResponse {
                league: league.to_string(),
                data_type: DataType::Headshots,
                data: LeagueData::Nfl(Box::new(NFLData::Headshots(headshots))),
                filtered_count: headshots_count,
                total_count: headshots_count,
            }))
        }
        _ => {
            tracing::error!("Unsupported league for headshots: {}", league);
            Err(StatusCode::BAD_REQUEST.into())
        }
    }
}


async fn handle_play_by_play_request(
    use_case_state: UseCaseState,
    params: PlayByPlayQuery,
) -> Result<Json<LeagueResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    if params.game_id.trim().is_empty() {
        tracing::error!("Missing or empty game_id parameter");
        return Err(StatusCode::BAD_REQUEST.into());
    }

    let api_url = play_by_play_path(league.clone(), Some(params.game_id.clone())).to_string();
    tracing::info!(
        "Constructed play-by-play API URL: {} for game_id: {}",
        api_url,
        params.game_id
    );

    let cache_key = CacheKey::play_by_play(&league, &params.game_id);
    let use_cache = params.cache.unwrap_or(true);

    // Try cache first
    let cached_data = if use_cache {
        let mut cache = use_case_state.cache.lock().await;
        match cache.get(&cache_key).await {
            Ok(Some(data)) => {
                tracing::debug!(
                    "Cache hit for play-by-play data (game_id: {})",
                    params.game_id
                );
                Some(data)
            }
            Ok(None) => {
                tracing::info!(
                    "Cache miss for play-by-play data (game_id: {}), fetching from origin",
                    params.game_id
                );
                None
            }
            Err(e) => {
                tracing::error!(
                    "Failed to get play-by-play data from cache for game_id {}: {}",
                    params.game_id,
                    e
                );
                None
            }
        }
    } else {
        tracing::info!(
            "Cache bypass requested for play-by-play (game_id: {}), fetching from origin",
            params.game_id
        );
        None
    };

    // Fetch if cache disabled or empty
    let data = if let Some(data) = cached_data {
        data
    } else {
        tracing::info!(
            "Fetching play-by-play data from API: {} for game_id: {}",
            api_url,
            params.game_id
        );
        let fetched_data = fetch_play_by_play_from_api(
            &api_url,
            &league,
            &params.game_id,
            params.last_timestamp.is_some(),
            params.delta_minutes,
            &use_case_state.config,
        )
            .await
            .map_err(|e| {
                tracing::error!(
                "Failed to fetch play-by-play data for game_id {}: {}",
                params.game_id,
                e
            );
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        // Cache fresh data
        if use_cache {
            let mut cache = use_case_state.cache.lock().await;
            if let Err(e) = cache
                .setx(
                    &cache_key,
                    &fetched_data,
                    use_case_state.config.cache.ttl.play_by_play,
                )
                .await
            {
                tracing::error!(
                    "Failed to cache play-by-play data for game_id {}: {}",
                    params.game_id,
                    e
                );
            }
        }

        fetched_data
    };

    let json_data: serde_json::Value = serde_json::from_str(&data).map_err(|e| {
        tracing::error!("Failed to parse play-by-play JSON for game_id {}: {}", params.game_id, e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let (events, new_events_count, total_events_count, _last_timestamp) =
        extract_play_by_play_events(json_data, &params.last_timestamp, params.t)?;

    let league_response = match league {
        League::Mlb => LeagueResponse {
            league: league.to_string(),
            data_type: DataType::PlayByPlay,
            data: crate::schema::league_response::LeagueData::Mlb(Box::new(
                crate::schema::league_response::MLBData::PlayByPlay(events),
            )),
            filtered_count: new_events_count,
            total_count: total_events_count,
        },
        League::Nfl => {
            let nfl_play_by_play: crate::schema::nfl::play_by_play::NFLPlayByPlayResponseUnknown =
                serde_json::from_value(events).map_err(|e| {
                    tracing::error!("Failed to parse NFL play-by-play data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::PlayByPlay,
                data: crate::schema::league_response::LeagueData::Nfl(Box::new(
                    crate::schema::league_response::NFLData::PlayByPlay(Box::new(
                        nfl_play_by_play,
                    )),
                )),
                filtered_count: new_events_count,
                total_count: total_events_count,
            }
        }
        League::Nba => {
            let nba_play_by_play: crate::schema::nba::play_by_play::NBAPlayByPlayResponseUnknown =
                serde_json::from_value(events).map_err(|e| {
                    tracing::error!("Failed to parse NBA play-by-play data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::PlayByPlay,
                data: crate::schema::league_response::LeagueData::Nba(Box::new(
                    crate::schema::league_response::NBAData::PlayByPlay(nba_play_by_play),
                )),
                filtered_count: new_events_count,
                total_count: total_events_count,
            }
        }
        _ => {
            tracing::error!("Unsupported league for play-by-play: {}", league);
            return Err(StatusCode::BAD_REQUEST.into());
        }
    };

    Ok(Json(league_response))
}


async fn handle_scores_request(
    use_case_state: UseCaseState,
    params: ScoresQuery,
) -> Result<Json<LeagueResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    let date_str = params.date;
    let _response_date = date_str.clone();

    let is_postseason = use_case_state
        .config
        .is_postseason_date(&league_str, &date_str);

    let api_url = if is_postseason {
        tracing::info!(
            "Date {} is postseason for league {}, using postseason endpoint",
            date_str,
            league_str
        );
        postseason_schedule_path(league.clone(), use_case_state.config.clone()).to_string()
    } else {
        tracing::info!(
            "Date {} is regular season for league {}, using regular season endpoint",
            date_str,
            league_str
        );
        games_by_date_path(league.clone(), Some(date_str.clone())).to_string()
    };

    let cache_key = CacheKey::scores(&league, &date_str);
    let use_cache = params.cache.unwrap_or(true);

    // Attempt to use cache first if requested
    let cached_data = if use_cache {
        let mut cache = use_case_state.cache.lock().await;
        match cache.get(&cache_key).await {
            Ok(Some(data)) => {
                tracing::debug!("Returning cached scores data for date: {}", date_str);
                Some(data)
            }
            Ok(None) => {
                tracing::info!(
                    "No cached scores found for date {}, will fetch from origin",
                    date_str
                );
                None
            }
            Err(e) => {
                tracing::error!(
                    "Failed to get scores data from cache for date {}: {}",
                    date_str,
                    e
                );
                None
            }
        }
    } else {
        tracing::info!("Cache bypass requested — fetching fresh data from API");
        None
    };

    // Fetch if cache disabled or empty
    let data = if let Some(data) = cached_data {
        data
    } else {
        tracing::info!(
            "Fetching scores data from API: {} for date: {}",
            api_url,
            date_str
        );

        let fetched_data = if is_postseason {
            fetch_schedule_from_api(&api_url, &league, &use_case_state.config)
                .await
                .map_err(|e| {
                    tracing::error!(
                        "Failed to fetch postseason schedule data for date {}: {}",
                        date_str,
                        e
                    );
                    StatusCode::INTERNAL_SERVER_ERROR
                })?
        } else {
            fetch_games_by_date_from_api(
                &api_url,
                &league,
                &date_str,
                &use_case_state.config,
            )
                .await
                .map_err(|e| {
                    tracing::error!(
                    "Failed to fetch scores data for date {}: {}",
                    date_str,
                    e
                );
                    StatusCode::INTERNAL_SERVER_ERROR
                })?
        };

        // Cache fresh data
        if use_cache {
            let mut cache = use_case_state.cache.lock().await;
            if let Err(e) = cache
                .setx(
                    &cache_key,
                    &fetched_data,
                    use_case_state.config.cache.ttl.scores,
                )
                .await
            {
                tracing::error!(
                    "Failed to cache scores data for date {}: {}",
                    date_str,
                    e
                );
            }
        }

        fetched_data
    };

    // Parse data and build response
    let json_data: serde_json::Value = serde_json::from_str(&data).map_err(|e| {
        tracing::error!("Failed to parse JSON data for date {}: {}", date_str, e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let all_games = json_data.as_array().cloned().unwrap_or_default();
    let (games_count, _live_games_count, _final_games_count) =
        process_scores_data(&serde_json::Value::Array(all_games.clone()))?;

    let league_response = match league {
        League::Mlb => LeagueResponse {
            league: league.to_string(),
            data_type: DataType::Scores,
            data: crate::schema::league_response::LeagueData::Mlb(Box::new(
                crate::schema::league_response::MLBData::Scores(
                    serde_json::Value::Array(all_games),
                ),
            )),
            filtered_count: games_count,
            total_count: games_count,
        },
        League::Nfl => {
            let nfl_games: Vec<crate::schema::nfl::scores::NFLScoresGame> =
                serde_json::from_value(serde_json::Value::Array(all_games)).map_err(|e| {
                    tracing::error!("Failed to parse NFL scores data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::Scores,
                data: crate::schema::league_response::LeagueData::Nfl(Box::new(
                    crate::schema::league_response::NFLData::Scores(nfl_games),
                )),
                filtered_count: games_count,
                total_count: games_count,
            }
        }
        League::Nba => {
            let nba_games: Vec<crate::schema::nba::schedule::NBAScheduleGame> =
                serde_json::from_value(serde_json::Value::Array(all_games)).map_err(|e| {
                    tracing::error!("Failed to parse NBA scores data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::Scores,
                data: crate::schema::league_response::LeagueData::Nba(Box::new(
                    crate::schema::league_response::NBAData::Scores(nba_games),
                )),
                filtered_count: games_count,
                total_count: games_count,
            }
        }
        _ => {
            tracing::error!("Unsupported league for scores: {}", league);
            return Err(StatusCode::BAD_REQUEST.into());
        }
    };

    Ok(Json(league_response))
}


fn extract_play_by_play_events(
    data: serde_json::Value,
    last_timestamp: &Option<String>,
    filter_timestamp: Option<i64>,
) -> Result<(serde_json::Value, usize, usize, Option<String>)> {
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
        new_events = plays.clone();
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

    if let Some(filter_ts) = filter_timestamp {
        new_events.retain(|play| {
            if let Some(play_timestamp) = play
                .get("Updated")
                .or_else(|| play.get("updated"))
                .or_else(|| play.get("timestamp"))
                .and_then(|v| v.as_str())
            {
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
    config: &ArbConfig,
) -> Result<String> {
    let _parsed_url = Url::parse(api_url)?;

    tracing::info!("Fetching schedule data from API: {}", api_url);

    match league {
        League::Mlb => {
            let api_key = &config.api.sportsdata_api_key;

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

            tracing::info!(
                "Successfully fetched schedule data. Response length: {} characters",
                body.len()
            );

            let preview = if body.len() > 500 {
                format!("{}...", &body[..500])
            } else {
                body.clone()
            };
            tracing::info!("Response preview: {}", preview);

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
        League::Nfl => {
            let api_key = &config.api.sportsdata_api_key;

            let client = reqwest::Client::new();

            tracing::info!("Making real API request for NFL schedule: {}", api_url);

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

            tracing::info!(
                "Successfully fetched NFL schedule data. Response length: {} characters",
                body.len()
            );

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
        League::Nba => {
            let api_key = &config.api.sportsdata_api_key;

            let client = reqwest::Client::new();

            tracing::info!("Making real API request for NBA schedule: {}", api_url);

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

            tracing::info!(
                "Successfully fetched NBA schedule data. Response length: {} characters",
                body.len()
            );

            let preview = if body.len() > 500 {
                format!("{}...", &body[..500])
            } else {
                body.clone()
            };
            tracing::info!("Response preview: {}", preview);

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
    data_type: &DataType,
    config: &ArbConfig,
) -> Result<String> {
    let _parsed_url = Url::parse(api_url)?;

    tracing::info!("Fetching {} data from API: {}", data_type, api_url);

    match league {
        League::Mlb => Err(Error::NotImplemented(format!(
            "API data fetching for {} {} is not yet implemented",
            league, data_type
        ))),
        League::Nfl => {
            if *data_type == DataType::Headshots {
                let api_key = &config.api.sportsdata_api_key;

                let client = reqwest::Client::new();

                tracing::info!("Making real API request for NFL headshots: {}", api_url);

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
                    tracing::error!(
                        "API request failed with status: {}",
                        response.status()
                    );
                    return Err(StatusCode::INTERNAL_SERVER_ERROR.into());
                }

                let body = response.text().await.map_err(|e| {
                    tracing::error!("Failed to read response body: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

                tracing::info!("Successfully fetched NFL headshots data. Response length: {} characters", body.len());
                Ok(body)
            } else {
                Err(Error::NotImplemented(format!(
                    "API data fetching for {} {} is not yet implemented",
                    league, data_type
                )))
            }
        }
        _ => Err(Error::NotImplemented(format!(
            "API data fetching for {} {} is not yet implemented",
            league, data_type
        ))),
    }
}

async fn fetch_play_by_play_from_api(
    api_url: &str,
    league: &League,
    game_id: &str,
    is_delta: bool,
    _delta_minutes: Option<u32>,
    config: &ArbConfig,
) -> Result<String> {
    let _parsed_url = Url::parse(api_url)?;

    tracing::info!(
        "Fetching play-by-play data from API: {} (delta: {}, game_id: {})",
        api_url,
        is_delta,
        game_id
    );

    let api_key = &config.api.sportsdata_api_key;

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

    let preview = if body.len() > 200 {
        format!("{}...", &body[..200])
    } else {
        body.clone()
    };

    tracing::info!(
        "Successfully fetched play-by-play data from API. Response preview: {}",
        preview
    );

    if body.trim_start().starts_with("<!DOCTYPE")
        || body.trim_start().starts_with("<html")
    {
        tracing::error!("API returned HTML instead of JSON. Full response: {}", body);
        return Err(StatusCode::INTERNAL_SERVER_ERROR.into());
    }

    Ok(body)
}

async fn fetch_games_by_date_from_api(
    api_url: &str,
    league: &League,
    date: &str,
    config: &ArbConfig,
) -> Result<String> {
    let _parsed_url = Url::parse(api_url)?;

    tracing::info!(
        "Fetching games by date data from API: {} for date: {}",
        api_url,
        date
    );

    match league {
        League::Mlb => {
            let api_key = &config.api.sportsdata_api_key;

            let client = reqwest::Client::new();

            tracing::info!("Making real API request for games by date: {}", api_url);

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

            let response_text = response.text().await.map_err(|e| {
                tracing::error!("Failed to read response body: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

            tracing::info!("Successfully fetched games by date data for date: {}", date);
            Ok(response_text)
        }
        League::Nfl => {
            let api_key = &config.api.sportsdata_api_key;

            let client = reqwest::Client::new();

            tracing::info!("Making real API request for NFL games by date: {}", api_url);

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

            let response_text = response.text().await.map_err(|e| {
                tracing::error!("Failed to read response body: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

            tracing::info!(
                "Successfully fetched NFL games by date data for date: {}",
                date
            );
            Ok(response_text)
        }
        League::Nba => {
            let api_key = &config.api.sportsdata_api_key;

            let client = reqwest::Client::new();

            tracing::info!("Making real API request for NBA games by date: {}", api_url);

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

            let response_text = response.text().await.map_err(|e| {
                tracing::error!("Failed to read response body: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

            tracing::info!(
                "Successfully fetched NBA games by date data for date: {}",
                date
            );
            Ok(response_text)
        }
        _ => Err(Error::NotImplemented(format!(
            "API data fetching for {} games by date is not yet implemented",
            league
        ))),
    }
}

#[allow(dead_code)]
async fn fetch_scores_from_api(
    api_url: &str,
    league: &League,
    date: &str,
    config: &ArbConfig,
) -> Result<String> {
    let _parsed_url = Url::parse(api_url)?;

    tracing::info!(
        "Fetching scores data from API: {} for date: {}",
        api_url,
        date
    );

    match league {
        League::Mlb => {
            let api_key = &config.api.sportsdata_api_key;

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
        _ => Err(Error::NotImplemented(format!(
            "Scores data for league: {:?} is not yet implemented",
            league
        ))),
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

#[allow(dead_code)]
fn extract_game_status(data: &serde_json::Value) -> Result<(bool, Option<String>)> {
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
    #[serde(default)]
    pub cache: Option<bool>,
}

pub async fn handle_game_by_date_request(
    Query(params): Query<GameByDateQuery>,
    State(use_case_state): State<UseCaseState>,
) -> Result<Json<LeagueResponse>> {
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

    let cache_key = CacheKey::game_by_date(&league, &params.date, &params.game_id);
    let use_cache = params.cache.unwrap_or(true);

    if use_cache {
        let mut cache = use_case_state.cache.lock().await;
        if let Some(cached_data) = cache.get(&cache_key).await? {
            tracing::debug!(
                "Returning cached game by date data for game_id: {}",
                params.game_id
            );
            let response: LeagueResponse =
                serde_json::from_str(&cached_data).map_err(|e| {
                    tracing::error!("Failed to deserialize cached data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            return Ok(Json(response));
        }
    }

    let raw_data = fetch_games_by_date_from_api(
        &api_url,
        &league,
        &params.date,
        &use_case_state.config,
    )
    .await?;

    let games: Vec<serde_json::Value> = serde_json::from_str(&raw_data).map_err(|e| {
        tracing::error!("Failed to parse games by date JSON: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let target_game = games.into_iter().find(|game| match league {
        League::Mlb => game
            .get("GameID")
            .and_then(|v| v.as_i64())
            .map(|id| id == game_id)
            .unwrap_or(false),
        League::Nfl => game
            .get("ScoreID")
            .and_then(|v| v.as_i64())
            .map(|id| id == game_id)
            .unwrap_or(false),
        League::Nba => game
            .get("GameID")
            .and_then(|v| v.as_i64())
            .map(|id| id == game_id)
            .unwrap_or(false),
        _ => false,
    });

    let game_data = if let Some(game) = target_game {
        tracing::info!("Found game with ID {}", game_id);
        match league {
            League::Mlb => match serde_json::from_value::<GameByDate>(game) {
                Ok(parsed_game) => {
                    tracing::info!("Successfully parsed MLB game data");
                    Some(serde_json::to_value(parsed_game).ok())
                }
                Err(e) => {
                    tracing::error!("Failed to parse MLB game data: {}", e);
                    None
                }
            },
            League::Nfl => {
                match serde_json::from_value::<
                    crate::schema::nfl::game_by_date::NFLGameByDate,
                >(game)
                {
                    Ok(parsed_game) => {
                        tracing::info!("Successfully parsed NFL game data");
                        Some(serde_json::to_value(parsed_game).ok())
                    }
                    Err(e) => {
                        tracing::error!("Failed to parse NFL game data: {}", e);
                        None
                    }
                }
            }
            League::Nba => {
                match serde_json::from_value::<
                    crate::schema::nba::schedule::NBAScheduleGame,
                >(game)
                {
                    Ok(parsed_game) => {
                        tracing::info!("Successfully parsed NBA game data");
                        Some(serde_json::to_value(parsed_game).ok())
                    }
                    Err(e) => {
                        tracing::error!("Failed to parse NBA game data: {}", e);
                        None
                    }
                }
            }
            _ => {
                tracing::error!("Unsupported league for game by date: {}", league);
                None
            }
        }
    } else {
        tracing::warn!("No game found with ID {}", game_id);
        None
    };

    let response = match league {
        League::Mlb => {
            let mlb_data = if let Some(Some(ref data)) = game_data {
                match serde_json::from_value::<GameByDate>(data.clone()) {
                    Ok(game) => Some(game),
                    Err(e) => {
                        tracing::error!("Failed to parse MLB game data: {}", e);
                        None
                    }
                }
            } else {
                None
            };

            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::GameByDate,
                data: LeagueData::Mlb(Box::new(MLBData::GameByDate(
                    GameByDateResponse {
                        data: mlb_data,
                        date: params.date,
                        game_id,
                    },
                ))),
                filtered_count: if game_data.is_some() { 1 } else { 0 },
                total_count: 1,
            }
        }
        League::Nfl => {
            let nfl_data = if let Some(Some(ref data)) = game_data {
                match serde_json::from_value::<
                    crate::schema::nfl::game_by_date::NFLGameByDate,
                >(data.clone())
                {
                    Ok(game) => vec![game],
                    Err(e) => {
                        tracing::error!("Failed to parse NFL game data: {}", e);
                        vec![]
                    }
                }
            } else {
                vec![]
            };

            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::GameByDate,
                data: LeagueData::Nfl(Box::new(NFLData::GameByDate(nfl_data))),
                filtered_count: if game_data.is_some() { 1 } else { 0 },
                total_count: 1,
            }
        }
        League::Nba => {
            let nba_data = if let Some(Some(ref data)) = game_data {
                match serde_json::from_value::<
                    crate::schema::nba::schedule::NBAScheduleGame,
                >(data.clone())
                {
                    Ok(game) => vec![game],
                    Err(e) => {
                        tracing::error!("Failed to parse NBA game data: {}", e);
                        vec![]
                    }
                }
            } else {
                vec![]
            };

            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::GameByDate,
                data: LeagueData::Nba(Box::new(NBAData::Schedule(nba_data))),
                filtered_count: if game_data.is_some() { 1 } else { 0 },
                total_count: 1,
            }
        }
        _ => {
            tracing::error!("Unsupported league for game by date: {}", league);
            return Err(StatusCode::BAD_REQUEST.into());
        }
    };

    {
        let mut cache = use_case_state.cache.lock().await;
        let serialized = serde_json::to_string(&response).map_err(|e| {
            tracing::error!("Failed to serialize response: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
        cache
            .setx(
                &cache_key,
                &serialized,
                use_case_state.config.cache.ttl.scores,
            )
            .await?;
    }

    tracing::info!(
        "Successfully fetched and cached game by date for game_id: {}",
        params.game_id
    );
    Ok(Json(response))
}

pub async fn handle_box_score_request(
    Query(params): Query<BoxScoreQuery>,
    State(use_case_state): State<UseCaseState>,
) -> Result<Json<LeagueResponse>> {
    let league = params.league.parse::<League>().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    let (id_param, id_value) = match league {
        League::Mlb => {
            if let Some(game_id) = params.game_id {
                ("game_id", game_id)
            } else {
                tracing::error!("game_id parameter is required for MLB box score");
                return Err(StatusCode::BAD_REQUEST.into());
            }
        }
        League::Nfl => {
            if let Some(score_id) = params.score_id {
                ("score_id", score_id)
            } else {
                tracing::error!("score_id parameter is required for NFL box score");
                return Err(StatusCode::BAD_REQUEST.into());
            }
        }
        League::Nba => {
            if let Some(game_id) = params.game_id {
                ("game_id", game_id)
            } else {
                tracing::error!("game_id parameter is required for NBA box score");
                return Err(StatusCode::BAD_REQUEST.into());
            }
        }
        _ => {
            tracing::error!("Unsupported league for box score: {}", league);
            return Err(StatusCode::BAD_REQUEST.into());
        }
    };

    let cache_key = CacheKey::box_score(&league, &id_value);
    let use_cache = params.cache.unwrap_or(true);

    if use_cache {
        let mut cache = use_case_state.cache.lock().await;
        if let Some(cached_data) = cache.get(&cache_key).await? {
            tracing::debug!("Returning cached box score for {}: {}", id_param, id_value);
            let response: LeagueResponse =
                serde_json::from_str(&cached_data).map_err(|e| {
                    tracing::error!("Failed to deserialize cached data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            return Ok(Json(response));
        }
    } else {
        tracing::info!("Cache bypass requested - fetching fresh data from API");
    }

    let api_url = box_score_path(league.clone(), id_value.clone()).to_string();
    let raw_data =
        fetch_box_score_from_api(&api_url, &league, &use_case_state.config).await?;

    let response = match league {
        League::Mlb => {
            let mlb_box_score: crate::schema::mlb::box_score::BoxScore =
                serde_json::from_str(&raw_data).map_err(|e| {
                    tracing::error!("Failed to parse MLB box score data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::BoxScore,
                data: crate::schema::league_response::LeagueData::Mlb(Box::new(
                    crate::schema::league_response::MLBData::BoxScore(mlb_box_score),
                )),
                filtered_count: 1,
                total_count: 1,
            }
        }
        League::Nfl => {
            let nfl_box_score: crate::schema::nfl::box_score::NFLBoxScoreByScoreIDV3Response =
                serde_json::from_str(&raw_data).map_err(|e| {
                    tracing::error!("Failed to parse NFL box score data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::BoxScore,
                data: crate::schema::league_response::LeagueData::Nfl(Box::new(
                    crate::schema::league_response::NFLData::BoxScoreByScoreIDV3(
                        Box::new(nfl_box_score),
                    ),
                )),
                filtered_count: 1,
                total_count: 1,
            }
        }
        League::Nba => {
            let nba_box_score: crate::schema::nba::box_score::NBABoxScoreResponse =
                serde_json::from_str(&raw_data).map_err(|e| {
                    tracing::error!("Failed to parse NBA box score data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::BoxScore,
                data: crate::schema::league_response::LeagueData::Nba(Box::new(
                    crate::schema::league_response::NBAData::BoxScore(Box::new(
                        nba_box_score,
                    )),
                )),
                filtered_count: 1,
                total_count: 1,
            }
        }
        _ => {
            tracing::error!("Unsupported league for box score: {}", league);
            return Err(StatusCode::BAD_REQUEST.into());
        }
    };

    {
        let mut cache = use_case_state.cache.lock().await;
        let serialized = serde_json::to_string(&response).map_err(|e| {
            tracing::error!("Failed to serialize response: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
        cache
            .setx(
                &cache_key,
                &serialized,
                use_case_state.config.cache.ttl.box_scores,
            )
            .await?;
    }

    tracing::info!(
        "Successfully fetched and cached box score for {}: {}",
        id_param,
        id_value
    );
    Ok(Json(response))
}

async fn fetch_box_score_from_api(
    api_url: &str,
    league: &League,
    config: &ArbConfig,
) -> Result<String> {
    let api_key = &config.api.sportsdata_api_key;

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
) -> Result<Json<LeagueResponse>> {
    let league = params.league.parse::<League>().map_err(|_| {
        tracing::error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    let api_path = stadiums_path(league.clone());
    let api_url = api_path.to_string();

    let cache_key = CacheKey::stadiums(&league);
    let use_cache = params.cache.unwrap_or(true);

    if use_cache {
        let mut cache = use_case_state.cache.lock().await;
        if let Some(cached_data) = cache.get(&cache_key).await? {
            tracing::debug!("Returning cached stadiums data for league: {}", league);
            let response: LeagueResponse =
                serde_json::from_str(&cached_data).map_err(|e| {
                    tracing::error!("Failed to deserialize cached data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            return Ok(Json(response));
        }
    } else {
        tracing::info!("Cache bypass requested - fetching fresh data from API");
    }

    let raw_data =
        fetch_stadiums_from_api(&api_url, &league, &use_case_state.config).await?;

    let response = match league {
        League::Mlb => {
            let stadiums: Vec<Stadium> =
                serde_json::from_str(&raw_data).map_err(|e| {
                    tracing::error!("Failed to parse MLB stadiums JSON: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

            let stadiums_count = stadiums.len();
            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::Stadiums,
                data: LeagueData::Mlb(Box::new(MLBData::Stadiums(stadiums))),
                filtered_count: stadiums_count,
                total_count: stadiums_count,
            }
        }
        League::Nba => {
            let stadiums: Vec<crate::schema::nba::stadiums::NBAStadium> =
                serde_json::from_str(&raw_data).map_err(|e| {
                    tracing::error!("Failed to parse NBA stadiums JSON: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

            let stadiums_count = stadiums.len();
            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::Stadiums,
                data: LeagueData::Nba(Box::new(NBAData::Stadiums(stadiums))),
                filtered_count: stadiums_count,
                total_count: stadiums_count,
            }
        }
        League::Nfl => {
            let stadiums: Vec<crate::schema::nfl::stadiums::NFLStadium> =
                serde_json::from_str(&raw_data).map_err(|e| {
                    tracing::error!("Failed to parse NFL stadiums JSON: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

            let stadiums_count = stadiums.len();
            LeagueResponse {
                league: league.to_string(),
                data_type: DataType::Stadiums,
                data: LeagueData::Nfl(Box::new(NFLData::Stadiums(stadiums))),
                filtered_count: stadiums_count,
                total_count: stadiums_count,
            }
        }
        _ => {
            tracing::error!("Unsupported league for stadiums: {}", league);
            return Err(StatusCode::BAD_REQUEST.into());
        }
    };

    {
        let mut cache = use_case_state.cache.lock().await;
        let serialized = serde_json::to_string(&response).map_err(|e| {
            tracing::error!("Failed to serialize response: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
        cache
            .setx(
                &cache_key,
                &serialized,
                use_case_state.config.cache.ttl.stadiums,
            )
            .await?;
    }

    tracing::info!(
        "Successfully fetched and cached stadiums for league: {}",
        league
    );
    Ok(Json(response))
}

async fn fetch_stadiums_from_api(
    api_url: &str,
    league: &League,
    config: &ArbConfig,
) -> Result<String> {
    let api_key = &config.api.sportsdata_api_key;

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

#[derive(Debug, Deserialize)]
pub struct TwitterSearchQuery {
    pub query: String,
    #[serde(default)]
    pub cache: Option<bool>,
}

pub async fn handle_twitter_search_request(
    State(state): State<UseCaseState>,
    Query(params): Query<TwitterSearchQuery>,
) -> Result<Json<TwitterSearchResponse>> {
    tracing::info!("Twitter search request for query: {}", params.query);

    let cache_key = format!("twitter_search:{}", params.query);
    let use_cache = params.cache.unwrap_or(true);

    if use_cache {
        if let Ok(Some(cached_data)) = state.cache.lock().await.get(&cache_key).await {
            if let Ok(twitter_response) =
                serde_json::from_str::<TwitterSearchResponse>(&cached_data)
            {
                tracing::debug!("Returning cached Twitter search result");
                return Ok(Json(twitter_response));
            }
        }
    } else {
        tracing::info!("Cache bypass requested - fetching fresh data from Twitter API");
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

    if let Ok(json_data) = serde_json::to_string(&twitter_response) {
        let _ = state
            .cache
            .lock()
            .await
            .setx(
                &cache_key,
                &json_data,
                state.config.cache.ttl.twitter_search,
            )
            .await;
    }

    Ok(Json(twitter_response))
}

pub async fn handle_reddit_search_request(
    State(state): State<UseCaseState>,
    Query(params): Query<RedditSearchQuery>,
) -> Result<Json<RedditSearchResponse>> {
    tracing::info!("Reddit search request received with params: {:?}", params);

    let subreddit = params.subreddit.ok_or_else(|| {
        tracing::error!("Missing required parameter: subreddit");
        StatusCode::BAD_REQUEST
    })?;

    let subreddit_clean = subreddit.trim().trim_start_matches("r/");
    let game_id = params.game_id.unwrap_or_default();
    let fetch_limit = 100;
    let output_limit = params
        .limit
        .unwrap_or(state.config.api.reddit_api.default_comment_limit);
    let sort_kind = params.kind.unwrap_or_else(|| "new".to_string());
    let bypass_cache = params.cache.unwrap_or(true); // Default to using cache

    tracing::info!(
        "Reddit search for subreddit: {}, game_id: {}, fetch_limit: {}, output_limit: {}, bypass_cache: {}",
        subreddit_clean,
        game_id,
        fetch_limit,
        output_limit,
        !bypass_cache
    );

    let comments_cache_key = format!("reddit:thread_comments:{}", subreddit_clean);

    if bypass_cache {
        let comments_cache_key = format!("reddit:thread_comments:{}", subreddit_clean);
        if let Ok(Some(cached_data)) =
            state.cache.lock().await.get(&comments_cache_key).await
        {
            if let Ok(reddit_response) =
                serde_json::from_str::<RedditSearchResponse>(&cached_data)
            {
                tracing::debug!("Returning cached Reddit comments result");
                return Ok(Json(reddit_response));
            }
        }
    } else {
        tracing::info!("Cache bypass requested - fetching fresh data from Reddit API");
    }

    let thread_cache_key = format!("reddit:thread:{}", subreddit_clean);
    let game_thread_id = if let Ok(Some(cached_thread_id)) =
        state.cache.lock().await.get(&thread_cache_key).await
    {
        if let Ok(thread_id) = serde_json::from_str::<String>(&cached_thread_id) {
            tracing::debug!("Found cached game thread ID: {}", thread_id);
            Some(thread_id)
        } else {
            None
        }
    } else {
        tracing::info!(
            "No cached game thread ID found for subreddit: {}",
            subreddit_clean
        );
        None
    };

    let game_thread_id = match game_thread_id {
        Some(id) => id,
        None => {
            tracing::error!("No game thread ID found for subreddit: {}", subreddit_clean);
            return Err(StatusCode::NOT_FOUND.into());
        }
    };

    let client_id = &state.config.api.reddit_oauth.client_id;
    let client_secret = &state.config.api.reddit_oauth.client_secret;
    let user_agent = &state.config.api.reddit_api.user_agent;

    let token_url = "https://www.reddit.com/api/v1/access_token";
    let token_params = [("grant_type", "client_credentials")];

    let token_response = reqwest::Client::new()
        .post(token_url)
        .basic_auth(client_id, Some(&client_secret))
        .form(&token_params)
        .header("User-Agent", user_agent)
        .send()
        .await
        .map_err(|e| {
            tracing::error!("Failed to get Reddit token: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if !token_response.status().is_success() {
        tracing::error!(
            "Reddit token request failed with status: {}",
            token_response.status()
        );
        return Err(StatusCode::INTERNAL_SERVER_ERROR.into());
    }

    let token_data: serde_json::Value = token_response.json().await.map_err(|e| {
        tracing::error!("Failed to parse Reddit token response: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let access_token = token_data["access_token"].as_str().ok_or_else(|| {
        tracing::error!("Missing access token in Reddit response");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let mut all_posts = Vec::new();
    let mut total_posts = 0;

    let search_url = format!(
        "https://oauth.reddit.com/r/{}/comments/{}.json?sort={}&limit={}",
        subreddit_clean, game_thread_id, sort_kind, fetch_limit
    );

    let search_response = reqwest::Client::new()
        .get(&search_url)
        .bearer_auth(access_token)
        .header("User-Agent", user_agent)
        .send()
        .await
        .map_err(|e| {
            tracing::error!(
                "Failed to search Reddit subreddit {}: {}",
                subreddit_clean,
                e
            );
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if !search_response.status().is_success() {
        tracing::warn!(
            "Reddit search failed for subreddit {} with status: {}",
            subreddit_clean,
            search_response.status()
        );
        return Ok(Json(RedditSearchResponse {
            posts: vec![],
            total_posts: 0,
            subreddits_searched: vec![subreddit_clean.to_string()],
            game_id,
            search_timestamp: chrono::Utc::now().to_rfc3339(),
        }));
    }

    let comments_data: Vec<serde_json::Value> =
        search_response.json().await.map_err(|e| {
            tracing::error!(
                "Failed to parse Reddit comments response for {}: {}",
                subreddit_clean,
                e
            );
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if comments_data.len() >= 2 {
        let post_data = &comments_data[0];
        let comments_listing = &comments_data[1];

        let mut reddit_post = RedditPost {
            id: game_thread_id.clone(),
            title: post_data["data"]["title"]
                .as_str()
                .unwrap_or("Game Thread")
                .to_string(),
            author: post_data["data"]["author"]
                .as_str()
                .unwrap_or("Unknown")
                .to_string(),
            selftext: post_data["data"]["selftext"]
                .as_str()
                .unwrap_or("Game thread comments")
                .to_string(),
            score: post_data["data"]["score"].as_i64().unwrap_or(0) as i32,
            num_comments: post_data["data"]["num_comments"].as_i64().unwrap_or(0) as i32,
            created_utc: post_data["data"]["created_utc"].as_f64().unwrap_or(0.0),
            permalink: post_data["data"]["permalink"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            subreddit: subreddit_clean.to_string(),
            url: post_data["data"]["url"].as_str().map(|s| s.to_string()),
            is_self: post_data["data"]["is_self"].as_bool().unwrap_or(true),
            team: None,
            comments: Vec::new(),
        };

        if let Some(comments_array) = comments_listing["data"]["children"].as_array() {
            tracing::info!(
                "Found {} comments for game thread {}, sampling {} for output",
                comments_array.len(),
                game_thread_id,
                output_limit
            );
            let mut post_comments = Vec::new();

            let sampled_comments = if comments_array.len() <= output_limit as usize {
                comments_array.iter().collect::<Vec<_>>()
            } else {
                use rand::seq::SliceRandom;
                use rand::thread_rng;

                let mut rng = thread_rng();
                comments_array
                    .choose_multiple(&mut rng, output_limit as usize)
                    .collect::<Vec<_>>()
            };

            tracing::info!(
                "Sampled {} comments from {} total comments",
                sampled_comments.len(),
                comments_array.len()
            );

            for comment_child in sampled_comments {
                if let Ok(comment_data) =
                    serde_json::from_value::<RedditChild>(comment_child.clone())
                {
                    if let Some(body) = &comment_data.data.body {
                        let comment = RedditComment {
                            id: comment_data.data.id.clone().unwrap_or_default(),
                            author: comment_data.data.author.clone().unwrap_or_default(),
                            content: body.clone(),
                            timestamp: if let Some(created_utc) =
                                comment_data.data.created_utc
                            {
                                chrono::DateTime::from_timestamp(created_utc as i64, 0)
                                    .unwrap_or_else(chrono::Utc::now)
                                    .to_rfc3339()
                            } else {
                                chrono::Utc::now().to_rfc3339()
                            },
                            score: comment_data.data.score.unwrap_or(0) as i32,
                            permalink: format!(
                                "https://reddit.com{}",
                                comment_data.data.permalink.clone().unwrap_or_default()
                            ),
                            subreddit: comment_data
                                .data
                                .subreddit
                                .clone()
                                .unwrap_or_default(),
                            team: Some("home".to_string()), // Default team assignment
                            depth: 0,
                            replies: comment_data
                                .data
                                .extract_comments(Some("home".to_string()), 1),
                        };
                        post_comments.push(comment);
                    }
                }
            }

            reddit_post.comments = post_comments;
        }

        all_posts.push(reddit_post);
        total_posts = 1;
    }

    let reddit_response = RedditSearchResponse {
        posts: all_posts,
        total_posts,
        subreddits_searched: vec![subreddit_clean.to_string()],
        game_id,
        search_timestamp: chrono::Utc::now().to_rfc3339(),
    };

    if let Ok(json_data) = serde_json::to_string(&reddit_response) {
        let _ = state
            .cache
            .lock()
            .await
            .setx(
                &comments_cache_key,
                &json_data,
                state.config.cache.ttl.reddit_thread_comments,
            )
            .await;
    }

    Ok(Json(reddit_response))
}

#[derive(Debug, Deserialize)]
pub struct RedditThreadQuery {
    pub subreddit: String,
    pub league: String,
    #[serde(default)]
    pub cache: Option<bool>,
}

pub async fn handle_reddit_thread_request(
    State(state): State<UseCaseState>,
    Query(params): Query<RedditThreadQuery>,
) -> Result<Json<serde_json::Value>> {
    tracing::info!("Reddit thread request received with params: {:?}", params);

    let subreddit_clean = params.subreddit.trim().trim_start_matches("r/");

    tracing::info!(
        "Reddit thread search for subreddit: {} (league: {})",
        subreddit_clean,
        params.league
    );

    let cache_key = format!("reddit:thread:{}", subreddit_clean);
    let use_cache = params.cache.unwrap_or(true);

    if use_cache {
        if let Ok(Some(_cached_data)) = state.cache.lock().await.get(&cache_key).await {
            tracing::debug!("Returning cached Reddit thread result");
            return Ok(Json(serde_json::json!({"success": true})));
        }
    } else {
        tracing::info!("Cache bypass requested - fetching fresh data from Reddit API");
    }

    let client_id = &state.config.api.reddit_oauth.client_id;
    let client_secret = &state.config.api.reddit_oauth.client_secret;
    let user_agent = &state.config.api.reddit_api.user_agent;

    let token_url = "https://www.reddit.com/api/v1/access_token";
    let token_params = [("grant_type", "client_credentials")];

    let token_response = reqwest::Client::new()
        .post(token_url)
        .basic_auth(client_id, Some(&client_secret))
        .form(&token_params)
        .header("User-Agent", user_agent)
        .send()
        .await
        .map_err(|e| {
            tracing::error!("Failed to get Reddit token: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if !token_response.status().is_success() {
        tracing::error!(
            "Reddit token request failed with status: {}",
            token_response.status()
        );
        return Err(StatusCode::INTERNAL_SERVER_ERROR.into());
    }

    let token_data: serde_json::Value = token_response.json().await.map_err(|e| {
        tracing::error!("Failed to parse Reddit token response: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let access_token = token_data["access_token"].as_str().ok_or_else(|| {
        tracing::error!("Missing access token in Reddit response");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let query = match params.league.to_lowercase().as_str() {
        "mlb" => match subreddit_clean.to_lowercase().as_str() {
            "dodgers" | "mariners" | "brewers" => "Game Chat",
            "chicubs" => "GDT:",
            _ => "Game Thread",
        },
        _ => "Game Thread",
    };

    let search_url = format!(
        "https://oauth.reddit.com/r/{}/search.json?q={}&restrict_sr=1&sort=new&limit=10",
        subreddit_clean,
        urlencoding::encode(query)
    );

    let search_response = reqwest::Client::new()
        .get(&search_url)
        .bearer_auth(access_token)
        .header("User-Agent", user_agent)
        .send()
        .await
        .map_err(|e| {
            tracing::error!(
                "Failed to search Reddit subreddit {}: {}",
                subreddit_clean,
                e
            );
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    if !search_response.status().is_success() {
        tracing::warn!(
            "Reddit search failed for subreddit {} with status: {}",
            subreddit_clean,
            search_response.status()
        );
        return Err(StatusCode::NOT_FOUND.into());
    }

    let search_data: RedditListing = search_response.json().await.map_err(|e| {
        tracing::error!(
            "Failed to parse Reddit search response for {}: {}",
            subreddit_clean,
            e
        );
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    if let Some(game_thread) = find_live_game_thread(&search_data) {
        tracing::info!(
            "Found game thread using query '{}': {} (ID: {})",
            query,
            game_thread.title,
            game_thread.id
        );

        if let Ok(json_data) = serde_json::to_string(&game_thread.id) {
            let _ = state
                .cache
                .lock()
                .await
                .setx(&cache_key, &json_data, state.config.cache.ttl.reddit_thread)
                .await;
        }

        Ok(Json(serde_json::json!({"success": true})))
    } else {
        tracing::warn!("No game thread found for subreddit: {}", subreddit_clean);
        Err(StatusCode::NOT_FOUND.into())
    }
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

    if league != League::Mlb {
        tracing::error!("Odds not yet supported for league: {}", league);
        return Err(StatusCode::BAD_REQUEST.into());
    }

    let api_path = odds_by_date_path(league.clone(), Some(params.date.clone()));
    let api_url = api_path.to_string();

    let cache_key = CacheKey::odds_by_date(&league, &params.date);
    let use_cache = params.cache.unwrap_or(true);

    if use_cache {
        let mut cache = use_case_state.cache.lock().await;
        if let Some(cached_data) = cache.get(&cache_key).await? {
            tracing::debug!("Returning cached odds data for date: {}", params.date);
            let response: OddsByDateResponse = serde_json::from_str(&cached_data)
                .map_err(|e| {
                    tracing::error!("Failed to deserialize cached data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;
            return Ok(Json(response));
        }
    }

    let raw_data =
        fetch_odds_by_date_from_api(&api_url, &league, &use_case_state.config).await?;

    let game_odds: Vec<GameOdds> = serde_json::from_str(&raw_data).map_err(|e| {
        tracing::error!("Failed to parse odds JSON: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let response = OddsByDateResponse {
        date: params.date.clone(),
        data: game_odds,
        games_count: 0, // Will be set from data length
    };

    let response = OddsByDateResponse {
        games_count: response.data.len(),
        ..response
    };

    {
        let mut cache = use_case_state.cache.lock().await;
        let serialized = serde_json::to_string(&response).map_err(|e| {
            tracing::error!("Failed to serialize response: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
        cache
            .setx(
                &cache_key,
                &serialized,
                use_case_state.config.cache.ttl.odds,
            )
            .await?;
    }

    tracing::info!(
        "Successfully fetched and cached odds for date: {}",
        params.date
    );
    Ok(Json(response))
}

async fn fetch_odds_by_date_from_api(
    api_url: &str,
    league: &League,
    config: &ArbConfig,
) -> Result<String> {
    let api_key = &config.api.sportsdata_api_key;

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

/// Google OAuth redirect endpoint
/// GET /api/v1/signin/google
pub async fn handle_google_auth_redirect(
    State(use_case_state): State<UseCaseState>,
) -> std::result::Result<Redirect, (StatusCode, String)> {
    let google_oauth = GoogleOAuth::new(
        use_case_state.config.api.google_oauth.client_id.clone(),
        use_case_state.config.api.google_oauth.client_secret.clone(),
        use_case_state.config.api.google_oauth.redirect_uri.clone(),
        use_case_state.config.api.jwt_secret.clone(),
    );

    let auth_url = google_oauth.get_auth_url();
    Ok(Redirect::to(&auth_url))
}

/// Google OAuth callback endpoint
/// GET /api/v1/signin/google/callback
pub async fn handle_google_auth_callback(
    Query(params): Query<HashMap<String, String>>,
    State(use_case_state): State<UseCaseState>,
) -> std::result::Result<Redirect, (StatusCode, String)> {
    let code = match params.get("code") {
        Some(code) => code,
        None => {
            let error_url =
                format!("{}?error=code", use_case_state.config.server.client_url);
            return Ok(Redirect::to(&error_url));
        }
    };

    let google_oauth = GoogleOAuth::new(
        use_case_state.config.api.google_oauth.client_id.clone(),
        use_case_state.config.api.google_oauth.client_secret.clone(),
        use_case_state.config.api.google_oauth.redirect_uri.clone(),
        use_case_state.config.api.jwt_secret.clone(),
    );

    let token_response = match google_oauth.exchange_code_for_token(code).await {
        Ok(token) => token,
        Err(e) => {
            let error_url = format!(
                "{}?error=token&message={}",
                use_case_state.config.server.client_url,
                urlencoding::encode(&e.to_string())
            );
            return Ok(Redirect::to(&error_url));
        }
    };

    let user_info = match google_oauth
        .get_user_info(&token_response.access_token)
        .await
    {
        Ok(info) => info,
        Err(e) => {
            let error_url = format!(
                "{}?error=userinfo&message={}",
                use_case_state.config.server.client_url,
                urlencoding::encode(&e.to_string())
            );
            return Ok(Redirect::to(&error_url));
        }
    };

    let user = match google_oauth
        .create_or_update_user(&user_info.email, &user_info.name)
        .await
    {
        Ok(user) => user,
        Err(e) => {
            let error_url = format!(
                "{}?error=user&message={}",
                use_case_state.config.server.client_url,
                urlencoding::encode(&e.to_string())
            );
            return Ok(Redirect::to(&error_url));
        }
    };

    let cache_key = CacheKey::user(&user.email);
    let user_json = match serde_json::to_string(&user) {
        Ok(json) => json,
        Err(e) => {
            let error_url = format!(
                "{}?error=serialize&message={}",
                use_case_state.config.server.client_url,
                urlencoding::encode(&e.to_string())
            );
            return Ok(Redirect::to(&error_url));
        }
    };

    {
        let mut cache = use_case_state.cache.lock().await;
        if let Err(e) = cache
            .setx(
                &cache_key,
                &user_json,
                use_case_state.config.cache.ttl.user_auth,
            )
            .await
        {
            tracing::warn!("Failed to cache user: {}", e);
        }
    }

    let success_url = format!(
        "{}?a=ok&s=g&e={}",
        use_case_state.config.server.client_url,
        urlencoding::encode(&user.email)
    );
    Ok(Redirect::to(&success_url))
}

/// Apple OAuth redirect endpoint
/// GET /api/v1/signin/apple
pub async fn handle_apple_auth_redirect(
    State(use_case_state): State<UseCaseState>,
) -> std::result::Result<Redirect, (StatusCode, String)> {
    let apple_oauth = AppleOAuth::new(
        use_case_state.config.api.apple_oauth.client_id.clone(),
        use_case_state.config.api.apple_oauth.redirect_uri.clone(),
        use_case_state.config.api.apple_oauth.team_id.clone(),
        use_case_state.config.api.apple_oauth.key_id.clone(),
        use_case_state
            .config
            .api
            .apple_oauth
            .secret_key_path
            .clone(),
        use_case_state.config.api.apple_oauth.jwt_expire_seconds,
        use_case_state.config.api.jwt_secret.clone(),
    );

    let auth_url = apple_oauth.get_auth_url();
    Ok(Redirect::to(&auth_url))
}

/// Apple OAuth callback endpoint
/// POST /api/v1/signin/apple/callback
pub async fn handle_apple_auth_callback(
    State(use_case_state): State<UseCaseState>,
    body: String,
) -> std::result::Result<Redirect, (StatusCode, String)> {
    let form_data: HashMap<String, String> = url::form_urlencoded::parse(body.as_bytes())
        .into_owned()
        .collect();

    let code = match form_data.get("code") {
        Some(code) => code,
        None => {
            let error_url =
                format!("{}?error=code", use_case_state.config.server.client_url);
            return Ok(Redirect::to(&error_url));
        }
    };

    let apple_oauth = AppleOAuth::new(
        use_case_state.config.api.apple_oauth.client_id.clone(),
        use_case_state.config.api.apple_oauth.redirect_uri.clone(),
        use_case_state.config.api.apple_oauth.team_id.clone(),
        use_case_state.config.api.apple_oauth.key_id.clone(),
        use_case_state
            .config
            .api
            .apple_oauth
            .secret_key_path
            .clone(),
        use_case_state.config.api.apple_oauth.jwt_expire_seconds,
        use_case_state.config.api.jwt_secret.clone(),
    );

    let token_response = match apple_oauth.exchange_code_for_token(code).await {
        Ok(token) => token,
        Err(e) => {
            let error_url = format!(
                "{}?error=token&message={}",
                use_case_state.config.server.client_url,
                urlencoding::encode(&e.to_string())
            );
            return Ok(Redirect::to(&error_url));
        }
    };

    let id_token = match token_response.id_token {
        Some(token) => token,
        None => {
            let error_url = format!(
                "{}?error=missing_id_token",
                use_case_state.config.server.client_url
            );
            return Ok(Redirect::to(&error_url));
        }
    };

    let user = match apple_oauth
        .create_or_update_user_from_token(&id_token)
        .await
    {
        Ok(user) => user,
        Err(e) => {
            let error_url = format!(
                "{}?error=user&message={}",
                use_case_state.config.server.client_url,
                urlencoding::encode(&e.to_string())
            );
            return Ok(Redirect::to(&error_url));
        }
    };

    let cache_key = CacheKey::user(&user.email);
    let user_json = match serde_json::to_string(&user) {
        Ok(json) => json,
        Err(e) => {
            let error_url = format!(
                "{}?error=serialize&message={}",
                use_case_state.config.server.client_url,
                urlencoding::encode(&e.to_string())
            );
            return Ok(Redirect::to(&error_url));
        }
    };

    {
        let mut cache = use_case_state.cache.lock().await;
        if let Err(e) = cache
            .setx(
                &cache_key,
                &user_json,
                use_case_state.config.cache.ttl.user_auth,
            )
            .await
        {
            tracing::warn!("Failed to cache user: {}", e);
        }
    }

    let success_url = format!(
        "{}?a=ok&s=a&e={}",
        use_case_state.config.server.client_url,
        urlencoding::encode(&user.email)
    );
    Ok(Redirect::to(&success_url))
}

pub use handle_box_score_request as box_score;
pub use handle_game_by_date_request as game_by_date;
pub use handle_odds_by_date_request as odds_by_date;
pub use handle_reddit_search_request as reddit_search;
pub use handle_reddit_thread_request as reddit_thread;
pub use handle_stadiums_request as stadiums;
pub use handle_twitter_search_request as twitter_search;
