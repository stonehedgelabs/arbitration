import { BaseDTO } from '../BaseDTO';

export interface PregameOdd {
  GameOddId: number | null;
  Sportsbook: string | null;
  GameId: number | null;
  Created: string | null;
  Updated: string | null;
  HomeMoneyLine: number | null;
  AwayMoneyLine: number | null;
  HomePointSpread: number | null;
  AwayPointSpread: number | null;
  HomePointSpreadPayout: number | null;
  AwayPointSpreadPayout: number | null;
  OverUnder: number | null;
  OverPayout: number | null;
  UnderPayout: number | null;
  SportsbookId: number | null;
  SportsbookUrl: string | null;
  OddType: string | null;
  Unlisted: string | null;
}

export interface LiveOdd {
  GameOddId: number;
  Sportsbook: string | null;
  GameId: number;
  Created: string | null;
  Updated: string | null;
  HomeMoneyLine: number | null;
  AwayMoneyLine: number | null;
  HomePointSpread: number | null;
  AwayPointSpread: number | null;
  HomePointSpreadPayout: number | null;
  AwayPointSpreadPayout: number | null;
  OverUnder: number | null;
  OverPayout: number | null;
  UnderPayout: number | null;
  SportsbookId: number | null;
  SportsbookUrl: string | null;
  OddType: string | null;
  Unlisted: string | null;
}

export interface AlternateMarketPregameOdd {
  GameOddId: number;
  Sportsbook: string | null;
  GameId: number;
  Created: string | null;
  Updated: string | null;
  HomeMoneyLine: number | null;
  AwayMoneyLine: number | null;
  HomePointSpread: number | null;
  AwayPointSpread: number | null;
  HomePointSpreadPayout: number | null;
  AwayPointSpreadPayout: number | null;
  OverUnder: number | null;
  OverPayout: number | null;
  UnderPayout: number | null;
  SportsbookId: number | null;
  SportsbookUrl: string | null;
  OddType: string | null;
  Unlisted: string | null;
}

export interface GameOdds {
  GameId: number | null;
  Season: number | null;
  SeasonType: number | null;
  Day: string | null;
  DateTime: string | null;
  Status: string | null;
  AwayTeamId: number | null;
  HomeTeamId: number | null;
  AwayTeamName: string | null;
  HomeTeamName: string | null;
  GlobalGameId: number | null;
  GlobalAwayTeamId: number | null;
  GlobalHomeTeamId: number | null;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  TotalScore: number | null;
  HomeRotationNumber: number | null;
  AwayRotationNumber: number | null;
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
