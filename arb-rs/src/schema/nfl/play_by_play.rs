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
pub struct NFLScore {
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
pub struct NFLQuarter {
    #[serde(rename = "QuarterID")]
    pub quarter_id: i64,

    #[serde(rename = "ScoreID")]
    pub score_id: i64,

    #[serde(rename = "Number")]
    pub number: i32,

    #[serde(rename = "Name")]
    pub name: String,

    #[serde(rename = "Description")]
    pub description: String,

    #[serde(rename = "AwayTeamScore")]
    pub away_team_score: i32,

    #[serde(rename = "HomeTeamScore")]
    pub home_team_score: i32,

    #[serde(rename = "Updated")]
    pub updated: String,

    #[serde(rename = "Created")]
    pub created: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFLPlayStat {
    #[serde(rename = "PlayStatID")]
    pub play_stat_id: i64,

    #[serde(rename = "PlayID")]
    pub play_id: i64,

    #[serde(rename = "Sequence")]
    pub sequence: i32,

    #[serde(rename = "PlayerID")]
    pub player_id: i64,

    #[serde(rename = "Name")]
    pub name: String,

    #[serde(rename = "Team")]
    pub team: String,

    #[serde(rename = "Opponent")]
    pub opponent: String,

    #[serde(rename = "HomeOrAway")]
    pub home_or_away: String,

    #[serde(rename = "Direction")]
    pub direction: String,

    #[serde(rename = "Updated")]
    pub updated: String,

    #[serde(rename = "Created")]
    pub created: String,

    #[serde(rename = "PassingAttempts")]
    pub passing_attempts: i32,

    #[serde(rename = "PassingCompletions")]
    pub passing_completions: i32,

    #[serde(rename = "PassingYards")]
    pub passing_yards: i32,

    #[serde(rename = "PassingTouchdowns")]
    pub passing_touchdowns: i32,

    #[serde(rename = "PassingInterceptions")]
    pub passing_interceptions: i32,

    #[serde(rename = "PassingSacks")]
    pub passing_sacks: i32,

    #[serde(rename = "PassingSackYards")]
    pub passing_sack_yards: i32,

    #[serde(rename = "RushingAttempts")]
    pub rushing_attempts: i32,

    #[serde(rename = "RushingYards")]
    pub rushing_yards: i32,

    #[serde(rename = "RushingTouchdowns")]
    pub rushing_touchdowns: i32,

    #[serde(rename = "ReceivingTargets")]
    pub receiving_targets: i32,

    #[serde(rename = "Receptions")]
    pub receptions: i32,

    #[serde(rename = "ReceivingYards")]
    pub receiving_yards: i32,

    #[serde(rename = "ReceivingTouchdowns")]
    pub receiving_touchdowns: i32,

    #[serde(rename = "Fumbles")]
    pub fumbles: i32,

    #[serde(rename = "FumblesLost")]
    pub fumbles_lost: i32,

    #[serde(rename = "TwoPointConversionAttempts")]
    pub two_point_conversion_attempts: i32,

    #[serde(rename = "TwoPointConversionPasses")]
    pub two_point_conversion_passes: i32,

    #[serde(rename = "TwoPointConversionRuns")]
    pub two_point_conversion_runs: i32,

    #[serde(rename = "TwoPointConversionReceptions")]
    pub two_point_conversion_receptions: i32,

    #[serde(rename = "TwoPointConversionReturns")]
    pub two_point_conversion_returns: i32,

    #[serde(rename = "SoloTackles")]
    pub solo_tackles: i32,

    #[serde(rename = "AssistedTackles")]
    pub assisted_tackles: i32,

    #[serde(rename = "TacklesForLoss")]
    pub tackles_for_loss: i32,

    #[serde(rename = "Sacks")]
    pub sacks: i32,

    #[serde(rename = "SackYards")]
    pub sack_yards: i32,

    #[serde(rename = "PassesDefended")]
    pub passes_defended: i32,

    #[serde(rename = "Safeties")]
    pub safeties: i32,

    #[serde(rename = "FumblesForced")]
    pub fumbles_forced: i32,

    #[serde(rename = "FumblesRecovered")]
    pub fumbles_recovered: i32,

    #[serde(rename = "FumbleReturnYards")]
    pub fumble_return_yards: i32,

    #[serde(rename = "FumbleReturnTouchdowns")]
    pub fumble_return_touchdowns: i32,

    #[serde(rename = "Interceptions")]
    pub interceptions: i32,

    #[serde(rename = "InterceptionReturnYards")]
    pub interception_return_yards: i32,

    #[serde(rename = "InterceptionReturnTouchdowns")]
    pub interception_return_touchdowns: i32,

    #[serde(rename = "PuntReturns")]
    pub punt_returns: i32,

    #[serde(rename = "PuntReturnYards")]
    pub punt_return_yards: i32,

    #[serde(rename = "PuntReturnTouchdowns")]
    pub punt_return_touchdowns: i32,

    #[serde(rename = "KickReturns")]
    pub kick_returns: i32,

    #[serde(rename = "KickReturnYards")]
    pub kick_return_yards: i32,

    #[serde(rename = "KickReturnTouchdowns")]
    pub kick_return_touchdowns: i32,

    #[serde(rename = "BlockedKicks")]
    pub blocked_kicks: i32,

    #[serde(rename = "BlockedKickReturns")]
    pub blocked_kick_returns: i32,

    #[serde(rename = "BlockedKickReturnYards")]
    pub blocked_kick_return_yards: i32,

    #[serde(rename = "BlockedKickReturnTouchdowns")]
    pub blocked_kick_return_touchdowns: i32,

    #[serde(rename = "FieldGoalReturns")]
    pub field_goal_returns: i32,

    #[serde(rename = "FieldGoalReturnYards")]
    pub field_goal_return_yards: i32,

    #[serde(rename = "FieldGoalReturnTouchdowns")]
    pub field_goal_return_touchdowns: i32,

    #[serde(rename = "Kickoffs")]
    pub kickoffs: i32,

    #[serde(rename = "KickoffYards")]
    pub kickoff_yards: i32,

    #[serde(rename = "KickoffTouchbacks")]
    pub kickoff_touchbacks: i32,

    #[serde(rename = "Punts")]
    pub punts: i32,

    #[serde(rename = "PuntYards")]
    pub punt_yards: i32,

    #[serde(rename = "PuntTouchbacks")]
    pub punt_touchbacks: i32,

    #[serde(rename = "PuntsHadBlocked")]
    pub punts_had_blocked: i32,

    #[serde(rename = "FieldGoalsAttempted")]
    pub field_goals_attempted: i32,

    #[serde(rename = "FieldGoalsMade")]
    pub field_goals_made: i32,

    #[serde(rename = "FieldGoalsYards")]
    pub field_goals_yards: i32,

    #[serde(rename = "FieldGoalsHadBlocked")]
    pub field_goals_had_blocked: i32,

    #[serde(rename = "ExtraPointsAttempted")]
    pub extra_points_attempted: i32,

    #[serde(rename = "ExtraPointsMade")]
    pub extra_points_made: i32,

    #[serde(rename = "ExtraPointsHadBlocked")]
    pub extra_points_had_blocked: i32,

    #[serde(rename = "Penalties")]
    pub penalties: i32,

    #[serde(rename = "PenaltyYards")]
    pub penalty_yards: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFLPlay {
    #[serde(rename = "PlayID")]
    pub play_id: i64,

    #[serde(rename = "QuarterID")]
    pub quarter_id: i64,

    #[serde(rename = "QuarterName")]
    pub quarter_name: String,

    #[serde(rename = "Sequence")]
    pub sequence: i32,

    #[serde(rename = "TimeRemainingMinutes")]
    pub time_remaining_minutes: i32,

    #[serde(rename = "TimeRemainingSeconds")]
    pub time_remaining_seconds: i32,

    #[serde(rename = "PlayTime")]
    pub play_time: String,

    #[serde(rename = "Updated")]
    pub updated: String,

    #[serde(rename = "Created")]
    pub created: String,

    #[serde(rename = "Team")]
    pub team: String,

    #[serde(rename = "Opponent")]
    pub opponent: String,

    #[serde(rename = "Down")]
    pub down: i32,

    #[serde(rename = "Distance")]
    pub distance: i32,

    #[serde(rename = "YardLine")]
    pub yard_line: i32,

    #[serde(rename = "YardLineTerritory")]
    pub yard_line_territory: String,

    #[serde(rename = "YardsToEndZone")]
    pub yards_to_end_zone: i32,

    #[serde(rename = "Type")]
    pub r#type: String,

    #[serde(rename = "YardsGained")]
    pub yards_gained: i32,

    #[serde(rename = "Description")]
    pub description: String,

    #[serde(rename = "IsScoringPlay")]
    pub is_scoring_play: bool,

    #[serde(rename = "ScoringPlay")]
    pub scoring_play: Option<String>,

    #[serde(rename = "PlayStats")]
    pub play_stats: Vec<NFLPlayStat>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFLPlayByPlayResponse {
    #[serde(rename = "Score")]
    pub score: NFLScore,

    #[serde(rename = "Quarters")]
    pub quarters: Vec<NFLQuarter>,

    #[serde(rename = "Plays")]
    pub plays: Vec<NFLPlay>,
}
