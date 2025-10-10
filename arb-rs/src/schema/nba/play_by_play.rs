use serde::{Deserialize, Serialize};

use crate::schema::nba::schedule::{NBAQuarter, NBAScheduleGame};

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
pub struct NBAPlayByPlayResponse {
    #[serde(rename = "Game")]
    pub game: NBAScheduleGame,

    #[serde(rename = "Quarters")]
    pub quarters: Vec<NBAQuarter>,

    #[serde(rename = "Plays")]
    pub plays: Vec<NBAPlay>,
}
