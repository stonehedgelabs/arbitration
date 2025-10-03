use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MLBScheduleGame {
    #[serde(rename = "GameID")]
    pub game_id: i64,

    #[serde(rename = "Season", default)]
    pub season: Option<i32>,

    #[serde(rename = "SeasonType", default)]
    pub season_type: Option<i32>,

    #[serde(rename = "Status", default)]
    pub status: Option<String>,

    #[serde(rename = "Day", default)]
    pub day: Option<String>,

    #[serde(rename = "DateTime", default)]
    pub date_time: Option<String>,

    #[serde(rename = "AwayTeam", default)]
    pub away_team: Option<String>,

    #[serde(rename = "HomeTeam", default)]
    pub home_team: Option<String>,

    #[serde(rename = "AwayTeamID", default)]
    pub away_team_id: Option<i32>,

    #[serde(rename = "HomeTeamID", default)]
    pub home_team_id: Option<i32>,

    #[serde(rename = "RescheduledGameID")]
    pub rescheduled_game_id: Option<i64>,

    #[serde(rename = "StadiumID")]
    pub stadium_id: Option<i32>,

    #[serde(rename = "Channel")]
    pub channel: Option<String>,

    #[serde(rename = "Inning")]
    pub inning: Option<i32>,

    #[serde(rename = "InningHalf")]
    pub inning_half: Option<String>,

    #[serde(rename = "AwayTeamRuns")]
    pub away_team_runs: Option<i32>,

    #[serde(rename = "HomeTeamRuns")]
    pub home_team_runs: Option<i32>,

    #[serde(rename = "AwayTeamHits")]
    pub away_team_hits: Option<i32>,

    #[serde(rename = "HomeTeamHits")]
    pub home_team_hits: Option<i32>,

    #[serde(rename = "AwayTeamErrors")]
    pub away_team_errors: Option<i32>,

    #[serde(rename = "HomeTeamErrors")]
    pub home_team_errors: Option<i32>,

    #[serde(rename = "WinningPitcherID")]
    pub winning_pitcher_id: Option<i64>,

    #[serde(rename = "LosingPitcherID")]
    pub losing_pitcher_id: Option<i64>,

    #[serde(rename = "SavingPitcherID")]
    pub saving_pitcher_id: Option<i64>,

    #[serde(rename = "Attendance")]
    pub attendance: Option<i32>,

    #[serde(rename = "AwayTeamProbablePitcherID")]
    pub away_team_probable_pitcher_id: Option<i64>,

    #[serde(rename = "HomeTeamProbablePitcherID")]
    pub home_team_probable_pitcher_id: Option<i64>,

    #[serde(rename = "Outs")]
    pub outs: Option<i32>,

    #[serde(rename = "Balls")]
    pub balls: Option<i32>,

    #[serde(rename = "Strikes")]
    pub strikes: Option<i32>,

    #[serde(rename = "CurrentPitcherID")]
    pub current_pitcher_id: Option<i64>,

    #[serde(rename = "CurrentHitterID")]
    pub current_hitter_id: Option<i64>,

    #[serde(rename = "AwayTeamStartingPitcherID")]
    pub away_team_starting_pitcher_id: Option<i64>,

    #[serde(rename = "HomeTeamStartingPitcherID")]
    pub home_team_starting_pitcher_id: Option<i64>,

    #[serde(rename = "CurrentPitchingTeamID")]
    pub current_pitching_team_id: Option<i32>,

    #[serde(rename = "CurrentHittingTeamID")]
    pub current_hitting_team_id: Option<i32>,

    #[serde(rename = "PointSpread")]
    pub point_spread: Option<f64>,

    #[serde(rename = "OverUnder")]
    pub over_under: Option<f64>,

    #[serde(rename = "AwayTeamMoneyLine")]
    pub away_team_money_line: Option<i32>,

    #[serde(rename = "HomeTeamMoneyLine")]
    pub home_team_money_line: Option<i32>,

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

    #[serde(rename = "ForecastWindDirection")]
    pub forecast_wind_direction: Option<i32>,

    #[serde(rename = "RescheduledFromGameID")]
    pub rescheduled_from_game_id: Option<i64>,

    #[serde(rename = "RunnerOnFirst")]
    pub runner_on_first: Option<bool>,

    #[serde(rename = "RunnerOnSecond")]
    pub runner_on_second: Option<bool>,

    #[serde(rename = "RunnerOnThird")]
    pub runner_on_third: Option<bool>,

    #[serde(rename = "AwayTeamStartingPitcher")]
    pub away_team_starting_pitcher: Option<String>,

    #[serde(rename = "HomeTeamStartingPitcher")]
    pub home_team_starting_pitcher: Option<String>,

    #[serde(rename = "CurrentPitcher")]
    pub current_pitcher: Option<String>,

    #[serde(rename = "CurrentHitter")]
    pub current_hitter: Option<String>,

    #[serde(rename = "WinningPitcher")]
    pub winning_pitcher: Option<String>,

    #[serde(rename = "LosingPitcher")]
    pub losing_pitcher: Option<String>,

    #[serde(rename = "SavingPitcher")]
    pub saving_pitcher: Option<String>,

    #[serde(rename = "DueUpHitterID1")]
    pub due_up_hitter_id1: Option<i64>,

    #[serde(rename = "DueUpHitterID2")]
    pub due_up_hitter_id2: Option<i64>,

    #[serde(rename = "DueUpHitterID3")]
    pub due_up_hitter_id3: Option<i64>,

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

    #[serde(rename = "LastPlay")]
    pub last_play: Option<String>,

    #[serde(rename = "IsClosed")]
    pub is_closed: Option<bool>,

    #[serde(rename = "Updated")]
    pub updated: Option<String>,

    #[serde(rename = "GameEndDateTime")]
    pub game_end_date_time: Option<String>,

    #[serde(rename = "HomeRotationNumber")]
    pub home_rotation_number: Option<i32>,

    #[serde(rename = "AwayRotationNumber")]
    pub away_rotation_number: Option<i32>,

    #[serde(rename = "NeutralVenue")]
    pub neutral_venue: Option<bool>,

    #[serde(rename = "InningDescription")]
    pub inning_description: Option<String>,

    #[serde(rename = "OverPayout")]
    pub over_payout: Option<i32>,

    #[serde(rename = "UnderPayout")]
    pub under_payout: Option<i32>,

    #[serde(rename = "DateTimeUTC")]
    pub date_time_utc: Option<String>,

    #[serde(rename = "HomeTeamOpener")]
    pub home_team_opener: Option<bool>,

    #[serde(rename = "AwayTeamOpener")]
    pub away_team_opener: Option<bool>,

    #[serde(rename = "SuspensionResumeDay")]
    pub suspension_resume_day: Option<String>,

    #[serde(rename = "SuspensionResumeDateTime")]
    pub suspension_resume_date_time: Option<String>,

    #[serde(rename = "SeriesInfo", default)]
    pub series_info: Option<serde_json::Value>,

    #[serde(rename = "Innings", default)]
    pub innings: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MLBScheduleResponse {
    pub league: String,
    pub data_type: String,
    pub data: Vec<MLBScheduleGame>,
    pub filtered_count: usize,
    pub total_count: usize,
}
