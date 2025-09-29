import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowLeft, Clock, Wifi } from "lucide-react";

interface PlayEvent {
  id: string;
  time: string;
  quarter: string;
  team: string;
  description: string;
  type:
    | "touchdown"
    | "field_goal"
    | "turnover"
    | "penalty"
    | "timeout"
    | "other";
}

interface LiveGame {
  id: string;
  homeTeam: { name: string; score: number };
  awayTeam: { name: string; score: number };
  status: string;
  quarter?: string;
}

interface LivePlayByPlayViewProps {
  game: LiveGame;
  plays: PlayEvent[];
  onBack: () => void;
}

export function LivePlayByPlayView({
  game,
  plays,
  onBack,
}: LivePlayByPlayViewProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "touchdown":
        return "🏈";
      case "field_goal":
        return "🥅";
      case "turnover":
        return "🔄";
      case "penalty":
        return "🚩";
      case "timeout":
        return "⏱️";
      default:
        return "📝";
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case "touchdown":
        return <Badge className="bg-green-600">TD</Badge>;
      case "field_goal":
        return <Badge className="bg-blue-600">FG</Badge>;
      case "turnover":
        return <Badge className="bg-orange-600">TO</Badge>;
      case "penalty":
        return <Badge className="bg-yellow-600">PEN</Badge>;
      default:
        return null;
    }
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
            <h1 className="text-center">Live Play-by-Play</h1>
          </div>
          <div className="w-8"></div>
        </div>
      </header>

      <div className="pb-4">
        {/* Game Status Card */}
        <Card className="m-4 mb-3 border-l-4 border-l-red-500">
          <CardContent className="p-4">
            {/* Live indicator */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-red-600 uppercase tracking-wide">
                  Live
                </span>
                <Wifi className="w-3 h-3 text-red-600" />
              </div>
              {game.quarter && (
                <Badge variant="outline" className="text-xs">
                  {game.quarter}
                </Badge>
              )}
            </div>

            {/* Teams and Score */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div>
                    <div className="font-medium">{game.awayTeam.name}</div>
                    <div className="text-xs text-muted-foreground">Away</div>
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
                    <div className="font-medium">{game.homeTeam.name}</div>
                    <div className="text-xs text-muted-foreground">Home</div>
                  </div>
                </div>
                <div className="font-mono text-2xl font-medium">
                  {game.homeTeam.score}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto-refresh indicator */}
        <div className="mx-4 mb-3 p-2 bg-muted/50 rounded-lg">
          <div className="text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            Auto-refreshing every 30 seconds
          </div>
        </div>

        {/* Play by Play */}
        <div className="space-y-3 px-4 pb-20">
          <h3 className="font-medium">Recent Plays</h3>

          {plays.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Waiting for live updates...
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {plays.map((play, index) => (
                <Card
                  key={play.id}
                  className={`border-l-4 border-l-primary ${index === 0 ? "bg-accent/30" : ""}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="text-xl flex-shrink-0">
                        {getEventIcon(play.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {play.quarter}
                          </Badge>
                          <div className="flex items-center gap-1 text-muted-foreground text-xs">
                            <Clock className="w-3 h-3" />
                            <span>{play.time}</span>
                          </div>
                          {getEventBadge(play.type)}
                          {index === 0 && (
                            <Badge className="bg-green-600 text-xs">
                              Latest
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1 truncate">
                          {play.team}
                        </p>
                        <p className="text-sm leading-tight">
                          {play.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
