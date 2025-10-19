import { BaseDTO } from '../BaseDTO';

/**
 * MLB Standings information for a single team
 */
export class MLBStanding extends BaseDTO {
  Season!: number;
  SeasonType!: number;
  TeamID!: number;
  Key!: string;
  City!: string | null;
  Name!: string;
  League!: string;
  Division!: string;
  Wins!: number;
  Losses!: number;
  Percentage!: number;
  DivisionWins!: number;
  DivisionLosses!: number;
  GamesBehind!: number | null;
  LastTenGamesWins!: number;
  LastTenGamesLosses!: number;
  Streak!: string | null;
  LeagueRank!: number;
  DivisionRank!: number;
  WildCardRank!: number | null;
  WildCardGamesBehind!: number | null;
  HomeWins!: number;
  HomeLosses!: number;
  AwayWins!: number;
  AwayLosses!: number;
  DayWins!: number | null;
  DayLosses!: number | null;
  NightWins!: number | null;
  NightLosses!: number | null;
  RunsScored!: number;
  RunsAgainst!: number;
  GlobalTeamID!: number;
}

/**
 * MLB Standings response
 */
export class MLBStandingsResponse extends BaseDTO {
  data!: MLBStanding[];
}

