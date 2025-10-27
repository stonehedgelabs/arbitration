use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "PascalCase")]
pub struct NFLStanding {
    pub season_type: i32,
    pub season: i32,
    pub conference: String,
    pub division: String,
    pub team: String,
    pub name: String,
    pub wins: i32,
    pub losses: i32,
    pub ties: i32,
    pub percentage: f64,
    pub points_for: i32,
    pub points_against: i32,
    pub net_points: i32,
    pub touchdowns: i32,
    pub division_wins: i32,
    pub division_losses: i32,
    pub conference_wins: i32,
    pub conference_losses: i32,
    #[serde(rename = "TeamID")]
    pub team_id: i32,
    pub division_ties: i32,
    pub conference_ties: i32,
    #[serde(rename = "GlobalTeamID")]
    pub global_team_id: i32,
    pub division_rank: i32,
    pub conference_rank: i32,
    pub home_wins: i32,
    pub home_losses: i32,
    pub home_ties: i32,
    pub away_wins: i32,
    pub away_losses: i32,
    pub away_ties: i32,
    pub streak: i32,
}

pub type NFLStandings = Vec<NFLStanding>;
