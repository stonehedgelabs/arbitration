import { BaseDTO } from '../BaseDTO';

export class Inning extends BaseDTO {
  InningID!: number;
  GameID!: number;
  InningNumber!: number;
  AwayTeamRuns!: number;
  HomeTeamRuns!: number;
}

export class SeriesInfo extends BaseDTO {
  HomeTeamWins!: number;
  AwayTeamWins!: number;
  GameNumber!: number;
  MaxLength!: number;
}

export class GameByDate extends BaseDTO {
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
  GlobalGameID!: number;
  GlobalAwayTeamID!: number;
  GlobalHomeTeamID!: number;
  PointSpreadAwayTeamMoneyLine?: number;
  PointSpreadHomeTeamMoneyLine?: number;
  LastPlay?: string;
  IsClosed!: boolean;
  Updated!: string;
  GameEndDateTime?: string;
  HomeRotationNumber!: number;
  AwayRotationNumber!: number;
  NeutralVenue!: boolean;
  InningDescription?: string;
  OverPayout?: number;
  UnderPayout?: number;
  DateTimeUTC!: string;
  HomeTeamOpener?: boolean;
  AwayTeamOpener?: boolean;
  SuspensionResumeDay?: string;
  SuspensionResumeDateTime?: string;
  SeriesInfo!: SeriesInfo;
  Innings!: Inning[];
}

export class GameByDateResponse extends BaseDTO {
  data?: GameByDate;
  date!: string;
  game_id!: number;
  league!: string;
}
