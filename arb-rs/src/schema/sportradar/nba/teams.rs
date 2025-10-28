use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NBATeamProfile {
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

    #[serde(rename = "LeagueID")]
    pub league_id: i32,

    #[serde(rename = "StadiumID")]
    pub stadium_id: Option<i32>,

    #[serde(rename = "Conference")]
    pub conference: Option<String>,

    #[serde(rename = "Division")]
    pub division: Option<String>,

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

    #[serde(rename = "NbaDotComTeamID")]
    pub nba_dot_com_team_id: Option<i32>,

    #[serde(rename = "HeadCoach")]
    pub head_coach: Option<String>,
}

// NBATeamProfilesResponse removed - use Vec<NBATeamProfile> directly
