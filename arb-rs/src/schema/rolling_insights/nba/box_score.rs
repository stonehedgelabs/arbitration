use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NBARollingInsightsBoxScoreGame {
    pub round: Option<String>,
    pub sport: String,
    pub season: String,
    pub status: String,
    #[serde(rename = "game_ID")]
    pub game_id: String,
    #[serde(rename = "full_box")]
    pub full_box: FullBox,
    pub broadcast: Option<String>,
    #[serde(rename = "game_time")]
    pub game_time: String,
    #[serde(rename = "event_name")]
    pub event_name: Option<String>,
    #[serde(rename = "player_box")]
    pub player_box: PlayerBox,
    #[serde(rename = "game_status")]
    pub game_status: String,
    #[serde(rename = "season_type")]
    pub season_type: String,
    #[serde(rename = "game_location")]
    pub game_location: String,
    #[serde(rename = "away_team_name")]
    pub away_team_name: String,
    #[serde(rename = "home_team_name")]
    pub home_team_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FullBox {
    pub current: Current,
    #[serde(rename = "away_team")]
    pub away_team: TeamBox,
    #[serde(rename = "home_team")]
    pub home_team: TeamBox,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Current {
    #[serde(rename = "Quarter")]
    pub quarter: i32,
    #[serde(rename = "TimeRemaining")]
    pub time_remaining: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamBox {
    pub abbrv: String,
    pub score: i32,
    pub mascot: String,
    pub record: String,
    #[serde(rename = "team_id")]
    pub team_id: i32,
    #[serde(rename = "team_stats")]
    pub team_stats: TeamStats,
    #[serde(rename = "division_name")]
    pub division_name: String,
    #[serde(rename = "quarter_scores")]
    pub quarter_scores: std::collections::HashMap<String, i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamStats {
    pub fouls: i32,
    pub blocks: i32,
    pub steals: i32,
    pub assists: i32,
    pub turnovers: i32,
    #[serde(rename = "total_rebounds")]
    pub total_rebounds: i32,
    #[serde(rename = "two_points_made")]
    pub two_points_made: i32,
    #[serde(rename = "field_goals_made")]
    pub field_goals_made: i32,
    #[serde(rename = "free_throws_made")]
    pub free_throws_made: i32,
    #[serde(rename = "three_points_made")]
    pub three_points_made: i32,
    #[serde(rename = "defensive_rebounds")]
    pub defensive_rebounds: i32,
    #[serde(rename = "offensive_rebounds")]
    pub offensive_rebounds: i32,
    #[serde(rename = "two_point_percentage")]
    pub two_point_percentage: f64,
    #[serde(rename = "two_points_attempted")]
    pub two_points_attempted: i32,
    #[serde(rename = "field_goals_attempted")]
    pub field_goals_attempted: i32,
    #[serde(rename = "free_throws_attempted")]
    pub free_throws_attempted: i32,
    #[serde(rename = "three_points_attempted")]
    pub three_points_attempted: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerBox {
    #[serde(rename = "away_team")]
    pub away_team: std::collections::HashMap<String, PlayerStats>,
    #[serde(rename = "home_team")]
    pub home_team: std::collections::HashMap<String, PlayerStats>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerStats {
    pub fouls: i32,
    pub blocks: i32,
    pub player: String,
    pub points: i32,
    pub status: String,
    pub steals: i32,
    pub assists: i32,
    pub minutes: String,
    pub position: String,
    pub turnovers: i32,
    #[serde(rename = "total_rebounds")]
    pub total_rebounds: i32,
    #[serde(rename = "two_points_made")]
    pub two_points_made: i32,
    #[serde(rename = "field_goals_made")]
    pub field_goals_made: i32,
    #[serde(rename = "free_throws_made")]
    pub free_throws_made: i32,
    #[serde(rename = "three_points_made")]
    pub three_points_made: i32,
    #[serde(rename = "defensive_rebounds")]
    pub defensive_rebounds: i32,
    #[serde(rename = "offensive_rebounds")]
    pub offensive_rebounds: i32,
    #[serde(rename = "two_point_percentage")]
    pub two_point_percentage: f64,
    #[serde(rename = "two_points_attempted")]
    pub two_points_attempted: i32,
    #[serde(rename = "field_goals_attempted")]
    pub field_goals_attempted: i32,
    #[serde(rename = "free_throws_attempted")]
    pub free_throws_attempted: i32,
    #[serde(rename = "three_points_attempted")]
    pub three_points_attempted: i32,
}
