use serde::{Deserialize, Serialize};
use strum::{Display, EnumString};

use crate::config::ArbConfig;

#[derive(Debug, Display, EnumString, PartialEq, Clone)]
#[strum(serialize_all = "lowercase")]
pub enum League {
    Mlb,
    Nfl,
    Nba,
    Nhl,
    Soccer,
}

// Base URL for sportsdata.io API
const BASE_URL: &str = "https://api.sportsdata.io/v3";

// Path structs for different API endpoints
#[derive(Debug, Clone)]
pub struct TeamProfilePath {
    league: League,
}

#[derive(Debug, Clone)]
pub struct TeamsPath {
    league: League,
}

#[derive(Debug, Clone)]
pub struct SchedulePath {
    league: League,
}

#[derive(Debug, Clone)]
pub struct PostseasonSchedulePath {
    league: League,
    config: ArbConfig,
}

#[derive(Debug, Clone)]
pub struct HeadshotsPath {
    league: League,
}

#[derive(Debug, Clone)]
pub struct ScoresBasicPath {
    league: League,
    date: Option<String>,
}

#[derive(Debug, Clone)]
pub struct ScoresBasicFinalPath {
    league: League,
    date: Option<String>,
}

#[derive(Debug, Clone)]
pub struct GamesByDatePath {
    league: League,
    date: Option<String>,
}

#[derive(Debug, Clone)]
pub struct GamesByDateFinalPath {
    league: League,
    date: Option<String>,
}

#[derive(Debug, Clone)]
pub struct BoxScoresPath {
    league: League,
    date: Option<String>,
}

#[derive(Debug, Clone)]
pub struct BoxScoresFinalPath {
    league: League,
    game_id: Option<String>,
}

#[derive(Debug, Clone)]
pub struct BoxScorePath {
    league: League,
    game_id: String,
}

#[derive(Debug, Clone)]
pub struct PlayByPlayPath {
    league: League,
    game_id: Option<String>,
}

#[derive(Debug, Clone)]
pub struct PlayByPlayFinalPath {
    league: League,
    game_id: Option<String>,
}

#[derive(Debug, Clone)]
pub struct PlayByPlayDeltaPath {
    league: League,
    season: Option<String>,
    week: Option<String>,
    minutes: Option<u32>,
}

#[derive(Debug, Clone)]
pub struct StadiumsPath {
    league: League,
}

#[derive(Debug, Clone)]
pub struct OddsByDatePath {
    league: League,
    date: Option<String>,
}

// Implement Display trait for all path types
impl std::fmt::Display for TeamProfilePath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}/{}/scores/json/AllTeams",
            BASE_URL,
            self.league.to_string().to_lowercase()
        )
    }
}

