import { BaseDTO } from '../BaseDTO';

/**
 * MLB Team Profile information
 */
export class MLBTeamProfile extends BaseDTO {
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
  QuaternaryColor!: string;
  WikipediaLogoUrl!: string;
  WikipediaWordMarkUrl!: string;
  GlobalTeamID!: number;
  HeadCoach!: string;
  ConferenceID!: number;
  DivisionID!: number;
}

/**
 * MLB Team Profiles response
 */
export class MLBTeamProfilesResponse extends BaseDTO {
  data!: MLBTeamProfile[];
  league!: string;
}
