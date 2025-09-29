import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { FavoriteButton } from "./FavoriteButton";

interface Team {
  name: string;
  score: number;
  logo?: string;
}

interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: "live" | "final" | "upcoming";
  time: string;
  quarter?: string;
}

interface ScoresSectionProps {
  games: Game[];
  onGameClick?: (gameId: string) => void;
  favoriteTeams: string[];
  onToggleFavorite: (teamName: string) => void;
}

export function ScoresSection({
  games,
  onGameClick,
  favoriteTeams,
  onToggleFavorite,
}: ScoresSectionProps) {
  const getStatusBadge = (status: string, quarter?: string) => {
    switch (status) {
      case "live":
        return <Badge variant="destructive">{quarter || "LIVE"}</Badge>;
      case "final":
        return <Badge variant="secondary">FINAL</Badge>;
      case "upcoming":
        return <Badge variant="outline">UPCOMING</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3 p-4 pb-20">
      <h2>Today's Games</h2>
      {games.map((game) => (
        <Card
          key={game.id}
          className="active:scale-[0.98] transition-transform cursor-pointer"
          onClick={() => onGameClick?.(game.id)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground">{game.time}</span>
              {getStatusBadge(game.status, game.quarter)}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <span className="truncate">{game.awayTeam.name}</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-medium min-w-[2ch] text-right">
                    {game.awayTeam.score}
                  </span>
                  <FavoriteButton
                    teamName={game.awayTeam.name}
                    isFavorite={favoriteTeams.includes(game.awayTeam.name)}
                    onToggle={onToggleFavorite}
                    size="sm"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <span className="truncate">{game.homeTeam.name}</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-medium min-w-[2ch] text-right">
                    {game.homeTeam.score}
                  </span>
                  <FavoriteButton
                    teamName={game.homeTeam.name}
                    isFavorite={favoriteTeams.includes(game.homeTeam.name)}
                    onToggle={onToggleFavorite}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
