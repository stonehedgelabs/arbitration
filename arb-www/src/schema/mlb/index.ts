// Explicit re-exports to avoid naming conflicts and improve clarity
export * from './teams';
export * from './stadiums';
export * from './schedule';

// BoxScore module exports
export { 
  Inning as BoxScoreInning,
  SeriesInfo as BoxScoreSeriesInfo,
  Game as BoxScoreGame,
  TeamGame as BoxScoreTeamGame,
  PlayerGame as BoxScorePlayerGame,
  BoxScore,
  BoxScoreResponse
} from './boxscore';

// GameByDate module exports  
export {
  Inning as GameByDateInning,
  SeriesInfo as GameByDateSeriesInfo,
  GameByDate,
  GameByDateResponse
} from './gameByDate';

// Scores module exports
export {
  MLBTeam as MLBScoresTeam,
  MLBGame as MLBScoresGame,
  MLBScoresResponse
} from './scores';

// Odds module exports
export {
  MLBOddsByDateResponse
} from './odds';

// PlayByPlay module exports
export {
  PlayByPlayResponse,
  PlayByPlayGame,
  SeriesInfo as PlayByPlaySeriesInfo,
  PlayByPlayInning,
  Play,
  Pitch,
  PlayByPlayApiResponse
} from './playbyplay';
