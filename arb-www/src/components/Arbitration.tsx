// React imports
import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// Third-party library imports
import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "motion/react";

// Internal imports - config
import { League } from "../config";

// Internal imports - components
import { Bet } from "./Bet.tsx";
import { BottomNav } from "./BottomNav.tsx";
import { FavoritesManager } from "./FavoritesManager.tsx";
import { ForYouSection } from "./ForYouSection.tsx";
import { LeagueSelector } from "./LeagueSelector.tsx";
import { Live, Scores } from "./Scores.tsx";
import { PlayByPlayMLB } from "./PlayByPlayMLB.tsx";
import { Social } from "./Social.tsx";

// Internal imports - store
import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import {
  addFavoriteTeam,
  loadFavorites,
  removeFavoriteTeam,
} from "../store/slices/favoritesSlice.ts";
import { setSelectedLeague } from "../store/slices/sportsDataSlice";

export function Arbitration() {
  const dispatch = useAppDispatch();
  const userType = useAppSelector((state) => state.auth.userType);
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );
  const leagueData = useAppSelector((state) => state.sportsData.leagueData);
  const forYouFeed = useAppSelector((state) => state.sportsData.forYouFeed);
  const favoriteTeams = useAppSelector((state) => state.favorites.teams);
  // Router-based navigation
  const navigate = useNavigate();
  const location = useLocation();
  const { league, gameId } = useParams<{ league?: string; gameId?: string }>();

  // Determine current view and league from URL
  const currentView = gameId ? "playbyplay" : "main";
  const currentLeague = league || selectedLeague;

  // Update Redux state when URL league changes
  useEffect(() => {
    if (league && league !== selectedLeague) {
      console.log("Updating selectedLeague from", selectedLeague, "to", league);
      dispatch(setSelectedLeague(league));
    }
  }, [league, selectedLeague, dispatch]);

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/fyp") return "for-you";
    if (path.startsWith("/scores")) return "scores";
    if (path.startsWith("/live")) return "play-by-play";
    if (path.startsWith("/social")) return "social";
    if (path === "/bet") return "bet";
    return "for-you"; // default
  };

  const activeTab = getActiveTab();

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

  const handleBackFromPlayByPlay = () => {
    // Navigate back to the previous page or to the live games tab
    navigate(-1);
  };

  // Get current league data based on URL league
  const currentLeagueData =
    leagueData[currentLeague as keyof typeof leagueData];

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
        return <Scores />;
      case "play-by-play":
        return <Live />;
      case "social":
        return <Social selectedLeague={currentLeague} />;
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

  // Show play-by-play view if selected
  if (currentView === "playbyplay" && gameId) {
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <Box minH="100vh" bg="gray.50">
          {currentLeague === League.MLB ? (
            <PlayByPlayMLB gameId={gameId} onBack={handleBackFromPlayByPlay} />
          ) : (
            <Box
              minH="100vh"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <VStack gap="4">
                <Text color="red.500" fontSize="lg" fontWeight="semibold">
                  Unsupported League
                </Text>
                <Text color="gray.600" textAlign="center">
                  Play-by-play for {selectedLeague?.toUpperCase()} is not yet
                  supported.
                </Text>
                <Button onClick={handleBackFromPlayByPlay}>Go Back</Button>
              </VStack>
            </Box>
          )}
        </Box>
      </motion.div>
    );
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
