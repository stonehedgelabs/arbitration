// React imports
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Third-party library imports
import {
  Badge,
  Box,
  Card,
  HStack,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Wifi } from "lucide-react";

// Internal imports - components
import { Skeleton, SkeletonCircle } from "../components/Skeleton";
import { Bases } from "../components/Bases";
import {
  MLBScoreCard,
  NBAScoreCard,
  NFLScoreCard,
  NHLScoreCard,
  GenericScoreCard,
} from "../components/cards/score";

// Internal imports - config
import {
  isPostseasonDate,
  League,
  GameStatus,
  mapApiStatusToGameStatus,
} from "../config";

// Internal imports - components
import { BoxScoreDetail } from "../components/boxscore/BoxScoreDetail.tsx";
import { DatePicker } from "../components/DatePicker";

// Internal imports - schema
import { MLBScheduleGame } from "../schema";

// Internal imports - services
import useArb from "../services/Arb";

// Internal imports - store
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setSelectedDate } from "../store/slices/sportsDataSlice";

// Internal imports - utils
import {
  convertUtcToLocalDate,
  getCurrentLocalDate,
  formatDateForSlider,
  toLocalTime,
  orEmpty,
  formatInningWithIcon,
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
const getGameOdds = (gameId: string, oddsData: any) => {
  if (!oddsData?.data) return null;

  const gameOdds = oddsData.data.find(
    (odds: any) => odds.GameId?.toString() === gameId,
  );

  if (!gameOdds) return null;

  return {
    homeMoneyLine: gameOdds.HomeMoneyLine,
    awayMoneyLine: gameOdds.AwayMoneyLine,
    homePointSpread: gameOdds.HomePointSpread,
    awayPointSpread: gameOdds.AwayPointSpread,
    overUnder: gameOdds.OverUnder,
    sportsbook: gameOdds.Sportsbook,
    homeTeam: {
      moneyLine: gameOdds.HomeMoneyLine,
      pointSpread: gameOdds.HomePointSpread,
    },
    awayTeam: {
      moneyLine: gameOdds.AwayMoneyLine,
      pointSpread: gameOdds.AwayPointSpread,
    },
    total: gameOdds.OverUnder,
    totalOverOdds: gameOdds.OverOdds,
    totalUnderOdds: gameOdds.UnderOdds,
  };
};

// Helper component for team odds display
const TeamOddsDisplay = ({
  odds,
  isAway = false,
  isLoading = false,
}: {
  odds: Game["odds"];
  isAway?: boolean;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <VStack gap="1" align="stretch" fontSize="xs" w="full">
        {/* Money Line skeleton */}
        <HStack justify="space-between" align="center" w="full">
          <Skeleton w="30%" h="2.5" />
          <Skeleton w="40%" h="2.5" />
        </HStack>
        {/* Point Spread skeleton */}
        <HStack justify="space-between" align="center" w="full">
          <Skeleton w="35%" h="2.5" />
          <Skeleton w="25%" h="2.5" />
        </HStack>
      </VStack>
    );
  }

  if (!odds) {
    return (
      <VStack gap="1" align="stretch" fontSize="xs" w="full">
        <Text color="text.500" textAlign="center">
          No odds
        </Text>
      </VStack>
    );
  }

  const teamOdds = isAway ? odds.awayTeam : odds.homeTeam;
  const total = odds.total;

  return (
    <VStack gap="1" align="stretch" fontSize="xs" w="full">
      {/* Money Line */}
      <HStack justify="space-between" align="center" w="full">
        <Text color="text.500">ML</Text>
        <Text
          color={teamOdds?.moneyLine > 0 ? "green.500" : "text.400"}
          fontWeight="medium"
        >
          {teamOdds?.moneyLine > 0 ? "+" : ""}
          {teamOdds?.moneyLine || "—"}
        </Text>
      </HStack>
      {/* Point Spread */}
      <HStack justify="space-between" align="center" w="full">
        <Text color="text.500">Spread</Text>
        <Text
          color={teamOdds?.pointSpread > 0 ? "green.500" : "text.400"}
          fontWeight="medium"
        >
          {teamOdds?.pointSpread > 0 ? "+" : ""}
          {teamOdds?.pointSpread || "—"}
        </Text>
      </HStack>
    </VStack>
  );
};

