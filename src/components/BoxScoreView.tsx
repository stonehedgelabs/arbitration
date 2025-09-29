import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ArrowLeft, MapPin, Clock } from "lucide-react";

interface PlayerStat {
  name: string;
  position: string;
  completions?: number;
  attempts?: number;
  yards: number;
  touchdowns: number;
  interceptions?: number;
  carries?: number;
  receptions?: number;
  targets?: number;
  longest?: number;
}

interface TeamStats {
  firstDowns: number;
  totalYards: number;
  passingYards: number;
  rushingYards: number;
  turnovers: number;
  penalties: number;
  penaltyYards: number;
  timeOfPossession: string;
}

interface BoxScoreData {
  id: string;
  homeTeam: {
    name: string;
    city: string;
    abbreviation: string;
    score: number;
    quarterScores: number[];
    stats: TeamStats;
    passingStats: PlayerStat[];
    rushingStats: PlayerStat[];
    receivingStats: PlayerStat[];
  };
  awayTeam: {
    name: string;
    city: string;
    abbreviation: string;
    score: number;
    quarterScores: number[];
    stats: TeamStats;
    passingStats: PlayerStat[];
    rushingStats: PlayerStat[];
    receivingStats: PlayerStat[];
  };
  gameInfo?: {
    date: string;
    time: string;
    venue: string;
    attendance: string;
    weather?: string;
    status: string;
  };
}

interface BoxScoreViewProps {
  game: BoxScoreData;
  sport: string;
  onBack: () => void;
}

