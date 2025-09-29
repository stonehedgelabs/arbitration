import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

interface Team {
  name: string;
  score: number;
  logo?: string;
}

interface LiveGame {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: "live";
  time: string;
  quarter?: string;
}

interface LiveGamesSectionProps {
  games: LiveGame[];
  onGameClick?: (gameId: string) => void;
}

export function LiveGamesSection({
  games,
  onGameClick,
}: LiveGamesSectionProps) {
  const liveGames = games.filter((game) => game.status === "live");

  if (liveGames.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📺</span>
        </div>
        <h3 className="mb-2">No Live Games</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          There are no live games happening right now. Check back during game
          times for live play-by-play coverage.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <h2>Live Games</h2>
        <Badge
          variant="secondary"
          className="bg-red-100 text-red-700 border-red-200"
        >
          {liveGames.length} Live
        </Badge>
      </div>

      <div className="space-y-3">
        {liveGames.map((game) => (
          <Card
            key={game.id}
            className="active:scale-[0.98] transition-transform cursor-pointer border-l-4 border-l-red-500"
            onClick={() => onGameClick?.(game.id)}
          >
            <CardContent className="p-4">
              {/* Live indicator */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-red-600 uppercase tracking-wide">
                    Live
                  </span>
                </div>
                {game.quarter && (
                  <Badge variant="outline" className="text-xs">
                    {game.quarter}
                  </Badge>
                )}
              </div>

              {/* Away Team */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-sm">
                      {game.awayTeam.name}
                    </div>
                    <div className="text-xs text-muted-foreground">Away</div>
                  </div>
                </div>
                <div className="font-mono text-xl font-medium">
                  {game.awayTeam.score}
                </div>
              </div>

              {/* Home Team */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div>
                    <div className="font-medium text-sm">
                      {game.homeTeam.name}
                    </div>
                    <div className="text-xs text-muted-foreground">Home</div>
                  </div>
                </div>
                <div className="font-mono text-xl font-medium">
                  {game.homeTeam.score}
                </div>
              </div>

              {/* Action prompt */}
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Tap to view live play-by-play →
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
