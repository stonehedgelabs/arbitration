import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { LeagueSelector } from "./LeagueSelector";
import { ScoresSection } from "./ScoresSection";
import { LiveGamesSection } from "./LiveGamesSection";
import { LivePlayByPlayView } from "./LivePlayByPlayView";
import { VideosSection } from "./VideosSection";
import { SocialSection } from "./SocialSection";
import { BetSection } from "./BetSection";
import { ForYouSection } from "./ForYouSection";
import { BoxScoreView } from "./BoxScoreView";
import { MobileBottomNav } from "./MobileBottomNav";
import { FavoritesManager } from "./FavoritesManager";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setSelectedLeague } from "../store/slices/sportsDataSlice";
import {
  loadFavorites,
  addFavoriteTeam,
  removeFavoriteTeam,
} from "../store/slices/favoritesSlice";

export function SportsApp() {
  const dispatch = useAppDispatch();
  const userType = useAppSelector((state) => state.auth.userType);
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );
  const leagues = useAppSelector((state) => state.sportsData.leagues);
  const leagueData = useAppSelector((state) => state.sportsData.leagueData);
  const forYouFeed = useAppSelector((state) => state.sportsData.forYouFeed);
  const boxScoreData = useAppSelector((state) => state.sportsData.boxScoreData);
  const favoriteTeams = useAppSelector((state) => state.favorites.teams);

  const [activeTab, setActiveTab] = useState("for-you");
  const [currentView, setCurrentView] = useState<
    "main" | "boxscore" | "live-playbyplay"
  >("main");
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  // Load favorites from Redux on mount
  useEffect(() => {
    if (userType) {
      dispatch(loadFavorites(userType));
    }
  }, [userType, dispatch]);

  const handleLeagueChange = (league: string) => {
    dispatch(setSelectedLeague(league));
  };

  const handleToggleFavorite = (teamName: string) => {
    if (!userType) return;

    if (favoriteTeams.includes(teamName)) {
      dispatch(removeFavoriteTeam({ team: teamName, userType }));
    } else {
      dispatch(addFavoriteTeam({ team: teamName, userType }));
    }
  };

  // Get current league data
  const currentLeague = leagues.find((league) => league.id === selectedLeague);
  const currentLeagueData = leagueData[selectedLeague];

  const handleGameClick = (gameId: string) => {
    setSelectedGameId(gameId);
    setCurrentView("boxscore");
  };

  const handleLiveGameClick = (gameId: string) => {
    setSelectedGameId(gameId);
    setCurrentView("live-playbyplay");
  };

  const handleBackToMain = () => {
    setCurrentView("main");
    setSelectedGameId(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "for-you":
        return (
          <ForYouSection
            items={forYouFeed}
            favoriteTeams={favoriteTeams}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case "scores":
        return (
          <ScoresSection
            games={currentLeagueData.games}
            onGameClick={handleGameClick}
            favoriteTeams={favoriteTeams}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case "play-by-play":
        return (
          <LiveGamesSection
            games={currentLeagueData.games}
            onGameClick={handleLiveGameClick}
          />
        );
      case "social":
        return (
          <SocialSection
            posts={currentLeagueData.social}
            favoriteTeams={favoriteTeams}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case "bet":
        return <BetSection bettingLines={currentLeagueData.betting} />;
      default:
        return (
          <ForYouSection
            items={forYouFeed}
            favoriteTeams={favoriteTeams}
            onToggleFavorite={handleToggleFavorite}
          />
        );
    }
  };

  // Show box score view if selected
  if (
    currentView === "boxscore" &&
    selectedGameId &&
    boxScoreData[selectedGameId as keyof typeof boxScoreData]
  ) {
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <BoxScoreView
          game={boxScoreData[selectedGameId as keyof typeof boxScoreData]}
          sport={selectedLeague}
          onBack={handleBackToMain}
        />
      </motion.div>
    );
  }

  // Show live play-by-play view if selected
  if (currentView === "live-playbyplay" && selectedGameId) {
    const selectedGame = currentLeagueData.games.find(
      (game) => game.id === selectedGameId,
    );
    if (selectedGame) {
      return (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          <LivePlayByPlayView
            game={selectedGame}
            plays={currentLeagueData.plays}
            onBack={handleBackToMain}
          />
        </motion.div>
      );
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background"
    >
      {/* Mobile Header */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <FavoritesManager
            favoriteTeams={favoriteTeams}
            onToggleFavorite={handleToggleFavorite}
          />
          <h1 className="text-center flex-1">SportsHub</h1>
          {userType !== "guest" && (
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {userType === "apple" ? "🍎" : "🟢"}
              </span>
            </div>
          )}
        </div>

        {/* League Selector - hidden on For You tab */}
        {activeTab !== "for-you" && (
          <LeagueSelector
            leagues={leagues}
            selectedLeague={selectedLeague}
            onLeagueChange={handleLeagueChange}
          />
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-140px)]">
        {/* Hide league selector on For You tab */}
        {activeTab === "for-you" && (
          <div className="p-4 border-b bg-card">
            <p className="text-sm text-muted-foreground text-center">
              {userType === "guest"
                ? "Discover amazing sports content"
                : "Personalized feed from your favorite teams"}
            </p>
          </div>
        )}
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </motion.div>
  );
}
