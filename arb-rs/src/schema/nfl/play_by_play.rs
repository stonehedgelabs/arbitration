use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayByPlay {
    #[serde(rename = "GameKey")]
    pub game_key: String,

    #[serde(rename = "PlayID")]
    pub play_id: i32,

    #[serde(rename = "Quarter")]
    pub quarter: i32,

    #[serde(rename = "TimeRemaining")]
    pub time_remaining: String,

    #[serde(rename = "Down")]
    pub down: Option<i32>,

    #[serde(rename = "Distance")]
    pub distance: Option<i32>,

    #[serde(rename = "YardLine")]
    pub yard_line: Option<i32>,

    #[serde(rename = "YardLineTerritory")]
    pub yard_line_territory: Option<String>,

    #[serde(rename = "YardsToGo")]
    pub yards_to_go: Option<i32>,

    #[serde(rename = "RedZone")]
    pub red_zone: bool,

    #[serde(rename = "GoalToGo")]
    pub goal_to_go: bool,

    #[serde(rename = "PlayType")]
    pub play_type: Option<String>,

    #[serde(rename = "Description")]
    pub description: String,

    #[serde(rename = "AwayTeamScore")]
    pub away_team_score: i32,

    #[serde(rename = "HomeTeamScore")]
    pub home_team_score: i32,

    #[serde(rename = "Season")]
    pub season: i32,

    #[serde(rename = "Week")]
    pub week: i32,

    #[serde(rename = "Date")]
    pub date: String,
}

pub type PlayByPlayData = Vec<PlayByPlay>;
