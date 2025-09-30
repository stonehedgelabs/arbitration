use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Game {
    #[serde(rename = "AwayTeam")]
    pub away_team: String,
    
    #[serde(rename = "HomeTeam")]
    pub home_team: String,
    
    #[serde(rename = "Date")]
    pub date: String,
    
    #[serde(rename = "DateTime")]
    pub date_time: String,
    
    #[serde(rename = "GameKey")]
    pub game_key: String,
    
    #[serde(rename = "Season")]
    pub season: i32,
    
    #[serde(rename = "SeasonType")]
    pub season_type: i32,
    
    #[serde(rename = "StadiumID")]
    pub stadium_id: Option<i32>,
}

pub type Schedule = Vec<Game>;
