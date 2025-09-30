import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Box, Text, HStack } from "@chakra-ui/react";
import { Bet } from "./Bet.tsx";
import { BoxScore } from "./BoxScore.tsx";
import { FavoritesManager } from "./FavoritesManager.tsx";
import { ForYouSection } from "./ForYouSection.tsx";
import { LeagueSelector } from "./LeagueSelector.tsx";
import { LiveGames } from "./LiveGames.tsx";
import { LivePlayByPlay } from "./LivePlayByPlay.tsx";
import { BottomNav } from "./BottomNav.tsx";
import { Scores } from "./Scores.tsx";
import { Social } from "./Social.tsx";
import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import {
  loadFavorites,
  addFavoriteTeam,
  removeFavoriteTeam,
} from "../store/slices/favoritesSlice.ts";

export function Arbitration() {
  const dispatch = useAppDispatch();
  const userType = useAppSelector((state) => state.auth.userType);
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );
  const activeTab = useAppSelector((state) => state.sportsData.activeTab);
  const leagueData = useAppSelector((state) => state.sportsData.leagueData);
  const forYouFeed = useAppSelector((state) => state.sportsData.forYouFeed);
  const boxScoreData = useAppSelector((state) => state.sportsData.boxScoreData);
  const favoriteTeams = useAppSelector((state) => state.favorites.teams);
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

  const handleToggleFavorite = (teamName: string) => {
    if (!userType) return;

    if (favoriteTeams.includes(teamName)) {
      dispatch(removeFavoriteTeam({ team: teamName, userType }));
    } else {
      dispatch(addFavoriteTeam({ team: teamName, userType }));
    }
  };

  // Get current league data
  const currentLeagueData =
    leagueData[selectedLeague as keyof typeof leagueData];

  const handleGameClick = (_gameId: string) => {
    // Use the first available box score for the current league
    const leagueBoxScoreKey = `${selectedLeague}-1`;
    setSelectedGameId(leagueBoxScoreKey);
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
          <Scores
            games={currentLeagueData?.games as any}
            onGameClick={handleGameClick}
            favoriteTeams={favoriteTeams}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case "play-by-play":
        return (
          <LiveGames
            games={currentLeagueData?.games as any}
            onGameClick={handleLiveGameClick}
          />
        );
      case "social":
        return (
          <Social
            posts={currentLeagueData?.social as any}
            favoriteTeams={favoriteTeams}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case "bet":
        return <Bet bettingLines={currentLeagueData?.betting as any} />;
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
        <Box minH="100vh" bg="gray.50">
          <BoxScore
            game={boxScoreData[selectedGameId as keyof typeof boxScoreData]}
            sport={selectedLeague}
            onBack={handleBackToMain}
          />
        </Box>
      </motion.div>
    );
  }

  // Show live play-by-play view if selected
  if (currentView === "live-playbyplay" && selectedGameId) {
    const selectedGame = currentLeagueData?.games.find(
      (game: any) => game.id === selectedGameId,
    );
    if (selectedGame) {
      return (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          <Box minH="100vh" bg="gray.50">
            <LivePlayByPlay
              game={selectedGame}
              plays={currentLeagueData.plays}
              onBack={handleBackToMain}
            />
          </Box>
        </motion.div>
      );
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
        {/* Mobile Header */}
        <Box
          bg="white"
          borderBottom="1px"
          borderColor="gray.200"
          position="sticky"
          top="0"
          zIndex="40"
          shadow="sm"
        >
          <Box px="4" py="3">
            <HStack justify="space-between" align="center">
              {userType !== "guest" && (
                <Box
                  w="8"
                  h="8"
                  bg="linear-gradient(to bottom right, #030213, #030213cc)"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize="xs" fontWeight="medium" color="white">
                    {userType === "apple" ? "🍎" : "🟢"}
                  </Text>
                </Box>
              )}
              <Text
                fontSize={{ base: "lg" }}
                fontWeight="bold"
                textAlign="center"
                flex="1"
                color="gray.900"
              >
                Arbitration
              </Text>
              <FavoritesManager
                favoriteTeams={favoriteTeams}
                onToggleFavorite={handleToggleFavorite}
              />
            </HStack>
          </Box>

          {/* League Selector - hidden on For You tab */}
          {activeTab !== "for-you" && (
            <Box px="4" pb="3">
              <LeagueSelector />
            </Box>
          )}
        </Box>

        {/* Main Content */}
        <Box
          flex="1"
          minH={{ base: "calc(100vh - 140px)" }}
          overflowY="auto"
          bg="gray.50"
        >
          {/* Discover section for For You tab */}
          {activeTab === "for-you" && (
            <Box
              p="4"
              borderBottom="1px"
              borderColor="gray.200"
              bg="white"
              shadow="sm"
            >
              <Text
                fontSize={{ base: "sm" }}
                color="gray.600"
                textAlign="center"
                fontWeight="medium"
              >
                {userType === "guest"
                  ? "Discover amazing sports content"
                  : "Personalized feed from your favorite teams"}
              </Text>
            </Box>
          )}

          {/* Content Area */}
          <Box p={{ base: "4" }} pb={{ base: "20" }}>
            {renderContent()}
          </Box>
        </Box>

        {/* Bottom Navigation */}
        <Box
          position="fixed"
          bottom="0"
          left="0"
          right="0"
          zIndex="50"
          bg="white"
          borderTop="1px"
          borderColor="gray.200"
          shadow="lg"
        >
          <BottomNav />
        </Box>
      </Box>
    </motion.div>
  );
}
