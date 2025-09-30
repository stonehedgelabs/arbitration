use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamProfile {
    #[serde(rename = "City")]
    pub city: String,

    #[serde(rename = "Name")]
    pub name: String,

    #[serde(rename = "Key")]
    pub key: String,

    #[serde(rename = "TeamID")]
    pub team_id: i32,

    #[serde(rename = "GlobalTeamID")]
    pub global_team_id: i32,

    #[serde(rename = "Division")]
    pub division: String,

    #[serde(rename = "Conference")]
    pub conference: String,

    #[serde(rename = "HeadCoach")]
    pub head_coach: Option<String>,

    #[serde(rename = "PrimaryColor")]
    pub primary_color: String,

    #[serde(rename = "SecondaryColor")]
    pub secondary_color: String,

    #[serde(rename = "StadiumID")]
    pub stadium_id: Option<i32>,
}

pub type TeamProfiles = Vec<TeamProfile>;
