use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NBARollingInsightsScheduleGame {
    pub away_team: String,
    pub home_team: String,
    #[serde(rename = "away_team_ID")]
    pub away_team_id: i32,
    #[serde(rename = "home_team_ID")]
    pub home_team_id: i32,
    #[serde(rename = "game_ID")]
    pub game_id: String,
    #[serde(rename = "game_time")]
    pub game_time: String,
    #[serde(rename = "season_type")]
    pub season_type: String,
    #[serde(rename = "event_name")]
    pub event_name: Option<String>,
    pub round: Option<String>,
    pub season: String,
    pub status: String,
    pub broadcast: Option<String>,
}
