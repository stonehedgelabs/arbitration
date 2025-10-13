use serde::{Deserialize, Deserializer, Serialize};
use serde_json;

fn deserialize_optional_bool_or_string<'de, D>(
    deserializer: D,
) -> Result<Option<bool>, D::Error>
where
    D: Deserializer<'de>,
{
    let value = serde_json::Value::deserialize(deserializer)?;
    match value {
        serde_json::Value::Bool(b) => Ok(Some(b)),
        serde_json::Value::String(_) => Ok(None), // Ignore string values like team abbreviations
        serde_json::Value::Null => Ok(None),
        _ => Err(serde::de::Error::custom(
            "Expected boolean, string, or null for optional boolean field",
        )),
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default)]
pub struct NFLStadiumDetails {
    #[serde(rename = "StadiumID")]
    pub stadium_id: Option<i32>,
    #[serde(rename = "Name")]
    pub name: Option<String>,
    #[serde(rename = "City")]
    pub city: Option<String>,
    #[serde(rename = "State")]
    pub state: Option<String>,
    #[serde(rename = "Country")]
    pub country: Option<String>,
    #[serde(rename = "Capacity")]
    pub capacity: Option<i32>,
    #[serde(rename = "PlayingSurface")]
    pub playing_surface: Option<String>,
    #[serde(rename = "GeoLat")]
    pub geo_lat: Option<f64>,
    #[serde(rename = "GeoLong")]
    pub geo_long: Option<f64>,
    #[serde(rename = "Type")]
    pub stadium_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default)]
