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
    pub state: String,

    #[serde(rename = "Country")]
    pub country: String,

    #[serde(rename = "Capacity")]
    pub capacity: i32,

    #[serde(rename = "PlayingSurface")]
    pub playing_surface: String,

    #[serde(rename = "GeoLat")]
    pub geo_lat: f64,

    #[serde(rename = "GeoLong")]
    pub geo_long: f64,

    #[serde(rename = "Type")]
    pub r#type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFLScoresGame {
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

    #[serde(rename = "AwayScore")]
    pub away_score: i32,

    #[serde(rename = "HomeScore")]
    pub home_score: i32,

    #[serde(rename = "Channel")]
    pub channel: String,

    #[serde(rename = "PointSpread")]
    pub point_spread: f64,

    #[serde(rename = "OverUnder")]
    pub over_under: f64,

    #[serde(rename = "Quarter")]
    pub quarter: String,

    #[serde(rename = "TimeRemaining")]
    pub time_remaining: Option<String>,

    #[serde(rename = "Possession")]
    pub possession: Option<String>,

    #[serde(rename = "Down")]
    pub down: Option<i32>,

    #[serde(rename = "Distance")]
    pub distance: String,

    #[serde(rename = "YardLine")]
    pub yard_line: Option<i32>,

    #[serde(rename = "YardLineTerritory")]
    pub yard_line_territory: String,

    #[serde(rename = "RedZone")]
    pub red_zone: Option<bool>,

    #[serde(rename = "AwayScoreQuarter1")]
    pub away_score_quarter1: i32,

    #[serde(rename = "AwayScoreQuarter2")]
    pub away_score_quarter2: i32,

    #[serde(rename = "AwayScoreQuarter3")]
    pub away_score_quarter3: i32,

    #[serde(rename = "AwayScoreQuarter4")]
    pub away_score_quarter4: i32,

    #[serde(rename = "AwayScoreOvertime")]
    pub away_score_overtime: i32,

    #[serde(rename = "HomeScoreQuarter1")]
    pub home_score_quarter1: i32,

    #[serde(rename = "HomeScoreQuarter2")]
    pub home_score_quarter2: i32,

    #[serde(rename = "HomeScoreQuarter3")]
    pub home_score_quarter3: i32,

    #[serde(rename = "HomeScoreQuarter4")]
    pub home_score_quarter4: i32,

    #[serde(rename = "HomeScoreOvertime")]
    pub home_score_overtime: i32,

    #[serde(rename = "HasStarted")]
    pub has_started: bool,

    #[serde(rename = "IsInProgress")]
    pub is_in_progress: bool,

    #[serde(rename = "IsOver")]
    pub is_over: bool,

    #[serde(rename = "Has1stQuarterStarted")]
    pub has_1st_quarter_started: bool,

    #[serde(rename = "Has2ndQuarterStarted")]
    pub has_2nd_quarter_started: bool,

    #[serde(rename = "Has3rdQuarterStarted")]
    pub has_3rd_quarter_started: bool,

    #[serde(rename = "Has4thQuarterStarted")]
    pub has_4th_quarter_started: bool,

    #[serde(rename = "IsOvertime")]
    pub is_overtime: bool,

    #[serde(rename = "DownAndDistance")]
    pub down_and_distance: Option<String>,

    #[serde(rename = "QuarterDescription")]
    pub quarter_description: String,

    #[serde(rename = "StadiumID")]
    pub stadium_id: i32,

    #[serde(rename = "LastUpdated")]
    pub last_updated: String,

    #[serde(rename = "GeoLat")]
    pub geo_lat: Option<f64>,

    #[serde(rename = "GeoLong")]
    pub geo_long: Option<f64>,

    #[serde(rename = "ForecastTempLow")]
    pub forecast_temp_low: i32,

    #[serde(rename = "ForecastTempHigh")]
    pub forecast_temp_high: i32,

    #[serde(rename = "ForecastDescription")]
    pub forecast_description: String,

    #[serde(rename = "ForecastWindChill")]
    pub forecast_wind_chill: i32,

    #[serde(rename = "ForecastWindSpeed")]
    pub forecast_wind_speed: i32,

    #[serde(rename = "AwayTeamMoneyLine")]
    pub away_team_money_line: i32,

    #[serde(rename = "HomeTeamMoneyLine")]
    pub home_team_money_line: i32,

    #[serde(rename = "Canceled")]
    pub canceled: bool,

    #[serde(rename = "Closed")]
    pub closed: bool,

    #[serde(rename = "LastPlay")]
    pub last_play: String,

    #[serde(rename = "Day")]
    pub day: String,

    #[serde(rename = "DateTime")]
    pub date_time: String,

    #[serde(rename = "AwayTeamID")]
    pub away_team_id: i32,

    #[serde(rename = "HomeTeamID")]
    pub home_team_id: i32,

    #[serde(rename = "GlobalGameID")]
    pub global_game_id: i64,

    #[serde(rename = "GlobalAwayTeamID")]
    pub global_away_team_id: i64,

    #[serde(rename = "GlobalHomeTeamID")]
    pub global_home_team_id: i64,

    #[serde(rename = "PointSpreadAwayTeamMoneyLine")]
    pub point_spread_away_team_money_line: i32,

    #[serde(rename = "PointSpreadHomeTeamMoneyLine")]
    pub point_spread_home_team_money_line: i32,

    #[serde(rename = "ScoreID")]
    pub score_id: i64,

    #[serde(rename = "Status")]
    pub status: String,

    #[serde(rename = "GameEndDateTime")]
    pub game_end_date_time: String,

    #[serde(rename = "HomeRotationNumber")]
    pub home_rotation_number: i32,

    #[serde(rename = "AwayRotationNumber")]
    pub away_rotation_number: i32,

    #[serde(rename = "NeutralVenue")]
    pub neutral_venue: bool,

    #[serde(rename = "RefereeID")]
    pub referee_id: i32,

    #[serde(rename = "OverPayout")]
    pub over_payout: i32,

    #[serde(rename = "UnderPayout")]
    pub under_payout: i32,

    #[serde(rename = "HomeTimeouts")]
    pub home_timeouts: Option<i32>,

    #[serde(rename = "AwayTimeouts")]
    pub away_timeouts: Option<i32>,

    #[serde(rename = "DateTimeUTC")]
    pub date_time_utc: String,

    #[serde(rename = "Attendance")]
    pub attendance: i32,

    #[serde(rename = "IsClosed")]
    pub is_closed: bool,

    #[serde(rename = "StadiumDetails")]
    pub stadium_details: NFLStadiumDetails,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFLScoresResponse {
    pub data: Vec<NFLScoresGame>,
    pub league: String,
}
