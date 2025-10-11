use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFLHeadshot {
    #[serde(rename = "PlayerID")]
    pub player_id: i32,

    #[serde(rename = "Name")]
    pub name: String,

    #[serde(rename = "TeamID")]
    pub team_id: i32,

    #[serde(rename = "Team")]
    pub team: String,

    #[serde(rename = "Position")]
    pub position: String,

    #[serde(rename = "PreferredHostedHeadshotUrl")]
    pub preferred_hosted_headshot_url: Option<String>,

    #[serde(rename = "PreferredHostedHeadshotUpdated")]
    pub preferred_hosted_headshot_updated: Option<String>,

    #[serde(rename = "HostedHeadshotWithBackgroundUrl")]
    pub hosted_headshot_with_background_url: Option<String>,

    #[serde(rename = "HostedHeadshotWithBackgroundUpdated")]
    pub hosted_headshot_with_background_updated: Option<String>,

    #[serde(rename = "HostedHeadshotNoBackgroundUrl")]
    pub hosted_headshot_no_background_url: Option<String>,

    #[serde(rename = "HostedHeadshotNoBackgroundUpdated")]
    pub hosted_headshot_no_background_updated: Option<String>,
}

// NFLHeadshotsResponse removed - use Vec<NFLHeadshot> directly
