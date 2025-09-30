use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamProfile {
    #[serde(rename = "Active")]
    pub active: bool,
    
    #[serde(rename = "City")]
    pub city: String,
    
    #[serde(rename = "Conference")]
    pub conference: String,
    
    #[serde(rename = "Division")]
    pub division: String,
    
    #[serde(rename = "GlobalTeamID")]
    pub global_team_id: i32,
    
    #[serde(rename = "HeadCoach")]
    pub head_coach: String,
    
    #[serde(rename = "Key")]
    pub key: String,
    
    #[serde(rename = "LeagueID")]
    pub league_id: i32,
    
    #[serde(rename = "Name")]
    pub name: String,
    
    #[serde(rename = "NbaDotComTeamID")]
    pub nba_dot_com_team_id: i32,
    
    #[serde(rename = "PrimaryColor")]
    pub primary_color: String,
    
    #[serde(rename = "QuaternaryColor")]
    pub quaternary_color: String,
    
    #[serde(rename = "SecondaryColor")]
    pub secondary_color: String,
    
    #[serde(rename = "StadiumID")]
    pub stadium_id: i32,
    
    #[serde(rename = "TeamID")]
    pub team_id: i32,
    
    #[serde(rename = "TertiaryColor")]
    pub tertiary_color: String,
    
    #[serde(rename = "WikipediaLogoUrl")]
    pub wikipedia_logo_url: String,
    
    #[serde(rename = "WikipediaWordMarkUrl")]
    pub wikipedia_word_mark_url: Option<String>,
}

pub type TeamProfiles = Vec<TeamProfile>;
