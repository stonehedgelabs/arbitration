import { BaseDTO } from '../BaseDTO';

/**
 * NFL Stadium Details information
 */
export class NFLStadiumDetails extends BaseDTO {
  StadiumID!: number;
  Name!: string;
  City!: string;
  State?: string;
  Country!: string;
  Capacity!: number;
  PlayingSurface!: string;
  GeoLat?: number;
  GeoLong?: number;
  Type!: string;
}

/**
 * NFL Game by Date information
 */
export class NFLGameByDate extends BaseDTO {
  GameKey!: string;
  SeasonType!: number;
  Season!: number;
  Week!: number;
  Date!: string;
  AwayTeam!: string;
  HomeTeam!: string;
  AwayScore?: number;
  HomeScore?: number;
  Channel?: string;
  PointSpread?: number;
  OverUnder?: number;
  Quarter?: string;
  TimeRemaining?: string;
  Possession?: string;
  Down?: string;
  Distance?: string;
  YardLine?: number;
  YardLineTerritory?: string;
  RedZone?: boolean;
  AwayScoreQuarter1?: number;
  AwayScoreQuarter2?: number;
  AwayScoreQuarter3?: number;
  AwayScoreQuarter4?: number;
  AwayScoreOvertime?: number;
  HomeScoreQuarter1?: number;
  HomeScoreQuarter2?: number;
  HomeScoreQuarter3?: number;
  HomeScoreQuarter4?: number;
  HomeScoreOvertime?: number;
  HasStarted?: boolean;
  IsInProgress?: boolean;
  IsOver?: boolean;
  Has1stQuarterStarted?: boolean;
  Has2ndQuarterStarted?: boolean;
  Has3rdQuarterStarted?: boolean;
  Has4thQuarterStarted?: boolean;
  IsOvertime?: boolean;
  DownAndDistance?: string;
  QuarterDescription?: string;
  StadiumID!: number;
  LastUpdated?: string;
  GeoLat?: number;
  GeoLong?: number;
  ForecastTempLow?: number;
  ForecastTempHigh?: number;
  ForecastDescription?: string;
  ForecastWindChill?: number;
  ForecastWindSpeed?: number;
  AwayTeamMoneyLine?: number;
  HomeTeamMoneyLine?: number;
  Canceled!: boolean;
  Closed?: boolean;
  LastPlay?: string;
  Day!: string;
  DateTime!: string;
  AwayTeamID?: number;
  HomeTeamID?: number;
  GlobalGameID!: number;
  GlobalAwayTeamID!: number;
  GlobalHomeTeamID!: number;
  PointSpreadAwayTeamMoneyLine?: number;
  PointSpreadHomeTeamMoneyLine?: number;
  ScoreID!: number;
  Status!: string;
  GameEndDateTime?: string;
  HomeRotationNumber?: number;
  AwayRotationNumber?: number;
  NeutralVenue?: boolean;
  RefereeID?: number;
  OverPayout?: number;
  UnderPayout?: number;
  HomeTimeouts?: number;
  AwayTimeouts?: number;
  DateTimeUTC!: string;
  Attendance?: number;
  IsClosed?: boolean;
  StadiumDetails?: NFLStadiumDetails;
}

/**
 * NFL Game by Date response
 */
export class NFLGameByDateResponse extends BaseDTO {
  data!: NFLGameByDate[];
  league!: string;
}
