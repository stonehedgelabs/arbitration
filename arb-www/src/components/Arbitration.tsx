// React imports
import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// Third-party library imports
import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "motion/react";

// Internal imports - config
import {
  League,
  GameStatus,
  mapApiStatusToGameStatus,
  isPostseasonDate,
} from "../config";

// Internal imports - components
import { Bet } from "./Bet.tsx";
import { BottomNav } from "./BottomNav.tsx";
import { BoxScoreDetailMLB } from "./boxscore/BoxScoreDetailMLB.tsx";
import { FavoritesManager } from "./favorites/FavoritesManager.tsx";
import { ForYouSection } from "./ForYouSection.tsx";
import { LeagueSelector } from "./LeagueSelector.tsx";
import { Scores } from "../views/Scores.tsx";
import { Live } from "../views/Live.tsx";
import { PlayByPlayMLB } from "./play-by-play/PlayByPlayMLB.tsx";
import { Social } from "../views/Social.tsx";

// Internal imports - services
import useArb from "../services/Arb";

// Internal imports - utils
import { convertUtcToLocalDate } from "../utils";

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

  // Data fetching for live games
  const {
    fetchMLBScores,
    fetchMLBTeamProfiles,
    fetchMLBStadiums,
    mlbScores,
    mlbTeamProfiles,
    mlbStadiums,
    mlbOddsByDate,
  } = useArb();
  // Router-based navigation
  const navigate = useNavigate();
  const location = useLocation();
  const { league, gameId } = useParams<{ league?: string; gameId?: string }>();

  // Determine current view and league from URL
  const isPlayByPlayView = location.pathname.endsWith("/pbp");
  const isBoxScoreView = gameId && !isPlayByPlayView;
  const currentView = isPlayByPlayView
    ? "playbyplay"
    : isBoxScoreView
      ? "boxscore"
      : "main";
  const currentLeague = league || selectedLeague;

  // Update Redux state when URL league changes
  useEffect(() => {
    if (league && league !== selectedLeague) {
      dispatch(setSelectedLeague(league));
    }
  }, [league, selectedLeague, dispatch]);

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/fyp") return "for-you";
    if (path.startsWith("/scores")) return "scores";
    if (path.startsWith("/live")) return "live";
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

  // Fetch live games data
  useEffect(() => {
    if (selectedLeague === "MLB") {
      fetchMLBScores();
      fetchMLBTeamProfiles();
      fetchMLBStadiums();
    }
  }, [selectedLeague, fetchMLBScores, fetchMLBTeamProfiles, fetchMLBStadiums]);

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

  // Process live games data
  const getLiveGames = () => {
    if (
      selectedLeague === League.MLB &&
      mlbScores &&
      mlbTeamProfiles &&
      mlbStadiums
    ) {
      // Convert MLB games to the format expected by LiveGames component
      const allGames = mlbScores.data
        .map((game) => {
          // Find team profiles
          const homeTeamProfile = mlbTeamProfiles.data.find(
            (team) => team.TeamID === game.HomeTeamID,
          );
          const awayTeamProfile = mlbTeamProfiles.data.find(
            (team) => team.TeamID === game.AwayTeamID,
          );

          // Find stadium
          const stadium = mlbStadiums.data.find(
            (s) => s.StadiumID === game.StadiumID,
          );

          if (!homeTeamProfile || !awayTeamProfile) return null;

          // Get the actual game status from the API
          const actualStatus = mapApiStatusToGameStatus(game.Status);

          return {
            id: game.GameID.toString(),
            homeTeam: {
              name: homeTeamProfile.Name,
              score: game.HomeTeamRuns || 0,
              logo: homeTeamProfile.WikipediaLogoUrl,
            },
            awayTeam: {
              name: awayTeamProfile.Name,
              score: game.AwayTeamRuns || 0,
              logo: awayTeamProfile.WikipediaLogoUrl,
            },
            status: actualStatus as GameStatus.LIVE,
            time: game.DateTime || "",
            quarter: game.Inning || undefined,
            inningHalf: game.InningHalf || undefined,
            stadium: stadium?.Name,
            city: stadium?.City,
            state: stadium?.State,
            isPostseason: game.DateTime
              ? isPostseasonDate(
                  League.MLB,
                  convertUtcToLocalDate(game.DateTime),
                )
              : false,
            league: League.MLB,
          };
        })
        .filter((game): game is NonNullable<typeof game> => game !== null);

      // Filter only live games
      return allGames.filter((game) => game.status === GameStatus.LIVE);
    }
    return [];
  };

  const liveGames = getLiveGames();

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
      case "live":
        return (
          <Live
            games={liveGames}
            onGameClick={(gameId) =>
              navigate(`/scores/${selectedLeague}/${gameId}/pbp`)
            }
            loading={!mlbScores || !mlbTeamProfiles || !mlbStadiums}
            selectedLeague={selectedLeague as League}
          />
        );
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

  // Show box score detail view if selected
  if (currentView === "boxscore" && gameId) {
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <Box minH="100vh" bg="primary.25">
          {currentLeague === League.MLB ? (
            <BoxScoreDetailMLB
              gameId={gameId}
              onBack={handleBackFromPlayByPlay}
            />
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
                  Box score detail for {selectedLeague?.toUpperCase()} is not
                  yet supported.
                </Text>
                <Button onClick={handleBackFromPlayByPlay}>Go Back</Button>
              </VStack>
            </Box>
          )}
        </Box>
      </motion.div>
    );
  }

  // Show play-by-play view if selected
  if (currentView === "playbyplay" && gameId) {
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <Box minH="100vh" bg="primary.25">
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
          bg="primary.25"
          borderBottom="1px"
          borderColor="border.100"
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
                  <Text fontSize="xs" fontWeight="medium" color="text.400">
                    {userType === "apple" ? "🍎" : "🟢"}
                  </Text>
                </Box>
              )}
              <Text
                fontSize={{ base: "lg" }}
                fontWeight="bold"
                textAlign="center"
                flex="1"
                color="text.400"
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
          bg="primary.25"
        >
          {/* Discover section for For You tab */}
          {activeTab === "for-you" && (
            <Box
              p="4"
              borderBottom="1px"
              borderColor="border.100"
              bg="primary.25"
              shadow="sm"
            >
              <Text
                fontSize={{ base: "sm" }}
                color="text.400"
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
          bg="primary.200"
          borderTop="1px"
          borderColor="border.100"
          shadow="lg"
        >
          <BottomNav />
        </Box>
      </Box>
    </motion.div>
  );
}
