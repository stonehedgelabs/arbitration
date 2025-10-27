use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NBARollingInsightsPlayerProfile {
    #[serde(rename = "player_id")]
    pub player_id: i32,
    pub player: String,
    #[serde(rename = "team_id")]
    pub team_id: i32,
    pub team: String,
    pub number: i32,
    pub status: String,
    pub position: String,
    #[serde(rename = "position_category")]
    pub position_category: String,
    pub height: String,
    pub weight: i32,
    pub age: String,
    pub college: String,
}
