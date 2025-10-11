use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFLStadiumDetails {
    #[serde(rename = "StadiumID")]
    pub stadium_id: i32,

    #[serde(rename = "Name")]
    pub name: String,

    #[serde(rename = "City")]
    pub city: String,

    #[serde(rename = "State")]
    pub state: Option<String>,

    #[serde(rename = "Country")]
    pub country: String,

    #[serde(rename = "Capacity")]
    pub capacity: i32,

    #[serde(rename = "PlayingSurface")]
    pub playing_surface: String,

    #[serde(rename = "GeoLat")]
    pub geo_lat: Option<f64>,

    #[serde(rename = "GeoLong")]
    pub geo_long: Option<f64>,

    #[serde(rename = "Type")]
    pub r#type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFLScheduleGame {
    #[serde(rename = "GameKey")]
    pub game_key: String,

    #[serde(rename = "SeasonType")]
    pub season_type: i32,

    #[serde(rename = "Season")]
    pub season: i32,

    #[serde(rename = "Week")]
    pub week: i32,

    #[serde(rename = "Date")]
    pub date: String,

    #[serde(rename = "AwayTeam")]
    pub away_team: String,

    #[serde(rename = "HomeTeam")]
    pub home_team: String,

    #[serde(rename = "Channel")]
    pub channel: Option<String>,

    #[serde(rename = "PointSpread")]
    pub point_spread: Option<f64>,

    #[serde(rename = "OverUnder")]
    pub over_under: Option<f64>,

    #[serde(rename = "StadiumID")]
    pub stadium_id: Option<i32>,

    #[serde(rename = "Canceled")]
    pub canceled: bool,

    #[serde(rename = "GeoLat")]
    pub geo_lat: Option<f64>,

    #[serde(rename = "GeoLong")]
    pub geo_long: Option<f64>,

    #[serde(rename = "ForecastTempLow")]
    pub forecast_temp_low: Option<i32>,

    #[serde(rename = "ForecastTempHigh")]
    pub forecast_temp_high: Option<i32>,

    #[serde(rename = "ForecastDescription")]
    pub forecast_description: Option<String>,

    #[serde(rename = "ForecastWindChill")]
    pub forecast_wind_chill: Option<i32>,

    #[serde(rename = "ForecastWindSpeed")]
    pub forecast_wind_speed: Option<i32>,

    #[serde(rename = "AwayTeamMoneyLine")]
    pub away_team_money_line: Option<i32>,

    #[serde(rename = "HomeTeamMoneyLine")]
    pub home_team_money_line: Option<i32>,

    #[serde(rename = "Day")]
    pub day: String,

    #[serde(rename = "DateTime")]
    pub date_time: String,

    #[serde(rename = "GlobalGameID")]
    pub global_game_id: i64,

    #[serde(rename = "GlobalAwayTeamID")]
    pub global_away_team_id: i64,

    #[serde(rename = "GlobalHomeTeamID")]
    pub global_home_team_id: i64,

    #[serde(rename = "ScoreID")]
    pub score_id: i64,

    #[serde(rename = "Status")]
    pub status: String,

    #[serde(rename = "IsClosed")]
    pub is_closed: Option<bool>,

    #[serde(rename = "DateTimeUTC")]
    pub date_time_utc: String,

    #[serde(rename = "StadiumDetails")]
    pub stadium_details: Option<NFLStadiumDetails>,
}

// NFLScheduleResponse removed - use Vec<NFLScheduleGame> directly
