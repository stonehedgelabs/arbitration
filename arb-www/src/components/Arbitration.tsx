import { useEffect, useCallback, memo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box, Button, HStack, Text, VStack } from "@chakra-ui/react";
import { motion } from "motion/react";

import { Bet } from "./Bet.tsx";
import { BottomNav } from "./BottomNav.tsx";
import { BoxScoreDetailMLB } from "./boxscore/BoxScoreDetailMLB.tsx";
import { FavoritesManager } from "./favorites/FavoritesManager.tsx";
import { ForYouSection } from "./ForYouSection.tsx";
import { LeagueSelector } from "./LeagueSelector.tsx";
import { Scores } from "../views/Scores.tsx";
import { Live } from "../views/Live.tsx";
import { PlayByPlay } from "../views/PlayByPlay";
import { Social } from "../views/Social.tsx";

import {
  League,
  GameStatus,
  ViewType,
  mapApiStatusToGameStatus,
  isPostseasonDate,
  Tab,
} from "../config";

import useArb from "../services/Arb";

import { convertUtcToLocalDate, getCurrentLocalDate } from "../utils";

import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import {
  addFavoriteTeam,
  loadFavorites,
  removeFavoriteTeam,
} from "../store/slices/favoritesSlice.ts";
import {
  setSelectedLeague,
  fetchBoxScore,
} from "../store/slices/sportsDataSlice";