// Helper component for game odds display
const GameOddsDisplay = ({
  odds,
  isLoading = false,
}: {
  odds: Game["odds"];
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <HStack justify="space-between" align="center" fontSize="xs" w="full">
        {/* Total skeleton */}
        <Skeleton w="50%" h="2.5" />
        {/* Sportsbook skeleton */}
        <Skeleton w="35%" h="2.5" />
      </HStack>
    );
  }

  if (!odds) {
    return (
      <HStack justify="space-between" align="center" fontSize="xs" w="full">
        <Text color="text.500">No odds available</Text>
      </HStack>
    );
  }

  return (
    <HStack justify="space-between" align="center" fontSize="xs" w="full">
      <Text color="text.500">
        Total: {odds.total || "—"} ({odds.totalOverOdds > 0 ? "+" : ""}
        {odds.totalOverOdds || "—"})
      </Text>
      <Text color="text.500" fontSize="2xs">
        {odds.sportsbook || "—"}
      </Text>
    </HStack>
  );
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

// Convert MLB game to Game format
const convertMLBGameToGame = (
  rawGame: any,
  mlbTeamProfiles: any,
  mlbStadiums: any,
  oddsData?: any,
): Game | null => {
  // Map API status to our status format
  const getStatus = (apiStatus: string): GameStatus => {
    return mapApiStatusToGameStatus(apiStatus);
  };

  // Helper functions to get team profiles and stadiums
  const getTeamProfile = (teamName: string) => {
    if (!mlbTeamProfiles?.data) return null;
    return mlbTeamProfiles.data.find(
      (team: any) => team.Name === teamName || team.Key === teamName,
    );
  };

  const getStadium = (stadiumId?: number) => {
    if (!mlbStadiums?.data || !stadiumId) return null;
    return mlbStadiums.data.find(
      (stadium: any) => stadium.StadiumID === stadiumId,
    );
  };

  // Get team profiles
  const homeTeamProfile = getTeamProfile(rawGame.HomeTeam);
  const awayTeamProfile = getTeamProfile(rawGame.AwayTeam);

  // Get stadium
  const stadium = getStadium(rawGame.StadiumID);

  if (!homeTeamProfile || !awayTeamProfile) {
    return null;
  }

  const gameId = rawGame.GameID.toString();

  const convertedGame: Game = {
    id: gameId,
    homeTeam: {
      name: homeTeamProfile.Name,
      score: rawGame.HomeTeamRuns || 0,
      logo: homeTeamProfile.WikipediaLogoUrl,
    },
    awayTeam: {
      name: awayTeamProfile.Name,
      score: rawGame.AwayTeamRuns || 0,
      logo: awayTeamProfile.WikipediaLogoUrl,
    },
    status: getStatus(rawGame.Status),
    time: rawGame.DateTime || "",
    date: rawGame.DateTime
      ? convertUtcToLocalDate(rawGame.DateTime)
      : new Date().toISOString().split("T")[0],
    quarter: rawGame.Inning || undefined,
    // Location/Venue information
    stadium: stadium?.Name,
    city: stadium?.City,
    state: stadium?.State,
    country: stadium?.Country,
    capacity: stadium?.Capacity,
    surface: stadium?.Surface,
    weather: rawGame.Weather,
    temperature: rawGame.Temperature,
    stadiumId: rawGame.StadiumID, // Store stadium ID for potential future lookup
    division: homeTeamProfile?.Division, // Store division for display
    // Postseason flag - determine based on the game date using config
    isPostseason: isPostseasonDate(
      League.MLB,
      rawGame.DateTime
        ? convertUtcToLocalDate(rawGame.DateTime)
        : new Date().toISOString().split("T")[0],
    ),
    // Base runners
    runnerOnFirst: rawGame.RunnerOnFirst || false,
    runnerOnSecond: rawGame.RunnerOnSecond || false,
    runnerOnThird: rawGame.RunnerOnThird || false,
    // Odds information
    odds: getGameOdds(gameId, oddsData) || undefined,
    // League
    league: League.MLB,
  };

  return convertedGame;
};

