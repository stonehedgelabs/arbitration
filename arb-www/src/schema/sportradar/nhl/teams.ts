import { BaseDTO } from '../../BaseDTO';

/**
 * NHL Team Profile information
 */
export class NHLTeamProfile extends BaseDTO {
  TeamID!: number;
  Key!: string;
  Active!: boolean;
  City!: string;
  Name!: string;
  StadiumID!: number;
  Conference!: string;
  Division!: string;
  PrimaryColor!: string;
  SecondaryColor!: string;
  TertiaryColor!: string;
  QuaternaryColor?: string;
  WikipediaLogoUrl!: string;
  WikipediaWordMarkUrl?: string;
  GlobalTeamID!: number;
  HeadCoach!: string;
}

/**
 * NHL Team Profiles response
 */
export class NHLTeamProfilesResponse extends BaseDTO {
  data!: NHLTeamProfile[];
  league!: string;
}
