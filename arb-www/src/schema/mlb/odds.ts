import { BaseDTO } from '../BaseDTO';

export interface PregameOdd {
  GameOddId: number;
  Sportsbook: string;
  GameId: number;
  Created: string;
  Updated: string;
  HomeMoneyLine: number | null;
  AwayMoneyLine: number | null;
  HomePointSpread: number | null;
  AwayPointSpread: number | null;
  HomePointSpreadPayout: number | null;
  AwayPointSpreadPayout: number | null;
  OverUnder: number | null;
  OverPayout: number | null;
  UnderPayout: number | null;
  SportsbookId: number;
  SportsbookUrl: string | null;
  OddType: string;
  Unlisted: string | null;
}

export interface LiveOdd {
  GameOddId: number;
  Sportsbook: string;
  GameId: number;
  Created: string;
  Updated: string;
  HomeMoneyLine: number | null;
  AwayMoneyLine: number | null;
  HomePointSpread: number | null;
  AwayPointSpread: number | null;
  HomePointSpreadPayout: number | null;
  AwayPointSpreadPayout: number | null;
  OverUnder: number | null;
  OverPayout: number | null;
  UnderPayout: number | null;
  SportsbookId: number;
  SportsbookUrl: string | null;
  OddType: string;
  Unlisted: string | null;
}

export interface AlternateMarketPregameOdd {
  GameOddId: number;
  Sportsbook: string;
  GameId: number;
  Created: string;
  Updated: string;
  HomeMoneyLine: number | null;
  AwayMoneyLine: number | null;
  HomePointSpread: number | null;
  AwayPointSpread: number | null;
  HomePointSpreadPayout: number | null;
  AwayPointSpreadPayout: number | null;
  OverUnder: number | null;
  OverPayout: number | null;
  UnderPayout: number | null;
  SportsbookId: number;
  SportsbookUrl: string | null;
  OddType: string;
  Unlisted: string | null;
}

export interface GameOdds {
  GameId: number;
  Season: number;
  SeasonType: number;
  Day: string;
  DateTime: string;
  Status: string;
  AwayTeamId: number;
  HomeTeamId: number;
  AwayTeamName: string;
  HomeTeamName: string;
  GlobalGameId: number;
  GlobalAwayTeamId: number;
  GlobalHomeTeamId: number;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  TotalScore: number | null;
  HomeRotationNumber: number;
  AwayRotationNumber: number;
  PregameOdds: PregameOdd[];
  LiveOdds: LiveOdd[];
  AlternateMarketPregameOdds: AlternateMarketPregameOdd[];
}

export class MLBOddsByDateResponse extends BaseDTO {
  league: string = '';
  date: string = '';
  data: GameOdds[] = [];
  games_count: number = 0;

  static fromJSON<T extends BaseDTO>(this: new () => T, json: any): T {
    const instance = new this();
    (instance as any).league = json.league || '';
    (instance as any).date = json.date || '';
    (instance as any).data = json.data || [];
    (instance as any).games_count = json.games_count || 0;
    return instance;
  }
}
