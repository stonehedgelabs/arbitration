import { BaseDTO } from '../../BaseDTO';

/**
 * NBA Rolling Insights Team Profile
 */
export class NBARollingInsightsTeamProfile extends BaseDTO {
  team_id!: number;
  team!: string;
  abbrv!: string;
  arena!: string;
  mascot!: string;
  conf!: string;
  location!: string;
}

/**
 * Rolling Insights NBA Team Profile response wrapper
 */
export interface NBARollingInsightsTeamProfileResponse {
  league: string;
  data_type: string;
  data: {
    Nba: {
      TeamProfiles: NBARollingInsightsTeamProfile[];
    };
  };
  filtered_count: number;
  total_count: number;
}

