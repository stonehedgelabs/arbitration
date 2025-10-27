import { BaseDTO } from '../../BaseDTO';

/**
 * NBA Quarter information
 */
export class NBAQuarter extends BaseDTO {
  QuarterID!: number;
  GameID!: number;
  Number!: number;
  Name!: string;
  AwayScore!: number;
  HomeScore!: number;
}

/**
 * NBA Schedule Game information
 */
export class NBAScheduleGame extends BaseDTO {
  GameID!: number;
  Season!: number;
  SeasonType!: number;
  Status!: string;
  Day!: string;
  DateTime!: string;
  AwayTeam!: string;
  HomeTeam!: string;
  AwayTeamID!: number;
  HomeTeamID!: number;
  StadiumID!: number;
  Channel?: string;
  Attendance?: number;
  AwayTeamScore?: number;
  HomeTeamScore?: number;
  Updated!: string;
  Quarter?: string;
  TimeRemainingMinutes?: number;
  TimeRemainingSeconds?: number;
  PointSpread?: number;
  OverUnder?: number;
  AwayTeamMoneyLine?: number;
  HomeTeamMoneyLine?: number;
  GlobalGameID!: number;
  GlobalAwayTeamID!: number;
  GlobalHomeTeamID!: number;
  PointSpreadAwayTeamMoneyLine?: number;
  PointSpreadHomeTeamMoneyLine?: number;
  LastPlay?: string;
  IsClosed!: boolean;
  GameEndDateTime?: string;
  HomeRotationNumber?: number;
  AwayRotationNumber?: number;
  NeutralVenue!: boolean;
  OverPayout?: number;
  UnderPayout?: number;
  CrewChiefID?: number;
  UmpireID?: number;
  RefereeID?: number;
  AlternateID?: number;
  DateTimeUTC!: string;
  InseasonTournament!: boolean;
  SeriesInfo?: any;
  Quarters!: NBAQuarter[];
}

/**
 * NBA Schedule response
 */
export class NBAScheduleResponse extends BaseDTO {
  data!: NBAScheduleGame[];
  league!: string;
}
