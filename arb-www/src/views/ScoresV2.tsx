import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Card, HStack, Text, VStack } from "@chakra-ui/react";

import { Skeleton, SkeletonCircle } from "../components/Skeleton";
import {
  MLBScoreCardV2,
  NBAScoreCardV2,
  NFLScoreCardV2,
  NHLScoreCardV2,
  GenericScoreCardV2,
} from "../components/cards/score";
import { ErrorState } from "../components/ErrorStates";
import { DatePicker } from "../components/DatePicker";
import { HideVerticalScroll } from "../components/containers";

import {
  isPostseasonDate,
  League,
  GameStatus,
  mapApiStatusToGameStatus,
} from "../config";

import { useAppSelector, useAppDispatch } from "../store/hooks";
import {
  setSelectedDate,
  setSelectedLeague,
  fetchBoxScore,
} from "../store/slices/sportsDataSlice";

import useArb from "../services/Arb";

import {
  convertUtcToLocalDate,
  getCurrentLocalDate,
  parseLocalDate,
} from "../utils.ts";

interface Team {
  name: string;
  score: number;
  logo?: string;
}

interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: GameStatus;
  time: string;
  date: string; // Add date field for GameByDate API
  quarter?: string;
  inningHalf?: string;
  // Location/Venue information
  stadium?: string;
  city?: string;
  state?: string;
  country?: string;
  capacity?: number;
  surface?: string;
  weather?: string;
  temperature?: number;
  stadiumId?: number;
  division?: string;
  // Postseason flag
  isPostseason?: boolean;
  // League
  league: League;
  // Base runners
  runnerOnFirst?: boolean;
  runnerOnSecond?: boolean;
  runnerOnThird?: boolean;
  // Odds information
  odds?: {
    homeMoneyLine?: number;
    awayMoneyLine?: number;
    homePointSpread?: number;
    awayPointSpread?: number;
    overUnder?: number;
    sportsbook?: string;
    homeTeam?: {
      moneyLine?: number;
      pointSpread?: number;
    };
    awayTeam?: {
      moneyLine?: number;
      pointSpread?: number;
    };
    total?: number;
    totalOverOdds?: number;
    totalUnderOdds?: number;
  };
}

// Helper function to get game odds
const getGameOdds = (gameId: string, oddsData: any, gameData?: any) => {
  // First, check if odds are directly on the game object (schedule format)
  if (gameData && gameData.HomeTeamMoneyLine !== undefined) {
    return {
      homeMoneyLine: gameData.HomeTeamMoneyLine,
      awayMoneyLine: gameData.AwayTeamMoneyLine,
      homePointSpread: gameData.PointSpreadHomeTeamMoneyLine,
      awayPointSpread: gameData.PointSpreadAwayTeamMoneyLine,
      overUnder: gameData.OverUnder,
      sportsbook: gameData.Sportsbook,
      homeTeam: {
        moneyLine: gameData.HomeTeamMoneyLine,
        pointSpread: gameData.PointSpreadHomeTeamMoneyLine,
      },
      awayTeam: {
        moneyLine: gameData.AwayTeamMoneyLine,
        pointSpread: gameData.PointSpreadAwayTeamMoneyLine,
      },
      total: gameData.OverUnder,
      totalOverOdds: gameData.OverPayout,
      totalUnderOdds: gameData.UnderPayout,
    };
  }

  // Otherwise, check the odds data (scores format)
  if (!oddsData?.data) return null;

  const gameOdds = oddsData.data.find(
    (odds: any) => odds.GameId?.toString() === gameId,
  );

  if (!gameOdds) return null;

  // Check for PregameOdds/LiveOdds arrays (scores format)
  const pregameOdd = gameOdds.PregameOdds?.[0];
  const liveOdd = gameOdds.LiveOdds?.[0];

  // Use live odds if available, otherwise use pregame odds
  const oddsEntry = liveOdd || pregameOdd;

  if (!oddsEntry) return null;

  return {
    homeMoneyLine: oddsEntry.HomeTeamMoneyLine,
    awayMoneyLine: oddsEntry.AwayTeamMoneyLine,
    homePointSpread: oddsEntry.PointSpreadHomeTeamMoneyLine,
    awayPointSpread: oddsEntry.PointSpreadAwayTeamMoneyLine,
    overUnder: oddsEntry.OverUnder,
    sportsbook: oddsEntry.Sportsbook,
    homeTeam: {
      moneyLine: oddsEntry.HomeTeamMoneyLine,
      pointSpread: oddsEntry.PointSpreadHomeTeamMoneyLine,
    },
    awayTeam: {
      moneyLine: oddsEntry.AwayTeamMoneyLine,
      pointSpread: oddsEntry.PointSpreadAwayTeamMoneyLine,
    },
    total: oddsEntry.OverUnder,
    totalOverOdds: oddsEntry.OverPayout,
    totalUnderOdds: oddsEntry.UnderPayout,
  };
};