// Convert schedule game to Game format
const convertScheduleGameToGame = (
  scheduleGame: MLBScheduleGame,
  mlbTeamProfiles: any,
  mlbStadiums: any,
  oddsData?: any,
): Game | null => {
  // Map API status to our status format
  const getStatus = (apiStatus: string): GameStatus => {
    return mapApiStatusToGameStatus(apiStatus);
  };

  // Helper functions to get team profiles and stadiums
  const getTeamProfile = (teamName: string) => {
    if (!mlbTeamProfiles?.data) return null;
    return mlbTeamProfiles.data.find(
      (team: any) => team.Name === teamName || team.Key === teamName,
    );
  };

  const getStadium = (stadiumId?: number) => {
    if (!mlbStadiums?.data || !stadiumId) return null;
    return mlbStadiums.data.find(
      (stadium: any) => stadium.StadiumID === stadiumId,
    );
  };

  // Get team profiles
  const homeTeamProfile = getTeamProfile(scheduleGame.HomeTeam || "");
  const awayTeamProfile = getTeamProfile(scheduleGame.AwayTeam || "");

  // Get stadium
  const stadium = getStadium(scheduleGame.StadiumID);

  if (!homeTeamProfile || !awayTeamProfile) {
    return null;
  }

  const gameId = scheduleGame.GameID.toString();
  const convertedDate = scheduleGame.DateTime
    ? convertUtcToLocalDate(scheduleGame.DateTime)
    : new Date().toISOString().split("T")[0];

  const convertedGame: Game = {
    id: gameId,
    homeTeam: {
      name: homeTeamProfile.Name,
      score: scheduleGame.HomeTeamRuns || 0,
      logo: homeTeamProfile.WikipediaLogoUrl,
    },
    awayTeam: {
      name: awayTeamProfile.Name,
      score: scheduleGame.AwayTeamRuns || 0,
      logo: awayTeamProfile.WikipediaLogoUrl,
    },
    status: getStatus(scheduleGame.Status || ""),
    time: scheduleGame.DateTime || "",
    date: convertedDate,
    quarter: scheduleGame.Inning?.toString() || undefined,
    // Location/Venue information
    stadium: stadium?.Name,
    city: stadium?.City,
    state: stadium?.State,
    country: stadium?.Country,
    capacity: stadium?.Capacity,
    surface: stadium?.Surface,
    weather: undefined, // Weather not available in schedule data
    temperature: undefined, // Temperature not available in schedule data
    stadiumId: scheduleGame.StadiumID, // Store stadium ID for potential future lookup
    division: homeTeamProfile?.Division, // Store division for display
    // Postseason flag - determine based on the game date using config
    isPostseason: isPostseasonDate(League.MLB, convertedDate),
    // Base runners
    runnerOnFirst: scheduleGame.RunnerOnFirst || false,
    runnerOnSecond: scheduleGame.RunnerOnSecond || false,
    runnerOnThird: scheduleGame.RunnerOnThird || false,
    // Odds information
    odds: getGameOdds(gameId, oddsData) || undefined,
    // League
    league: League.MLB,
  };

  return convertedGame;
};

// League-specific score card component
const ScoreCard = ({
  game,
  onGameClick,
  oddsLoading,
  mlbOddsByDate,
}: {
  game: Game;
  onGameClick: (gameId: string, gameDate: string) => void;
  oddsLoading?: boolean;
  mlbOddsByDate?: any;
}) => {
  switch (game.league) {
    case League.MLB:
      return (
        <MLBScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          mlbOddsByDate={mlbOddsByDate}
        />
      );
    case League.NBA:
      return (
        <NBAScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
        />
      );
    case League.NFL:
      return (
        <NFLScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
        />
      );
    case League.NHL:
      return (
        <NHLScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
        />
      );
    default:
      return (
        <GenericScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
        />
      );
  }
};

