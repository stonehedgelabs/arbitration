use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NBAQuarter {
    #[serde(rename = "QuarterID")]
    pub quarter_id: i32,

    #[serde(rename = "GameID")]
    pub game_id: i32,

    #[serde(rename = "Number")]
    pub number: i32,

    #[serde(rename = "Name")]
    pub name: String,

    #[serde(rename = "AwayScore")]
    pub away_score: i32,

    #[serde(rename = "HomeScore")]
    pub home_score: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NBAScheduleGame {
    #[serde(rename = "GameID")]
    pub game_id: i32,

    #[serde(rename = "Season")]
    pub season: i32,

    #[serde(rename = "SeasonType")]
    pub season_type: i32,

    #[serde(rename = "Status")]
    pub status: String,

    #[serde(rename = "Day")]
    pub day: String,

    #[serde(rename = "DateTime")]
    pub date_time: String,

    #[serde(rename = "AwayTeam")]
    pub away_team: String,

    #[serde(rename = "HomeTeam")]
    pub home_team: String,

    #[serde(rename = "AwayTeamID")]
    pub away_team_id: i32,

    #[serde(rename = "HomeTeamID")]
    pub home_team_id: i32,

    #[serde(rename = "StadiumID")]
    pub stadium_id: i32,

    #[serde(rename = "Channel")]
    pub channel: Option<String>,

    #[serde(rename = "Attendance")]
    pub attendance: Option<i32>,

    #[serde(rename = "AwayTeamScore")]
    pub away_team_score: Option<i32>,

    #[serde(rename = "HomeTeamScore")]
    pub home_team_score: Option<i32>,

    #[serde(rename = "Updated")]
    pub updated: String,

    #[serde(rename = "Quarter")]
    pub quarter: Option<String>,

    #[serde(rename = "TimeRemainingMinutes")]
    pub time_remaining_minutes: Option<i32>,

    #[serde(rename = "TimeRemainingSeconds")]
    pub time_remaining_seconds: Option<i32>,

    #[serde(rename = "PointSpread")]
    pub point_spread: Option<f64>,

    #[serde(rename = "OverUnder")]
    pub over_under: Option<f64>,

    #[serde(rename = "AwayTeamMoneyLine")]
    pub away_team_money_line: Option<i32>,

    #[serde(rename = "HomeTeamMoneyLine")]
    pub home_team_money_line: Option<i32>,

    #[serde(rename = "GlobalGameID")]
    pub global_game_id: i64,

    #[serde(rename = "GlobalAwayTeamID")]
    pub global_away_team_id: i64,

    #[serde(rename = "GlobalHomeTeamID")]
    pub global_home_team_id: i64,

    #[serde(rename = "PointSpreadAwayTeamMoneyLine")]
    pub point_spread_away_team_money_line: Option<i32>,

    #[serde(rename = "PointSpreadHomeTeamMoneyLine")]
    pub point_spread_home_team_money_line: Option<i32>,

    #[serde(rename = "LastPlay")]
    pub last_play: Option<String>,

    #[serde(rename = "IsClosed")]
    pub is_closed: bool,

    #[serde(rename = "GameEndDateTime")]
    pub game_end_date_time: Option<String>,

    #[serde(rename = "HomeRotationNumber")]
    pub home_rotation_number: Option<i32>,

    #[serde(rename = "AwayRotationNumber")]
    pub away_rotation_number: Option<i32>,

    #[serde(rename = "NeutralVenue")]
    pub neutral_venue: bool,

    #[serde(rename = "OverPayout")]
    pub over_payout: Option<i32>,

    #[serde(rename = "UnderPayout")]
    pub under_payout: Option<i32>,

    #[serde(rename = "CrewChiefID")]
    pub crew_chief_id: Option<i32>,

    #[serde(rename = "UmpireID")]
    pub umpire_id: Option<i32>,

    #[serde(rename = "RefereeID")]
    pub referee_id: Option<i32>,

    #[serde(rename = "AlternateID")]
    pub alternate_id: Option<i32>,

    #[serde(rename = "DateTimeUTC")]
    pub date_time_utc: String,

    #[serde(rename = "InseasonTournament")]
    pub inseason_tournament: bool,

    #[serde(rename = "SeriesInfo")]
    pub series_info: Option<serde_json::Value>,

    #[serde(rename = "Quarters")]
    pub quarters: Vec<NBAQuarter>,
}

// NBAScheduleResponse removed - use Vec<NBAScheduleGame> directly
