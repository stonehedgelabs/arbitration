use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PregameOdd {
    #[serde(rename = "GameOddId")]
    pub game_odd_id: i64,
    #[serde(rename = "Sportsbook")]
    pub sportsbook: String,
    #[serde(rename = "GameId")]
    pub game_id: i64,
    #[serde(rename = "Created")]
    pub created: String,
    #[serde(rename = "Updated")]
    pub updated: String,
    #[serde(rename = "HomeMoneyLine")]
    pub home_money_line: Option<i32>,
    #[serde(rename = "AwayMoneyLine")]
    pub away_money_line: Option<i32>,
    #[serde(rename = "HomePointSpread")]
    pub home_point_spread: Option<f64>,
    #[serde(rename = "AwayPointSpread")]
    pub away_point_spread: Option<f64>,
    #[serde(rename = "HomePointSpreadPayout")]
    pub home_point_spread_payout: Option<i32>,
    #[serde(rename = "AwayPointSpreadPayout")]
    pub away_point_spread_payout: Option<i32>,
    #[serde(rename = "OverUnder")]
    pub over_under: Option<f64>,
    #[serde(rename = "OverPayout")]
    pub over_payout: Option<i32>,
    #[serde(rename = "UnderPayout")]
    pub under_payout: Option<i32>,
    #[serde(rename = "SportsbookId")]
    pub sportsbook_id: i32,
    #[serde(rename = "SportsbookUrl")]
    pub sportsbook_url: Option<String>,
    #[serde(rename = "OddType")]
    pub odd_type: String,
    #[serde(rename = "Unlisted")]
    pub unlisted: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LiveOdd {
    #[serde(rename = "GameOddId")]
    pub game_odd_id: i64,
    #[serde(rename = "Sportsbook")]
    pub sportsbook: String,
    #[serde(rename = "GameId")]
    pub game_id: i64,
    #[serde(rename = "Created")]
    pub created: String,
    #[serde(rename = "Updated")]
    pub updated: String,
    #[serde(rename = "HomeMoneyLine")]
    pub home_money_line: Option<i32>,
    #[serde(rename = "AwayMoneyLine")]
    pub away_money_line: Option<i32>,
    #[serde(rename = "HomePointSpread")]
    pub home_point_spread: Option<f64>,
    #[serde(rename = "AwayPointSpread")]
    pub away_point_spread: Option<f64>,
    #[serde(rename = "HomePointSpreadPayout")]
    pub home_point_spread_payout: Option<i32>,
    #[serde(rename = "AwayPointSpreadPayout")]
    pub away_point_spread_payout: Option<i32>,
    #[serde(rename = "OverUnder")]
    pub over_under: Option<f64>,
    #[serde(rename = "OverPayout")]
    pub over_payout: Option<i32>,
    #[serde(rename = "UnderPayout")]
    pub under_payout: Option<i32>,
    #[serde(rename = "SportsbookId")]
    pub sportsbook_id: i32,
    #[serde(rename = "SportsbookUrl")]
    pub sportsbook_url: Option<String>,
    #[serde(rename = "OddType")]
    pub odd_type: String,
    #[serde(rename = "Unlisted")]
    pub unlisted: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlternateMarketPregameOdd {
    #[serde(rename = "GameOddId")]
    pub game_odd_id: i64,
    #[serde(rename = "Sportsbook")]
    pub sportsbook: String,
    #[serde(rename = "GameId")]
    pub game_id: i64,
    #[serde(rename = "Created")]
    pub created: String,
    #[serde(rename = "Updated")]
    pub updated: String,
    #[serde(rename = "HomeMoneyLine")]
    pub home_money_line: Option<i32>,
    #[serde(rename = "AwayMoneyLine")]
    pub away_money_line: Option<i32>,
    #[serde(rename = "HomePointSpread")]
    pub home_point_spread: Option<f64>,
    #[serde(rename = "AwayPointSpread")]
    pub away_point_spread: Option<f64>,
    #[serde(rename = "HomePointSpreadPayout")]
    pub home_point_spread_payout: Option<i32>,
    #[serde(rename = "AwayPointSpreadPayout")]
    pub away_point_spread_payout: Option<i32>,
    #[serde(rename = "OverUnder")]
    pub over_under: Option<f64>,
    #[serde(rename = "OverPayout")]
    pub over_payout: Option<i32>,
    #[serde(rename = "UnderPayout")]
    pub under_payout: Option<i32>,
    #[serde(rename = "SportsbookId")]
    pub sportsbook_id: i32,
    #[serde(rename = "SportsbookUrl")]
    pub sportsbook_url: Option<String>,
    #[serde(rename = "OddType")]
    pub odd_type: String,
    #[serde(rename = "Unlisted")]
    pub unlisted: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameOdds {
    #[serde(rename = "GameId")]
    pub game_id: i64,
    #[serde(rename = "Season")]
    pub season: i32,
    #[serde(rename = "SeasonType")]
    pub season_type: i32,
    #[serde(rename = "Day")]
    pub day: String,
    #[serde(rename = "DateTime")]
    pub date_time: String,
    #[serde(rename = "Status")]
    pub status: String,
    #[serde(rename = "AwayTeamId")]
    pub away_team_id: i32,
    #[serde(rename = "HomeTeamId")]
    pub home_team_id: i32,
    #[serde(rename = "AwayTeamName")]
    pub away_team_name: String,
    #[serde(rename = "HomeTeamName")]
    pub home_team_name: String,
    #[serde(rename = "GlobalGameId")]
    pub global_game_id: i64,
    #[serde(rename = "GlobalAwayTeamId")]
    pub global_away_team_id: i64,
    #[serde(rename = "GlobalHomeTeamId")]
    pub global_home_team_id: i64,
    #[serde(rename = "HomeTeamScore")]
    pub home_team_score: Option<i32>,
    #[serde(rename = "AwayTeamScore")]
    pub away_team_score: Option<i32>,
    #[serde(rename = "TotalScore")]
    pub total_score: Option<i32>,
    #[serde(rename = "HomeRotationNumber")]
    pub home_rotation_number: i32,
    #[serde(rename = "AwayRotationNumber")]
    pub away_rotation_number: i32,
    #[serde(rename = "PregameOdds")]
    pub pregame_odds: Vec<PregameOdd>,
    #[serde(rename = "LiveOdds")]
    pub live_odds: Vec<LiveOdd>,
    #[serde(rename = "AlternateMarketPregameOdds")]
    pub alternate_market_pregame_odds: Vec<AlternateMarketPregameOdd>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OddsByDateResponse {
    pub league: String,
    pub date: String,
    pub data: Vec<GameOdds>,
    pub games_count: usize,
}

impl OddsByDateResponse {
    pub fn from_json(
        data: serde_json::Value,
        league: String,
        date: String,
    ) -> Result<Self, serde_json::Error> {
        let game_odds: Vec<GameOdds> = serde_json::from_value(data)?;
        let games_count = game_odds.len();

        Ok(OddsByDateResponse {
            league,
            date,
            data: game_odds,
            games_count,
        })
    }
}
