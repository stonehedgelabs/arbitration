# Sports Data API Documentation

This document contains comprehensive API documentation for all supported sports leagues, organized by sport for easy reference.

## NFL

### Base URL
```
https://api.sportsdata.io/v3/nfl/
```

### Authentication
- **Query Parameter**: `?key={api_key}`
- **Header**: `Ocp-Apim-Subscription-Key: {api_key}`
- **Response Format**: `?format=json` or `?format=xml`

### Key Endpoints

#### Teams & Rosters
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/AllTeams` | Full team information (all teams, active/inactive) | 4 hours | `Team[]` |
| `/scores/json/Teams` | Active teams only | 4 hours | `Team[]` |
| `/scores/json/TeamsBasic` | Basic team info (name, city, conference, division) | 5 minutes | `TeamBasic[]` |
| `/scores/json/Players` | All players with biographical info | 1 hour | `Player[]` |
| `/scores/json/Players/{team}` | Players by team | 1 hour | `PlayerDetail[]` |
| `/scores/json/PlayersByFreeAgents` | Free agent players | 15 minutes | `PlayerBasic[]` |

#### Schedules & Games
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/Schedules/{season}` | Full game schedules with betting info, weather | 3 minutes | `Schedule[]` |
| `/scores/json/SchedulesBasic/{season}` | Lightweight schedules (teams, dates, times) | 3 minutes | `ScheduleBasic[]` |
| `/scores/json/Scores/{season}` | Live & final scores for season | 5 minutes | `Score[]` |
| `/scores/json/ScoresByWeek/{season}/{week}` | Scores by week (live updates) | 5 seconds | `Score[]` |
| `/scores/json/ScoresByDate/{date}` | Scores by date | 5 seconds | `Score[]` |

#### Player Headshots
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/headshots/json/Headshots` | USA Today/IMAGN player headshots | 1 hour | `Headshot[]` |

#### Play-by-Play
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/pbp/json/PlayByPlay/{season}/{week}/{hometeam}` | Live & final play-by-play by team | 1 minute | `PlayByPlay` |
| `/pbp/json/PlayByPlay/{gameid}` | Play-by-play by game ID | 1 minute | `PlayByPlay` |
| `/pbp/json/PlayByPlayDelta/{season}/{week}/{minutes}` | Delta updates (last X minutes) | 3 seconds | `PlayByPlay[]` |

#### Betting & Odds
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/odds/json/GameOddsByWeek/{season}/{week}` | Pre-game odds (spread, moneyline, total) | 30 seconds | `GameInfo[]` |
| `/odds/json/LiveGameOddsByWeek/{season}/{week}` | In-game odds | 5 seconds | `GameInfo[]` |
| `/odds/json/BettingMarkets/{eventId}` | All betting markets for event | 10 minutes | `BettingMarket[]` |

#### Fantasy & Projections
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/stats/json/PlayerGameStatsByWeek/{season}/{week}` | Player game stats by week | 5 minutes | `PlayerGame[]` |
| `/stats/json/PlayerSeasonStats/{season}` | Season-long player stats | 15 minutes | `PlayerSeason[]` |
| `/projections/json/PlayerGameProjectionStatsByWeek/{season}/{week}` | Player projections by week | 5 minutes | `PlayerGameProjection[]` |

#### Utility Endpoints
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/CurrentSeason` | Current season year | 5 minutes | `integer` |
| `/scores/json/CurrentWeek` | Current week number | 5 minutes | `integer` |
| `/scores/json/Timeframes/{type}` | Current timeframes (current/upcoming/completed) | 3 minutes | `Timeframe[]` |
| `/scores/json/AreAnyGamesInProgress` | Check if games are live | 5 seconds | `boolean` |

### Season Format Examples
- **Regular Season**: `2025`, `2025REG`
- **Preseason**: `2025PRE`
- **Postseason**: `2025POST`
- **Week Numbers**: Preseason 0-4, Regular 1-17, Postseason 1-4

### Data Tables Included
- **Team**: Full team info with stadium, colors, coaching staff
- **Player**: Biographical info, position, team, jersey number
- **Schedule**: Game details, stadium info, betting lines, weather
- **Score**: Live scores, quarter-by-quarter, game state
- **PlayByPlay**: Individual plays with detailed stats
- **Headshot**: Player photos with multiple URL variants
- **BettingMarket**: Odds, spreads, totals, props

## MLB

### Base URL
```
https://api.sportsdata.io/v3/mlb/
```

### Authentication
- **Query Parameter**: `?key={api_key}`
- **Header**: `Ocp-Apim-Subscription-Key: {api_key}`
- **Response Format**: `?format=json` or `?format=xml`

### Key Endpoints

#### Standings & Competition
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/Standings/{season}` | Regular season standings for all divisions and leagues | 5 minutes | `Standing[]` |

