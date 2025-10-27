use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NFLStadium {
    #[serde(rename = "StadiumID")]
    pub stadium_id: i32,
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "City")]
    pub city: String,
    #[serde(rename = "State")]
    pub state: Option<String>,
    #[serde(rename = "Country")]
    pub country: String,
    #[serde(rename = "Capacity")]
    pub capacity: Option<i32>,
    #[serde(rename = "PlayingSurface")]
    pub playing_surface: Option<String>,
    #[serde(rename = "GeoLat")]
    pub geo_lat: f64,
    #[serde(rename = "GeoLong")]
    pub geo_long: f64,
    #[serde(rename = "Type")]
    pub stadium_type: Option<String>,
}

// NFLStadiumsResponse removed - use Vec<NFLStadium> directly
