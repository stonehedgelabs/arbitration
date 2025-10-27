import { BaseDTO } from '../../BaseDTO';

/**
 * NBA Team Profile information
 */
export class NBATeamProfile extends BaseDTO {
  TeamID!: number;
  Key!: string;
  Active!: boolean;
  City!: string;
  Name!: string;
  LeagueID!: number;
  StadiumID!: number;
  Conference!: string;
  Division!: string;
  PrimaryColor!: string;
  SecondaryColor!: string;
  TertiaryColor!: string;
  QuaternaryColor!: string;
  WikipediaLogoUrl!: string;
  WikipediaWordMarkUrl?: string;
  GlobalTeamID!: number;
  NbaDotComTeamID!: number;
  HeadCoach!: string;
}

/**
 * NBA Team Profiles response
 */
export class NBATeamProfilesResponse extends BaseDTO {
  data!: NBATeamProfile[];
  league!: string;
}
