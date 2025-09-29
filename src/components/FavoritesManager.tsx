import { useState } from "react";
import { motion } from "motion/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Settings, Heart, Check } from "lucide-react";

interface Team {
  id: string;
  name: string;
  league: string;
  leagueColor: string;
  city?: string;
}

interface FavoritesManagerProps {
  favoriteTeams: string[];
  onToggleFavorite: (teamName: string) => void;
}

const allTeams: Team[] = [
  // NFL Teams
  {
    id: "dal",
    name: "Dallas Cowboys",
    league: "NFL",
    leagueColor: "#013369",
    city: "Dallas",
  },
  {
    id: "gb",
    name: "Green Bay Packers",
    league: "NFL",
    leagueColor: "#013369",
    city: "Green Bay",
  },
  {
    id: "ne",
    name: "New England Patriots",
    league: "NFL",
    leagueColor: "#013369",
    city: "New England",
  },
  {
    id: "kc",
    name: "Kansas City Chiefs",
    league: "NFL",
    leagueColor: "#013369",
    city: "Kansas City",
  },
  {
    id: "sf",
    name: "San Francisco 49ers",
    league: "NFL",
    leagueColor: "#013369",
    city: "San Francisco",
  },
  {
    id: "buf",
    name: "Buffalo Bills",
    league: "NFL",
    leagueColor: "#013369",
    city: "Buffalo",
  },

  // NBA Teams
  {
    id: "lal",
    name: "Los Angeles Lakers",
    league: "NBA",
    leagueColor: "#C8102E",
    city: "Los Angeles",
  },
  {
    id: "bos",
    name: "Boston Celtics",
    league: "NBA",
    leagueColor: "#C8102E",
    city: "Boston",
  },
  {
    id: "gsw",
    name: "Golden State Warriors",
    league: "NBA",
    leagueColor: "#C8102E",
    city: "Golden State",
  },
  {
    id: "mia",
    name: "Miami Heat",
    league: "NBA",
    leagueColor: "#C8102E",
    city: "Miami",
  },
  {
    id: "chi",
    name: "Chicago Bulls",
    league: "NBA",
    leagueColor: "#C8102E",
    city: "Chicago",
  },
  {
    id: "bkn",
    name: "Brooklyn Nets",
    league: "NBA",
    leagueColor: "#C8102E",
    city: "Brooklyn",
  },

  // MLB Teams
  {
    id: "nyy",
    name: "New York Yankees",
    league: "MLB",
    leagueColor: "#002D72",
    city: "New York",
  },
  {
    id: "bos-mlb",
    name: "Boston Red Sox",
    league: "MLB",
    leagueColor: "#002D72",
    city: "Boston",
  },
  {
    id: "lad",
    name: "Los Angeles Dodgers",
    league: "MLB",
    leagueColor: "#002D72",
    city: "Los Angeles",
  },
  {
    id: "sf-mlb",
    name: "San Francisco Giants",
    league: "MLB",
    leagueColor: "#002D72",
    city: "San Francisco",
  },
  {
    id: "hou",
    name: "Houston Astros",
    league: "MLB",
    leagueColor: "#002D72",
    city: "Houston",
  },
  {
    id: "atl",
    name: "Atlanta Braves",
    league: "MLB",
    leagueColor: "#002D72",
    city: "Atlanta",
  },

  // NHL Teams
  {
    id: "tor",
    name: "Toronto Maple Leafs",
    league: "NHL",
    leagueColor: "#000000",
    city: "Toronto",
  },
  {
    id: "bos-nhl",
    name: "Boston Bruins",
    league: "NHL",
    leagueColor: "#000000",
    city: "Boston",
  },
  {
    id: "nyr",
    name: "New York Rangers",
    league: "NHL",
    leagueColor: "#000000",
    city: "New York",
  },
  {
    id: "chi-nhl",
    name: "Chicago Blackhawks",
    league: "NHL",
    leagueColor: "#000000",
    city: "Chicago",
  },

  // MLS Teams
  {
    id: "lafc",
    name: "LAFC",
    league: "MLS",
    leagueColor: "#005F45",
    city: "Los Angeles",
  },
  {
    id: "sea",
    name: "Seattle Sounders",
    league: "MLS",
    leagueColor: "#005F45",
    city: "Seattle",
  },
  {
    id: "atl-mls",
    name: "Atlanta United",
    league: "MLS",
    leagueColor: "#005F45",
    city: "Atlanta",
  },
  {
    id: "nycfc",
    name: "New York City FC",
    league: "MLS",
    leagueColor: "#005F45",
    city: "New York",
  },
];

export function FavoritesManager({
  favoriteTeams,
  onToggleFavorite,
}: FavoritesManagerProps) {
  const [selectedLeague, setSelectedLeague] = useState<string>("all");

  const leagues = ["all", "NFL", "NBA", "MLB", "NHL", "MLS"];

  const filteredTeams =
    selectedLeague === "all"
      ? allTeams
      : allTeams.filter((team) => team.league === selectedLeague);

  const isFavorite = (teamName: string) => favoriteTeams.includes(teamName);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="ios-button-press ios-haptic"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] ios-card">
        <SheetHeader className="text-left pb-4">
          <SheetTitle>Favorite Teams</SheetTitle>
          <SheetDescription>
            Select your favorite teams to personalize your For You feed. You
            have {favoriteTeams.length} favorites.
          </SheetDescription>
        </SheetHeader>

        {/* League Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          {leagues.map((league) => (
            <Button
              key={league}
              variant={selectedLeague === league ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLeague(league)}
              className="flex-shrink-0 ios-button ios-button-press"
            >
              {league === "all" ? "All Leagues" : league}
            </Button>
          ))}
        </div>

        {/* Teams Grid */}
        <div className="space-y-3 overflow-y-auto flex-1">
          {leagues
            .filter((l) => l !== "all")
            .map((league) => {
              const leagueTeams = filteredTeams.filter((team) =>
                selectedLeague === "all"
                  ? team.league === league
                  : team.league === selectedLeague,
              );

              if (leagueTeams.length === 0 || selectedLeague !== "all")
                return null;

              return (
                <div key={league} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      style={{ borderColor: leagueTeams[0]?.leagueColor }}
                      className="text-xs"
                    >
                      {league}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {
                        favoriteTeams.filter((fav) =>
                          leagueTeams.some((team) => team.name === fav),
                        ).length
                      }{" "}
                      favorites
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {leagueTeams.map((team) => (
                      <TeamCard
                        key={team.id}
                        team={team}
                        isFavorite={isFavorite(team.name)}
                        onToggle={() => onToggleFavorite(team.name)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

          {/* Show filtered results if a specific league is selected */}
          {selectedLeague !== "all" && (
            <div className="grid gap-2">
              {filteredTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isFavorite={isFavorite(team.name)}
                  onToggle={() => onToggleFavorite(team.name)}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function TeamCard({
  team,
  isFavorite,
  onToggle,
}: {
  team: Team;
  isFavorite: boolean;
  onToggle: () => void;
}) {
  return (
    <Card
      className="transition-all ios-card ios-button-press"
      onClick={onToggle}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ backgroundColor: team.leagueColor }}
            >
              {team.name
                .split(" ")
                .map((word) => word[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <p className="font-medium text-sm">{team.name}</p>
              <p className="text-xs text-muted-foreground">{team.league}</p>
            </div>
          </div>

          <motion.div
            animate={{ scale: isFavorite ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {isFavorite ? (
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
            ) : (
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-muted-foreground" />
              </div>
            )}
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
