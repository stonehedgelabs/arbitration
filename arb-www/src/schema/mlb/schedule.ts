import { BaseDTO } from '../BaseDTO';

/**
 * MLB Schedule Game information
 */
export class MLBScheduleGame extends BaseDTO {
  GameID!: number;
  Season?: number;
  SeasonType?: number;
  Status?: string;
  Day?: string;
  DateTime?: string;
  AwayTeam?: string;
  HomeTeam?: string;
  AwayTeamID?: number;
  HomeTeamID?: number;
  RescheduledGameID?: number;
  StadiumID?: number;
  Channel?: string;
  Inning?: number;
  InningHalf?: string;
  AwayTeamRuns?: number;
  HomeTeamRuns?: number;
  AwayTeamHits?: number;
  HomeTeamHits?: number;
  AwayTeamErrors?: number;
  HomeTeamErrors?: number;
  WinningPitcherID?: number;
  LosingPitcherID?: number;
  SavingPitcherID?: number;
  Attendance?: number;
  AwayTeamProbablePitcherID?: number;
  HomeTeamProbablePitcherID?: number;
  Outs?: number;
  Balls?: number;
  Strikes?: number;
  CurrentPitcherID?: number;
  CurrentHitterID?: number;
  AwayTeamStartingPitcherID?: number;
  HomeTeamStartingPitcherID?: number;
  CurrentPitchingTeamID?: number;
  CurrentHittingTeamID?: number;
  PointSpread?: number;
  OverUnder?: number;
  AwayTeamMoneyLine?: number;
  HomeTeamMoneyLine?: number;
  ForecastTempLow?: number;
  ForecastTempHigh?: number;
  ForecastDescription?: string;
  ForecastWindChill?: number;
  ForecastWindSpeed?: number;
  ForecastWindDirection?: number;
  RescheduledFromGameID?: number;
  RunnerOnFirst?: boolean;
  RunnerOnSecond?: boolean;
  RunnerOnThird?: boolean;
  AwayTeamStartingPitcher?: string;
  HomeTeamStartingPitcher?: string;
  CurrentPitcher?: string;
  CurrentHitter?: string;
  WinningPitcher?: string;
  LosingPitcher?: string;
  SavingPitcher?: string;
  DueUpHitterID1?: number;
  DueUpHitterID2?: number;
  DueUpHitterID3?: number;
  GlobalGameID?: number;
  GlobalAwayTeamID?: number;
  GlobalHomeTeamID?: number;
  PointSpreadAwayTeamMoneyLine?: number;
  PointSpreadHomeTeamMoneyLine?: number;
  LastPlay?: string;
  IsClosed?: boolean;
  Updated?: string;
  GameEndDateTime?: string;
  HomeRotationNumber?: number;
  AwayRotationNumber?: number;
  NeutralVenue?: boolean;
  InningDescription?: string;
  OverPayout?: number;
  UnderPayout?: number;
  DateTimeUTC?: string;
  HomeTeamOpener?: boolean;
  AwayTeamOpener?: boolean;
  SuspensionResumeDay?: string;
  SuspensionResumeDateTime?: string;
  SeriesInfo?: any;
  Innings?: any[];
}

/**
 * MLB Schedule Response
 */
export class MLBScheduleResponse extends BaseDTO {
  league!: string;
  data_type!: string;
  data!: MLBScheduleGame[];
  filtered_count!: number;
  total_count!: number;
}