pub struct NFLBoxScoreGame {
    #[serde(rename = "GameKey")]
    pub game_key: Option<String>,
    #[serde(rename = "SeasonType")]
    pub season_type: Option<i32>,
    #[serde(rename = "Season")]
    pub season: Option<i32>,
    #[serde(rename = "Week")]
    pub week: Option<i32>,
    #[serde(rename = "Date")]
    pub date: Option<String>,
    #[serde(rename = "AwayTeam")]
    pub away_team: Option<String>,
    #[serde(rename = "HomeTeam")]
    pub home_team: Option<String>,
    #[serde(rename = "AwayScore")]
    pub away_score: Option<i32>,
    #[serde(rename = "HomeScore")]
    pub home_score: Option<i32>,
    #[serde(rename = "Channel")]
    pub channel: Option<String>,
    #[serde(rename = "PointSpread")]
    pub point_spread: Option<f64>,
    #[serde(rename = "OverUnder")]
    pub over_under: Option<f64>,
    #[serde(rename = "Quarter")]
    pub quarter: Option<String>,
    #[serde(rename = "TimeRemaining")]
    pub time_remaining: Option<String>,
    #[serde(rename = "Possession")]
    pub possession: Option<String>,
    #[serde(rename = "Down")]
    pub down: Option<i32>,
    #[serde(rename = "Distance")]
    pub distance: Option<String>,
    #[serde(rename = "YardLine")]
    pub yard_line: Option<i32>,
    #[serde(rename = "YardLineTerritory")]
    pub yard_line_territory: Option<String>,
    #[serde(
        rename = "RedZone",
        deserialize_with = "deserialize_optional_bool_or_string"
    )]
    pub red_zone: Option<bool>,
    #[serde(rename = "AwayScoreQuarter1")]
    pub away_score_quarter1: Option<i32>,
    #[serde(rename = "AwayScoreQuarter2")]
    pub away_score_quarter2: Option<i32>,
    #[serde(rename = "AwayScoreQuarter3")]
    pub away_score_quarter3: Option<i32>,
    #[serde(rename = "AwayScoreQuarter4")]
    pub away_score_quarter4: Option<i32>,
    #[serde(rename = "AwayScoreOvertime")]
    pub away_score_overtime: Option<i32>,
    #[serde(rename = "HomeScoreQuarter1")]
    pub home_score_quarter1: Option<i32>,
    #[serde(rename = "HomeScoreQuarter2")]
    pub home_score_quarter2: Option<i32>,
    #[serde(rename = "HomeScoreQuarter3")]
    pub home_score_quarter3: Option<i32>,
    #[serde(rename = "HomeScoreQuarter4")]
    pub home_score_quarter4: Option<i32>,
    #[serde(rename = "HomeScoreOvertime")]
    pub home_score_overtime: Option<i32>,
    #[serde(
        rename = "HasStarted",
        deserialize_with = "deserialize_optional_bool_or_string"
    )]
    pub has_started: Option<bool>,
    #[serde(
        rename = "IsInProgress",
        deserialize_with = "deserialize_optional_bool_or_string"
    )]
    pub is_in_progress: Option<bool>,
    #[serde(
        rename = "IsOver",
        deserialize_with = "deserialize_optional_bool_or_string"
    )]
    pub is_over: Option<bool>,
    #[serde(
        rename = "Has1stQuarterStarted",
        deserialize_with = "deserialize_optional_bool_or_string"
    )]
    pub has_1st_quarter_started: Option<bool>,
    #[serde(
        rename = "Has2ndQuarterStarted",
        deserialize_with = "deserialize_optional_bool_or_string"
    )]
    pub has_2nd_quarter_started: Option<bool>,
    #[serde(
        rename = "Has3rdQuarterStarted",
        deserialize_with = "deserialize_optional_bool_or_string"
    )]
    pub has_3rd_quarter_started: Option<bool>,
    #[serde(
        rename = "Has4thQuarterStarted",
        deserialize_with = "deserialize_optional_bool_or_string"
    )]
    pub has_4th_quarter_started: Option<bool>,
    #[serde(
        rename = "IsOvertime",
        deserialize_with = "deserialize_optional_bool_or_string"
    )]
    pub is_overtime: Option<bool>,
    #[serde(rename = "DownAndDistance")]
    pub down_and_distance: Option<String>,
    #[serde(rename = "QuarterDescription")]
    pub quarter_description: Option<String>,
    #[serde(rename = "StadiumID")]
    pub stadium_id: Option<i32>,
    #[serde(rename = "LastUpdated")]
    pub last_updated: Option<String>,
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
    #[serde(
        rename = "Canceled",
        deserialize_with = "deserialize_optional_bool_or_string"
    )]
    pub canceled: Option<bool>,
    #[serde(
        rename = "Closed",
        deserialize_with = "deserialize_optional_bool_or_string"
    )]
    pub closed: Option<bool>,
    #[serde(rename = "LastPlay")]
    pub last_play: Option<String>,
    #[serde(rename = "Day")]
    pub day: Option<String>,
    #[serde(rename = "DateTime")]
    pub date_time: Option<String>,
    #[serde(rename = "AwayTeamID")]
    pub away_team_id: Option<i32>,
    #[serde(rename = "HomeTeamID")]
    pub home_team_id: Option<i32>,
    #[serde(rename = "GlobalGameID")]
    pub global_game_id: Option<i64>,
    #[serde(rename = "GlobalAwayTeamID")]
    pub global_away_team_id: Option<i64>,
    #[serde(rename = "GlobalHomeTeamID")]
    pub global_home_team_id: Option<i64>,
    #[serde(rename = "PointSpreadAwayTeamMoneyLine")]
    pub point_spread_away_team_money_line: Option<i32>,
    #[serde(rename = "PointSpreadHomeTeamMoneyLine")]
    pub point_spread_home_team_money_line: Option<i32>,
    #[serde(rename = "ScoreID")]
    pub score_id: Option<i64>,
    #[serde(rename = "Status")]
    pub status: Option<String>,
    #[serde(rename = "GameEndDateTime")]
    pub game_end_date_time: Option<String>,
    #[serde(rename = "HomeRotationNumber")]
    pub home_rotation_number: Option<i32>,
    #[serde(rename = "AwayRotationNumber")]
    pub away_rotation_number: Option<i32>,
    #[serde(
        rename = "NeutralVenue",
        deserialize_with = "deserialize_optional_bool_or_string"
    )]
    pub neutral_venue: Option<bool>,
    #[serde(rename = "RefereeID")]
    pub referee_id: Option<i32>,
    #[serde(rename = "OverPayout")]
    pub over_payout: Option<i32>,
    #[serde(rename = "UnderPayout")]
    pub under_payout: Option<i32>,
    #[serde(rename = "HomeTimeouts")]
    pub home_timeouts: Option<i32>,
    #[serde(rename = "AwayTimeouts")]
    pub away_timeouts: Option<i32>,
    #[serde(rename = "DateTimeUTC")]
    pub date_time_utc: Option<String>,
    #[serde(rename = "Attendance")]
    pub attendance: Option<i32>,
    #[serde(
        rename = "IsClosed",
        deserialize_with = "deserialize_optional_bool_or_string"
    )]
    pub is_closed: Option<bool>,
    #[serde(rename = "StadiumDetails")]
    pub stadium_details: Option<NFLStadiumDetails>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default)]