export function BoxScoreView({ game, sport, onBack }: BoxScoreViewProps) {
  const getQuarterLabels = () => {
    switch (sport) {
      case "nfl":
        return ["1st", "2nd", "3rd", "4th"];
      case "nba":
        return ["1st", "2nd", "3rd", "4th"];
      case "mlb":
        return ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];
      case "nhl":
        return ["1st", "2nd", "3rd"];
      case "mls":
        return ["1st", "2nd"];
      default:
        return ["1st", "2nd", "3rd", "4th"];
    }
  };

  const quarters = getQuarterLabels();

  const StatRow = ({
    label,
    homeValue,
    awayValue,
  }: {
    label: string;
    homeValue: string | number;
    awayValue: string | number;
  }) => (
    <div className="flex justify-between items-center py-2 border-b last:border-b-0">
      <div className="text-sm text-center w-1/4">{awayValue}</div>
      <div className="text-sm font-medium text-center flex-1">{label}</div>
      <div className="text-sm text-center w-1/4">{homeValue}</div>
    </div>
  );

  const PlayerStatRow = ({
    player,
    statType,
  }: {
    player: PlayerStat;
    statType: string;
  }) => {
    if (sport === "nfl") {
      if (statType === "passing") {
        return (
          <div className="flex justify-between items-center py-2 text-sm border-b last:border-b-0">
            <div className="flex-1">
              <span className="font-medium">{player.name}</span>
              <span className="text-muted-foreground ml-1">
                {player.position}
              </span>
            </div>
            <div className="text-right w-16">
              {player.completions}/{player.attempts}
            </div>
            <div className="text-right w-12">{player.yards}</div>
            <div className="text-right w-8">{player.touchdowns}</div>
            <div className="text-right w-8">{player.interceptions}</div>
          </div>
        );
      } else if (statType === "rushing") {
        return (
          <div className="flex justify-between items-center py-2 text-sm border-b last:border-b-0">
            <div className="flex-1">
              <span className="font-medium">{player.name}</span>
              <span className="text-muted-foreground ml-1">
                {player.position}
              </span>
            </div>
            <div className="text-right w-12">{player.carries}</div>
            <div className="text-right w-12">{player.yards}</div>
            <div className="text-right w-8">{player.touchdowns}</div>
            <div className="text-right w-12">{player.longest}</div>
          </div>
        );
      } else {
        return (
          <div className="flex justify-between items-center py-2 text-sm border-b last:border-b-0">
            <div className="flex-1">
              <span className="font-medium">{player.name}</span>
              <span className="text-muted-foreground ml-1">
                {player.position}
              </span>
            </div>
            <div className="text-right w-12">{player.receptions}</div>
            <div className="text-right w-12">{player.yards}</div>
            <div className="text-right w-8">{player.touchdowns}</div>
            <div className="text-right w-12">{player.longest}</div>
          </div>
        );
      }
    } else if (sport === "nba") {
      return (
        <div className="flex justify-between items-center py-2 text-sm border-b last:border-b-0">
          <div className="flex-1">
            <span className="font-medium">{player.name}</span>
            <span className="text-muted-foreground ml-1">
              {player.position}
            </span>
          </div>
          <div className="text-right w-8">{(player as any).points}</div>
          <div className="text-right w-8">{(player as any).rebounds}</div>
          <div className="text-right w-8">{(player as any).assists}</div>
          <div className="text-right w-12">{(player as any).fieldGoals}</div>
          <div className="text-right w-8">{(player as any).minutes}</div>
        </div>
      );
    } else if (sport === "mlb") {
      if (statType === "batting") {
        return (
          <div className="flex justify-between items-center py-2 text-sm border-b last:border-b-0">
            <div className="flex-1">
              <span className="font-medium">{player.name}</span>
              <span className="text-muted-foreground ml-1">
                {player.position}
              </span>
            </div>
            <div className="text-right w-8">{(player as any).atBats}</div>
            <div className="text-right w-8">{(player as any).runs}</div>
            <div className="text-right w-8">{(player as any).hits}</div>
            <div className="text-right w-8">{(player as any).rbis}</div>
            <div className="text-right w-12">{(player as any).average}</div>
          </div>
        );
      } else {
        return (
          <div className="flex justify-between items-center py-2 text-sm border-b last:border-b-0">
            <div className="flex-1">
              <span className="font-medium">{player.name}</span>
              <span className="text-muted-foreground ml-1">
                {player.position}
              </span>
            </div>
            <div className="text-right w-8">{(player as any).innings}</div>
            <div className="text-right w-8">{(player as any).hits}</div>
            <div className="text-right w-8">{(player as any).runs}</div>
            <div className="text-right w-8">{(player as any).strikeouts}</div>
            <div className="text-right w-12">{(player as any).era}</div>
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-center">Box Score</h1>
          </div>
          <div className="w-8"></div>
        </div>
      </header>

      <div className="pb-4">
        {/* Game Header */}
        <Card className="m-4 mb-3">
          <CardContent className="p-4">
            {/* Teams and Score */}
            <div className="space-y-4 mb-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div>
                    <div className="font-medium">{game.awayTeam.city}</div>
                    <div className="text-sm text-muted-foreground">
                      {game.awayTeam.name}
                    </div>
                  </div>
                </div>
                <div className="font-mono text-2xl font-medium">
                  {game.awayTeam.score}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div>
                    <div className="font-medium">{game.homeTeam.city}</div>
                    <div className="text-sm text-muted-foreground">
                      {game.homeTeam.name}
                    </div>
                  </div>
                </div>
                <div className="font-mono text-2xl font-medium">
                  {game.homeTeam.score}
                </div>
              </div>
            </div>

            {/* Game Info */}
            {game.gameInfo && (
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground border-t pt-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{game.gameInfo.status}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{game.gameInfo.venue}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quarter by Quarter */}
        <Card className="mx-4 mb-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Scoring Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Team</th>
                    {quarters.map((quarter) => (
                      <th key={quarter} className="text-center py-2 w-12">
                        {quarter}
                      </th>
                    ))}
                    <th className="text-center py-2 w-12 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-medium">
                      {game.awayTeam.abbreviation}
                    </td>
                    {game.awayTeam.quarterScores.map((score, index) => (
                      <td key={index} className="text-center py-2">
                        {score}
                      </td>
                    ))}
                    <td className="text-center py-2 font-medium">
                      {game.awayTeam.score}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-medium">
                      {game.homeTeam.abbreviation}
                    </td>
                    {game.homeTeam.quarterScores.map((score, index) => (
                      <td key={index} className="text-center py-2">
                        {score}
                      </td>
                    ))}
                    <td className="text-center py-2 font-medium">
                      {game.homeTeam.score}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Team Stats */}
        <Card className="mx-4 mb-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Team Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-3 text-sm font-medium">
              <div className="w-1/4 text-center">
                {game.awayTeam.abbreviation}
              </div>
              <div className="flex-1 text-center">Statistic</div>
              <div className="w-1/4 text-center">
                {game.homeTeam.abbreviation}
              </div>
            </div>
            <div className="space-y-0">
              <StatRow
                label="First Downs"
                homeValue={game.homeTeam.stats.firstDowns}
                awayValue={game.awayTeam.stats.firstDowns}
              />
              <StatRow
                label="Total Yards"
                homeValue={game.homeTeam.stats.totalYards}
                awayValue={game.awayTeam.stats.totalYards}
              />
              <StatRow
                label="Passing Yards"
                homeValue={game.homeTeam.stats.passingYards}
                awayValue={game.awayTeam.stats.passingYards}
              />
              <StatRow
                label="Rushing Yards"
                homeValue={game.homeTeam.stats.rushingYards}
                awayValue={game.awayTeam.stats.rushingYards}
              />
              <StatRow
                label="Turnovers"
                homeValue={game.homeTeam.stats.turnovers}
                awayValue={game.awayTeam.stats.turnovers}
              />
              <StatRow
                label="Penalties"
                homeValue={`${game.homeTeam.stats.penalties}-${game.homeTeam.stats.penaltyYards}`}
                awayValue={`${game.awayTeam.stats.penalties}-${game.awayTeam.stats.penaltyYards}`}
              />
              <StatRow
                label="Time of Possession"
                homeValue={game.homeTeam.stats.timeOfPossession}
                awayValue={game.awayTeam.stats.timeOfPossession}
              />
            </div>
          </CardContent>
        </Card>

        {/* Player Stats - Sport Specific */}
        {sport === "nfl" && (
          <>
            {/* Passing */}
            <Card className="mx-4 mb-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Passing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">
                      {game.awayTeam.city} {game.awayTeam.name}
                    </h4>
                    <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground border-b pb-1">
                      <div className="flex-1">Player</div>
                      <div className="text-right w-16">C/ATT</div>
                      <div className="text-right w-12">YDS</div>
                      <div className="text-right w-8">TD</div>
                      <div className="text-right w-8">INT</div>
                    </div>
                    {game.awayTeam.passingStats?.map((player, index) => (
                      <PlayerStatRow
                        key={index}
                        player={player}
                        statType="passing"
                      />
                    ))}
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">
                      {game.homeTeam.city} {game.homeTeam.name}
                    </h4>
                    <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground border-b pb-1">
                      <div className="flex-1">Player</div>
                      <div className="text-right w-16">C/ATT</div>
                      <div className="text-right w-12">YDS</div>
                      <div className="text-right w-8">TD</div>
                      <div className="text-right w-8">INT</div>
                    </div>
                    {game.homeTeam.passingStats?.map((player, index) => (
                      <PlayerStatRow
                        key={index}
                        player={player}
                        statType="passing"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rushing */}
            <Card className="mx-4 mb-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Rushing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">
                      {game.awayTeam.city} {game.awayTeam.name}
                    </h4>
                    <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground border-b pb-1">
                      <div className="flex-1">Player</div>
                      <div className="text-right w-12">CAR</div>
                      <div className="text-right w-12">YDS</div>
                      <div className="text-right w-8">TD</div>
                      <div className="text-right w-12">LONG</div>
                    </div>
                    {game.awayTeam.rushingStats?.map((player, index) => (
                      <PlayerStatRow
                        key={index}
                        player={player}
                        statType="rushing"
                      />
                    ))}
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">
                      {game.homeTeam.city} {game.homeTeam.name}
                    </h4>
                    <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground border-b pb-1">
                      <div className="flex-1">Player</div>
                      <div className="text-right w-12">CAR</div>
                      <div className="text-right w-12">YDS</div>
                      <div className="text-right w-8">TD</div>
                      <div className="text-right w-12">LONG</div>
                    </div>
                    {game.homeTeam.rushingStats?.map((player, index) => (
                      <PlayerStatRow
                        key={index}
                        player={player}
                        statType="rushing"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Receiving */}
            <Card className="mx-4 mb-20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Receiving</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">
                      {game.awayTeam.city} {game.awayTeam.name}
                    </h4>
                    <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground border-b pb-1">
                      <div className="flex-1">Player</div>
                      <div className="text-right w-12">REC</div>
                      <div className="text-right w-12">YDS</div>
                      <div className="text-right w-8">TD</div>
                      <div className="text-right w-12">LONG</div>
                    </div>
                    {game.awayTeam.receivingStats?.map((player, index) => (
                      <PlayerStatRow
                        key={index}
                        player={player}
                        statType="receiving"
                      />
                    ))}
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">
                      {game.homeTeam.city} {game.homeTeam.name}
                    </h4>
                    <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground border-b pb-1">
                      <div className="flex-1">Player</div>
                      <div className="text-right w-12">REC</div>
                      <div className="text-right w-12">YDS</div>
                      <div className="text-right w-8">TD</div>
                      <div className="text-right w-12">LONG</div>
                    </div>
                    {game.homeTeam.receivingStats?.map((player, index) => (
                      <PlayerStatRow
                        key={index}
                        player={player}
                        statType="receiving"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {sport === "nba" && (
          <Card className="mx-4 mb-20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Player Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">
                    {game.awayTeam.city} {game.awayTeam.name}
                  </h4>
                  <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground border-b pb-1">
                    <div className="flex-1">Player</div>
                    <div className="text-right w-8">PTS</div>
                    <div className="text-right w-8">REB</div>
                    <div className="text-right w-8">AST</div>
                    <div className="text-right w-12">FG</div>
                    <div className="text-right w-8">MIN</div>
                  </div>
                  {(game.awayTeam as any).playerStats?.map(
                    (player: any, index: number) => (
                      <PlayerStatRow
                        key={index}
                        player={player}
                        statType="nba"
                      />
                    ),
                  )}
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">
                    {game.homeTeam.city} {game.homeTeam.name}
                  </h4>
                  <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground border-b pb-1">
                    <div className="flex-1">Player</div>
                    <div className="text-right w-8">PTS</div>
                    <div className="text-right w-8">REB</div>
                    <div className="text-right w-8">AST</div>
                    <div className="text-right w-12">FG</div>
                    <div className="text-right w-8">MIN</div>
                  </div>
                  {(game.homeTeam as any).playerStats?.map(
                    (player: any, index: number) => (
                      <PlayerStatRow
                        key={index}
                        player={player}
                        statType="nba"
                      />
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {sport === "mlb" && (
          <>
            <Card className="mx-4 mb-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Batting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">
                      {game.awayTeam.city} {game.awayTeam.name}
                    </h4>
                    <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground border-b pb-1">
                      <div className="flex-1">Player</div>
                      <div className="text-right w-8">AB</div>
                      <div className="text-right w-8">R</div>
                      <div className="text-right w-8">H</div>
                      <div className="text-right w-8">RBI</div>
                      <div className="text-right w-12">AVG</div>
                    </div>
                    {(game.awayTeam as any).battingStats?.map(
                      (player: any, index: number) => (
                        <PlayerStatRow
                          key={index}
                          player={player}
                          statType="batting"
                        />
                      ),
                    )}
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">
                      {game.homeTeam.city} {game.homeTeam.name}
                    </h4>
                    <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground border-b pb-1">
                      <div className="flex-1">Player</div>
                      <div className="text-right w-8">AB</div>
                      <div className="text-right w-8">R</div>
                      <div className="text-right w-8">H</div>
                      <div className="text-right w-8">RBI</div>
                      <div className="text-right w-12">AVG</div>
                    </div>
                    {(game.homeTeam as any).battingStats?.map(
                      (player: any, index: number) => (
                        <PlayerStatRow
                          key={index}
                          player={player}
                          statType="batting"
                        />
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mx-4 mb-20">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Pitching</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">
                      {game.awayTeam.city} {game.awayTeam.name}
                    </h4>
                    <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground border-b pb-1">
                      <div className="flex-1">Player</div>
                      <div className="text-right w-8">IP</div>
                      <div className="text-right w-8">H</div>
                      <div className="text-right w-8">R</div>
                      <div className="text-right w-8">SO</div>
                      <div className="text-right w-12">ERA</div>
                    </div>
                    {(game.awayTeam as any).pitchingStats?.map(
                      (player: any, index: number) => (
                        <PlayerStatRow
                          key={index}
                          player={player}
                          statType="pitching"
                        />
                      ),
                    )}
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2">
                      {game.homeTeam.city} {game.homeTeam.name}
                    </h4>
                    <div className="flex justify-between items-center mb-2 text-xs text-muted-foreground border-b pb-1">
                      <div className="flex-1">Player</div>
                      <div className="text-right w-8">IP</div>
                      <div className="text-right w-8">H</div>
                      <div className="text-right w-8">R</div>
                      <div className="text-right w-8">SO</div>
                      <div className="text-right w-12">ERA</div>
                    </div>
                    {(game.homeTeam as any).pitchingStats?.map(
                      (player: any, index: number) => (
                        <PlayerStatRow
                          key={index}
                          player={player}
                          statType="pitching"
                        />
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
