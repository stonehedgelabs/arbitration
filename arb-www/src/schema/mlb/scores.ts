import { BaseDTO } from '../BaseDTO';

/**
 * MLB Team information
 */
export class MLBTeam extends BaseDTO {
  id!: number;
  name!: string;
  city!: string;
  abbreviation!: string;
  logo?: string;
  score?: number;
}

/**
 * MLB Game information
 */
export class MLBGame extends BaseDTO {
  id!: string;
  homeTeam!: MLBTeam;
  awayTeam!: MLBTeam;
  status!: 'live' | 'final' | 'upcoming';
  time!: string;
  quarter?: string;
  date!: string;
  league!: string;
  // Location/Venue information
  stadium?: string;
  city?: string;
  state?: string;
  weather?: string;
  temperature?: number;
}

/**
 * MLB Scores response
 */
export class MLBScoresResponse extends BaseDTO {
  data!: any[]; // Raw API data array
  date!: string;
  league!: string;
  games_count!: number;
  live_games_count!: number;
  final_games_count!: number;
}