#### Teams & Rosters
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/AllTeams` | All teams with full information | 4 hours | `Team[]` |
| `/scores/json/teams` | Active teams only | 4 hours | `Team[]` |
| `/scores/json/teams/{season}` | Teams by season | 4 hours | `Team[]` |
| `/scores/json/PlayersByActive` | All active players with biographical info | 1 hour | `PlayerBasic[]` |
| `/scores/json/PlayersByFreeAgents` | Free agent players | 1 hour | `PlayerBasic[]` |
| `/scores/json/PlayersBasic/{team}` | Players by team | 5 minutes | `PlayerBasic[]` |
| `/scores/json/Players` | All active players with detailed info | 1 hour | `Player[]` |
| `/scores/json/FreeAgents` | Free agent players with detailed info | 1 hour | `Player[]` |
| `/scores/json/Players/{team}` | Team players with full bio and injury info | 1 hour | `Player[]` |

#### Venues & Officials
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/Stadiums` | All stadiums with capacity, surface, dimensions | 4 hours | `Stadium[]` |

#### Schedules & Games
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/Games/{season}` | Full game schedules with betting info, weather | 5 minutes | `Game[]` |
| `/scores/json/SchedulesBasic/{season}` | Basic schedules (teams, dates, times) | 5 minutes | `ScheduleBasic[]` |
| `/scores/json/ScoresBasicFinal/{date}` | Final scores by date | 5 seconds | `ScoreBasic[]` |
| `/scores/json/GamesByDateFinal/{date}` | Final games by date | 5 seconds | `Game[]` |
| `/scores/json/ScoresBasic/{date}` | Live & final scores by date | 5 seconds | `ScoreBasic[]` |
| `/scores/json/GamesByDate/{date}` | Live & final games by date | 5 seconds | `Game[]` |

#### Team & Player Stats
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/stats/json/BoxScoreFinal/{gameid}` | Final box scores | 1 minute | `BoxScore` |
| `/stats/json/BoxScoresFinal/{date}` | Final box scores by date | 1 minute | `BoxScore[]` |
| `/stats/json/BoxScore/{gameid}` | Live & final box scores | 1 minute | `BoxScore` |
| `/stats/json/BoxScores/{date}` | Live & final box scores by date | 1 minute | `BoxScore[]` |
| `/stats/json/BoxScoresDelta/{date}/{minutes}` | Delta box scores (last X minutes) | 3 seconds | `BoxScore[]` |
| `/stats/json/PlayerGameStatsByDate/{date}` | Player game stats by date | 5 minutes | `PlayerGame[]` |
| `/stats/json/PlayerSeasonStats/{season}` | Season-long player stats | 15 minutes | `PlayerSeason[]` |
| `/stats/json/PlayerSeasonSplitStats/{season}/{split}` | Player split stats (L/R/S) | 15 minutes | `PlayerSeason[]` |
| `/stats/json/TeamSeasonStats/{season}` | Team season stats | 5 minutes | `TeamSeason[]` |

#### Play-by-Play
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/pbp/json/PlayByPlayFinal/{gameid}` | Final play-by-play | 1 minute | `PlayByPlay` |
| `/pbp/json/PlayByPlay/{gameid}` | Live & final play-by-play | 1 minute | `PlayByPlay` |
| `/pbp/json/PlayByPlayDelta/{date}/{minutes}` | Delta play-by-play (last X minutes) | 3 seconds | `PlayByPlay[]` |

#### Player Feeds
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/projections/json/DepthCharts` | Team depth charts | 5 minutes | `TeamDepthChart[]` |
| `/projections/json/InjuredPlayers` | Injured players list | 1 minute | `Player[]` |
| `/projections/json/StartingLineupsByDate/{date}` | Starting lineups by date | 3 minutes | `StartingLineups[]` |
| `/scores/json/TransactionsByDate/{date}` | Transactions by date | 1 minute | `Transaction[]` |

