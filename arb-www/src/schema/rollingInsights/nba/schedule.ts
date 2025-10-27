import { BaseDTO } from '../../BaseDTO';

/**
 * NBA Rolling Insights Schedule Game
 */
export class NBARollingInsightsScheduleGame extends BaseDTO {
  away_team!: string;
  home_team!: string;
  'away_team_ID'!: number;
  'home_team_ID'!: number;
  'game_ID'!: string;
  'game_time'!: string;
  'season_type'!: string;
  'event_name'?: string | null;
  round?: string | null;
  season!: string;
  status!: string;
  broadcast?: string | null;
}

/**
 * Rolling Insights NBA Schedule response wrapper
 */
export interface NBARollingInsightsScheduleResponse {
  league: string;
  data_type: string;
  data: {
    Nba: {
      Schedule: NBARollingInsightsScheduleGame[];
    };
  };
  filtered_count: number;
  total_count: number;
}

