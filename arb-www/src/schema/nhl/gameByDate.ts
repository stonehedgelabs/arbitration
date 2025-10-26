import { BaseDTO } from '../BaseDTO';

/**
 * NHL Game by Date information
 */
export class NHLGameByDate extends BaseDTO {
  GameID!: number;
  Season!: number;
  SeasonType!: number;
  Status!: string;
  Day!: string;
  DateTime!: string;
  Updated!: string;
  IsClosed!: boolean;
  AwayTeam!: string;
  HomeTeam!: string;
  AwayTeamID!: number;
  HomeTeamID!: number;
  StadiumID!: number;
  Channel?: string;
  Attendance?: number;
  AwayTeamScore?: number;
  HomeTeamScore?: number;
  Period?: number;
  TimeRemainingMinutes?: number;
  TimeRemainingSeconds?: number;
  AwayTeamMoneyLine?: number;
  HomeTeamMoneyLine?: number;
  PointSpread?: number;
  OverUnder?: number;
  GlobalGameID!: number;
  GlobalAwayTeamID!: number;
  GlobalHomeTeamID!: number;
  PointSpreadAwayTeamMoneyLine?: number;
  PointSpreadHomeTeamMoneyLine?: number;
  LastPlay?: string;
  GameEndDateTime?: string;
  HomeRotationNumber?: number;
  AwayRotationNumber?: number;
  NeutralVenue!: boolean;
  OverPayout?: number;
  UnderPayout?: number;
  DateTimeUTC!: string;
  SeriesInfo?: any;
  Periods!: any[];
}

/**
 * NHL Game by Date response
 */
export class NHLGameByDateResponse extends BaseDTO {
  data!: NHLGameByDate[];
  league!: string;
}
