import { BaseDTO } from '../../BaseDTO';

export class PlayByPlayResponse extends BaseDTO {
  Game!: PlayByPlayGame;
  Plays!: MLBPlay[];
}

export class PlayByPlayGame extends BaseDTO {
  GameID!: number;
  Season!: number;
  SeasonType!: number;
  Status?: string;
  Day!: string;
  DateTime!: string;
  AwayTeam!: string;
  HomeTeam!: string;
  AwayTeamID!: number;
  HomeTeamID!: number;
  RescheduledGameID?: number;
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
  SeriesInfo!: SeriesInfo;
  Innings!: PlayByPlayInning[];
}

export class SeriesInfo extends BaseDTO {
  HomeTeamWins!: number;
  AwayTeamWins!: number;
  GameNumber!: number;
  MaxLength!: number;
}

export class PlayByPlayInning extends BaseDTO {
  InningID!: number;
  GameID!: number;
  InningNumber!: number;
  AwayTeamRuns!: number;
  HomeTeamRuns!: number;
}

export class MLBPlay extends BaseDTO {
  PlayID!: number;
  InningID!: number;
  InningNumber!: number;
  InningHalf!: string;
  PlayNumber!: number;
  InningBatterNumber!: number;
  AwayTeamRuns!: number;
  HomeTeamRuns!: number;
  HitterID!: number;
  PitcherID!: number;
  HitterTeamID!: number;
  PitcherTeamID!: number;
  HitterName!: string;
  PitcherName!: string;
  PitcherThrowHand!: string;
  HitterBatHand!: string;
  HitterPosition!: string;
  Outs!: number;
  Balls!: number;
  Strikes!: number;
  PitchNumberThisAtBat!: number;
  Result?: string;
  NumberOfOutsOnPlay!: number;
  RunsBattedIn!: number;
  AtBat!: boolean;
  Strikeout!: boolean;
  Walk!: boolean;
  Hit!: boolean;
  Out!: boolean;
  Sacrifice!: boolean;
  Error!: boolean;
  Updated!: string;
  Description?: string;
  Runner1ID?: number;
  Runner2ID?: number;
  Runner3ID?: number;
  Pitches!: Pitch[];
}

export class Pitch extends BaseDTO {
  PitchID!: number;
  PlayID!: number;
  PitchNumberThisAtBat!: number;
  PitcherID!: number;
  HitterID!: number;
  Outs!: number;
  BallsBeforePitch!: number;
  StrikesBeforePitch!: number;
  Strike!: boolean;
  Ball!: boolean;
  Foul!: boolean;
  Swinging!: boolean;
  Looking!: boolean;
}

export class PlayByPlayApiResponse extends BaseDTO {
  data!: PlayByPlayResponse;
  league!: string;
}
