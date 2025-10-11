use serde::{Deserialize, Serialize};

use crate::schema::{
    data_type::DataType,
    mlb::{
        box_score::BoxScore, game_by_date::GameByDateResponse, odds::OddsByDateResponse,
        schedule::MLBScheduleGame, stadiums::Stadium, teams::TeamProfiles,
    },
    nba::{
        box_score::NBABoxScoreResponse, headshots::PlayerHeadshots,
        play_by_play::NBAPlayByPlayResponse, schedule::NBAScheduleGame,
        stadiums::NBAStadium, teams::NBATeamProfile,
    },
    nfl::{
        box_score::{NFLBoxScoreByScoreIDV3Response, NFLBoxScoreGame},
        game_by_date::NFLGameByDate,
        headshots::NFLHeadshot,
        play_by_play::NFLPlayByPlayResponse,
        schedule::NFLScheduleGame,
        scores::NFLScoresGame,
        stadiums::NFLStadium,
        teams::NFLTeamProfile,
    },
};

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
#[serde(untagged)]
pub enum LeagueData {
    Mlb(Box<MLBData>),
    Nba(Box<NBAData>),
    Nfl(Box<NFLData>),
}

/// MLB-specific data types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum MLBData {
    Schedule(Vec<MLBScheduleGame>),
    CurrentGames(Vec<MLBScheduleGame>),
    TeamProfiles(TeamProfiles),
    Headshots(serde_json::Value), // MLB headshots uses generic JSON
    Stadiums(Vec<Stadium>),
    BoxScore(BoxScore),
    PlayByPlay(serde_json::Value),
    Odds(OddsByDateResponse),
    GameByDate(GameByDateResponse),
    Scores(serde_json::Value), // MLB scores uses generic JSON
}

/// NBA-specific data types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum NBAData {
    Schedule(Vec<NBAScheduleGame>),
    CurrentGames(Vec<NBAScheduleGame>),
    Stadiums(Vec<NBAStadium>),
    TeamProfiles(Vec<NBATeamProfile>),
    Headshots(PlayerHeadshots),
    PlayByPlay(NBAPlayByPlayResponse),
    Scores(Vec<NBAScheduleGame>),
    BoxScore(NBABoxScoreResponse),
}

/// NFL-specific data types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum NFLData {
    Schedule(Vec<NFLScheduleGame>),
    CurrentGames(Vec<NFLScheduleGame>),
    TeamProfiles(Vec<NFLTeamProfile>),
    Headshots(Vec<NFLHeadshot>),
    GameByDate(Vec<NFLGameByDate>),
    PlayByPlay(Box<NFLPlayByPlayResponse>),
    Scores(Vec<NFLScoresGame>),
    Stadiums(Vec<NFLStadium>),
    BoxScore(Vec<NFLBoxScoreGame>),
    BoxScoreByScoreIDV3(Box<NFLBoxScoreByScoreIDV3Response>),
}
