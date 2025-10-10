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
 * NFL Schedule Game information
 */
export class NFLScheduleGame extends BaseDTO {
  GameKey!: string;
  SeasonType!: number;
  Season!: number;
  Week!: number;
  Date!: string;
  AwayTeam!: string;
  HomeTeam!: string;
  Channel?: string;
  PointSpread?: number;
  OverUnder?: number;
  StadiumID!: number;
  Canceled!: boolean;
  GeoLat?: number;
  GeoLong?: number;
  ForecastTempLow?: number;
  ForecastTempHigh?: number;
  ForecastDescription?: string;
  ForecastWindChill?: number;
  ForecastWindSpeed?: number;
  AwayTeamMoneyLine?: number;
  HomeTeamMoneyLine?: number;
  Day!: string;
  DateTime!: string;
  GlobalGameID!: number;
  GlobalAwayTeamID!: number;
  GlobalHomeTeamID!: number;
  ScoreID!: number;
  Status!: string;
  IsClosed?: boolean;
  DateTimeUTC!: string;
  StadiumDetails?: NFLStadiumDetails;
}

/**
 * NFL Schedule response
 */
export class NFLScheduleResponse extends BaseDTO {
  data!: NFLScheduleGame[];
  league!: string;
}
