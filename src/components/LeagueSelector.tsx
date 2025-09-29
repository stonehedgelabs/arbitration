import { Button } from "./ui/button";

export interface League {
  id: string;
  name: string;
  abbreviation: string;
  color: string;
}

interface LeagueSelectorProps {
  leagues: League[];
  selectedLeague: string;
  onLeagueChange: (leagueId: string) => void;
}

export function LeagueSelector({
  leagues,
  selectedLeague,
  onLeagueChange,
}: LeagueSelectorProps) {
  return (
    <div className="flex gap-3 overflow-x-auto px-4 py-3 bg-card border-b scrollbar-hide">
      {leagues.map((league) => (
        <Button
          key={league.id}
          variant={selectedLeague === league.id ? "default" : "outline"}
          onClick={() => onLeagueChange(league.id)}
          className="whitespace-nowrap min-w-[60px] h-10 rounded-full"
          style={{
            backgroundColor:
              selectedLeague === league.id ? league.color : undefined,
            borderColor: league.color,
            color: selectedLeague === league.id ? "white" : league.color,
          }}
        >
          {league.abbreviation}
        </Button>
      ))}
    </div>
  );
}
