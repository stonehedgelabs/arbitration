use serde::{Deserialize, Serialize};

/// Enum for different data types supported by the API
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DataType {
    #[serde(rename = "schedule")]
    Schedule,
    #[serde(rename = "current_games")]
    CurrentGames,
    #[serde(rename = "team_profiles")]
    TeamProfiles,
    #[serde(rename = "headshots")]
    Headshots,
    #[serde(rename = "stadiums")]
    Stadiums,
    #[serde(rename = "standings")]
    Standings,
    #[serde(rename = "box_score")]
    BoxScore,
    #[serde(rename = "play_by_play")]
    PlayByPlay,
    #[serde(rename = "odds")]
    Odds,
    #[serde(rename = "game_by_date")]
    GameByDate,
    #[serde(rename = "scores")]
    Scores,
}

impl DataType {
    /// Convert the enum to its string representation
    pub fn as_str(&self) -> &'static str {
        match self {
            DataType::Schedule => "schedule",
            DataType::CurrentGames => "current_games",
            DataType::TeamProfiles => "team_profiles",
            DataType::Headshots => "headshots",
            DataType::Stadiums => "stadiums",
            DataType::Standings => "standings",
            DataType::BoxScore => "box_score",
            DataType::PlayByPlay => "play_by_play",
            DataType::Odds => "odds",
            DataType::GameByDate => "game_by_date",
            DataType::Scores => "scores",
        }
    }
}

impl std::fmt::Display for DataType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

impl From<&str> for DataType {
    fn from(s: &str) -> Self {
        match s {
            "schedule" => DataType::Schedule,
            "current_games" => DataType::CurrentGames,
            "team_profiles" => DataType::TeamProfiles,
            "headshots" => DataType::Headshots,
            "stadiums" => DataType::Stadiums,
            "standings" => DataType::Standings,
            "box_score" => DataType::BoxScore,
            "play_by_play" => DataType::PlayByPlay,
            "odds" => DataType::Odds,
            "game_by_date" => DataType::GameByDate,
            "scores" => DataType::Scores,
            _ => panic!("Invalid data type: {}", s),
        }
    }
}
