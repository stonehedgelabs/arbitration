import { BaseDTO } from '../BaseDTO';

/**
 * NFL Stadium Details information
 */
export class NFLStadiumDetails extends BaseDTO {
  StadiumID!: number;
  Name!: string;
  City!: string;
  State!: string;
  Country!: string;
  Capacity!: number;
  PlayingSurface!: string;
  GeoLat!: number;
  GeoLong!: number;
  Type!: string;
}

/**
 * NFL Score information
 */
export class NFLScore extends BaseDTO {
  GameKey!: string;
  SeasonType!: number;
  Season!: number;
  Week!: number;
  Date!: string;
  AwayTeam!: string;
  HomeTeam!: string;
  AwayScore!: number;
  HomeScore!: number;
  Channel!: string;
  PointSpread!: number;
  OverUnder!: number;
  Quarter!: string;
  TimeRemaining?: string;
  Possession?: string;
  Down?: number;
  Distance!: string;
  YardLine?: number;
  YardLineTerritory!: string;
  RedZone?: boolean;
  AwayScoreQuarter1!: number;
  AwayScoreQuarter2!: number;
  AwayScoreQuarter3!: number;
  AwayScoreQuarter4!: number;
  AwayScoreOvertime!: number;
  HomeScoreQuarter1!: number;
  HomeScoreQuarter2!: number;
  HomeScoreQuarter3!: number;
  HomeScoreQuarter4!: number;
  HomeScoreOvertime!: number;
  HasStarted!: boolean;
  IsInProgress!: boolean;
  IsOver!: boolean;
  Has1stQuarterStarted!: boolean;
  Has2ndQuarterStarted!: boolean;
  Has3rdQuarterStarted!: boolean;
  Has4thQuarterStarted!: boolean;
  IsOvertime!: boolean;
  DownAndDistance?: string;
  QuarterDescription!: string;
  StadiumID!: number;
  LastUpdated!: string;
  GeoLat?: number;
  GeoLong?: number;
  ForecastTempLow!: number;
  ForecastTempHigh!: number;
  ForecastDescription!: string;
  ForecastWindChill!: number;
  ForecastWindSpeed!: number;
  AwayTeamMoneyLine!: number;
  HomeTeamMoneyLine!: number;
  Canceled!: boolean;
  Closed!: boolean;
  LastPlay!: string;
  Day!: string;
  DateTime!: string;
  AwayTeamID!: number;
  HomeTeamID!: number;
  GlobalGameID!: number;
  GlobalAwayTeamID!: number;
  GlobalHomeTeamID!: number;
  PointSpreadAwayTeamMoneyLine!: number;
  PointSpreadHomeTeamMoneyLine!: number;
  ScoreID!: number;
  Status!: string;
  GameEndDateTime!: string;
  HomeRotationNumber!: number;
  AwayRotationNumber!: number;
  NeutralVenue!: boolean;
  RefereeID!: number;
  OverPayout!: number;
  UnderPayout!: number;
  HomeTimeouts?: number;
  AwayTimeouts?: number;
  DateTimeUTC!: string;
  Attendance!: number;
  IsClosed!: boolean;
  StadiumDetails!: NFLStadiumDetails;
}

/**
 * NFL Quarter information
 */
export class NFLQuarter extends BaseDTO {
  QuarterID!: number;
  ScoreID!: number;
  Number!: number;
  Name!: string;
  Description!: string;
  AwayTeamScore!: number;
  HomeTeamScore!: number;
  Updated!: string;
  Created!: string;
}

/**
 * NFL Play Stat information
 */
export class NFLPlayStat extends BaseDTO {
  PlayStatID!: number;
  PlayID!: number;
  Sequence!: number;
  PlayerID!: number;
  Name!: string;
  Team!: string;
  Opponent!: string;
  HomeOrAway!: string;
  Direction!: string;
  Updated!: string;
  Created!: string;
  
  // Passing stats
  PassingAttempts!: number;
  PassingCompletions!: number;
  PassingYards!: number;
  PassingTouchdowns!: number;
  PassingInterceptions!: number;
  PassingSacks!: number;
  PassingSackYards!: number;
  
  // Rushing stats
  RushingAttempts!: number;
  RushingYards!: number;
  RushingTouchdowns!: number;
  
  // Receiving stats
  ReceivingTargets!: number;
  Receptions!: number;
  ReceivingYards!: number;
  ReceivingTouchdowns!: number;
  
  // Fumble stats
  Fumbles!: number;
  FumblesLost!: number;
  
  // Two-point conversion stats
  TwoPointConversionAttempts!: number;
  TwoPointConversionPasses!: number;
  TwoPointConversionRuns!: number;
  TwoPointConversionReceptions!: number;
  TwoPointConversionReturns!: number;
  
  // Defensive stats
  SoloTackles!: number;
  AssistedTackles!: number;
  TacklesForLoss!: number;
  Sacks!: number;
  SackYards!: number;
  PassesDefended!: number;
  Safeties!: number;
  FumblesForced!: number;
  FumblesRecovered!: number;
  FumbleReturnYards!: number;
  FumbleReturnTouchdowns!: number;
  Interceptions!: number;
  InterceptionReturnYards!: number;
  InterceptionReturnTouchdowns!: number;
  
  // Return stats
  PuntReturns!: number;
  PuntReturnYards!: number;
  PuntReturnTouchdowns!: number;
  KickReturns!: number;
  KickReturnYards!: number;
  KickReturnTouchdowns!: number;
  
  // Special teams stats
  BlockedKicks!: number;
  BlockedKickReturns!: number;
  BlockedKickReturnYards!: number;
  BlockedKickReturnTouchdowns!: number;
  FieldGoalReturns!: number;
  FieldGoalReturnYards!: number;
  FieldGoalReturnTouchdowns!: number;
  
  // Kicking stats
  Kickoffs!: number;
  KickoffYards!: number;
  KickoffTouchbacks!: number;
  Punts!: number;
  PuntYards!: number;
  PuntTouchbacks!: number;
  PuntsHadBlocked!: number;
  FieldGoalsAttempted!: number;
  FieldGoalsMade!: number;
  FieldGoalsYards!: number;
  FieldGoalsHadBlocked!: number;
  ExtraPointsAttempted!: number;
  ExtraPointsMade!: number;
  ExtraPointsHadBlocked!: number;
  
  // Penalty stats
  Penalties!: number;
  PenaltyYards!: number;
}

/**
 * NFL Play information
 */
export class NFLPlay extends BaseDTO {
  PlayID!: number;
  QuarterID!: number;
  QuarterName!: string;
  Sequence!: number;
  TimeRemainingMinutes!: number;
  TimeRemainingSeconds!: number;
  PlayTime!: string;
  Updated!: string;
  Created!: string;
  Team!: string;
  Opponent!: string;
  Down!: number;
  Distance!: number;
  YardLine!: number;
  YardLineTerritory!: string;
  YardsToEndZone!: number;
  Type!: string;
  YardsGained!: number;
  Description!: string;
  IsScoringPlay!: boolean;
  ScoringPlay?: string;
  PlayStats!: NFLPlayStat[];
}

/**
 * NFL Play-by-Play response
 */
export class NFLPlayByPlayResponse extends BaseDTO {
  Score!: NFLScore;
  Quarters!: NFLQuarter[];
  Plays!: NFLPlay[];
}
