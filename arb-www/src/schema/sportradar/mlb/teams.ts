import { BaseDTO } from '../../BaseDTO';

/**
 * MLB Team Profile information
 */
export class MLBTeamProfile extends BaseDTO {
  TeamID!: number;
  Key!: string;
  Active!: boolean;
  City!: string | null;
  Name!: string;
  StadiumID!: number | null;
  League!: string;
  Division!: string;
  PrimaryColor!: string | null;
  SecondaryColor!: string | null;
  TertiaryColor!: string | null;
  QuaternaryColor!: string | null;
  WikipediaLogoUrl!: string;
  WikipediaWordMarkUrl!: string | null;
  GlobalTeamID!: number;
  HeadCoach!: string | null;
  HittingCoach!: string | null;
  PitchingCoach!: string | null;
}

/**
 * MLB Team Profiles response
 */
export class MLBTeamProfilesResponse extends BaseDTO {
  data!: MLBTeamProfile[];
  league!: string;
}
