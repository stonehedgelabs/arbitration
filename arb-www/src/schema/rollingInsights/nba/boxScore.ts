import { BaseDTO } from '../../BaseDTO';

/**
 * NBA Rolling Insights Box Score Game
 */
export class NBARollingInsightsBoxScoreGame extends BaseDTO {
  round!: string | null;
  sport!: string;
  season!: string;
  status!: string;
  'game_ID'!: string;
  'full_box'!: FullBox;
  broadcast!: string | null;
  'game_time'!: string;
  'event_name'!: string | null;
  'player_box'!: PlayerBox;
  'game_status'!: string;
  'season_type'!: string;
  'game_location'!: string;
  'away_team_name'!: string;
  'home_team_name'!: string;
}

/**
 * Full Box Score structure
 */
export class FullBox extends BaseDTO {
  current!: Current;
  'away_team'!: TeamBox;
  'home_team'!: TeamBox;
}

/**
 * Current game state
 */
export class Current extends BaseDTO {
  Quarter!: number;
  'TimeRemaining'!: string | null;
}

/**
 * Team Box Score
 */
export class TeamBox extends BaseDTO {
  abbrv!: string;
  score!: number;
  mascot!: string;
  record!: string;
  team_id!: number;
  'team_stats'!: TeamStats;
  'division_name'!: string;
  'quarter_scores'!: Record<string, number>;
}

/**
 * Team Statistics
 */
export class TeamStats extends BaseDTO {
  fouls!: number;
  blocks!: number;
  steals!: number;
  assists!: number;
  turnovers!: number;
  'total_rebounds'!: number;
  'two_points_made'!: number;
  'field_goals_made'!: number;
  'free_throws_made'!: number;
  'three_points_made'!: number;
  'defensive_rebounds'!: number;
  'offensive_rebounds'!: number;
  'two_point_percentage'!: number;
  'two_points_attempted'!: number;
  'field_goals_attempted'!: number;
  'free_throws_attempted'!: number;
  'three_points_attempted'!: number;
}

/**
 * Player Box Score structure
 */
export class PlayerBox extends BaseDTO {
  'away_team'!: Record<string, PlayerStats>;
  'home_team'!: Record<string, PlayerStats>;
}

/**
 * Individual Player Statistics
 */
export class PlayerStats extends BaseDTO {
  fouls!: number;
  blocks!: number;
  player!: string;
  points!: number;
  status!: string;
  steals!: number;
  assists!: number;
  minutes!: string;
  position!: string;
  turnovers!: number;
  'total_rebounds'!: number;
  'two_points_made'!: number;
  'field_goals_made'!: number;
  'free_throws_made'!: number;
  'three_points_made'!: number;
  'defensive_rebounds'!: number;
  'offensive_rebounds'!: number;
  'two_point_percentage'!: number;
  'two_points_attempted'!: number;
  'field_goals_attempted'!: number;
  'free_throws_attempted'!: number;
  'three_points_attempted'!: number;
}

/**
 * Rolling Insights NBA Box Score response wrapper
 */
export interface NBARollingInsightsBoxScoreResponse {
  league: string;
  data_type: string;
  data: {
    Nba: {
      BoxScore: NBARollingInsightsBoxScoreGame[];
    };
  };
  filtered_count: number;
  total_count: number;
}

