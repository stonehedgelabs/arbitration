use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NBAStadium {
    #[serde(rename = "StadiumID")]
    pub stadium_id: i32,
    #[serde(rename = "Active")]
    pub active: bool,
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Address")]
    pub address: String,
    #[serde(rename = "City")]
    pub city: String,
    #[serde(rename = "State")]
    pub state: String,
    #[serde(rename = "Zip")]
    pub zip: String,
    #[serde(rename = "Country")]
    pub country: String,
    #[serde(rename = "Capacity")]
    pub capacity: i32,
    #[serde(rename = "GeoLat")]
    pub geo_lat: f64,
    #[serde(rename = "GeoLong")]
    pub geo_long: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NBAStadiumsResponse {
    pub data: Vec<NBAStadium>,
    pub league: String,
}
