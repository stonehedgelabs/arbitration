use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NBARollingInsightsTeamProfile {
    #[serde(rename = "team_id")]
    pub team_id: i32,
    pub team: String,
    pub abbrv: String,
    pub arena: String,
    pub mascot: String,
    pub conf: String,
    pub location: String,
}
