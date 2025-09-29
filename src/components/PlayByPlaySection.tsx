import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock } from "lucide-react";

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

interface PlayByPlaySectionProps {
  plays: PlayEvent[];
  gameTitle: string;
}

export function PlayByPlaySection({
  plays,
  gameTitle,
}: PlayByPlaySectionProps) {
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
    <div className="space-y-3 p-4 pb-20">
      <h2>Live Play-by-Play</h2>
      <div className="space-y-2">
        {plays.map((play) => (
          <Card
            key={play.id}
            className="border-l-4 border-l-primary active:scale-[0.98] transition-transform"
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
                  </div>
                  <p className="text-xs text-muted-foreground mb-1 truncate">
                    {play.team}
                  </p>
                  <p className="text-sm leading-tight">{play.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
