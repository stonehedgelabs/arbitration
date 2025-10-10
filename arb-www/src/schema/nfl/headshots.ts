import { BaseDTO } from '../BaseDTO';

/**
 * NFL Headshot information
 */
export class NFLHeadshot extends BaseDTO {
  PlayerID!: number;
  Name!: string;
  TeamID!: number;
  Team!: string;
  Position!: string;
  PreferredHostedHeadshotUrl?: string;
  PreferredHostedHeadshotUpdated?: string;
  HostedHeadshotWithBackgroundUrl?: string;
  HostedHeadshotWithBackgroundUpdated?: string;
  HostedHeadshotNoBackgroundUrl?: string;
  HostedHeadshotNoBackgroundUpdated?: string;
}

/**
 * NFL Headshots response
 */
export class NFLHeadshotsResponse extends BaseDTO {
  data!: NFLHeadshot[];
  league!: string;
}
