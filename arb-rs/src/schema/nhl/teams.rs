use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NHLTeamProfile {
    #[serde(rename = "TeamID")]
    pub team_id: i32,

    #[serde(rename = "Key")]
    pub key: String,

    #[serde(rename = "Active")]
    pub active: bool,

    #[serde(rename = "City")]
    pub city: String,

    #[serde(rename = "Name")]
    pub name: String,

    #[serde(rename = "StadiumID")]
    pub stadium_id: i32,

    #[serde(rename = "Conference")]
    pub conference: String,

    #[serde(rename = "Division")]
    pub division: String,

    #[serde(rename = "PrimaryColor")]
    pub primary_color: String,

    #[serde(rename = "SecondaryColor")]
    pub secondary_color: String,

    #[serde(rename = "TertiaryColor")]
    pub tertiary_color: String,

    #[serde(rename = "QuaternaryColor")]
    pub quaternary_color: Option<String>,

    #[serde(rename = "WikipediaLogoUrl")]
    pub wikipedia_logo_url: String,

    #[serde(rename = "WikipediaWordMarkUrl")]
    pub wikipedia_word_mark_url: Option<String>,

    #[serde(rename = "GlobalTeamID")]
    pub global_team_id: i32,

    #[serde(rename = "HeadCoach")]
    pub head_coach: String,
}
