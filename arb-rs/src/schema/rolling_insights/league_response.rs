use serde::{Deserialize, Serialize};

use super::{
    data_type::DataType,
    nba::{
        box_score::NBARollingInsightsBoxScoreGame,
        player_profile::NBARollingInsightsPlayerProfile,
        schedule::NBARollingInsightsScheduleGame,
        team_profile::NBARollingInsightsTeamProfile,
    },
};

/// Generic response wrapper for different leagues from Rolling Insights
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RollingInsightsLeagueResponse {
    pub league: String,
    pub data_type: DataType,
    pub data: RollingInsightsLeagueData,
    pub filtered_count: usize,
    pub total_count: usize,
}

/// League-specific data types from Rolling Insights
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum RollingInsightsLeagueData {
    Nba(Box<NBARollingInsightsData>),
}

/// NBA-specific data types from Rolling Insights
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum NBARollingInsightsData {
    Schedule(Vec<NBARollingInsightsScheduleGame>),
    CurrentGames(Vec<NBARollingInsightsScheduleGame>),
    TeamProfiles(Vec<NBARollingInsightsTeamProfile>),
    PlayerProfiles(Vec<NBARollingInsightsPlayerProfile>),
    BoxScore(Vec<NBARollingInsightsBoxScoreGame>),
}
