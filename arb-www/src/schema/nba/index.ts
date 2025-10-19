// Explicit re-exports to avoid naming conflicts and improve clarity
export { 
  NBAStadium, 
  NBAStadiumsResponse 
} from './stadiums';

export { 
  NBAStanding,
  NBAStandingsResponse 
} from './standings';

export { 
  NBATeamProfile, 
  NBATeamProfilesResponse 
} from './teams';

export { 
  NBAQuarter,
  NBAScheduleGame, 
  NBAScheduleResponse 
} from './schedule';

export type { 
  NBAHeadshot,
  NBAHeadshotsResponse 
} from './headshots';

export { 
  NBAPlay,
  NBAPlayByPlayResponse 
} from './playByPlay';

export { 
  NBATeamGame,
  NBAPlayerGame,
  NBABoxScoreResponse 
} from './boxScore';
