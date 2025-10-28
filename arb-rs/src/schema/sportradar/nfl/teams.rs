use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFLTeamProfile {
    #[serde(rename = "Key")]
    pub key: String,

    #[serde(rename = "TeamID")]
    pub team_id: i32,

    #[serde(rename = "PlayerID")]
    pub player_id: Option<i32>,

    #[serde(rename = "City")]
    pub city: Option<String>,

    #[serde(rename = "Name")]
    pub name: String,

    #[serde(rename = "Conference")]
    pub conference: Option<String>,

    #[serde(rename = "Division")]
    pub division: Option<String>,

    #[serde(rename = "FullName")]
    pub full_name: String,

    #[serde(rename = "StadiumID")]
    pub stadium_id: Option<i32>,

    #[serde(rename = "ByeWeek")]
    pub bye_week: Option<i32>,

    #[serde(rename = "AverageDraftPosition")]
    pub average_draft_position: Option<f64>,

    #[serde(rename = "AverageDraftPositionPPR")]
    pub average_draft_position_ppr: Option<f64>,

    #[serde(rename = "HeadCoach")]
    pub head_coach: Option<String>,

    #[serde(rename = "OffensiveCoordinator")]
    pub offensive_coordinator: Option<String>,

    #[serde(rename = "DefensiveCoordinator")]
    pub defensive_coordinator: Option<String>,

    #[serde(rename = "SpecialTeamsCoach")]
    pub special_teams_coach: Option<String>,

    #[serde(rename = "OffensiveScheme")]
    pub offensive_scheme: Option<String>,

    #[serde(rename = "DefensiveScheme")]
    pub defensive_scheme: Option<String>,

    #[serde(rename = "UpcomingSalary")]
    pub upcoming_salary: Option<i32>,

    #[serde(rename = "UpcomingOpponent")]
    pub upcoming_opponent: Option<String>,

    #[serde(rename = "UpcomingOpponentRank")]
    pub upcoming_opponent_rank: Option<i32>,

    #[serde(rename = "UpcomingOpponentPositionRank")]
    pub upcoming_opponent_position_rank: Option<i32>,

    #[serde(rename = "UpcomingFanDuelSalary")]
    pub upcoming_fan_duel_salary: Option<i32>,

    #[serde(rename = "UpcomingDraftKingsSalary")]
    pub upcoming_draft_kings_salary: Option<i32>,

    #[serde(rename = "UpcomingYahooSalary")]
    pub upcoming_yahoo_salary: Option<i32>,

    #[serde(rename = "PrimaryColor")]
    pub primary_color: Option<String>,

    #[serde(rename = "SecondaryColor")]
    pub secondary_color: Option<String>,

    #[serde(rename = "TertiaryColor")]
    pub tertiary_color: Option<String>,

    #[serde(rename = "QuaternaryColor")]
    pub quaternary_color: Option<String>,

    #[serde(rename = "WikipediaLogoUrl")]
    pub wikipedia_logo_url: Option<String>,

    #[serde(rename = "WikipediaWordMarkUrl")]
    pub wikipedia_word_mark_url: Option<String>,

    #[serde(rename = "GlobalTeamID")]
    pub global_team_id: i32,

    #[serde(rename = "DraftKingsName")]
    pub draft_kings_name: Option<String>,

    #[serde(rename = "DraftKingsPlayerID")]
    pub draft_kings_player_id: Option<i32>,

    #[serde(rename = "FanDuelName")]
    pub fan_duel_name: Option<String>,

    #[serde(rename = "FanDuelPlayerID")]
    pub fan_duel_player_id: Option<i32>,

    #[serde(rename = "FantasyDraftName")]
    pub fantasy_draft_name: Option<String>,

    #[serde(rename = "FantasyDraftPlayerID")]
    pub fantasy_draft_player_id: Option<i32>,

    #[serde(rename = "YahooName")]
    pub yahoo_name: Option<String>,

    #[serde(rename = "YahooPlayerID")]
    pub yahoo_player_id: Option<i32>,

    #[serde(rename = "AverageDraftPosition2QB")]
    pub average_draft_position_2qb: Option<f64>,

    #[serde(rename = "AverageDraftPositionDynasty")]
    pub average_draft_position_dynasty: Option<f64>,

    #[serde(rename = "StadiumDetails")]
    pub stadium_details: Option<serde_json::Value>,
}

// NFLTeamProfilesResponse removed - use Vec<NFLTeamProfile> directly
