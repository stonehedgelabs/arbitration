import { Clock } from "lucide-react";
import { Badge, Card } from "@chakra-ui/react";

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
  // Function to generate a short title from the description
  const getPlayTitle = (description: string): string => {
    // Extract the main action from the description
    const desc = description.toLowerCase();

    // Common patterns for different sports
    if (desc.includes("touchdown")) {
      return "Touchdown";
    } else if (desc.includes("field goal")) {
      return "Field Goal";
    } else if (desc.includes("interception")) {
      return "Interception";
    } else if (desc.includes("fumble")) {
      return "Fumble";
    } else if (desc.includes("sack")) {
      return "Sack";
    } else if (desc.includes("penalty")) {
      return "Penalty";
    } else if (desc.includes("timeout")) {
      return "Timeout";
    } else {
      // Fallback: use first few words of description
      const words = description.split(" ");
      return words.slice(0, 3).join(" ");
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
          <Card.Root
            key={play.id}
            className="border-l-4 border-l-primary active:scale-[0.98] transition-transform"
          >
            <Card.Body className="p-3">
              <div className="flex items-start gap-3">
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
                  <p className="text-sm font-medium leading-tight">
                    {getPlayTitle(play.description)}
                  </p>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {play.description}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card.Root>
        ))}
      </div>
    </div>
  );
}