#### Betting & Odds
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/odds/json/GameOddsByDate/{date}` | Pre-game odds by date | 30 seconds | `GameInfo[]` |
| `/odds/json/LiveGameOddsByDate/{date}` | In-game odds by date | 5 seconds | `GameInfo[]` |
| `/odds/json/AlternateMarketGameOddsByDate/{date}` | Period game odds by date | 1 minute | `GameInfo[]` |
| `/odds/json/BettingMarkets/{eventId}` | All betting markets for event | 10 minutes | `BettingMarket[]` |
| `/odds/json/BettingPlayerPropsByGameID/{gameId}` | Player props by game | 10 minutes | `BettingMarket[]` |

#### Fantasy & Projections
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/projections/json/PlayerGameProjectionStatsByDate/{date}` | Player game projections by date | 5 minutes | `PlayerGameProjection[]` |
| `/projections/json/PlayerSeasonProjectionStats/{season}` | Player season projections | 5 minutes | `PlayerSeasonProjection[]` |
| `/projections/json/DfsSlatesByDate/{date}` | DFS slates by date | 15 minutes | `DfsSlate[]` |

#### News & Images
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/News` | Basic RotoBaller news | 3 minutes | `News[]` |
| `/scores/json/NewsByDate/{date}` | News by date | 3 minutes | `News[]` |
| `/scores/json/NewsByPlayerID/{playerid}` | News by player | 3 minutes | `News[]` |
| `/headshots/json/Headshots` | Player headshots | 1 hour | `Headshot[]` |

#### Utility Endpoints
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/AreAnyGamesInProgress` | Check if games are live | 5 seconds | `boolean` |
| `/scores/json/CurrentSeason` | Current season year | 5 minutes | `Season` |
| `/odds/json/BettingMetadata` | Betting metadata and market types | 15 minutes | `BettingEntityMetadataCollection` |
| `/odds/json/ActiveSportsbooks` | Active sportsbooks list | 1 hour | `Sportsbook[]` |

### Season Format Examples
- **Regular Season**: `2025`, `2025REG`
- **Preseason**: `2025PRE`
- **Postseason**: `2025POST`
- **All-Star**: `2025STAR`

### Data Tables Included
- **Team**: Full team info with stadium, colors, coaching staff
- **Player**: Biographical info, position, team, jersey number, injury status
- **Game**: Game details, stadium info, betting lines, weather, probable pitchers
- **BoxScore**: Team and player stats, inning-by-inning scoring
- **PlayByPlay**: Individual plays with detailed stats and outcomes
- **Headshot**: Player photos with multiple URL variants
- **BettingMarket**: Odds, spreads, totals, props, futures
- **Stadium**: Venue info with capacity, surface, dimensions, location

## NBA

### Base URL
```
https://api.sportsdata.io/v3/nba/
```

### Authentication
- **Query Parameter**: `?key={api_key}`
- **Header**: `Ocp-Apim-Subscription-Key: {api_key}`
- **Response Format**: `?format=json` or `?format=xml`

### Key Endpoints

#### Standings & Competition
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/Standings/{season}` | Regular season standings for all teams | 5 minutes | `Standing[]` |

#### Teams & Rosters
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/AllTeams` | All teams with full information (including All-Star teams) | 4 hours | `Team[]` |
| `/scores/json/teams` | Active teams only | 4 hours | `Team[]` |
| `/scores/json/teams/{season}` | Teams by season | 4 hours | `Team[]` |
| `/scores/json/PlayersActiveBasic` | All active players with basic info | 15 minutes | `PlayerBasic[]` |
| `/scores/json/PlayersByFreeAgents` | Free agent players | 1 hour | `PlayerBasic[]` |
| `/scores/json/PlayersBasic/{team}` | Players by team | 5 minutes | `PlayerBasic[]` |
| `/scores/json/Players` | All active players with detailed info | 1 hour | `Player[]` |
| `/scores/json/FreeAgents` | Free agent players with detailed info | 1 hour | `Player[]` |
| `/scores/json/Players/{team}` | Team players with full bio and injury info | 1 hour | `Player[]` |

