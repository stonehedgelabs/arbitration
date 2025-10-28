import { BaseDTO } from '../../BaseDTO';

/**
 * NBA Team Profile information
 */
export class NBATeamProfile extends BaseDTO {
  TeamID!: number;
  Key!: string;
  Active!: boolean;
  City!: string | null;
  Name!: string;
  LeagueID!: number;
  StadiumID!: number | null;
  Conference!: string | null;
  Division!: string | null;
  PrimaryColor!: string | null;
  SecondaryColor!: string | null;
  TertiaryColor!: string | null;
  QuaternaryColor!: string | null;
  WikipediaLogoUrl!: string | null;
  WikipediaWordMarkUrl!: string | null;
  GlobalTeamID!: number;
  NbaDotComTeamID!: number | null;
  HeadCoach!: string | null;
}

/**
 * NBA Team Profiles response
 */
export class NBATeamProfilesResponse extends BaseDTO {
  data!: NBATeamProfile[];
  league!: string;
}