impl std::fmt::Display for TeamsPath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.league {
            League::Mlb | League::Nba | League::Nhl => {
                write!(
                    f,
                    "{}/{}/scores/json/teams",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
            League::Nfl => {
                write!(
                    f,
                    "{}/{}/scores/json/Teams",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
            League::Soccer => {
                write!(
                    f,
                    "{}/{}/scores/json/Teams",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
        }
    }
}

impl std::fmt::Display for SchedulePath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.league {
            League::Mlb => {
                write!(
                    f,
                    "{}/{}/scores/json/Games/2025",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
            League::Nba | League::Nhl => {
                write!(
                    f,
                    "{}/{}/scores/json/Games",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
            League::Nfl => {
                write!(
                    f,
                    "{}/{}/scores/json/Schedules",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
            League::Soccer => {
                write!(
                    f,
                    "{}/{}/scores/json/Games",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
        }
    }
}

impl std::fmt::Display for PostseasonSchedulePath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.league {
            League::Mlb => {
                let season_id = self
                    .config
                    .get_season_identifier("mlb", "2025-10-01")
                    .unwrap_or_else(|| "2026POST".to_string());
                write!(
                    f,
                    "{}/{}/scores/json/Games/{}",
                    self.config.api.sportsdata_base_url,
                    self.league.to_string().to_lowercase(),
                    season_id
                )
            }
            _ => {
                // For other leagues, fall back to regular schedule
                write!(
                    f,
                    "{}/{}/scores/json/Games",
                    self.config.api.sportsdata_base_url,
                    self.league.to_string().to_lowercase()
                )
            }
        }
    }
}

impl std::fmt::Display for HeadshotsPath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}/{}/headshots/json/Headshots",
            BASE_URL,
            self.league.to_string().to_lowercase()
        )
    }
}

impl std::fmt::Display for ScoresBasicPath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.date {
            Some(ref date) => {
                write!(
                    f,
                    "{}/{}/scores/json/ScoresBasic/{}",
                    BASE_URL,
                    self.league.to_string().to_lowercase(),
                    date
                )
            }
            None => {
                write!(
                    f,
                    "{}/{}/scores/json/ScoresBasic",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
        }
    }
}

impl std::fmt::Display for ScoresBasicFinalPath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.date {
            Some(ref date) => {
                write!(
                    f,
                    "{}/{}/scores/json/ScoresBasicFinal/{}",
                    BASE_URL,
                    self.league.to_string().to_lowercase(),
                    date
                )
            }
            None => {
                write!(
                    f,
                    "{}/{}/scores/json/ScoresBasicFinal",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
        }
    }
}

impl std::fmt::Display for GamesByDatePath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.date {
            Some(ref date) => {
                write!(
                    f,
                    "{}/{}/scores/json/GamesByDate/{}",
                    BASE_URL,
                    self.league.to_string().to_lowercase(),
                    date
                )
            }
            None => {
                write!(
                    f,
                    "{}/{}/scores/json/GamesByDate",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
        }
    }
}

impl std::fmt::Display for GamesByDateFinalPath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.date {
            Some(ref date) => {
                write!(
                    f,
                    "{}/{}/scores/json/GamesByDateFinal/{}",
                    BASE_URL,
                    self.league.to_string().to_lowercase(),
                    date
                )
            }
            None => {
                write!(
                    f,
                    "{}/{}/scores/json/GamesByDateFinal",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
        }
    }
}

impl std::fmt::Display for BoxScoresPath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.date {
            Some(ref date) => {
                write!(
                    f,
                    "{}/{}/stats/json/BoxScores/{}",
                    BASE_URL,
                    self.league.to_string().to_lowercase(),
                    date
                )
            }
            None => {
                write!(
                    f,
                    "{}/{}/stats/json/BoxScores",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
        }
    }
}

impl std::fmt::Display for BoxScoresFinalPath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.game_id {
            Some(ref game_id) => {
                write!(
                    f,
                    "{}/{}/stats/json/BoxScoresFinal/{}",
                    BASE_URL,
                    self.league.to_string().to_lowercase(),
                    game_id
                )
            }
            None => {
                write!(
                    f,
                    "{}/{}/stats/json/BoxScoresFinal",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
        }
    }
}

impl std::fmt::Display for BoxScorePath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}/{}/stats/json/BoxScore/{}",
            BASE_URL,
            self.league.to_string().to_lowercase(),
            self.game_id
        )
    }
}

impl std::fmt::Display for PlayByPlayPath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.game_id {
            Some(ref game_id) => {
                write!(
                    f,
                    "{}/{}/pbp/json/PlayByPlay/{}",
                    BASE_URL,
                    self.league.to_string().to_lowercase(),
                    game_id
                )
            }
            None => {
                write!(
                    f,
                    "{}/{}/pbp/json/PlayByPlay",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
        }
    }
}

impl std::fmt::Display for PlayByPlayFinalPath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.game_id {
            Some(ref game_id) => {
                write!(
                    f,
                    "{}/{}/pbp/json/PlayByPlayFinal/{}",
                    BASE_URL,
                    self.league.to_string().to_lowercase(),
                    game_id
                )
            }
            None => {
                write!(
                    f,
                    "{}/{}/pbp/json/PlayByPlayFinal",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
        }
    }
}

