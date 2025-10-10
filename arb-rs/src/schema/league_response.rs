use serde::{Deserialize, Serialize};

use crate::schema::{
    data_type::DataType,
    mlb::{
        box_score::BoxScoreResponse, game_by_date::GameByDateResponse,
        odds::OddsByDateResponse, schedule::MLBScheduleResponse,
        stadiums::StadiumsResponse, teams::TeamProfiles,
    },
    nba::{
        box_score::NBABoxScoreResponse,
        headshots::PlayerHeadshots,
        play_by_play::NBAPlayByPlayResponse,
        schedule::NBAScheduleResponse,
        stadiums::NBAStadiumsResponse,
        teams::NBATeamProfilesResponse,
    },
    nfl::{
        box_score::NFLBoxScoreResponse, game_by_date::NFLGameByDateResponse, headshots::NFLHeadshotsResponse,
        play_by_play::NFLPlayByPlayResponse, schedule::NFLScheduleResponse,
        scores::NFLScoresResponse, stadiums::NFLStadiumsResponse,
        teams::NFLTeamProfilesResponse,
    },
};

// Import the wrapper from uses.rs
use crate::uses::MLBPlayByPlayWrapper;

/// Generic response wrapper for different leagues
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LeagueResponse {
    pub league: String,
    pub data_type: DataType,
    pub data: LeagueData,
    pub filtered_count: usize,
    pub total_count: usize,
}

/// League-specific data types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "league", content = "data")]
pub enum LeagueData {
    #[serde(rename = "mlb")]
    Mlb(Box<MLBData>),
    #[serde(rename = "nba")]
    Nba(Box<NBAData>),
    #[serde(rename = "nfl")]
    Nfl(Box<NFLData>),
}

/// MLB-specific data types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "data_type", content = "data")]
pub enum MLBData {
    #[serde(rename = "schedule")]
    Schedule(MLBScheduleResponse),
    #[serde(rename = "current_games")]
    CurrentGames(MLBScheduleResponse),
    #[serde(rename = "team_profiles")]
    TeamProfiles(TeamProfiles),
    #[serde(rename = "headshots")]
    Headshots(serde_json::Value), // MLB headshots uses generic JSON
    #[serde(rename = "stadiums")]
    Stadiums(StadiumsResponse),
    #[serde(rename = "box_score")]
    BoxScore(BoxScoreResponse),
    #[serde(rename = "play_by_play")]
    PlayByPlay(MLBPlayByPlayWrapper),
    #[serde(rename = "odds")]
    Odds(OddsByDateResponse),
    #[serde(rename = "game_by_date")]
    GameByDate(GameByDateResponse),
    #[serde(rename = "scores")]
    Scores(serde_json::Value), // MLB scores uses generic JSON
}

/// NBA-specific data types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "data_type", content = "data")]
pub enum NBAData {
    #[serde(rename = "schedule")]
    Schedule(NBAScheduleResponse),
    #[serde(rename = "current_games")]
    CurrentGames(NBAScheduleResponse),
    #[serde(rename = "stadiums")]
    Stadiums(NBAStadiumsResponse),
    #[serde(rename = "team_profiles")]
    TeamProfiles(NBATeamProfilesResponse),
    #[serde(rename = "headshots")]
    Headshots(PlayerHeadshots),
    #[serde(rename = "play_by_play")]
    PlayByPlay(NBAPlayByPlayResponse),
    #[serde(rename = "scores")]
    Scores(NBAScheduleResponse),
    #[serde(rename = "box_score")]
    BoxScore(NBABoxScoreResponse),
}

/// NFL-specific data types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "data_type", content = "data")]
pub enum NFLData {
    #[serde(rename = "schedule")]
    Schedule(NFLScheduleResponse),
    #[serde(rename = "current_games")]
    CurrentGames(NFLScheduleResponse),
    #[serde(rename = "team_profiles")]
    TeamProfiles(NFLTeamProfilesResponse),
    #[serde(rename = "headshots")]
    Headshots(NFLHeadshotsResponse),
    #[serde(rename = "game_by_date")]
    GameByDate(NFLGameByDateResponse),
    #[serde(rename = "play_by_play")]
    PlayByPlay(Box<NFLPlayByPlayResponse>),
    #[serde(rename = "scores")]
    Scores(NFLScoresResponse),
    #[serde(rename = "stadiums")]
    Stadiums(NFLStadiumsResponse),
    #[serde(rename = "box_score")]
    BoxScore(NFLBoxScoreResponse),
}
