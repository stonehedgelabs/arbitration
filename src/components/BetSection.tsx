import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";

interface BettingLine {
  id: string;
  playerName: string;
  position: string;
  team: string;
  opponent: string;
  gameTime: string;
  statType: string;
  line: number;
  odds: string;
  trend: "up" | "down" | "neutral";
  percentage: number;
  description: string;
  overUnder: "over" | "under";
  recommendation: string;
}

interface BetSectionProps {
  bettingLines: BettingLine[];
}

export function BetSection({ bettingLines }: BetSectionProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-500";
      case "down":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getOddsColor = (odds: string) => {
    return odds.startsWith("+") ? "text-green-500" : "text-red-400";
  };

  if (bettingLines.length === 0) {
    return (
      <div className="space-y-3 p-4 pb-20">
        <h2>Betting Lines</h2>
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2">No Betting Lines</h3>
            <p className="text-sm text-muted-foreground">
              There are no betting lines available for this league yet. Check
              back later for player prop bets and insights.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 pb-20">
      <div className="flex items-center justify-between">
        <h2>Betting Lines</h2>
        <Badge variant="outline" className="text-xs">
          <BarChart3 className="w-3 h-3 mr-1" />
          Live Odds
        </Badge>
      </div>

      <div className="space-y-3">
        {bettingLines.map((line) => (
          <Card
            key={line.id}
            className="bg-gradient-to-r from-card to-card/80 border border-border/50 active:scale-[0.98] transition-transform shadow-sm"
          >
            <CardContent className="p-4">
              {/* Player Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {line.playerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{line.playerName}</span>
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {line.position}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {line.team} @ {line.opponent} • {line.gameTime}
                    </div>
                  </div>
                </div>
                {getTrendIcon(line.trend)}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3 leading-tight">
                {line.description}
              </p>

              {/* Betting Line */}
              <div className="bg-muted/30 rounded-lg p-3 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {line.overUnder === "over" ? "Over" : "Under"} {line.line}{" "}
                    {line.statType}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="relative w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                          line.trend === "up"
                            ? "bg-green-500"
                            : line.trend === "down"
                              ? "bg-red-500"
                              : "bg-muted-foreground"
                        }`}
                        style={{ width: `${line.percentage}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium ${getTrendColor(line.trend)}`}
                    >
                      {line.percentage}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 px-3">
                    <span
                      className={`text-sm font-medium ${getOddsColor(line.odds)}`}
                    >
                      {line.odds}
                    </span>
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {line.recommendation}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary"
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
