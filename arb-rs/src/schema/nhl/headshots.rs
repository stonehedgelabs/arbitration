use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerHeadshot {
    #[serde(rename = "Name")]
    pub name: String,

    #[serde(rename = "PlayerID")]
    pub player_id: i32,

    #[serde(rename = "Position")]
    pub position: String,

    #[serde(rename = "Team")]
    pub team: String,

    #[serde(rename = "TeamID")]
    pub team_id: i32,

    #[serde(rename = "PreferredHostedHeadshotUrl")]
    pub preferred_hosted_headshot_url: String,
}

pub type PlayerHeadshots = Vec<PlayerHeadshot>;
