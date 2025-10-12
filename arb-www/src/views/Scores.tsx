import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Card, HStack, Text, VStack } from "@chakra-ui/react";
import { AlertCircle, RefreshCw, Tv } from "lucide-react";

import { Skeleton, SkeletonCircle } from "../components/Skeleton";
import {
  MLBScoreCard,
  NBAScoreCard,
  NFLScoreCard,
  NHLScoreCard,
  GenericScoreCard,
} from "../components/score";
import { DatePicker } from "../components/DatePicker";
import { HideVerticalScroll } from "../components/containers";
import { TopNavigation } from "../components/TopNavigation";
import { AppLayout } from "../components/containers/AppLayout";

import { League, GameStatus } from "../config";

import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  setSelectedDate,
  setSelectedLeague,
  // fetchBoxScore,
} from "../store/slices/sportsDataSlice";

import useArb from "../services/Arb";

import {
  getCurrentLocalDate,
  parseLocalDate,
  extractDataFromResponse,
} from "../utils.ts";
import {
  convertGameToGame,
  convertScheduleGameToGame,
  Game,
} from "../scores/utils";

// Compact Error State Component for Scores View
interface ScoresErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

function ScoresErrorState({ title, message, onRetry }: ScoresErrorStateProps) {
  return (
    <Card.Root bg="primary.25" borderWidth={0}>
      <Card.Body p="8" textAlign="center">
        <VStack gap="4">
          {/* Icon */}
          <Box
            w="16"
            h="16"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="text.300"
          >
            <AlertCircle size={32} />
          </Box>

          {/* Content */}
          <VStack gap="2">
            <Text fontSize="lg" fontWeight="semibold" color="text.300">
              {title}
            </Text>
            <Text
              fontSize="sm"
              color="text.300"
              textAlign="center"
              lineHeight="1.4"
            >
              {message}
            </Text>
          </VStack>

          {/* Retry Button */}
          {onRetry && (
            <Box
              as="button"
              onClick={onRetry}
              bg="buttons.primary.bg"
              color="white"
              px="6"
              py="3"
              borderRadius="md"
              fontSize="sm"
              fontWeight="medium"
              _hover={{ bg: "primary.600" }}
              _active={{ bg: "primary.700" }}
              display="flex"
              alignItems="center"
              gap="2"
            >
              <RefreshCw size={16} />
              Try Again
            </Box>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

// Game Card Skeleton Component
const GameCardSkeleton = () => {
  return (
    <Card.Root
      variant="outline"
      size="sm"
      transition="all 0.2s"
      bg="primary.100"
      borderRadius="sm"
      shadow="sm"
      border="1px"
      borderColor="text.400"
    >
      <Card.Body p="4">
        <VStack gap="3" align="stretch">
          {/* Game Status and Time */}
          <HStack justify="space-between" align="center">
            <Skeleton w="20%" h="3" bg={"primary.300"} />
            <HStack gap="2">
              <Skeleton w="12" h="5" borderRadius="full" bg={"primary.300"} />
              <Skeleton w="16" h="5" borderRadius="full" bg={"primary.300"} />
            </HStack>
          </HStack>

          {/* Location */}
          <HStack gap="2" flexWrap="wrap">
            <Skeleton w="24" h="5" borderRadius="full" bg={"primary.300"} />
            <Skeleton w="20" h="5" borderRadius="full" bg={"primary.300"} />
          </HStack>

          {/* Away Team */}
          <HStack justify="space-between" align="center">
            <HStack gap="3" align="center">
              <SkeletonCircle size="8" bg={"primary.300"} />
              <VStack align="start" gap="1">
                <Skeleton w="24" h="3" bg={"primary.300"} />
                <Skeleton w="16" h="2" bg={"primary.300"} />
              </VStack>
            </HStack>
            <HStack gap="2" align="center">
              <Skeleton w="6" h="5" bg={"primary.300"} />
              <Skeleton w="20" h="8" borderRadius="6px" bg={"primary.300"} />
            </HStack>
          </HStack>

          {/* Home Team */}
          <HStack justify="space-between" align="center">
            <HStack gap="3" align="center">
              <SkeletonCircle size="8" bg={"primary.300"} />
              <VStack align="start" gap="1">
                <Skeleton w="24" h="3" bg={"primary.300"} />
                <Skeleton w="16" h="2" bg={"primary.300"} />
              </VStack>
            </HStack>
            <HStack gap="2" align="center">
              <Skeleton w="6" h="5" bg={"primary.300"} />
              <Skeleton w="20" h="8" borderRadius="6px" bg={"primary.300"} />
            </HStack>
          </HStack>

          {/* Game Odds */}
          <Box pt="2" borderTop="1px" borderColor="text.200">
            <Skeleton w="full" h="3" bg={"primary.300"} />
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

// League-specific score card component
const ScoreCard = ({
  game,
  onGameClick,
  oddsLoading,
  oddsByDate,
}: {
  game: Game;
  onGameClick: (gameId: string, gameDate: string) => void;
  oddsLoading?: boolean;
  oddsByDate?: any;
}) => {
  switch (game.league) {
    case League.MLB:
      return (
        <MLBScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
    case League.NBA:
      return (
        <NBAScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
    case League.NFL:
      return (
        <NFLScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
    case League.NHL:
      return (
        <NHLScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
    default:
      return (
        <GenericScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
  }
};

function ScoresV2() {
  // Get selectedLeague from Redux
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );

  // Use the generic Arb service
  const {
    scores,
    teamProfiles,
    stadiums,
    schedule,
    odds,
    scoresLoading,
    teamProfilesLoading,
    stadiumsLoading,
    scheduleLoading,
    oddsLoading,
    scoresError,
    teamProfilesError,
    stadiumsError,
    scheduleError,
    fetchScores,
    fetchTeamProfiles,
    fetchStadiums,
    fetchSchedule,
  } = useArb();

  // Redux state
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector((state) => state.sportsData.selectedDate);
  const boxScoreData = useAppSelector((state) => state.sportsData.boxScoreData);
  const navigate = useNavigate();
  const { league } = useParams<{ league: string }>();

  // Handle game click for box score navigation - now goes to new /scores route
  const handleGameClick = (gameId: string, _gameDate: string) => {
    // For NFL games, we need to find the game to get the scoreId
    const game = allGames.find((g) => g.id === gameId);
    if (selectedLeague === League.NFL && game?.scoreId) {
      // For NFL, use the ScoreID as the game ID in the URL
      navigate(`/scores/${selectedLeague}/${game.scoreId}`);
    } else {
      navigate(`/scores/${selectedLeague}/${gameId}`);
    }
  };

  // Initialize selected date to today only on first load (when selectedDate is empty)
  useEffect(() => {
    if (!selectedDate) {
      const today = getCurrentLocalDate();
      dispatch(setSelectedDate(today));
    }
  }, [selectedDate]);

  // Update selectedLeague from URL if not in state
  useEffect(() => {
    if (league && league !== selectedLeague) {
      dispatch(setSelectedLeague(league));
    }
  }, [league, selectedLeague, dispatch]);

  useEffect(() => {
    if (!selectedLeague && league) {
      dispatch(setSelectedLeague(league));
    }
  }, [league]);

  // Fetch data when league parameter changes (from URL)
  useEffect(() => {
    if (league) {
      const dateToUse = getCurrentLocalDate(); // Always use today's date when league changes
      fetchScores(league, dateToUse);
      fetchTeamProfiles(league);
      fetchStadiums(league);
      fetchSchedule(league, dateToUse);
    }
  }, [league]); // Only depend on league parameter

  // Fetch data when selectedDate changes (for date picker changes)
  useEffect(() => {
    if (league && selectedDate) {
      fetchScores(league, selectedDate);
      fetchSchedule(league, selectedDate);
    }
  }, [selectedDate]); // Only depend on selectedDate

  // Get all games based on the selected date and league
  const getAllGames = (): Game[] => {
    // Use selectedDate if available, otherwise use today's date (same logic as data fetching)
    const dateToUse = selectedDate || getCurrentLocalDate();
    const today = getCurrentLocalDate();
    const isFutureDate = dateToUse > today;

    // Use scores data for past/current dates, schedule data for future dates
    // But if schedule data is empty, fall back to scores data
    if (isFutureDate && schedule?.data && schedule.data.length > 0) {
      const scheduleGames = schedule.data
        .filter((rawGame: any) => {
          // Filter out games that don't have a DateTime field
          return rawGame.DateTime !== undefined && rawGame.DateTime !== null;
        })
        .map((game: any) => {
          return convertScheduleGameToGame(
            game,
            teamProfiles,
            stadiums,
            selectedLeague as League,
            odds,
            boxScoreData,
          );
        })
        .filter((game: any): game is Game => {
          if (!game) {
            return false;
          }

          // Filter games to only show those that actually start on the selected date
          const gameDate = game.date; // This is already converted to YYYY-MM-DD format
          return gameDate === dateToUse;
        });

      return scheduleGames;
    } else if (scores?.data && scores.data.length > 0) {
      // Use the utility function to extract data from the new response structure
      const gamesArray = extractDataFromResponse(scores);

      const scoresGames = gamesArray
        .filter((rawGame: any) => {
          // Filter out games that don't have a DateTime field
          return rawGame.DateTime !== undefined && rawGame.DateTime !== null;
        })
        .map((game: any) => {
          return convertGameToGame(
            game,
            teamProfiles,
            stadiums,
            selectedLeague as League,
            odds,
            boxScoreData,
          );
        })
        .filter((game: any): game is Game => {
          if (!game) {
            return false;
          }

          // Filter games to only show those that actually start on the selected date
          const gameDate = game.date; // This is already converted to YYYY-MM-DD format
          return gameDate === dateToUse;
        });

      return scoresGames;
    }

    return [];
  };

  const allGames = getAllGames();

  // Sort games by time (most recent first for live games, then by start time)
  const sortedGames = [...allGames].sort((a, b) => {
    // Live games first
    if (a.status === GameStatus.LIVE && b.status !== GameStatus.LIVE) {
      return -1;
    }
    if (b.status === GameStatus.LIVE && a.status !== GameStatus.LIVE) {
      return 1;
    }

    // Then sort by time
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();

    // For NFL, sort by timestamp ASC (earlier games first)
    if (league === League.NFL) {
      return timeA - timeB; // Earlier games first
    }

    // For other leagues, keep most recent first
    return timeB - timeA; // Most recent first
  });

  // Retry function for error state
  const handleRetry = () => {
    if (selectedDate && league) {
      fetchScores(league, selectedDate);
      fetchTeamProfiles(league);
      fetchStadiums(league);
      fetchSchedule(league, selectedDate);
    }
  };

  // Check for critical errors (odds errors are non-blocking)
  const hasCriticalError =
    scoresError || teamProfilesError || stadiumsError || scheduleError;

  return (
    <AppLayout>
      <Box minH="100vh" bg="primary.25" display="flex" flexDirection="column">
        {/* Top Navigation */}
        <TopNavigation />

        {/* Main Content */}
        <Box
          flex="1"
          minH="calc(100vh - 140px)"
          overflowY="auto"
          bg="primary.25"
        >
          <HideVerticalScroll minH="100vh" bg="primary.25">
            <VStack gap="4" align="stretch" p="4" pb="20">
              {/* Date Selector */}
              <DatePicker selectedLeague={selectedLeague} />

              {/* Error State or Games List */}
              {hasCriticalError ? (
                <ScoresErrorState
                  title="Error Loading Scores"
                  message={hasCriticalError}
                  onRetry={handleRetry}
                />
              ) : (
                <VStack gap="4" align="stretch">
                  {sortedGames.length === 0 ? (
                    // Show loading state if we're fetching data, otherwise show no games
                    scoresLoading ||
                    teamProfilesLoading ||
                    stadiumsLoading ||
                    scheduleLoading ||
                    oddsLoading ? (
                      // Show skeleton cards while loading
                      Array.from({ length: 3 }, (_, index) => (
                        <GameCardSkeleton key={`skeleton-${index}`} />
                      ))
                    ) : (
                      <Card.Root
                        bg="primary.25"
                        border="1px"
                        borderColor="text.400"
                      >
                        <Card.Body p="8" textAlign="center">
                          <VStack gap="4">
                            <Box
                              w="16"
                              h="16"
                              bg="primary.25"
                              borderRadius="full"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Tv size={32} />
                            </Box>
                            <VStack gap="2">
                              <Text
                                fontSize="lg"
                                fontWeight="semibold"
                                color="text.300"
                              >
                                {selectedLeague === League.MLB ||
                                selectedLeague === League.NFL ||
                                selectedLeague === League.NBA
                                  ? "No Games"
                                  : "Coming Soon"}
                              </Text>
                              <Text
                                fontSize="sm"
                                color="text.300"
                                textAlign="center"
                              >
                                {selectedLeague === League.MLB ||
                                selectedLeague === League.NFL ||
                                selectedLeague === League.NBA ? (
                                  <>
                                    No games scheduled for{" "}
                                    {selectedDate
                                      ? parseLocalDate(
                                          selectedDate,
                                        ).toLocaleDateString("en-US", {
                                          weekday: "long",
                                          month: "long",
                                          day: "numeric",
                                        })
                                      : "this date"}
                                    .
                                  </>
                                ) : (
                                  <>
                                    {selectedLeague.toUpperCase()} scores are
                                    not yet available. We're working on adding
                                    support for {selectedLeague.toUpperCase()}{" "}
                                    games.
                                  </>
                                )}
                              </Text>
                            </VStack>
                          </VStack>
                        </Card.Body>
                      </Card.Root>
                    )
                  ) : (
                    <VStack gap="4" align="stretch">
                      {scoresLoading ||
                      teamProfilesLoading ||
                      stadiumsLoading ||
                      scheduleLoading ||
                      oddsLoading
                        ? // Show skeleton cards while loading
                          Array.from({ length: 3 }, (_, index) => (
                            <GameCardSkeleton key={`skeleton-${index}`} />
                          ))
                        : sortedGames.map((game) => (
                            <ScoreCard
                              key={game.id}
                              game={game}
                              onGameClick={handleGameClick}
                              oddsLoading={oddsLoading || false}
                              oddsByDate={odds}
                            />
                          ))}
                    </VStack>
                  )}
                </VStack>
              )}
            </VStack>
          </HideVerticalScroll>
        </Box>

        {/* Bottom Navigation */}
        {/* <BottomNavigation /> */}
      </Box>
    </AppLayout>
  );
}

export default ScoresV2;