impl std::fmt::Display for PlayByPlayDeltaPath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match (self.season.as_ref(), self.week.as_ref(), self.minutes) {
            (Some(season), Some(week), Some(minutes)) => {
                write!(
                    f,
                    "{}/{}/pbp/json/PlayByPlayDelta/{}/{}/{}",
                    BASE_URL,
                    self.league.to_string().to_lowercase(),
                    season,
                    week,
                    minutes
                )
            }
            (Some(season), Some(week), None) => {
                write!(
                    f,
                    "{}/{}/pbp/json/PlayByPlayDelta/{}/{}",
                    BASE_URL,
                    self.league.to_string().to_lowercase(),
                    season,
                    week
                )
            }
            _ => {
                write!(
                    f,
                    "{}/{}/pbp/json/PlayByPlayDelta",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
        }
    }
}

impl std::fmt::Display for StadiumsPath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "{}/{}/scores/json/Stadiums",
            BASE_URL,
            self.league.to_string().to_lowercase()
        )
    }
}

impl std::fmt::Display for OddsByDatePath {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self.date {
            Some(ref date) => {
                write!(
                    f,
                    "{}/{}/odds/json/GameOddsByDate/{}",
                    BASE_URL,
                    self.league.to_string().to_lowercase(),
                    date
                )
            }
            None => {
                write!(
                    f,
                    "{}/{}/odds/json/GameOddsByDate",
                    BASE_URL,
                    self.league.to_string().to_lowercase()
                )
            }
        }
    }
}

// Helper functions to create path instances
pub fn team_profile_path(league: League) -> TeamProfilePath {
    TeamProfilePath { league }
}

pub fn teams_path(league: League) -> TeamsPath {
    TeamsPath { league }
}

pub fn schedule_path(league: League) -> SchedulePath {
    SchedulePath { league }
}

pub fn postseason_schedule_path(
    league: League,
    config: ArbConfig,
) -> PostseasonSchedulePath {
    PostseasonSchedulePath { league, config }
}

pub fn headshots_path(league: League) -> HeadshotsPath {
    HeadshotsPath { league }
}

pub fn scores_basic_path(league: League, date: Option<String>) -> ScoresBasicPath {
    ScoresBasicPath { league, date }
}

pub fn scores_basic_final_path(
    league: League,
    date: Option<String>,
) -> ScoresBasicFinalPath {
    ScoresBasicFinalPath { league, date }
}

pub fn games_by_date_path(league: League, date: Option<String>) -> GamesByDatePath {
    GamesByDatePath { league, date }
}

pub fn games_by_date_final_path(
    league: League,
    date: Option<String>,
) -> GamesByDateFinalPath {
    GamesByDateFinalPath { league, date }
}

pub fn box_scores_path(league: League, date: Option<String>) -> BoxScoresPath {
    BoxScoresPath { league, date }
}

pub fn box_scores_final_path(
    league: League,
    game_id: Option<String>,
) -> BoxScoresFinalPath {
    BoxScoresFinalPath { league, game_id }
}

pub fn box_score_path(league: League, game_id: String) -> BoxScorePath {
    BoxScorePath { league, game_id }
}

pub fn play_by_play_path(league: League, game_id: Option<String>) -> PlayByPlayPath {
    PlayByPlayPath { league, game_id }
}

pub fn play_by_play_final_path(
    league: League,
    game_id: Option<String>,
) -> PlayByPlayFinalPath {
    PlayByPlayFinalPath { league, game_id }
}

pub fn play_by_play_delta_path(
    league: League,
    season: Option<String>,
    week: Option<String>,
    minutes: Option<u32>,
) -> PlayByPlayDeltaPath {
    PlayByPlayDeltaPath {
        league,
        season,
        week,
        minutes,
    }
}

pub fn stadiums_path(league: League) -> StadiumsPath {
    StadiumsPath { league }
}

pub fn odds_by_date_path(league: League, date: Option<String>) -> OddsByDatePath {
    OddsByDatePath { league, date }
}
