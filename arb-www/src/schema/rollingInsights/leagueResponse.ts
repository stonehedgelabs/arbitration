import { BaseDTO } from '../BaseDTO';
import type { NBARollingInsightsBoxScoreGame } from './nba/boxScore';
import type { NBARollingInsightsPlayerProfile } from './nba/playerProfile';
import type { NBARollingInsightsScheduleGame } from './nba/schedule';
import type { NBARollingInsightsTeamProfile } from './nba/teamProfile';

/**
 * Rolling Insights DataType enum
 */
export enum RollingInsightsDataType {
  Schedule = 'schedule',
  CurrentGames = 'current_games',
  TeamProfiles = 'team_profiles',
  Headshots = 'headshots',
  Stadiums = 'stadiums',
  Standings = 'standings',
  BoxScore = 'box_score',
  PlayByPlay = 'play_by_play',
  Odds = 'odds',
  GameByDate = 'game_by_date',
  Scores = 'scores',
}

/**
 * Rolling Insights League Response
 */
export class RollingInsightsLeagueResponse extends BaseDTO {
  league!: string;
  data_type!: RollingInsightsDataType;
  data!: RollingInsightsLeagueData;
  filtered_count!: number;
  total_count!: number;
}

/**
 * Rolling Insights League Data union type
 */
export type RollingInsightsLeagueData = 
  | { Nba: NBARollingInsightsData };

/**
 * Rolling Insights NBA Data
 */
export type NBARollingInsightsData = 
  | { Schedule: NBARollingInsightsScheduleGame[] }
  | { CurrentGames: NBARollingInsightsScheduleGame[] }
  | { TeamProfiles: NBARollingInsightsTeamProfile[] }
  | { PlayerProfiles: NBARollingInsightsPlayerProfile[] }
  | { BoxScore: NBARollingInsightsBoxScoreGame[] };