#### Venues & Officials
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/Referees` | All referees with position, number, college, experience | 1 day | `Referee[]` |
| `/scores/json/Stadiums` | All stadiums with capacity, address, location | 4 hours | `Stadium[]` |

#### Schedules & Games
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/Games/{season}` | Full game schedules with betting info, referees | 5 minutes | `Game[]` |
| `/scores/json/SchedulesBasic/{season}` | Basic schedules (teams, dates, times) | 5 minutes | `ScheduleBasic[]` |
| `/scores/json/ScoresBasicFinal/{date}` | Final scores by date | 5 seconds | `ScoreBasic[]` |
| `/scores/json/GamesByDateFinal/{date}` | Final games by date | 5 seconds | `Game[]` |
| `/scores/json/ScoresBasic/{date}` | Live & final scores by date | 5 seconds | `ScoreBasic[]` |
| `/scores/json/GamesByDate/{date}` | Live & final games by date | 5 seconds | `Game[]` |

#### Team & Player Stats
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/stats/json/BoxScoreFinal/{gameid}` | Final box scores | 1 minute | `BoxScore` |
| `/stats/json/BoxScoresFinal/{date}` | Final box scores by date | 1 minute | `BoxScore[]` |
| `/stats/json/BoxScore/{gameid}` | Live & final box scores | 1 minute | `BoxScore` |
| `/stats/json/BoxScores/{date}` | Live & final box scores by date | 1 minute | `BoxScore[]` |
| `/stats/json/BoxScoresDelta/{date}/{minutes}` | Delta box scores (last X minutes) | 3 seconds | `BoxScore[]` |
| `/stats/json/PlayerGameStatsByDate/{date}` | Player game stats by date | 5 minutes | `PlayerGame[]` |
| `/stats/json/PlayerSeasonStats/{season}` | Season-long player stats | 15 minutes | `PlayerSeason[]` |
| `/stats/json/TeamSeasonStats/{season}` | Team season stats | 5 minutes | `TeamSeason[]` |
| `/stats/json/TeamStatsAllowedByPosition/{season}` | Team stats allowed by position | 5 minutes | `TeamSeason[]` |

#### Play-by-Play
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/pbp/json/PlayByPlayFinal/{gameid}` | Final play-by-play | 1 minute | `PlayByPlay` |
| `/pbp/json/PlayByPlay/{gameid}` | Live & final play-by-play | 1 minute | `PlayByPlay` |
| `/pbp/json/PlayByPlayDelta/{date}/{minutes}` | Delta play-by-play (last X minutes) | 3 seconds | `PlayByPlay[]` |

#### Player Feeds
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/stats/json/AllStars/{season}` | All-Star Game players | 4 hours | `PlayerInfo[]` |
| `/scores/json/DepthCharts` | Team depth charts | 5 minutes | `TeamDepthChart[]` |
| `/projections/json/InjuredPlayers` | Injured players list | 1 minute | `Player[]` |
| `/projections/json/StartingLineupsByDate/{date}` | Starting lineups by date | 3 minutes | `StartingLineups[]` |
| `/scores/json/TransactionsByDate/{date}` | Transactions by date | 1 minute | `Transaction[]` |

#### Betting & Odds
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/odds/json/GameOddsByDate/{date}` | Pre-game odds by date | 30 seconds | `GameInfo[]` |
| `/odds/json/LiveGameOddsByDate/{date}` | In-game odds by date | 5 seconds | `GameInfo[]` |
| `/odds/json/AlternateMarketGameOddsByDate/{date}` | Period game odds (1st half/quarter) | 1 minute | `GameInfo[]` |
| `/odds/json/BettingMarkets/{eventId}` | All betting markets for event | 10 minutes | `BettingMarket[]` |
| `/odds/json/BettingPlayerPropsByGameID/{gameId}` | Player props by game | 10 minutes | `BettingMarket[]` |

#### Fantasy & Projections
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/projections/json/PlayerGameProjectionStatsByDate/{date}` | Player game projections by date | 5 minutes | `PlayerGameProjection[]` |
| `/projections/json/PlayerSeasonProjectionStats/{season}` | Player season projections | 5 minutes | `PlayerSeasonProjection[]` |
| `/projections/json/PlayerSeasonProjectionStatsByTeam/{season}/{team}` | Player projections by team | 5 minutes | `PlayerSeasonProjection[]` |
| `/projections/json/DfsSlatesByDate/{date}` | DFS slates by date | 15 minutes | `DfsSlate[]` |

#### News & Images
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/News` | Basic RotoBaller news | 3 minutes | `News[]` |
| `/scores/json/NewsByDate/{date}` | News by date | 3 minutes | `News[]` |
| `/scores/json/NewsByPlayerID/{playerid}` | News by player | 3 minutes | `News[]` |
| `/headshots/json/Headshots` | Player headshots | 1 hour | `Headshot[]` |

