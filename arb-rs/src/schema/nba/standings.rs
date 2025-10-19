use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "PascalCase")]
pub struct NBAStanding {
    pub season: i32,
    pub season_type: i32,
    #[serde(rename = "TeamID")]
    pub team_id: i32,
    pub key: String,
    pub city: String,
    pub name: String,
    pub conference: String,
    pub division: String,
    pub wins: i32,
    pub losses: i32,
    pub percentage: f64,
    pub conference_wins: i32,
    pub conference_losses: i32,
    pub division_wins: i32,
    pub division_losses: i32,
    pub home_wins: i32,
    pub home_losses: i32,
    pub away_wins: i32,
    pub away_losses: i32,
    pub last_ten_wins: i32,
    pub last_ten_losses: i32,
    pub points_per_game_for: f64,
    pub points_per_game_against: f64,
    pub streak: i32,
    pub games_back: f64,
    pub streak_description: String,
    #[serde(rename = "GlobalTeamID")]
    pub global_team_id: i32,
    pub conference_rank: i32,
    pub division_rank: i32,
}

pub type NBAStandings = Vec<NBAStanding>;
