import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Check, Heart, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setFavoriteTeams } from "../store/slices/favoritesSlice";

interface Team {
  id: string;
  name: string;
  league: string;
  leagueColor: string;
  city?: string;
}

const popularTeams: Team[] = [
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
];

export function OnboardingScreen() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userType = useAppSelector((state) => state.auth.userType);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const handleComplete = () => {
    if (selectedTeams.length > 0 && userType) {
      dispatch(setFavoriteTeams({ teams: selectedTeams, userType }));
    }
    navigate("/app");
  };

  const toggleTeam = (teamName: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamName)
        ? prev.filter((team) => team !== teamName)
        : [...prev, teamName],
    );
  };

  const handleContinue = () => {
    handleComplete();
  };

  const handleSkip = () => {
    navigate("/app");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="p-4 pb-32"
        >
          {/* Header */}
          <div className="text-center mb-8 pt-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Follow Your Teams</h1>
            <p className="text-muted-foreground">
              {userType === "guest"
                ? "Select teams to see personalized content in your For You feed"
                : "Choose your favorite teams to get personalized updates and content"}
            </p>
          </div>

          {/* Team Selection */}
          <div className="space-y-6">
            {/* Popular Teams by League */}
            {["NFL", "NBA", "MLB"].map((league) => {
              const leagueTeams = popularTeams.filter(
                (team) => team.league === league,
              );
              const leagueColor = leagueTeams[0]?.leagueColor;

              return (
                <div key={league}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      variant="outline"
                      style={{ borderColor: leagueColor, color: leagueColor }}
                    >
                      {league}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {
                        selectedTeams.filter((team) =>
                          leagueTeams.some((t) => t.name === team),
                        ).length
                      }{" "}
                      selected
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {leagueTeams.map((team) => (
                      <Card
                        key={team.id}
                        className={`transition-all cursor-pointer ios-button-press ${
                          selectedTeams.includes(team.name)
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => toggleTeam(team.name)}
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
                                <p className="font-medium text-sm">
                                  {team.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {team.city}
                                </p>
                              </div>
                            </div>

                            <motion.div
                              animate={{
                                scale: selectedTeams.includes(team.name)
                                  ? 1.1
                                  : 1,
                              }}
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                              }}
                            >
                              {selectedTeams.includes(team.name) ? (
                                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 border-2 border-muted rounded-full"></div>
                              )}
                            </motion.div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 ios-blur border-t border-border">
        <div className="p-4 space-y-3 ios-safe-bottom">
          <Button
            onClick={handleContinue}
            className="w-full h-12 ios-button ios-button-press ios-haptic"
            disabled={selectedTeams.length === 0}
          >
            <span>
              Continue with {selectedTeams.length} team
              {selectedTeams.length !== 1 ? "s" : ""}
            </span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            variant="ghost"
            onClick={handleSkip}
            className="w-full h-12 ios-button ios-button-press"
          >
            {userType === "guest" ? "Continue as Guest" : "Skip for now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
