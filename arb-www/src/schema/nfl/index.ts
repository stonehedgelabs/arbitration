export * from './teams';
export * from './headshots';
export * from './stadiums';

// Explicit re-exports to avoid naming conflicts with NFLStadiumDetails
export { 
  NFLBoxScoreGame, 
  NFLBoxScoreResponse,
  NFLStadiumDetails as NFLBoxScoreStadiumDetails 
} from './boxScore';

export { 
  NFLScheduleGame, 
  NFLScheduleResponse,
  NFLStadiumDetails as NFLScheduleStadiumDetails 
} from './schedule';

export { 
  NFLGameByDate, 
  NFLGameByDateResponse,
  NFLStadiumDetails as NFLGameByDateStadiumDetails 
} from './gameByDate';

export { 
  NFLScore, 
  NFLQuarter, 
  NFLPlay, 
  NFLPlayStat, 
  NFLPlayByPlayResponse,
  NFLStadiumDetails as NFLPlayByPlayStadiumDetails 
} from './playByPlay';

export { 
  NFLScoresGame, 
  NFLScoresResponse,
  NFLStadiumDetails as NFLScoresStadiumDetails 
} from './scores';
