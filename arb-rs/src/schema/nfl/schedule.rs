use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StadiumDetails {
    #[serde(rename = "Capacity")]
    pub capacity: Option<i32>,

    #[serde(rename = "City")]
    pub city: Option<String>,

    #[serde(rename = "Country")]
    pub country: Option<String>,

    #[serde(rename = "GeoLat")]
    pub geo_lat: Option<f64>,

    #[serde(rename = "GeoLong")]
    pub geo_long: Option<f64>,

    #[serde(rename = "Name")]
    pub name: Option<String>,

    #[serde(rename = "PlayingSurface")]
    pub playing_surface: Option<String>,

    #[serde(rename = "StadiumID")]
    pub stadium_id: Option<i32>,

    #[serde(rename = "State")]
    pub state: Option<String>,

    #[serde(rename = "Type")]
    pub stadium_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Game {
    #[serde(rename = "AwayTeam")]
    pub away_team: String,

    #[serde(rename = "AwayTeamMoneyLine")]
    pub away_team_money_line: Option<i32>,

    #[serde(rename = "Canceled")]
    pub canceled: bool,

    #[serde(rename = "Channel")]
    pub channel: Option<String>,

    #[serde(rename = "Date")]
    pub date: String,

    #[serde(rename = "DateTime")]
    pub date_time: String,

    #[serde(rename = "DateTimeUTC")]
    pub date_time_utc: String,

    #[serde(rename = "Day")]
    pub day: String,

    #[serde(rename = "ForecastDescription")]
    pub forecast_description: Option<String>,

    #[serde(rename = "ForecastTempHigh")]
    pub forecast_temp_high: Option<i32>,

    #[serde(rename = "ForecastTempLow")]
    pub forecast_temp_low: Option<i32>,

    #[serde(rename = "ForecastWindChill")]
    pub forecast_wind_chill: Option<i32>,

    #[serde(rename = "ForecastWindSpeed")]
    pub forecast_wind_speed: Option<i32>,

    #[serde(rename = "GameKey")]
    pub game_key: String,

    #[serde(rename = "GeoLat")]
    pub geo_lat: Option<f64>,

    #[serde(rename = "GeoLong")]
    pub geo_long: Option<f64>,

    #[serde(rename = "GlobalAwayTeamID")]
    pub global_away_team_id: i32,

    #[serde(rename = "GlobalGameID")]
    pub global_game_id: i32,

    #[serde(rename = "GlobalHomeTeamID")]
    pub global_home_team_id: i32,

    #[serde(rename = "HomeTeam")]
    pub home_team: String,

    #[serde(rename = "HomeTeamMoneyLine")]
    pub home_team_money_line: Option<i32>,

    #[serde(rename = "IsClosed")]
    pub is_closed: Option<bool>,

    #[serde(rename = "OverUnder")]
    pub over_under: Option<f64>,

    #[serde(rename = "PointSpread")]
    pub point_spread: Option<f64>,

    #[serde(rename = "ScoreID")]
    pub score_id: i32,

    #[serde(rename = "Season")]
    pub season: i32,

    #[serde(rename = "SeasonType")]
    pub season_type: i32,

    #[serde(rename = "StadiumDetails")]
    pub stadium_details: Option<StadiumDetails>,

    #[serde(rename = "StadiumID")]
    pub stadium_id: Option<i32>,

    #[serde(rename = "Status")]
    pub status: Option<String>,

    #[serde(rename = "Week")]
    pub week: i32,
}

pub type Schedule = Vec<Game>;
