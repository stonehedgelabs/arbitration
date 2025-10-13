use serde::{Deserialize, Serialize};

use crate::schema::nba::schedule::NBAQuarter;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NBAPlay {
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

    #[serde(rename = "AwayTeamScore")]
    pub away_team_score: i32,

    #[serde(rename = "HomeTeamScore")]
    pub home_team_score: i32,

    #[serde(rename = "PotentialPoints")]
    pub potential_points: i32,

    #[serde(rename = "Points")]
    pub points: i32,

    #[serde(rename = "ShotMade")]
    pub shot_made: bool,

    #[serde(rename = "Category")]
    pub category: String,

    #[serde(rename = "Type")]
    pub r#type: String,

    #[serde(rename = "TeamID")]
    pub team_id: Option<i32>,

    #[serde(rename = "Team")]
    pub team: Option<String>,

    #[serde(rename = "OpponentID")]
    pub opponent_id: Option<i32>,

    #[serde(rename = "Opponent")]
    pub opponent: Option<String>,

    #[serde(rename = "ReceivingTeamID")]
    pub receiving_team_id: Option<i32>,

    #[serde(rename = "ReceivingTeam")]
    pub receiving_team: Option<String>,

    #[serde(rename = "Description")]
    pub description: String,

    #[serde(rename = "PlayerID")]
    pub player_id: Option<i64>,

    #[serde(rename = "AssistedByPlayerID")]
    pub assisted_by_player_id: Option<i64>,

    #[serde(rename = "BlockedByPlayerID")]
    pub blocked_by_player_id: Option<i64>,

    #[serde(rename = "FastBreak")]
    pub fast_break: Option<bool>,

    #[serde(rename = "SideOfBasket")]
    pub side_of_basket: String,

    #[serde(rename = "Updated")]
    pub updated: String,

    #[serde(rename = "Created")]
    pub created: String,

    #[serde(rename = "SubstituteInPlayerID")]
    pub substitute_in_player_id: Option<i64>,

    #[serde(rename = "SubstituteOutPlayerID")]
    pub substitute_out_player_id: Option<i64>,

    #[serde(rename = "AwayPlayerID")]
    pub away_player_id: Option<i64>,

    #[serde(rename = "HomePlayerID")]
    pub home_player_id: Option<i64>,

    #[serde(rename = "ReceivingPlayerID")]
    pub receiving_player_id: Option<i64>,

    #[serde(rename = "BaselineOffsetPercentage")]
    pub baseline_offset_percentage: Option<f64>,

    #[serde(rename = "SidelineOffsetPercentage")]
    pub sideline_offset_percentage: Option<f64>,

    #[serde(rename = "Coordinates")]
    pub coordinates: String,

    #[serde(rename = "StolenByPlayerID")]
    pub stolen_by_player_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NBAPlayByPlayGame {
    #[serde(rename = "GameID")]
    pub game_id: Option<i32>,

    #[serde(rename = "Season")]
    pub season: Option<i32>,

    #[serde(rename = "SeasonType")]
    pub season_type: Option<i32>,

    #[serde(rename = "Status")]
    pub status: Option<String>,

    #[serde(rename = "Day")]
    pub day: Option<String>,

    #[serde(rename = "DateTime")]
    pub date_time: Option<String>,

    #[serde(rename = "AwayTeam")]
    pub away_team: Option<String>,

    #[serde(rename = "HomeTeam")]
    pub home_team: Option<String>,

    #[serde(rename = "AwayTeamID")]
    pub away_team_id: Option<i32>,

    #[serde(rename = "HomeTeamID")]
    pub home_team_id: Option<i32>,

    #[serde(rename = "StadiumID")]
    pub stadium_id: Option<i32>,

    #[serde(rename = "Channel")]
    pub channel: Option<String>,

    #[serde(rename = "Attendance")]
    pub attendance: Option<i32>,

    #[serde(rename = "AwayTeamScore")]
    pub away_team_score: Option<i32>,

    #[serde(rename = "HomeTeamScore")]
    pub home_team_score: Option<i32>,

    #[serde(rename = "Updated")]
    pub updated: Option<String>,

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

    #[serde(rename = "GameEndDateTime")]
    pub game_end_date_time: Option<String>,

    #[serde(rename = "HomeRotationNumber")]
    pub home_rotation_number: Option<i32>,

    #[serde(rename = "AwayRotationNumber")]
    pub away_rotation_number: Option<i32>,

    #[serde(rename = "NeutralVenue")]
    pub neutral_venue: Option<bool>,

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
    pub date_time_utc: Option<String>,

    #[serde(rename = "InseasonTournament")]
    pub inseason_tournament: Option<bool>,

    #[serde(rename = "SeriesInfo")]
    pub series_info: Option<serde_json::Value>,

    #[serde(rename = "Quarters")]
    pub quarters: Option<Vec<NBAQuarter>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NBAPlayByPlayResponse {
    #[serde(rename = "Game")]
    pub game: NBAPlayByPlayGame,

    #[serde(rename = "Quarters")]
    pub quarters: Vec<NBAQuarter>,

    #[serde(rename = "Plays")]
    pub plays: Vec<NBAPlay>,
}

pub type NBAPlayByPlayResponseUnknown = serde_json::Value;
