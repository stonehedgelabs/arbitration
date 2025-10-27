import { BaseDTO } from '../../BaseDTO';
import { NBAQuarter, NBAScheduleGame } from './schedule';

/**
 * NBA Play information
 */
export class NBAPlay extends BaseDTO {
  PlayID!: number;
  QuarterID!: number;
  QuarterName!: string;
  Sequence!: number;
  TimeRemainingMinutes!: number;
  TimeRemainingSeconds!: number;
  AwayTeamScore!: number;
  HomeTeamScore!: number;
  PotentialPoints!: number;
  Points!: number;
  ShotMade!: boolean;
  Category!: string;
  Type!: string;
  TeamID?: number;
  Team?: string;
  OpponentID?: number;
  Opponent?: string;
  ReceivingTeamID?: number;
  ReceivingTeam?: string;
  Description!: string;
  PlayerID?: number;
  AssistedByPlayerID?: number;
  BlockedByPlayerID?: number;
  FastBreak?: boolean;
  SideOfBasket!: string;
  Updated!: string;
  Created!: string;
  SubstituteInPlayerID?: number;
  SubstituteOutPlayerID?: number;
  AwayPlayerID?: number;
  HomePlayerID?: number;
  ReceivingPlayerID?: number;
  BaselineOffsetPercentage?: number;
  SidelineOffsetPercentage?: number;
  Coordinates!: string;
  StolenByPlayerID?: number;
}

/**
 * NBA Play-by-Play response
 */
export class NBAPlayByPlayResponse extends BaseDTO {
  Game!: NBAScheduleGame;
  Quarters!: NBAQuarter[];
  Plays!: NBAPlay[];
}
