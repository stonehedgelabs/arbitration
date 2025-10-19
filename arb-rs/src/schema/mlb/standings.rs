use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "PascalCase")]
pub struct MLBStanding {
    pub season: i32,
    pub season_type: i32,
    #[serde(rename = "TeamID")]
    pub team_id: i32,
    pub key: String,
    pub city: Option<String>,
    pub name: String,
    pub league: String,
    pub division: String,
    pub wins: i32,
    pub losses: i32,
    pub percentage: f64,
    pub division_wins: i32,
    pub division_losses: i32,
    pub games_behind: Option<f64>,
    pub last_ten_games_wins: i32,
    pub last_ten_games_losses: i32,
    pub streak: Option<String>,
    pub league_rank: i32,
    pub division_rank: i32,
    pub wild_card_rank: Option<i32>,
    pub wild_card_games_behind: Option<f64>,
    pub home_wins: i32,
    pub home_losses: i32,
    pub away_wins: i32,
    pub away_losses: i32,
    pub day_wins: Option<i32>,
    pub day_losses: Option<i32>,
    pub night_wins: Option<i32>,
    pub night_losses: Option<i32>,
    pub runs_scored: i32,
    pub runs_against: i32,
    #[serde(rename = "GlobalTeamID")]
    pub global_team_id: i32,
}

pub type MLBStandings = Vec<MLBStanding>;
