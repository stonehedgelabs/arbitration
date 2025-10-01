use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stadium {
    #[serde(rename = "StadiumID")]
    pub stadium_id: i32,
    #[serde(rename = "Active")]
    pub active: bool,
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "City")]
    pub city: Option<String>,
    #[serde(rename = "State")]
    pub state: Option<String>,
    #[serde(rename = "Country")]
    pub country: Option<String>,
    #[serde(rename = "Capacity")]
    pub capacity: Option<i32>,
    #[serde(rename = "Surface")]
    pub surface: Option<String>,
    #[serde(rename = "LeftField")]
    pub left_field: Option<i32>,
    #[serde(rename = "MidLeftField")]
    pub mid_left_field: Option<i32>,
    #[serde(rename = "LeftCenterField")]
    pub left_center_field: Option<i32>,
    #[serde(rename = "MidLeftCenterField")]
    pub mid_left_center_field: Option<i32>,
    #[serde(rename = "CenterField")]
    pub center_field: Option<i32>,
    #[serde(rename = "MidRightCenterField")]
    pub mid_right_center_field: Option<i32>,
    #[serde(rename = "RightCenterField")]
    pub right_center_field: Option<i32>,
    #[serde(rename = "MidRightField")]
    pub mid_right_field: Option<i32>,
    #[serde(rename = "RightField")]
    pub right_field: Option<i32>,
    #[serde(rename = "GeoLat")]
    pub geo_lat: Option<f64>,
    #[serde(rename = "GeoLong")]
    pub geo_long: Option<f64>,
    #[serde(rename = "Altitude")]
    pub altitude: Option<i32>,
    #[serde(rename = "HomePlateDirection")]
    pub home_plate_direction: Option<i32>,
    #[serde(rename = "Type")]
    pub stadium_type: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StadiumsResponse {
    pub data: Vec<Stadium>,
    pub league: String,
}
