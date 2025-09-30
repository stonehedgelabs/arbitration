use async_std::sync::{Arc, Mutex};
use base64::{engine::general_purpose, Engine as _};
use serde_json::Value;
use std::collections::HashMap;
use std::fs;
use std::path::Path;

use crate::cache::Cache;
use crate::error::Result;
use crate::uses::League;

pub struct DataLoader {
    cache: Arc<Mutex<Cache>>,
}

impl DataLoader {
    pub fn new(cache: Arc<Mutex<Cache>>) -> Self {
        Self { cache }
    }

    pub async fn preload_all_data(&self) -> Result<()> {
        tracing::info!("Starting data pre-loading...");

        self.preload_league_data(League::Nfl, "2025").await?;
        self.preload_league_data(League::Mlb, "2026").await?;
        self.preload_league_data(League::Nba, "2026").await?;
        self.preload_league_data(League::Nhl, "2026").await?;

        tracing::info!("Data pre-loading completed successfully");
        Ok(())
    }

    async fn preload_league_data(&self, league: League, season: &str) -> Result<()> {
        let league_str = league.to_string();
        tracing::info!("Pre-loading data for {} season {}", league_str, season);

        self.preload_data_type(&league_str, season, "teams").await?;
        self.preload_data_type(&league_str, season, "schedule")
            .await?;
        self.preload_data_type(&league_str, season, "headshots")
            .await?;

        Ok(())
    }

    async fn preload_data_type(
        &self,
        league: &str,
        season: &str,
        data_type: &str,
    ) -> Result<()> {
        let file_path = format!("data/{}/{}/{}.json", league, season, data_type);

        if !Path::new(&file_path).exists() {
            tracing::warn!("Data file not found: {}", file_path);
            return Ok(());
        }

        let json_data = fs::read_to_string(&file_path)?;
        let parsed_data: Value = serde_json::from_str(&json_data)?;

        let base64_key = self.get_base64_url(league, data_type)?;
        let cache_key = format!("{}:{}:{}", data_type, league, base64_key);

        self.cache
            .lock()
            .await
            .set_with_ttl(&cache_key, &json_data, 86400)
            .await?;

        tracing::info!(
            "Pre-loaded {} {} records for {} (cache key: {})",
            parsed_data.as_array().map(|a| a.len()).unwrap_or(0),
            data_type,
            league,
            cache_key
        );

        Ok(())
    }

    fn get_base64_url(&self, league: &str, data_type: &str) -> Result<String> {
        let base_url = match league {
            "nfl" => "https://api.sportsdata.io/v3/nfl/",
            "mlb" => "https://api.sportsdata.io/v3/mlb/",
            "nba" => "https://api.sportsdata.io/v3/nba/",
            "nhl" => "https://api.sportsdata.io/v3/nhl/",
            _ => return Err(crate::error::Error::InvalidLeague(league.to_string())),
        };

        let endpoint = match data_type {
            "teams" => "scores/json/AllTeams",
            "schedule" => "scores/json/Schedules/2025",
            "headshots" => "headshots/json/Headshots",
            "play-by-play" => "pbp/json/PlayByPlay/2025/1", // Default to week 1 for NFL
            _ => return Err(crate::error::Error::InvalidDataType(data_type.to_string())),
        };

        let full_url = format!("{}{}", base_url, endpoint);
        let encoded = general_purpose::STANDARD.encode(full_url);
        Ok(encoded)
    }
}

impl DataLoader {
    pub async fn preload_teams_only(&self) -> Result<()> {
        tracing::info!("Pre-loading team data only...");

        self.preload_league_teams(League::Nfl, "2025").await?;
        self.preload_league_teams(League::Mlb, "2026").await?;
        self.preload_league_teams(League::Nba, "2026").await?;
        self.preload_league_teams(League::Nhl, "2026").await?;

        tracing::info!("Team data pre-loading completed");
        Ok(())
    }

    async fn preload_league_teams(&self, league: League, season: &str) -> Result<()> {
        let league_str = league.to_string();
        self.preload_data_type(&league_str, season, "teams").await
    }
}