#### Utility Endpoints
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/AreAnyGamesInProgress` | Check if games are live | 5 seconds | `boolean` |
| `/scores/json/CurrentSeason` | Current season year | 5 minutes | `Season` |
| `/odds/json/BettingMetadata` | Betting metadata and market types | 15 minutes | `BettingEntityMetadataCollection` |
| `/odds/json/ActiveSportsbooks` | Active sportsbooks list | 1 hour | `Sportsbook[]` |

### Season Format Examples
- **Regular Season**: `2025`, `2025REG`
- **Preseason**: `2025PRE`
- **Postseason**: `2025POST`
- **All-Star**: `2025STAR`

### Data Tables Included
- **Team**: Full team info with conference, division, colors, logos, head coach
- **Player**: Biographical info, position, team, jersey number, injury status
- **Game**: Game details, stadium info, betting lines, quarter-by-quarter scores
- **BoxScore**: Team and player stats, quarter-by-quarter scoring
- **PlayByPlay**: Individual plays with detailed stats and outcomes
- **Headshot**: Player photos with multiple URL variants
- **BettingMarket**: Odds, spreads, totals, props, futures
- **Referee**: Official info with position, number, college, experience
- **Stadium**: Venue info with capacity, address, location

## NHL

### Base URL
```
https://api.sportsdata.io/v3/nhl/
```

### Authentication
- **Query Parameter**: `?key={api_key}`
- **Header**: `Ocp-Apim-Subscription-Key: {api_key}`
- **Response Format**: `?format=json` or `?format=xml`

### Key Endpoints

#### Standings & Competition
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/Standings/{season}` | Regular season standings for all teams | 5 minutes | `Standing[]` |

#### Teams & Rosters
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/AllTeams` | All teams with full information (including All-Star teams) | 4 hours | `Team[]` |
| `/scores/json/teams` | Active teams only | 4 hours | `Team[]` |
| `/scores/json/teams/{season}` | Teams by season | 4 hours | `Team[]` |
| `/scores/json/PlayersByActive` | All active players with basic info | 1 hour | `PlayerBasic[]` |
| `/scores/json/PlayersByFreeAgents` | Free agent players | 1 hour | `PlayerBasic[]` |
| `/scores/json/PlayersBasic/{team}` | Players by team | 5 minutes | `PlayerBasic[]` |
| `/scores/json/Players` | All active players with detailed info | 1 hour | `Player[]` |
| `/scores/json/FreeAgents` | Free agent players with detailed info | 1 hour | `Player[]` |
| `/scores/json/Players/{team}` | Team players with full bio and injury info | 1 hour | `Player[]` |

#### Venues & Officials
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/Stadiums` | All stadiums with capacity, address, location | 4 hours | `Stadium[]` |

#### Schedules & Games
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/Games/{season}` | Full game schedules with betting info, penalties, scoring plays | 5 minutes | `Game[]` |
| `/scores/json/SchedulesBasic/{season}` | Basic schedules (teams, dates, times) | 5 minutes | `ScheduleBasic[]` |
| `/scores/json/ScoresBasicFinal/{date}` | Final scores by date | 5 seconds | `ScoreBasic[]` |
| `/scores/json/GamesByDateFinal/{date}` | Final games by date | 5 seconds | `Game[]` |
| `/scores/json/ScoresBasic/{date}` | Live & final scores by date | 5 seconds | `ScoreBasic[]` |
| `/scores/json/GamesByDate/{date}` | Live & final games by date | 5 seconds | `Game[]` |

#### Team & Player Stats
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/stats/json/BoxScoreFinal/{gameid}` | Final box scores | 1 minute | `BoxScore` |
| `/stats/json/BoxScoresFinal/{date}` | Final box scores by date | 1 minute | `BoxScore[]` |
| `/stats/json/BoxScore/{gameid}` | Live & final box scores | 1 minute | `BoxScore` |
| `/stats/json/BoxScores/{date}` | Live & final box scores by date | 1 minute | `BoxScore[]` |
| `/stats/json/BoxScoresDelta/{date}/{minutes}` | Delta box scores (last X minutes) | 3 seconds | `BoxScore[]` |
| `/stats/json/PlayerGameStatsByDate/{date}` | Player game stats by date | 5 minutes | `PlayerGame[]` |
| `/stats/json/PlayerSeasonStats/{season}` | Season-long player stats | 15 minutes | `PlayerSeason[]` |
| `/stats/json/TeamSeasonStats/{season}` | Team season stats | 5 minutes | `TeamSeason[]` |
| `/stats/json/TeamStatsAllowedByPosition/{season}` | Team stats allowed by position | 5 minutes | `TeamSeason[]` |

