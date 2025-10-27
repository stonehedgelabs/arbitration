use std::time::Instant;

use async_std::sync::{Arc, Mutex};
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::Json,
};
use chrono;
use serde::Deserialize;
use tracing::{error, info};

use crate::{
    cache::{Cache, CacheKey, Provider},
    config::ArbConfig,
    error::Result,
    path::League,
    schema::rolling_insights::{
        data_type::DataType,
        league_response::{
            NBARollingInsightsData, RollingInsightsLeagueData,
            RollingInsightsLeagueResponse,
        },
        nba::{
            box_score::NBARollingInsightsBoxScoreGame,
            player_profile::NBARollingInsightsPlayerProfile,
            schedule::NBARollingInsightsScheduleGame,
            team_profile::NBARollingInsightsTeamProfile,
        },
    },
};

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

    pub fn provider(&self) -> Provider {
        Provider::RollingInsights
    }
}

#[derive(Debug, Deserialize)]
pub struct ScheduleQuery {
    pub league: String,
    pub date: String, // Required, format: YYYY-mm-dd
    #[serde(default)]
    pub cache: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct BoxScoreQuery {
    pub league: String,
    pub date: String,    // Required, format: YYYY-mm-dd
    pub game_id: String, // Required, format: YYYYMMDD-TeamID-TeamID
    #[serde(default)]
    pub cache: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct CurrentGamesQuery {
    pub league: String,
    pub start: String, // Required, format: YYYY-mm-dd
    pub end: String,   // Required, format: YYYY-mm-dd
    #[serde(default)]
    pub cache: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct TeamProfileQuery {
    pub league: String,
    pub team_id: Option<i32>,
    #[serde(default)]
    pub cache: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct PlayerProfileQuery {
    pub league: String,
    pub team_id: Option<i32>,
    #[serde(default)]
    pub cache: Option<bool>,
}

pub async fn schedule(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<ScheduleQuery>,
) -> Result<Json<RollingInsightsLeagueResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    // For now, only support NBA
    if league != League::Nba {
        error!(
            "Rolling insights schedule not yet supported for league: {}",
            league
        );
        return Err(StatusCode::BAD_REQUEST.into());
    }

    // Build the API URL
    let sport = league_str.to_uppercase(); // NBA, MLB, etc.
    let base_url = &use_case_state.config.api.rolling_insights_base_url;
    let rsc_token = &use_case_state.config.api.rsc_token;

    let api_url = format!("{}schedule-season/{}/{}", base_url, params.date, sport);

    info!("Rolling Insights API URL: {}", api_url);

    // Build cache key
    let cache_key =
        CacheKey::data_type(use_case_state.provider(), &DataType::Schedule, &league);
    let use_cache = params.cache.unwrap_or(true);

    // Try cache first
    let cached_data = if use_cache {
        let mut cache = use_case_state.cache.lock().await;
        cache.get(&cache_key).await?
    } else {
        info!("Cache bypass requested — fetching fresh data from Rolling Insights API");
        None
    };

    // Fetch from origin if no cache or cache disabled
    let data = if let Some(data) = cached_data {
        info!("Returning cached rolling insights schedule data");
        data
    } else {
        info!(
            "Fetching schedule data from Rolling Insights API: {}",
            api_url
        );

        let client = reqwest::Client::new();
        let response = client
            .get(&api_url)
            .query(&[("RSC_token", rsc_token)])
            .send()
            .await
            .map_err(|e| {
                error!("Failed to make HTTP request: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            error!(
                "Rolling Insights API request failed with status {}: {}",
                status, error_text
            );
            return Err(StatusCode::from_u16(status.as_u16())
                .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
                .into());
        }

        let body = response.text().await.map_err(|e| {
            error!("Failed to read response body: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

        info!("Successfully fetched schedule data from Rolling Insights API");

        // Parse the response - it should be a JSON object with the sport as the key
        let schedule_data: serde_json::Value =
            serde_json::from_str(&body).map_err(|e| {
                error!("Failed to parse JSON response: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        // Extract the schedule array for this sport
        let games_array = schedule_data
            .get(&sport)
            .and_then(|v| v.as_array())
            .ok_or_else(|| {
                error!(
                    "Invalid response format - missing {} key or not an array",
                    sport
                );
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        // Cache the full response body
        if use_cache {
            let mut cache = use_case_state.cache.lock().await;
            if let Err(e) = cache
                .setx(&cache_key, &body, use_case_state.config.cache.ttl.schedule)
                .await
            {
                error!("Failed to cache schedule data: {}", e);
            }
        }

        // Parse the games array into our schema
        let games: Vec<NBARollingInsightsScheduleGame> =
            serde_json::from_value(serde_json::Value::Array(games_array.clone()))
                .map_err(|e| {
                    error!("Failed to parse NBA schedule data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

        let total_count = games.len();
        let filtered_count = games.len();

        let response = RollingInsightsLeagueResponse {
            league: league.to_string(),
            data_type: DataType::Schedule,
            data: RollingInsightsLeagueData::Nba(Box::new(
                NBARollingInsightsData::Schedule(games),
            )),
            filtered_count,
            total_count,
        };

        return Ok(Json(response));
    };

    // Parse cached data
    let schedule_data: serde_json::Value = serde_json::from_str(&data).map_err(|e| {
        error!("Failed to parse cached JSON data: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let games_array = schedule_data
        .get(&sport)
        .and_then(|v| v.as_array())
        .ok_or_else(|| {
            error!("Invalid cached data format");
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let games: Vec<NBARollingInsightsScheduleGame> = serde_json::from_value(
        serde_json::Value::Array(games_array.clone()),
    )
    .map_err(|e| {
        error!("Failed to parse cached NBA schedule data: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let total_count = games.len();
    let filtered_count = games.len();

    let league_response = RollingInsightsLeagueResponse {
        league: league.to_string(),
        data_type: DataType::Schedule,
        data: RollingInsightsLeagueData::Nba(Box::new(NBARollingInsightsData::Schedule(
            games,
        ))),
        filtered_count,
        total_count,
    };

    Ok(Json(league_response))
}

pub async fn box_score(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<BoxScoreQuery>,
) -> Result<Json<RollingInsightsLeagueResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    // For now, only support NBA
    if league != League::Nba {
        error!(
            "Rolling insights box score not yet supported for league: {}",
            league
        );
        return Err(StatusCode::BAD_REQUEST.into());
    }

    // Build the API URL
    let sport = league_str.to_uppercase(); // NBA, MLB, etc.
    let base_url = &use_case_state.config.api.rolling_insights_base_url;
    let rsc_token = &use_case_state.config.api.rsc_token;

    let api_url = format!("{}live/{}/{}", base_url, params.date, sport);

    info!("Rolling Insights API URL: {}", api_url);

    // Build cache key
    let cache_key =
        CacheKey::data_type(use_case_state.provider(), &DataType::BoxScore, &league);
    let use_cache = params.cache.unwrap_or(true);

    // Try cache first
    let cached_data = if use_cache {
        let mut cache = use_case_state.cache.lock().await;
        cache.get(&cache_key).await?
    } else {
        info!("Cache bypass requested — fetching fresh data from Rolling Insights API");
        None
    };

    // Fetch from origin if no cache or cache disabled
    let data = if let Some(data) = cached_data {
        info!("Returning cached rolling insights box score data");
        data
    } else {
        info!(
            "Fetching box score data from Rolling Insights API: {}",
            api_url
        );

        let client = reqwest::Client::new();
        let response = client
            .get(&api_url)
            .query(&[
                ("RSC_token", rsc_token.as_str()),
                ("game_id", params.game_id.as_str()),
            ])
            .send()
            .await
            .map_err(|e| {
                error!("Failed to make HTTP request: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            error!(
                "Rolling Insights API request failed with status {}: {}",
                status, error_text
            );
            return Err(StatusCode::from_u16(status.as_u16())
                .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
                .into());
        }

        let body = response.text().await.map_err(|e| {
            error!("Failed to read response body: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

        info!("Successfully fetched box score data from Rolling Insights API");

        // Parse the response - it should be a JSON object with "data" containing the sport key
        let box_score_data: serde_json::Value =
            serde_json::from_str(&body).map_err(|e| {
                error!("Failed to parse JSON response: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        // Extract the games array from data.[sport]
        let games_array = box_score_data
            .get("data")
            .and_then(|d| d.get(&sport))
            .and_then(|v| v.as_array())
            .ok_or_else(|| {
                error!(
                    "Invalid response format - missing data.{} key or not an array",
                    sport
                );
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        // Cache the full response body
        if use_cache {
            let mut cache = use_case_state.cache.lock().await;
            if let Err(e) = cache
                .setx(
                    &cache_key,
                    &body,
                    use_case_state.config.cache.ttl.box_scores,
                )
                .await
            {
                error!("Failed to cache box score data: {}", e);
            }
        }

        // Parse the games array into our schema
        let games: Vec<NBARollingInsightsBoxScoreGame> =
            serde_json::from_value(serde_json::Value::Array(games_array.clone()))
                .map_err(|e| {
                    error!("Failed to parse NBA box score data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

        let total_count = games.len();
        let filtered_count = games.len();

        let response = RollingInsightsLeagueResponse {
            league: league.to_string(),
            data_type: DataType::BoxScore,
            data: RollingInsightsLeagueData::Nba(Box::new(
                NBARollingInsightsData::BoxScore(games),
            )),
            filtered_count,
            total_count,
        };

        return Ok(Json(response));
    };

    // Parse cached data
    let box_score_data: serde_json::Value = serde_json::from_str(&data).map_err(|e| {
        error!("Failed to parse cached JSON data: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let games_array = box_score_data
        .get("data")
        .and_then(|d| d.get(&sport))
        .and_then(|v| v.as_array())
        .ok_or_else(|| {
            error!("Invalid cached data format");
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let games: Vec<NBARollingInsightsBoxScoreGame> = serde_json::from_value(
        serde_json::Value::Array(games_array.clone()),
    )
    .map_err(|e| {
        error!("Failed to parse cached NBA box score data: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let total_count = games.len();
    let filtered_count = games.len();

    let league_response = RollingInsightsLeagueResponse {
        league: league.to_string(),
        data_type: DataType::BoxScore,
        data: RollingInsightsLeagueData::Nba(Box::new(NBARollingInsightsData::BoxScore(
            games,
        ))),
        filtered_count,
        total_count,
    };

    Ok(Json(league_response))
}

pub async fn current_games(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<CurrentGamesQuery>,
) -> Result<Json<RollingInsightsLeagueResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    // For now, only support NBA
    if league != League::Nba {
        error!(
            "Rolling insights current games not yet supported for league: {}",
            league
        );
        return Err(StatusCode::BAD_REQUEST.into());
    }

    // Parse start and end dates
    let start_date = chrono::NaiveDate::parse_from_str(&params.start, "%Y-%m-%d")
        .map_err(|_| {
            error!("Invalid start date format: {}", params.start);
            StatusCode::BAD_REQUEST
        })?;

    let end_date =
        chrono::NaiveDate::parse_from_str(&params.end, "%Y-%m-%d").map_err(|_| {
            error!("Invalid end date format: {}", params.end);
            StatusCode::BAD_REQUEST
        })?;

    if start_date > end_date {
        error!(
            "Start date {} is after end date {}",
            params.start, params.end
        );
        return Err(StatusCode::BAD_REQUEST.into());
    }

    let sport = league_str.to_uppercase(); // NBA, MLB, etc.
    let base_url = &use_case_state.config.api.rolling_insights_base_url;
    let rsc_token = &use_case_state.config.api.rsc_token;

    let use_cache = params.cache.unwrap_or(true);
    let mut all_games = Vec::new();
    let mut current_date = start_date;

    // Loop through each date from start to end
    while current_date <= end_date {
        let date_str = current_date.format("%Y-%m-%d").to_string();
        let api_url = format!("{}schedule/{}/{}", base_url, date_str, sport);

        info!("Rolling Insights API URL for current games: {}", api_url);

        // Build cache key for this specific date
        let date_cache_key = CacheKey::new(format!(
            "{}:schedule:{}:{}",
            use_case_state.provider().as_str(),
            league_str,
            date_str
        ));

        // Try cache first
        let cached_data = if use_cache {
            let mut cache = use_case_state.cache.lock().await;
            cache.get(&date_cache_key).await?
        } else {
            None
        };

        let games_for_date = if let Some(data) = cached_data {
            info!("Returning cached schedule data for date: {}", date_str);
            data
        } else {
            info!(
                "Fetching schedule data from Rolling Insights API for date: {}",
                date_str
            );

            let client = reqwest::Client::new();
            let response = client
                .get(&api_url)
                .query(&[("RSC_token", rsc_token)])
                .send()
                .await
                .map_err(|e| {
                    error!("Failed to make HTTP request: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

            if !response.status().is_success() {
                let status = response.status();
                let error_text = response
                    .text()
                    .await
                    .unwrap_or_else(|_| "Unknown error".to_string());
                error!(
                    "Rolling Insights API request failed with status {}: {}",
                    status, error_text
                );
                return Err(StatusCode::from_u16(status.as_u16())
                    .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
                    .into());
            }

            let body = response.text().await.map_err(|e| {
                error!("Failed to read response body: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

            info!("Successfully fetched schedule data for date: {}", date_str);

            // Cache the full response body
            if use_cache {
                let mut cache = use_case_state.cache.lock().await;
                if let Err(e) = cache
                    .setx(
                        &date_cache_key,
                        &body,
                        use_case_state.config.cache.ttl.schedule,
                    )
                    .await
                {
                    error!("Failed to cache schedule data for date {}: {}", date_str, e);
                }
            }

            body
        };

        // Parse the response
        let schedule_data: serde_json::Value = serde_json::from_str(&games_for_date)
            .map_err(|e| {
                error!("Failed to parse JSON response for date {}: {}", date_str, e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        // Extract the games array for this sport
        let games_array = schedule_data
            .get(&sport)
            .and_then(|v| v.as_array())
            .ok_or_else(|| {
                error!(
                    "Invalid response format for date {} - missing {} key or not an array",
                    date_str, sport
                );
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        // Add games to the combined array
        for game in games_array {
            all_games.push(game.clone());
        }

        // Move to next date
        current_date = current_date
            .succ_opt()
            .ok_or(StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    // Parse all games into the schedule game type
    let games: Vec<NBARollingInsightsScheduleGame> = serde_json::from_value(
        serde_json::Value::Array(all_games.clone()),
    )
    .map_err(|e| {
        error!("Failed to parse NBA current games data: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let total_count = games.len();
    let filtered_count = games.len();

    let league_response = RollingInsightsLeagueResponse {
        league: league.to_string(),
        data_type: DataType::CurrentGames,
        data: RollingInsightsLeagueData::Nba(Box::new(
            NBARollingInsightsData::CurrentGames(games),
        )),
        filtered_count,
        total_count,
    };

    Ok(Json(league_response))
}

pub async fn team_profiles(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<TeamProfileQuery>,
) -> Result<Json<RollingInsightsLeagueResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    // For now, only support NBA
    if league != League::Nba {
        error!(
            "Rolling insights team profiles not yet supported for league: {}",
            league
        );
        return Err(StatusCode::BAD_REQUEST.into());
    }

    let sport = league_str.to_uppercase(); // NBA, MLB, etc.
    let base_url = &use_case_state.config.api.rolling_insights_base_url;
    let rsc_token = &use_case_state.config.api.rsc_token;

    let api_url = format!("{}team-info/{}", base_url, sport);

    info!("Rolling Insights API URL: {}", api_url);

    // Build cache key (include team_id if provided for proper caching)
    let cache_key = if let Some(team_id) = params.team_id {
        CacheKey::new(format!(
            "{}:team_profile:{}:{}",
            use_case_state.provider().as_str(),
            league_str,
            team_id
        ))
    } else {
        CacheKey::team_profile(use_case_state.provider(), &league)
    };
    let use_cache = params.cache.unwrap_or(true);

    // Try cache first
    let cached_data = if use_cache {
        let mut cache = use_case_state.cache.lock().await;
        cache.get(&cache_key).await?
    } else {
        info!("Cache bypass requested — fetching fresh data from Rolling Insights API");
        None
    };

    // Fetch from origin if no cache or cache disabled
    let data = if let Some(data) = cached_data {
        info!("Returning cached rolling insights team profiles data");
        data
    } else {
        info!("Fetching team profiles data from Rolling Insights API");

        let client = reqwest::Client::new();
        let response = client
            .get(&api_url)
            .query(&[("RSC_token", rsc_token)])
            .send()
            .await
            .map_err(|e| {
                error!("Failed to make HTTP request: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            error!(
                "Rolling Insights API request failed with status {}: {}",
                status, error_text
            );
            return Err(StatusCode::from_u16(status.as_u16())
                .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
                .into());
        }

        let body = response.text().await.map_err(|e| {
            error!("Failed to read response body: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

        info!("Successfully fetched team profiles data from Rolling Insights API");

        // Parse the response - it should be a JSON object with "data" containing the sport key
        let team_data: serde_json::Value = serde_json::from_str(&body).map_err(|e| {
            error!("Failed to parse JSON response: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

        // Extract the teams array from data.[sport]
        let teams_array = team_data
            .get("data")
            .and_then(|d| d.get(&sport))
            .and_then(|v| v.as_array())
            .ok_or_else(|| {
                error!(
                    "Invalid response format - missing data.{} key or not an array",
                    sport
                );
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        // Cache the full response body
        if use_cache {
            let mut cache = use_case_state.cache.lock().await;
            if let Err(e) = cache
                .setx(
                    &cache_key,
                    &body,
                    use_case_state.config.cache.ttl.team_profiles,
                )
                .await
            {
                error!("Failed to cache team profiles data: {}", e);
            }
        }

        // Parse the teams array into our schema
        let mut teams: Vec<NBARollingInsightsTeamProfile> =
            serde_json::from_value(serde_json::Value::Array(teams_array.clone()))
                .map_err(|e| {
                    error!("Failed to parse NBA team profiles data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

        // Filter by team_id if provided
        if let Some(team_id) = params.team_id {
            teams.retain(|team| team.team_id == team_id);
        }

        let total_count = teams.len();
        let filtered_count = teams.len();

        let response = RollingInsightsLeagueResponse {
            league: league.to_string(),
            data_type: DataType::TeamProfiles,
            data: RollingInsightsLeagueData::Nba(Box::new(
                NBARollingInsightsData::TeamProfiles(teams),
            )),
            filtered_count,
            total_count,
        };

        return Ok(Json(response));
    };

    // Parse cached data
    let team_data: serde_json::Value = serde_json::from_str(&data).map_err(|e| {
        error!("Failed to parse cached JSON data: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let teams_array = team_data
        .get("data")
        .and_then(|d| d.get(&sport))
        .and_then(|v| v.as_array())
        .ok_or_else(|| {
            error!("Invalid cached data format");
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let mut teams: Vec<NBARollingInsightsTeamProfile> = serde_json::from_value(
        serde_json::Value::Array(teams_array.clone()),
    )
    .map_err(|e| {
        error!("Failed to parse cached NBA team profiles data: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // Filter by team_id if provided
    if let Some(team_id) = params.team_id {
        teams.retain(|team| team.team_id == team_id);
    }

    let total_count = teams.len();
    let filtered_count = teams.len();

    let league_response = RollingInsightsLeagueResponse {
        league: league.to_string(),
        data_type: DataType::TeamProfiles,
        data: RollingInsightsLeagueData::Nba(Box::new(
            NBARollingInsightsData::TeamProfiles(teams),
        )),
        filtered_count,
        total_count,
    };

    Ok(Json(league_response))
}

pub async fn player_profiles(
    State(use_case_state): State<UseCaseState>,
    Query(params): Query<PlayerProfileQuery>,
) -> Result<Json<RollingInsightsLeagueResponse>> {
    let league_str = params.league.to_lowercase();
    let league: League = league_str.parse().map_err(|_| {
        error!("Invalid league: {}", params.league);
        StatusCode::BAD_REQUEST
    })?;

    // For now, only support NBA
    if league != League::Nba {
        error!(
            "Rolling insights player profiles not yet supported for league: {}",
            league
        );
        return Err(StatusCode::BAD_REQUEST.into());
    }

    let sport = league_str.to_uppercase(); // NBA, MLB, etc.
    let base_url = &use_case_state.config.api.rolling_insights_base_url;
    let rsc_token = &use_case_state.config.api.rsc_token;

    let api_url = format!("{}player-info/{}", base_url, sport);

    info!("Rolling Insights API URL: {}", api_url);

    // Build cache key (include team_id if provided for proper caching)
    let cache_key = if let Some(team_id) = params.team_id {
        CacheKey::new(format!(
            "{}:player_profile:{}:{}",
            use_case_state.provider().as_str(),
            league_str,
            team_id
        ))
    } else {
        CacheKey::new(format!(
            "{}:player_profile:{}",
            use_case_state.provider().as_str(),
            league_str
        ))
    };
    let use_cache = params.cache.unwrap_or(true);

    // Try cache first
    let cached_data = if use_cache {
        let mut cache = use_case_state.cache.lock().await;
        cache.get(&cache_key).await?
    } else {
        info!("Cache bypass requested — fetching fresh data from Rolling Insights API");
        None
    };

    // Fetch from origin if no cache or cache disabled
    let data = if let Some(data) = cached_data {
        info!("Returning cached rolling insights player profiles data");
        data
    } else {
        info!("Fetching player profiles data from Rolling Insights API");

        let client = reqwest::Client::new();
        let mut request = client.get(&api_url).query(&[("RSC_token", rsc_token)]);

        // Add team_id to query params if provided
        if let Some(team_id) = params.team_id {
            request = request.query(&[("team_id", team_id.to_string())]);
        }

        let response = request.send().await.map_err(|e| {
            error!("Failed to make HTTP request: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            error!(
                "Rolling Insights API request failed with status {}: {}",
                status, error_text
            );
            return Err(StatusCode::from_u16(status.as_u16())
                .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
                .into());
        }

        let body = response.text().await.map_err(|e| {
            error!("Failed to read response body: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

        info!("Successfully fetched player profiles data from Rolling Insights API");

        // Parse the response - it should be a JSON object with "data" containing the sport key
        let player_data: serde_json::Value =
            serde_json::from_str(&body).map_err(|e| {
                error!("Failed to parse JSON response: {}", e);
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        // Extract the players array from data.[sport]
        let players_array = player_data
            .get("data")
            .and_then(|d| d.get(&sport))
            .and_then(|v| v.as_array())
            .ok_or_else(|| {
                error!(
                    "Invalid response format - missing data.{} key or not an array",
                    sport
                );
                StatusCode::INTERNAL_SERVER_ERROR
            })?;

        // Cache the full response body
        if use_cache {
            let mut cache = use_case_state.cache.lock().await;
            if let Err(e) = cache
                .setx(
                    &cache_key,
                    &body,
                    use_case_state.config.cache.ttl.team_profiles,
                )
                .await
            {
                error!("Failed to cache player profiles data: {}", e);
            }
        }

        // Parse the players array into our schema
        let players: Vec<NBARollingInsightsPlayerProfile> =
            serde_json::from_value(serde_json::Value::Array(players_array.clone()))
                .map_err(|e| {
                    error!("Failed to parse NBA player profiles data: {}", e);
                    StatusCode::INTERNAL_SERVER_ERROR
                })?;

        let total_count = players.len();
        let filtered_count = players.len();

        let response = RollingInsightsLeagueResponse {
            league: league.to_string(),
            data_type: DataType::TeamProfiles,
            data: RollingInsightsLeagueData::Nba(Box::new(
                NBARollingInsightsData::PlayerProfiles(players),
            )),
            filtered_count,
            total_count,
        };

        return Ok(Json(response));
    };

    // Parse cached data
    let player_data: serde_json::Value = serde_json::from_str(&data).map_err(|e| {
        error!("Failed to parse cached JSON data: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let players_array = player_data
        .get("data")
        .and_then(|d| d.get(&sport))
        .and_then(|v| v.as_array())
        .ok_or_else(|| {
            error!("Invalid cached data format");
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    let players: Vec<NBARollingInsightsPlayerProfile> = serde_json::from_value(
        serde_json::Value::Array(players_array.clone()),
    )
    .map_err(|e| {
        error!("Failed to parse cached NBA player profiles data: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let total_count = players.len();
    let filtered_count = players.len();

    let league_response = RollingInsightsLeagueResponse {
        league: league.to_string(),
        data_type: DataType::TeamProfiles,
        data: RollingInsightsLeagueData::Nba(Box::new(
            NBARollingInsightsData::PlayerProfiles(players),
        )),
        filtered_count,
        total_count,
    };

    Ok(Json(league_response))
}