export const Arbitration = memo(function Arbitration() {
  const dispatch = useAppDispatch();
  const userType = useAppSelector((state) => state.auth.userType);
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );
  // const leagueData = useAppSelector((state) => state.sportsData.leagueData);
  const forYouFeed = useAppSelector((state) => state.sportsData.forYouFeed);
  const favoriteTeams = useAppSelector((state) => state.favorites.teams);

  // Data fetching for live games
  const {
    scores,
    teamProfiles,
    stadiums,
    schedule,
    fetchScores,
    fetchTeamProfiles,
    fetchStadiums,
    fetchSchedule,
    scoresLoading,
    teamProfilesLoading,
    stadiumsLoading,
    scheduleLoading,
    scoresError,
    teamProfilesError,
    stadiumsError,
    scheduleError,
  } = useArb();

  // Get box score data from Redux state for more accurate scores
  const boxScoreData = useAppSelector((state) => state.sportsData.boxScoreData);
  // Router-based navigation
  const navigate = useNavigate();
  const location = useLocation();
  const { league, gameId } = useParams<{ league?: string; gameId?: string }>();

  // Determine current view and league from URL
  const isPlayByPlayView = location.pathname.endsWith("/pbp");
  const isBoxScoreView = gameId && !isPlayByPlayView;
  const currentView = isPlayByPlayView
    ? ViewType.PLAYBYPLAY
    : isBoxScoreView
      ? ViewType.BOXSCORE
      : ViewType.MAIN;
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
    if (path === "/fyp") return Tab.FOR_YOU;
    if (path.startsWith("/scores")) return Tab.SCORES;
    if (path.startsWith("/live")) return Tab.LIVE;
    if (path.startsWith("/social")) return Tab.SOCIAL;
    if (path === "/bet") return Tab.BET;
    return Tab.FOR_YOU; // default
  };

  const activeTab = getActiveTab();

  // Load favorites from Redux on mount
  useEffect(() => {
    if (userType) {
      dispatch(loadFavorites(userType));
    }
  }, [userType, dispatch]);

  // Fetch live games data when on Live tab
  useEffect(() => {
    if (activeTab === Tab.LIVE) {
      // Fetch today's scores and schedule for live games
      const today = getCurrentLocalDate();
      fetchScores(currentLeague, today);
      fetchSchedule(currentLeague, today);
      fetchTeamProfiles(currentLeague);
      fetchStadiums(currentLeague);
    }
  }, [
    activeTab,
    currentLeague,
    fetchScores,
    fetchSchedule,
    fetchTeamProfiles,
    fetchStadiums,
  ]);

  // Fetch box score data for live games to get more accurate scores
  useEffect(() => {
    if (activeTab === Tab.LIVE && scores?.data) {
      // Fetch box score data for each live game to get accurate scores
      scores.data.forEach((game: any) => {
        const gameId = game.GameID.toString();
        const gameStatus = mapApiStatusToGameStatus(game.Status);

        // Only fetch box score for live games that we don't already have
        if (gameStatus === GameStatus.LIVE && !boxScoreData[gameId]) {
          dispatch(fetchBoxScore({ league: currentLeague, gameId }));
        }
      });
    }
  }, [activeTab, scores?.data, currentLeague, dispatch, boxScoreData]);

  // Note: MLB data fetching is now handled by the Scores component to prevent duplicate requests

  const handleToggleFavorite = useCallback(
    (teamName: string) => {
      if (!userType) return;

      if (favoriteTeams.includes(teamName)) {
        dispatch(removeFavoriteTeam({ team: teamName, userType }));
      } else {
        dispatch(addFavoriteTeam({ team: teamName, userType }));
      }
    },
    [userType, favoriteTeams, dispatch],
  );

  const handleBackFromPlayByPlay = () => {
    // Navigate back to the previous page or to the live games tab
    navigate(-1);
  };

  // Get current league data based on URL league (currently unused)
  // const currentLeagueData =
  //   leagueData[currentLeague as keyof typeof leagueData];

  // Process live games data - prioritize box score data for accuracy
  const getLiveGames = () => {
    if (!scores && !schedule) {
      return [];
    }

    // Check if this is a postseason date (only for MLB)
    const today = getCurrentLocalDate();
    const isPostseason =
      currentLeague === League.MLB
        ? isPostseasonDate(currentLeague as League, today)
        : false;

    let allGames: any[] = [];

    if (isPostseason) {
      // Use schedule data for postseason
      if (schedule?.data) {
        allGames = schedule.data
          .map((game: any) => {
            // Check if we have more accurate box score data for this game
            const boxScoreGame =
              boxScoreData[game.GameID.toString()]?.data?.Game;

            // Find team profiles by ID
            const homeTeamProfile = teamProfiles?.data?.find(
              (team: any) => team.TeamID === game.HomeTeamID,
            );
            const awayTeamProfile = teamProfiles?.data?.find(
              (team: any) => team.TeamID === game.AwayTeamID,
            );

            // Find stadium
            const stadium = stadiums?.data?.find(
              (s: any) => s.StadiumID === game.StadiumID,
            );

            if (!homeTeamProfile || !awayTeamProfile) return null;

            // Use box score data if available, otherwise use schedule data
            const gameData = boxScoreGame || game;
            const actualStatus = mapApiStatusToGameStatus(
              gameData.Status || "",
            );

            return {
              id: game.GameID.toString(),
              homeTeam: {
                name: homeTeamProfile.Name,
                score: gameData.HomeTeamRuns || 0,
                logo: homeTeamProfile.WikipediaLogoUrl,
              },
              awayTeam: {
                name: awayTeamProfile.Name,
                score: gameData.AwayTeamRuns || 0,
                logo: awayTeamProfile.WikipediaLogoUrl,
              },
              status: actualStatus,
              time: gameData.DateTime || "",
              quarter: gameData.Inning?.toString() || undefined,
              inningHalf: gameData.InningHalf || undefined,
              stadium: stadium?.Name,
              city: stadium?.City,
              state: stadium?.State,
              isPostseason: true,
              league: currentLeague as League,
            };
          })
          .filter(
            (game: any): game is NonNullable<typeof game> => game !== null,
          );
      }
    } else {
      // Use regular scores data for regular season
      if (scores?.data) {
        allGames = scores.data
          .map((game: any) => {
            // Check if we have more accurate box score data for this game
            const boxScoreGame =
              boxScoreData[game.GameID.toString()]?.data?.Game;

            // Find team profiles by ID
            const homeTeamProfile = teamProfiles?.data?.find(
              (team: any) => team.TeamID === game.HomeTeamID,
            );
            const awayTeamProfile = teamProfiles?.data?.find(
              (team: any) => team.TeamID === game.AwayTeamID,
            );

            // Find stadium
            const stadium = stadiums?.data?.find(
              (s: any) => s.StadiumID === game.StadiumID,
            );

            if (!homeTeamProfile || !awayTeamProfile) return null;

            // Use box score data if available, otherwise use scores data
            const gameData = boxScoreGame || game;
            const actualStatus = mapApiStatusToGameStatus(gameData.Status);

            return {
              id: game.GameID.toString(),
              homeTeam: {
                name: homeTeamProfile.Name,
                score: gameData.HomeTeamRuns || 0,
                logo: homeTeamProfile.WikipediaLogoUrl,
              },
              awayTeam: {
                name: awayTeamProfile.Name,
                score: gameData.AwayTeamRuns || 0,
                logo: awayTeamProfile.WikipediaLogoUrl,
              },
              status: actualStatus,
              time: gameData.DateTime || "",
              quarter: gameData.Inning || undefined,
              inningHalf: gameData.InningHalf || undefined,
              stadium: stadium?.Name,
              city: stadium?.City,
              state: stadium?.State,
              isPostseason: gameData.DateTime
                ? isPostseasonDate(
                    currentLeague as League,
                    convertUtcToLocalDate(gameData.DateTime),
                  )
                : false,
              league: currentLeague as League,
            };
          })
          .filter(
            (game: any): game is NonNullable<typeof game> => game !== null,
          );
      }
    }

    // Filter only live games
    return allGames.filter((game) => game.status === GameStatus.LIVE);
  };

  const liveGames = getLiveGames();

  const renderContent = useCallback(() => {
    switch (activeTab) {
      case Tab.FOR_YOU:
        return (
          <ForYouSection
            items={forYouFeed}
            favoriteTeams={favoriteTeams}
            onToggleFavorite={handleToggleFavorite}
          />
        );
      case Tab.SCORES:
        return <Scores />;
      case Tab.LIVE:
        return (
          <Live
            games={liveGames}
            onGameClick={(gameId) =>
              navigate(`/scores/${selectedLeague}/${gameId}/pbp`)
            }
            loading={
              scoresLoading ||
              teamProfilesLoading ||
              stadiumsLoading ||
              scheduleLoading
            }
            selectedLeague={currentLeague as League}
            error={
              scoresError || teamProfilesError || stadiumsError || scheduleError
            }
          />
        );
      case Tab.SOCIAL:
        return <Social selectedLeague={currentLeague} />;
      case Tab.BET:
        return <Bet bettingLines={[]} />;
      default:
        return (
          <ForYouSection
            items={forYouFeed}
            favoriteTeams={favoriteTeams}
            onToggleFavorite={handleToggleFavorite}
          />
        );
    }
  }, [
    activeTab,
    forYouFeed,
    favoriteTeams,
    handleToggleFavorite,
    liveGames,
    navigate,
    selectedLeague,
    scoresLoading,
    teamProfilesLoading,
    stadiumsLoading,
    currentLeague,
    null,
  ]);

  // Show box score detail view if selected
  if (currentView === ViewType.BOXSCORE && gameId) {
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
  if (currentView === ViewType.PLAYBYPLAY && gameId) {
    return (
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <PlayByPlay
          gameId={gameId}
          league={currentLeague as League}
          onBack={handleBackFromPlayByPlay}
        />
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
              <Box
                w="8"
                h="8"
                bg="primary.200"
                borderRadius="8px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="sm"
              >
                <Box
                  w="6"
                  h="6"
                  bg="primary.25"
                  borderRadius="4px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="text.400" fontSize="xs" fontWeight="bold">
                    A
                  </Text>
                </Box>
              </Box>
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
          {activeTab !== Tab.FOR_YOU && (
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
          {activeTab === Tab.FOR_YOU && (
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
});
