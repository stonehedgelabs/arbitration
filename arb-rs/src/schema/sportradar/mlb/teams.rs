use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamProfile {
    #[serde(rename = "TeamID")]
    pub team_id: i32,

    #[serde(rename = "Key")]
    pub key: String,

    #[serde(rename = "Active")]
    pub active: bool,

    #[serde(rename = "City")]
    pub city: Option<String>,

    #[serde(rename = "Name")]
    pub name: String,

    #[serde(rename = "StadiumID")]
    pub stadium_id: Option<i32>,

    #[serde(rename = "League")]
    pub league: String,

    #[serde(rename = "Division")]
    pub division: String,

    #[serde(rename = "PrimaryColor")]
    pub primary_color: Option<String>,

    #[serde(rename = "SecondaryColor")]
    pub secondary_color: Option<String>,

    #[serde(rename = "TertiaryColor")]
    pub tertiary_color: Option<String>,

    #[serde(rename = "QuaternaryColor")]
    pub quaternary_color: Option<String>,

    #[serde(rename = "WikipediaLogoUrl")]
    pub wikipedia_logo_url: String,

    #[serde(rename = "WikipediaWordMarkUrl")]
    pub wikipedia_word_mark_url: Option<String>,

    #[serde(rename = "GlobalTeamID")]
    pub global_team_id: i32,

    #[serde(rename = "HeadCoach")]
    pub head_coach: Option<String>,

    #[serde(rename = "HittingCoach")]
    pub hitting_coach: Option<String>,

    #[serde(rename = "PitchingCoach")]
    pub pitching_coach: Option<String>,
}

pub type TeamProfiles = Vec<TeamProfile>;
