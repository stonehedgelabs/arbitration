import { BaseDTO } from '../../BaseDTO';

/**
 * NFL Team Profile information
 */
export class NFLTeamProfile extends BaseDTO {
  Key!: string;
  TeamID!: number;
  PlayerID!: number | null;
  City!: string | null;
  Name!: string;
  Conference!: string | null;
  Division!: string | null;
  FullName!: string;
  StadiumID!: number | null;
  ByeWeek!: number | null;
  AverageDraftPosition!: number | null;
  AverageDraftPositionPPR!: number | null;
  HeadCoach!: string | null;
  OffensiveCoordinator!: string | null;
  DefensiveCoordinator!: string | null;
  SpecialTeamsCoach!: string | null;
  OffensiveScheme!: string | null;
  DefensiveScheme!: string | null;
  UpcomingSalary!: number | null;
  UpcomingOpponent!: string | null;
  UpcomingOpponentRank!: number | null;
  UpcomingOpponentPositionRank!: number | null;
  UpcomingFanDuelSalary!: number | null;
  UpcomingDraftKingsSalary!: number | null;
  UpcomingYahooSalary!: number | null;
  PrimaryColor!: string | null;
  SecondaryColor!: string | null;
  TertiaryColor!: string | null;
  QuaternaryColor!: string | null;
  WikipediaLogoUrl!: string | null;
  WikipediaWordMarkUrl!: string | null;
  GlobalTeamID!: number;
  DraftKingsName!: string | null;
  DraftKingsPlayerID!: number | null;
  FanDuelName!: string | null;
  FanDuelPlayerID!: number | null;
  FantasyDraftName!: string | null;
  FantasyDraftPlayerID!: number | null;
  YahooName!: string | null;
  YahooPlayerID!: number | null;
  AverageDraftPosition2QB!: number | null;
  AverageDraftPositionDynasty!: number | null;
  StadiumDetails!: any | null;
}

/**
 * NFL Team Profiles response
 */
export class NFLTeamProfilesResponse extends BaseDTO {
  data!: NFLTeamProfile[];
  league!: string;
}
