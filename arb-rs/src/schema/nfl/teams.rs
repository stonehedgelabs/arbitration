use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Team {
    #[serde(rename = "ByeWeek")]
    pub bye_week: i32,

    #[serde(rename = "City")]
    pub city: String,

    #[serde(rename = "Conference")]
    pub conference: String,

    #[serde(rename = "DefensiveCoordinator")]
    pub defensive_coordinator: String,

    #[serde(rename = "DefensiveScheme")]
    pub defensive_scheme: String,

    #[serde(rename = "Division")]
    pub division: String,

    #[serde(rename = "FullName")]
    pub full_name: String,

    #[serde(rename = "GlobalTeamID")]
    pub global_team_id: i32,

    #[serde(rename = "HeadCoach")]
    pub head_coach: String,

    #[serde(rename = "Key")]
    pub key: String,

    #[serde(rename = "Name")]
    pub name: String,

    #[serde(rename = "OffensiveCoordinator")]
    pub offensive_coordinator: String,

    #[serde(rename = "OffensiveScheme")]
    pub offensive_scheme: String,

    #[serde(rename = "PlayerID")]
    pub player_id: i32,

    #[serde(rename = "PrimaryColor")]
    pub primary_color: String,

    #[serde(rename = "QuaternaryColor")]
    pub quaternary_color: String,

    #[serde(rename = "SecondaryColor")]
    pub secondary_color: String,

    #[serde(rename = "SpecialTeamsCoach")]
    pub special_teams_coach: String,

    #[serde(rename = "StadiumID")]
    pub stadium_id: i32,

    #[serde(rename = "TeamID")]
    pub team_id: i32,

    #[serde(rename = "TertiaryColor")]
    pub tertiary_color: String,

    #[serde(rename = "WikipediaLogoURL")]
    pub wikipedia_logo_url: String,

    #[serde(rename = "WikipediaWordMarkURL")]
    pub wikipedia_word_mark_url: String,
}

pub type TeamProfiles = Vec<Team>;
