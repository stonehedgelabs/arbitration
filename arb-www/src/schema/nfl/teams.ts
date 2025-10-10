import { BaseDTO } from '../BaseDTO';

/**
 * NFL Team Profile information
 */
export class NFLTeamProfile extends BaseDTO {
  Key!: string;
  TeamID!: number;
  PlayerID!: number;
  City!: string;
  Name!: string;
  Conference!: string;
  Division!: string;
  FullName!: string;
  StadiumID?: number;
  ByeWeek?: number;
  AverageDraftPosition?: number;
  AverageDraftPositionPPR?: number;
  HeadCoach?: string;
  OffensiveCoordinator?: string;
  DefensiveCoordinator?: string;
  SpecialTeamsCoach?: string;
  OffensiveScheme?: string;
  DefensiveScheme?: string;
  UpcomingSalary?: number;
  UpcomingOpponent?: string;
  UpcomingOpponentRank?: number;
  UpcomingOpponentPositionRank?: number;
  UpcomingFanDuelSalary?: number;
  UpcomingDraftKingsSalary?: number;
  UpcomingYahooSalary?: number;
  PrimaryColor?: string;
  SecondaryColor?: string;
  TertiaryColor?: string;
  QuaternaryColor?: string;
  WikipediaLogoUrl?: string;
  WikipediaWordMarkUrl?: string;
  GlobalTeamID!: number;
  DraftKingsName?: string;
  DraftKingsPlayerID?: number;
  FanDuelName?: string;
  FanDuelPlayerID?: number;
  FantasyDraftName?: string;
  FantasyDraftPlayerID?: number;
  YahooName?: string;
  YahooPlayerID?: number;
  AverageDraftPosition2QB?: number;
  AverageDraftPositionDynasty?: number;
  StadiumDetails?: any;
}

/**
 * NFL Team Profiles response
 */
export class NFLTeamProfilesResponse extends BaseDTO {
  data!: NFLTeamProfile[];
  league!: string;
}