pub struct NFLBoxScoreByScoreIDV3Response {
    #[serde(rename = "Score")]
    pub score: Option<NFLBoxScoreGame>,
    #[serde(rename = "Quarters")]
    pub quarters: Option<Vec<NFLBoxScoreQuarter>>,
    #[serde(rename = "TeamGames")]
    pub team_games: Option<Vec<NFLBoxScoreTeamGame>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default)]
pub struct NFLBoxScoreQuarter {
    #[serde(rename = "QuarterID")]
    pub quarter_id: Option<i32>,
    #[serde(rename = "ScoreID")]
    pub score_id: Option<i64>,
    #[serde(rename = "Number")]
    pub number: Option<i32>,
    #[serde(rename = "Name")]
    pub name: Option<String>,
    #[serde(rename = "Description")]
    pub description: Option<String>,
    #[serde(rename = "AwayTeamScore")]
    pub away_team_score: Option<i32>,
    #[serde(rename = "HomeTeamScore")]
    pub home_team_score: Option<i32>,
    #[serde(rename = "Updated")]
    pub updated: Option<String>,
    #[serde(rename = "Created")]
    pub created: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(default)]
pub struct NFLBoxScoreTeamGame {
    #[serde(rename = "GameKey")]
    pub game_key: Option<String>,
    #[serde(rename = "Date")]
    pub date: Option<String>,
    #[serde(rename = "SeasonType")]
    pub season_type: Option<i32>,
    #[serde(rename = "Season")]
    pub season: Option<i32>,
    #[serde(rename = "Week")]
    pub week: Option<i32>,
    #[serde(rename = "Team")]
    pub team: Option<String>,
    #[serde(rename = "Opponent")]
    pub opponent: Option<String>,
    #[serde(rename = "HomeOrAway")]
    pub home_or_away: Option<String>,
    #[serde(rename = "Score")]
    pub score: Option<i32>,
    #[serde(rename = "OpponentScore")]
    pub opponent_score: Option<i32>,
    #[serde(rename = "TotalScore")]
    pub total_score: Option<i32>,
    #[serde(rename = "Stadium")]
    pub stadium: Option<String>,
    #[serde(rename = "PlayingSurface")]
    pub playing_surface: Option<String>,
    #[serde(rename = "Temperature")]
    pub temperature: Option<i32>,
    #[serde(rename = "Humidity")]
    pub humidity: Option<i32>,
    #[serde(rename = "WindSpeed")]
    pub wind_speed: Option<i32>,
    #[serde(rename = "OverUnder")]
    pub over_under: Option<f64>,
    #[serde(rename = "PointSpread")]
    pub point_spread: Option<f64>,
    #[serde(rename = "ScoreQuarter1")]
    pub score_quarter1: Option<i32>,
    #[serde(rename = "ScoreQuarter2")]
    pub score_quarter2: Option<i32>,
    #[serde(rename = "ScoreQuarter3")]
    pub score_quarter3: Option<i32>,
    #[serde(rename = "ScoreQuarter4")]
    pub score_quarter4: Option<i32>,
    #[serde(rename = "ScoreOvertime")]
    pub score_overtime: Option<i32>,
    #[serde(rename = "TimeOfPossession")]
    pub time_of_possession: Option<String>,
    #[serde(rename = "FirstDowns")]
    pub first_downs: Option<i32>,
    #[serde(rename = "OffensivePlays")]
    pub offensive_plays: Option<i32>,
    #[serde(rename = "OffensiveYards")]
    pub offensive_yards: Option<i32>,
    #[serde(rename = "Touchdowns")]
    pub touchdowns: Option<i32>,
    #[serde(rename = "RushingAttempts")]
    pub rushing_attempts: Option<i32>,
    #[serde(rename = "RushingYards")]
    pub rushing_yards: Option<i32>,
    #[serde(rename = "RushingTouchdowns")]
    pub rushing_touchdowns: Option<i32>,
    #[serde(rename = "PassingAttempts")]
    pub passing_attempts: Option<i32>,
    #[serde(rename = "PassingCompletions")]
    pub passing_completions: Option<i32>,
    #[serde(rename = "PassingYards")]
    pub passing_yards: Option<i32>,
    #[serde(rename = "PassingTouchdowns")]
    pub passing_touchdowns: Option<i32>,
    #[serde(rename = "PassingInterceptions")]
    pub passing_interceptions: Option<i32>,
    #[serde(rename = "TeamID")]
    pub team_id: Option<i32>,
    #[serde(rename = "OpponentID")]
    pub opponent_id: Option<i32>,
    #[serde(rename = "ScoreID")]
    pub score_id: Option<i64>,
}
