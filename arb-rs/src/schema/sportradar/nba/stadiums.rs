use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NBAStadium {
    #[serde(rename = "StadiumID")]
    pub stadium_id: i32,
    #[serde(rename = "Active")]
    pub active: Option<bool>,
    #[serde(rename = "Name")]
    pub name: Option<String>,
    #[serde(rename = "Address")]
    pub address: Option<String>,
    #[serde(rename = "City")]
    pub city: Option<String>,
    #[serde(rename = "State")]
    pub state: Option<String>,
    #[serde(rename = "Zip")]
    pub zip: Option<String>,
    #[serde(rename = "Country")]
    pub country: Option<String>,
    #[serde(rename = "Capacity")]
    pub capacity: Option<i32>,
    #[serde(rename = "GeoLat")]
    pub geo_lat: Option<f64>,
    #[serde(rename = "GeoLong")]
    pub geo_long: Option<f64>,
}
