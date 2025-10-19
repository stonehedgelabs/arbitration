import { BaseDTO } from '../BaseDTO';

/**
 * NFL Standings information
 */
export class NFLStanding extends BaseDTO {
  SeasonType!: number;
  Season!: number;
  Conference!: string;
  Division!: string;
  Team!: string;
  Name!: string;
  Wins!: number;
  Losses!: number;
  Ties!: number;
  Percentage!: number;
  PointsFor!: number;
  PointsAgainst!: number;
  NetPoints!: number;
  Touchdowns!: number;
  DivisionWins!: number;
  DivisionLosses!: number;
  ConferenceWins!: number;
  ConferenceLosses!: number;
  TeamID!: number;
  DivisionTies!: number;
  ConferenceTies!: number;
  GlobalTeamID!: number;
  DivisionRank!: number;
  ConferenceRank!: number;
  HomeWins!: number;
  HomeLosses!: number;
  HomeTies!: number;
  AwayWins!: number;
  AwayLosses!: number;
  AwayTies!: number;
  Streak!: number;
}

/**
 * NFL Standings response
 */
export class NFLStandingsResponse extends BaseDTO {
  data!: NFLStanding[];
}