// Game Card Skeleton Component
const GameCardSkeleton = () => {
  return (
    <Card.Root
      variant="outline"
      size="sm"
      transition="all 0.2s"
      bg="primary.25"
      borderRadius="12px"
      shadow="sm"
      border="1px"
      borderColor="text.400"
    >
      <Card.Body p="4">
        <VStack gap="3" align="stretch">
          {/* Game Status and Time */}
          <HStack justify="space-between" align="center">
            <Skeleton w="20%" h="3" />
            <HStack gap="2">
              <Skeleton w="12" h="5" borderRadius="full" />
              <Skeleton w="16" h="5" borderRadius="full" />
            </HStack>
          </HStack>

          {/* Location */}
          <HStack gap="2" flexWrap="wrap">
            <Skeleton w="24" h="5" borderRadius="full" />
            <Skeleton w="20" h="5" borderRadius="full" />
          </HStack>

          {/* Away Team */}
          <HStack justify="space-between" align="center">
            <HStack gap="3" align="center">
              <SkeletonCircle size="8" />
              <VStack align="start" gap="1">
                <Skeleton w="24" h="3" />
                <Skeleton w="16" h="2" />
              </VStack>
            </HStack>
            <HStack gap="2" align="center">
              <Skeleton w="6" h="5" />
              <Skeleton w="20" h="8" borderRadius="6px" />
            </HStack>
          </HStack>

          {/* Home Team */}
          <HStack justify="space-between" align="center">
            <HStack gap="3" align="center">
              <SkeletonCircle size="8" />
              <VStack align="start" gap="1">
                <Skeleton w="24" h="3" />
                <Skeleton w="16" h="2" />
              </VStack>
            </HStack>
            <HStack gap="2" align="center">
              <Skeleton w="6" h="5" />
              <Skeleton w="20" h="8" borderRadius="6px" />
            </HStack>
          </HStack>

          {/* Game Odds */}
          <Box pt="2" borderTop="1px" borderColor="text.200">
            <Skeleton w="full" h="3" />
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

// Convert game data to Game format (works for all leagues)
const convertGameToGame = (
  rawGame: any,
  teamProfiles: any,
  stadiums: any,
  league: League,
  oddsData?: any,
  boxScoreData?: any,
): Game | null => {
  // Map API status to our status format
  const getStatus = (apiStatus: string): GameStatus => {
    return mapApiStatusToGameStatus(apiStatus);
  };

  // Helper functions to get team profiles and stadiums
  const getTeamProfile = (teamId: number) => {
    if (!teamProfiles?.data) return null;
    return teamProfiles.data.find((team: any) => team.TeamID === teamId);
  };

  const getStadium = (stadiumId?: number) => {
    if (!stadiums?.data || !stadiumId) return null;
    return stadiums.data.find(
      (stadium: any) => stadium.StadiumID === stadiumId,
    );
  };

  // Get team profiles
  const homeTeamProfile = getTeamProfile(rawGame.HomeTeamID);
  const awayTeamProfile = getTeamProfile(rawGame.AwayTeamID);

  // Get stadium
  const stadium = getStadium(rawGame.StadiumID);

  if (!homeTeamProfile || !awayTeamProfile) {
    return null;
  }

  const gameId = rawGame.GameID.toString();

  // Check if we have more accurate box score data for this game
  const boxScoreGame = boxScoreData?.[gameId]?.data?.Game;

  // Use box score data if available, otherwise use raw game data
  const gameData = boxScoreGame || rawGame;

  const convertedGame: Game = {
    id: gameId,
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
    status: getStatus(gameData.Status),
    time: gameData.DateTime || "",
    date: gameData.DateTime
      ? convertUtcToLocalDate(gameData.DateTime)
      : new Date().toISOString().split("T")[0],
    quarter: gameData.Inning || undefined,
    inningHalf: gameData.InningHalf || undefined,
    // Location/Venue information
    stadium: stadium?.Name,
    city: stadium?.City,
    state: stadium?.State,
    country: stadium?.Country,
    capacity: stadium?.Capacity,
    surface: stadium?.Surface,
    weather: gameData.Weather,
    temperature: gameData.Temperature,
    stadiumId: gameData.StadiumID, // Store stadium ID for potential future lookup
    division: homeTeamProfile?.Division, // Store division for display
    // Postseason flag - determine based on the game date using config
    isPostseason: isPostseasonDate(
      league,
      gameData.DateTime
        ? convertUtcToLocalDate(gameData.DateTime)
        : new Date().toISOString().split("T")[0],
    ),
    // Base runners
    runnerOnFirst: gameData.RunnerOnFirst || false,
    runnerOnSecond: gameData.RunnerOnSecond || false,
    runnerOnThird: gameData.RunnerOnThird || false,
    // Odds information
    odds: getGameOdds(gameId, oddsData, gameData) || undefined,
    // League
    league: league,
  };

  return convertedGame;
};

// Convert schedule game to Game format
const convertScheduleGameToGame = (
  scheduleGame: any, // Changed from MLBScheduleGame to any for generic support
  teamProfiles: any,
  stadiums: any,
  league: League,
  oddsData?: any,
  boxScoreData?: any,
): Game | null => {
  // Map API status to our status format
  const getStatus = (apiStatus: string): GameStatus => {
    return mapApiStatusToGameStatus(apiStatus);
  };

  // Helper functions to get team profiles and stadiums
  const getTeamProfile = (teamId: number) => {
    if (!teamProfiles?.data) return null;
    return teamProfiles.data.find((team: any) => team.TeamID === teamId);
  };

  const getStadium = (stadiumId?: number) => {
    if (!stadiums?.data || !stadiumId) return null;
    return stadiums.data.find(
      (stadium: any) => stadium.StadiumID === stadiumId,
    );
  };

  // Get team profiles
  const homeTeamProfile = getTeamProfile(scheduleGame.HomeTeamID);
  const awayTeamProfile = getTeamProfile(scheduleGame.AwayTeamID);

  // Get stadium
  const stadium = getStadium(scheduleGame.StadiumID);

  if (!homeTeamProfile || !awayTeamProfile) {
    return null;
  }

  const gameId = scheduleGame.GameID.toString();

  // Check if we have more accurate box score data for this game
  const boxScoreGame = boxScoreData?.[gameId]?.data?.Game;

  // Use box score data if available, otherwise use schedule game data
  const gameData = boxScoreGame || scheduleGame;

  const convertedDate = gameData.DateTime
    ? convertUtcToLocalDate(gameData.DateTime)
    : new Date().toISOString().split("T")[0];

  const convertedGame: Game = {
    id: gameId,
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
    status: getStatus(gameData.Status || ""),
    time: gameData.DateTime || "",
    date: convertedDate,
    quarter: gameData.Inning?.toString() || undefined,
    inningHalf: gameData.InningHalf || undefined,
    // Location/Venue information
    stadium: stadium?.Name,
    city: stadium?.City,
    state: stadium?.State,
    country: stadium?.Country,
    capacity: stadium?.Capacity,
    surface: stadium?.Surface,
    weather: undefined, // Weather not available in schedule data
    temperature: undefined, // Temperature not available in schedule data
    stadiumId: gameData.StadiumID, // Store stadium ID for potential future lookup
    division: homeTeamProfile?.Division, // Store division for display
    // Postseason flag - determine based on the game date using config
    isPostseason: isPostseasonDate(league, convertedDate),
    // Base runners
    runnerOnFirst: gameData.RunnerOnFirst || false,
    runnerOnSecond: gameData.RunnerOnSecond || false,
    runnerOnThird: gameData.RunnerOnThird || false,
    // Odds information
    odds: getGameOdds(gameId, oddsData, gameData) || undefined,
    // League
    league: league,
  };

  return convertedGame;
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
        <MLBScoreCardV2
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
    case League.NBA:
      return (
        <NBAScoreCardV2
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
    case League.NFL:
      return (
        <NFLScoreCardV2
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
    case League.NHL:
      return (
        <NHLScoreCardV2
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
    default:
      return (
        <GenericScoreCardV2
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
  }
};

export function ScoresV2() {
  // Get league from URL parameter
  const { league } = useParams<{ league: string }>();

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
    // fetchOddsByDate: fetchOdds, // Commented out - not using odds-by-date endpoint anymore
  } = useArb();

  // Redux state
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector((state) => state.sportsData.selectedDate);
  const boxScoreData = useAppSelector((state) => state.sportsData.boxScoreData);
  const navigate = useNavigate();

  // Handle game click for box score navigation - now goes to new /scores route
  const handleGameClick = (gameId: string) => {
    navigate(`/scores/${selectedLeague}/${gameId}`);
  };

  // Initialize selected date to today only on first load (when selectedDate is empty)
  useEffect(() => {
    if (!selectedDate) {
      const today = getCurrentLocalDate();
      dispatch(setSelectedDate(today));
    }
  }, [selectedDate, dispatch]);

  // Update selectedLeague when URL parameter changes
  useEffect(() => {
    if (league && league !== selectedLeague) {
      dispatch(setSelectedLeague(league));
    }
  }, [league, selectedLeague, dispatch]);

  // Fetch data when component mounts or league/date changes
  useEffect(() => {
    if (selectedDate && league) {
      const today = getCurrentLocalDate();
      const isFutureDate = selectedDate > today;

      // Use scores endpoint for past/current dates, schedule endpoint for future dates
      if (isFutureDate) {
        fetchSchedule(league, selectedDate);
      } else {
        fetchScores(league, selectedDate);
      }

      fetchTeamProfiles(league);
      fetchStadiums(league);
      // fetchOdds(league, selectedDate); // Commented out - not using odds-by-date endpoint anymore
    }
  }, [
    league,
    selectedDate,
    fetchScores,
    fetchTeamProfiles,
    fetchStadiums,
    // fetchOdds, // Commented out - not using odds-by-date endpoint anymore
    fetchSchedule,
  ]);

  // Fetch box score data for live games to get more accurate scores
  useEffect(() => {
    if (scores?.data && selectedDate && league) {
      // Fetch box score data for each live game to get accurate scores
      scores.data.forEach((game: any) => {
        const gameId = game.GameID.toString();
        const gameStatus = mapApiStatusToGameStatus(game.Status);

        // Only fetch box score for live games that we don't already have
        if (gameStatus === GameStatus.LIVE && !boxScoreData[gameId]) {
          dispatch(fetchBoxScore({ league, gameId }));
        }
      });
    }
  }, [scores?.data, selectedDate, league, dispatch, boxScoreData]);

  // Get all games based on the selected date and league
  const getAllGames = (): Game[] => {
    if (!scores && !schedule) {
      return [];
    }

    // Determine which data source to use based on whether it's a future date
    const today = getCurrentLocalDate();
    const isFutureDate = selectedDate && selectedDate > today;

    // Use scores data for past/current dates, schedule data for future dates
    if (isFutureDate && schedule?.data) {
      const scheduleGames = schedule.data
        .filter((rawGame: any) => {
          // Filter out games that don't have a DateTime field
          return rawGame.DateTime !== undefined && rawGame.DateTime !== null;
        })
        .map((game: any) =>
          convertScheduleGameToGame(
            game,
            teamProfiles,
            stadiums,
            selectedLeague as League,
            odds,
            boxScoreData,
          ),
        )
        .filter((game: any): game is Game => {
          if (!game) return false;

          // Filter games to only show those that actually start on the selected date
          const gameDate = game.date; // This is already converted to YYYY-MM-DD format
          return gameDate === selectedDate;
        });

      return scheduleGames;
    } else if (!isFutureDate && scores?.data) {
      const scoresGames = scores.data
        .filter((rawGame: any) => {
          // Filter out games that don't have a DateTime field
          return rawGame.DateTime !== undefined && rawGame.DateTime !== null;
        })
        .map((game: any) =>
          convertGameToGame(
            game,
            teamProfiles,
            stadiums,
            selectedLeague as League,
            odds,
            boxScoreData,
          ),
        )
        .filter((game: any): game is Game => {
          if (!game) return false;

          // Filter games to only show those that actually start on the selected date
          const gameDate = game.date; // This is already converted to YYYY-MM-DD format
          return gameDate === selectedDate;
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
    return timeB - timeA; // Most recent first
  });

  // Retry function for error state
  const handleRetry = () => {
    if (selectedDate && league) {
      const today = getCurrentLocalDate();
      const isFutureDate = selectedDate > today;

      // Use the appropriate endpoint based on date
      if (isFutureDate) {
        fetchSchedule(league, selectedDate);
      } else {
        fetchScores(league, selectedDate);
      }

      fetchTeamProfiles(league);
      fetchStadiums(league);
      // Only retry odds if there's no critical error
      // if (!hasCriticalError) {
      //   fetchOdds(league, selectedDate); // Commented out - not using odds-by-date endpoint anymore
      // }
    }
  };

  // Show error state if there's a critical error (odds errors are non-blocking)
  const hasCriticalError =
    scoresError || teamProfilesError || stadiumsError || scheduleError;
  if (hasCriticalError) {
    return (
      <ErrorState
        title="Error Loading Scores"
        message={`Failed to load ${selectedLeague.toUpperCase()} scores. ${hasCriticalError}`}
        onRetry={handleRetry}
        showRetry={true}
        showBack={false}
        variant="error"
      />
    );
  }

  return (
    <HideVerticalScroll minH="100vh" bg="primary.25">
      <VStack gap="4" align="stretch" p="4" pb="20">
        {/* Date Selector */}
        <DatePicker selectedLeague={selectedLeague} />

        {/* Games List */}
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
                borderRadius="12px"
                shadow="sm"
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
                      <Text fontSize="2xl">📺</Text>
                    </Box>
                    <VStack gap="2">
                      <Text
                        fontSize="lg"
                        fontWeight="semibold"
                        color="text.400"
                      >
                        {selectedLeague === League.MLB
                          ? "No Games"
                          : "Coming Soon"}
                      </Text>
                      <Text fontSize="sm" color="text.400" textAlign="center">
                        {selectedLeague === League.MLB ? (
                          <>
                            No games scheduled for{" "}
                            {selectedDate
                              ? parseLocalDate(selectedDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )
                              : "this date"}
                            .
                          </>
                        ) : (
                          <>
                            {selectedLeague.toUpperCase()} scores are not yet
                            available. We're working on adding support for{" "}
                            {selectedLeague.toUpperCase()} games.
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
      </VStack>
    </HideVerticalScroll>
  );
}
