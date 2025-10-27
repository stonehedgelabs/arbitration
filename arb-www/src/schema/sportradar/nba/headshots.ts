export interface NBAHeadshot {
  PlayerID: number;
  Name: string;
  TeamID: number;
  Team: string;
  Position: string;
  PreferredHostedHeadshotUrl: string;
  PreferredHostedHeadshotUpdated: string;
  HostedHeadshotWithBackgroundUrl: string;
  HostedHeadshotWithBackgroundUpdated: string;
  HostedHeadshotNoBackgroundUrl: string;
  HostedHeadshotNoBackgroundUpdated: string;
}

export interface NBAHeadshotsResponse {
  data: NBAHeadshot[];
  league: string;
}
