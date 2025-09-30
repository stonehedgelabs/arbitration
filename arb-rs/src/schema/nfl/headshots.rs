use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Headshot {
    #[serde(rename = "HostedHeadshotNoBackgroundUpdated")]
    pub hosted_headshot_no_background_updated: String,

    #[serde(rename = "HostedHeadshotNoBackgroundUrl")]
    pub hosted_headshot_no_background_url: String,

    #[serde(rename = "HostedHeadshotWithBackgroundUpdated")]
    pub hosted_headshot_with_background_updated: String,

    #[serde(rename = "HostedHeadshotWithBackgroundUrl")]
    pub hosted_headshot_with_background_url: String,

    #[serde(rename = "Name")]
    pub name: String,

    #[serde(rename = "PlayerID")]
    pub player_id: i32,

    #[serde(rename = "Position")]
    pub position: String,

    #[serde(rename = "PreferredHostedHeadshotUpdated")]
    pub preferred_hosted_headshot_updated: String,

    #[serde(rename = "PreferredHostedHeadshotUrl")]
    pub preferred_hosted_headshot_url: String,

    #[serde(rename = "Team")]
    pub team: String,

    #[serde(rename = "TeamID")]
    pub team_id: i32,
}

pub type PlayerHeadshots = Vec<Headshot>;
