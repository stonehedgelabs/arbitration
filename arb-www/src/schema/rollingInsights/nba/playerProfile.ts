import { BaseDTO } from '../../BaseDTO';

/**
 * NBA Rolling Insights Player Profile
 */
export class NBARollingInsightsPlayerProfile extends BaseDTO {
  player_id!: number;
  player!: string;
  team_id!: number;
  team!: string;
  number!: number;
  status!: string;
  position!: string;
  position_category!: string;
  height!: string;
  weight!: number;
  age!: string;
  college!: string;
}

/**
 * Rolling Insights NBA Player Profile response wrapper
 */
export interface NBARollingInsightsPlayerProfileResponse {
  league: string;
  data_type: string;
  data: {
    Nba: {
      PlayerProfiles: NBARollingInsightsPlayerProfile[];
    };
  };
  filtered_count: number;
  total_count: number;
}