#### Play-by-Play
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/pbp/json/PlayByPlayFinal/{gameid}` | Final play-by-play | 1 minute | `PlayByPlay` |
| `/pbp/json/PlayByPlay/{gameid}` | Live & final play-by-play | 1 minute | `PlayByPlay` |
| `/pbp/json/PlayByPlayDelta/{date}/{minutes}` | Delta play-by-play (last X minutes) | 3 seconds | `PlayByPlay[]` |

#### Player Feeds
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/GoalieDepthCharts` | Goaltender depth charts | 5 minutes | `TeamGoalieDepthChart[]` |
| `/stats/json/LinesBySeason/{season}` | Line combinations by season | 15 minutes | `TeamLine[]` |
| `/projections/json/InjuredPlayers` | Injured players list | 1 minute | `Player[]` |
| `/projections/json/StartingGoaltendersByDate/{date}` | Starting goaltenders by date | 3 minutes | `StartingGoaltenders[]` |
| `/scores/json/TransactionsByDate/{date}` | Transactions by date | 1 minute | `Transaction[]` |

#### Betting & Odds
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/odds/json/GameOddsByDate/{date}` | Pre-game odds by date | 30 seconds | `GameInfo[]` |
| `/odds/json/LiveGameOddsByDate/{date}` | In-game odds by date | 5 seconds | `GameInfo[]` |
| `/odds/json/AlternateMarketGameOddsByDate/{date}` | Period game odds (1st period/regulation) | 1 minute | `GameInfo[]` |
| `/odds/json/BettingMarkets/{eventId}` | All betting markets for event | 10 minutes | `BettingMarket[]` |
| `/odds/json/BettingPlayerPropsByGameID/{gameId}` | Player props by game | 10 minutes | `BettingMarket[]` |

#### Fantasy & Projections
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/projections/json/PlayerGameProjectionStatsByDate/{date}` | Player game projections by date | 5 minutes | `PlayerGameProjection[]` |
| `/projections/json/DfsSlatesByDate/{date}` | DFS slates by date | 15 minutes | `DfsSlate[]` |

#### News & Images
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/News` | Basic RotoBaller news | 3 minutes | `News[]` |
| `/scores/json/NewsByDate/{date}` | News by date | 3 minutes | `News[]` |
| `/scores/json/NewsByPlayerID/{playerid}` | News by player | 3 minutes | `News[]` |
| `/headshots/json/Headshots` | Player headshots | 1 hour | `Headshot[]` |

#### Utility Endpoints
| Endpoint | Description | Cache Interval | Return Type |
|----------|-------------|----------------|-------------|
| `/scores/json/AreAnyGamesInProgress` | Check if games are live | 5 seconds | `boolean` |
| `/scores/json/CurrentSeason` | Current season year | 5 minutes | `Season` |
| `/odds/json/Bettingmetadata` | Betting metadata and market types | 15 minutes | `BettingEntityMetadataCollection` |
| `/odds/json/ActiveSportsbooks` | Active sportsbooks list | 1 hour | `Sportsbook[]` |

### Season Format Examples
- **Regular Season**: `2025`, `2025REG`
- **Preseason**: `2025PRE`
- **Postseason**: `2025POST`
- **All-Star**: `2025STAR`

### Data Tables Included
- **Team**: Full team info with conference, division, colors, logos, head coach
- **Player**: Biographical info, position, team, jersey number, injury status
- **Game**: Game details, stadium info, betting lines, period-by-period scores
- **BoxScore**: Team and player stats, period-by-period scoring
- **PlayByPlay**: Individual plays with detailed stats and outcomes
- **Headshot**: Player photos with multiple URL variants
- **BettingMarket**: Odds, spreads, totals, props, futures
- **Stadium**: Venue info with capacity, address, location
- **Penalty**: Penalty information and details
- **ScoringPlay**: Goal scoring events and assists
- **GoalieDepthChart**: Goaltender depth chart information
- **TeamLine**: Line combinations for skaters

---

*This document will be updated as additional sports leagues are added.*