export function Scores() {
  // Get selectedLeague from Redux
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );

  const {
    mlbScores,
    mlbTeamProfiles,
    mlbStadiums,
    mlbSchedule,
    currentGames,
    mlbOddsByDate,
    mlbScoresLoading,
    mlbScoresError: mlbError,
    oddsLoading,
    fetchMLBScores,
    fetchMLBTeamProfiles,
    fetchMLBStadiums,
    fetchMLBSchedule,
    fetchCurrentGames,
    fetchMLBOddsByDate,
  } = useArb();

  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedGameDate, setSelectedGameDate] = useState<string | null>(null);
  const [isFetchingDateData, setIsFetchingDateData] = useState(false);

  // Redux state
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector((state) => state.sportsData.selectedDate);
  const navigate = useNavigate();

  // Handle game click for box score navigation
  const handleGameClick = (gameId: string, gameDate: string) => {
    navigate(`/scores/${selectedLeague}/${gameId}`);
  };

  // Fetch MLB scores and team profiles when component mounts or league changes
  useEffect(() => {
    if (selectedLeague === League.MLB) {
      fetchMLBScores(selectedDate);
      fetchMLBTeamProfiles();
      fetchMLBStadiums();
    }
  }, [
    selectedLeague,
    selectedDate,
    fetchMLBScores,
    fetchMLBTeamProfiles,
    fetchMLBStadiums,
  ]);

  // Initialize selected date to today only on first load (when selectedDate is empty)
  useEffect(() => {
    if (!selectedDate) {
      const today = getCurrentLocalDate();
      dispatch(setSelectedDate(today));
    }
  }, [selectedDate, dispatch]);

  // Fetch odds when component mounts or league changes
  useEffect(() => {
    if (selectedLeague === League.MLB && selectedDate) {
      fetchMLBOddsByDate(selectedDate);
    }
  }, [selectedLeague, selectedDate, fetchMLBOddsByDate]);

  // Fetch schedule data for postseason dates
  useEffect(() => {
    if (selectedLeague === League.MLB && selectedDate) {
      // Check if this is a postseason date using config
      const isPostseason = isPostseasonDate(League.MLB, selectedDate);

      if (isPostseason) {
        setIsFetchingDateData(true);
        fetchMLBSchedule(selectedDate).finally(() => {
          setIsFetchingDateData(false);
        });
      }
    }
  }, [selectedLeague, selectedDate, fetchMLBSchedule]);

  // Get all games based on the selected date and league
  const getAllGames = (): Game[] => {
    if (selectedLeague === League.MLB) {
      // Check if this is a postseason date
      const isPostseason = selectedDate
        ? isPostseasonDate(League.MLB, selectedDate)
        : false;

      if (isPostseason) {
        // Use schedule data for postseason
        if (
          mlbSchedule?.data &&
          selectedDate &&
          isPostseasonDate(League.MLB, selectedDate)
        ) {
          const scheduleGames = mlbSchedule.data
            .map((game) =>
              convertScheduleGameToGame(
                game,
                mlbTeamProfiles,
                mlbStadiums,
                mlbOddsByDate,
              ),
            )
            .filter((game): game is Game => game !== null);

          return scheduleGames;
        }
      } else {
        // Use regular scores data for regular season
        if (mlbScores?.data) {
          const scoresGames = mlbScores.data
            .map((game) =>
              convertMLBGameToGame(
                game,
                mlbTeamProfiles,
                mlbStadiums,
                mlbOddsByDate,
              ),
            )
            .filter((game): game is Game => game !== null);

          return scoresGames;
        }
      }
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

  // Format time from DateTime (convert EST to local time)
  const formatTime = (dateTime: string) => {
    return toLocalTime(dateTime);
  };

  // Show error state if there's an error
  if (mlbError) {
    return (
      <Box minH="100vh" bg="primary.25" p="4">
        <VStack gap="4" align="center" justify="center" minH="50vh">
          <Text color="red.500" fontSize="lg" fontWeight="semibold">
            Error loading scores
          </Text>
          <Text color="text.400" textAlign="center">
            {mlbError}
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="primary.25">
      <VStack gap="4" align="stretch" p="4" pb="20">
        {/* Date Selector */}
        <DatePicker selectedLeague={selectedLeague} />

        {/* Games List */}
        <VStack gap="4" align="stretch">
          {sortedGames.length === 0 ? (
            // Show loading state if we're fetching data, otherwise show no games
            isFetchingDateData ||
            mlbScoresLoading ||
            (selectedLeague === League.MLB && !mlbScores) ? (
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
                        No Games
                      </Text>
                      <Text fontSize="sm" color="text.400" textAlign="center">
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
                      </Text>
                    </VStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            )
          ) : (
            <VStack gap="4" align="stretch">
              {isFetchingDateData
                ? // Show skeleton cards while loading
                  Array.from({ length: 3 }, (_, index) => (
                    <GameCardSkeleton key={`skeleton-${index}`} />
                  ))
                : sortedGames.map((game) => (
                    <ScoreCard
                      key={game.id}
                      game={game}
                      onGameClick={handleGameClick}
                      oddsLoading={oddsLoading}
                      mlbOddsByDate={mlbOddsByDate}
                    />
                  ))}
            </VStack>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}
