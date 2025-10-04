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
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Wifi } from "lucide-react";

// Internal imports - components
import { Skeleton, SkeletonCircle } from "./Skeleton";
import { Bases } from "./Bases";

// Internal imports - config
import {
  isPostseasonDate,
  League,
  GameStatus,
  mapApiStatusToGameStatus,
} from "../config";

// Internal imports - components
import { BoxScoreDetail } from "./BoxScoreDetail";
import { DatePicker } from "./DatePicker";

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
} from "../utils";

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
  };
}

// Helper function to safely parse dates
const isValidDate = (dateString: string): boolean => {
  if (!dateString || dateString.trim() === "") return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Helper function to get display name for a date
const getDateDisplayName = (dateString: string): string => {
  if (!dateString) return "This Date";

  const todayString = getCurrentLocalDate();
  if (dateString === todayString) {
    return "Today";
  }

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return "This Date";
  }

  return formatDateForSlider(date);
};

// Helper function to titleize text
const titleize = (text: string): string => {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Helper function to get odds data for a specific game
const getGameOdds = (
  gameId: string,
  oddsData: any,
): Game["odds"] | undefined => {
  if (!oddsData?.data) {
    return undefined;
  }

  const gameOdds = oddsData.data.find(
    (odds: any) => odds.GameId?.toString() === gameId,
  );

  if (!gameOdds) {
    return undefined;
  }

  // Get the first available odds (prefer pregame odds)
  const pregameOdds = gameOdds.PregameOdds?.[0];
  const liveOdds = gameOdds.LiveOdds?.[0];
  const odds = pregameOdds || liveOdds;

  if (!odds) {
    return undefined;
  }

  return {
    homeMoneyLine: odds.HomeMoneyLine,
    awayMoneyLine: odds.AwayMoneyLine,
    homePointSpread: odds.HomePointSpread,
    awayPointSpread: odds.AwayPointSpread,
    overUnder: odds.OverUnder,
    sportsbook: odds.Sportsbook || "Unknown",
  };
};

// Team Odds Display Component
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
      <VStack gap="1" align="stretch" fontSize="xs">
        <Text color="gray.500" textAlign="center">
          No odds yet
        </Text>
      </VStack>
    );
  }

  const moneyLine = isAway ? odds.awayMoneyLine : odds.homeMoneyLine;
  const pointSpread = isAway ? odds.awayPointSpread : odds.homePointSpread;

  return (
    <VStack gap="1" align="stretch" fontSize="xs">
      {/* Money Line */}
      {moneyLine !== null && moneyLine !== undefined && (
        <HStack justify="space-between" align="center">
          <Text color="gray.600" fontWeight="medium">
            ML:
          </Text>
          <Text color="gray.800" fontWeight="semibold">
            {moneyLine > 0 ? `+${moneyLine}` : moneyLine}
          </Text>
        </HStack>
      )}

      {/* Point Spread */}
      {pointSpread !== null && pointSpread !== undefined && (
        <HStack justify="space-between" align="center">
          <Text color="gray.600" fontWeight="medium">
            Spread:
          </Text>
          <Text color="gray.800" fontWeight="semibold">
            {pointSpread > 0 ? `+${pointSpread}` : pointSpread}
          </Text>
        </HStack>
      )}
    </VStack>
  );
};

// Game Card Skeleton Component
const GameCardSkeleton = () => {
  return (
    <Card.Root
      variant="outline"
      size="sm"
      transition="all 0.2s"
      cursor="pointer"
    >
      <Card.Body p="4">
        <VStack gap="3" align="stretch">
          {/* Game Status and Time */}
          <HStack justify="space-between" align="center">
            <Skeleton w="20" h="5" />
            <Skeleton w="16" h="4" />
          </HStack>

          {/* Away Team */}
          <HStack justify="space-between" align="center" gap="2">
            <HStack gap="3" align="center" flex="1" minW="0">
              <SkeletonCircle size="8" />
              <Skeleton w="70%" h="4" />
            </HStack>
            <HStack gap="2" align="center">
              <Skeleton w="6" h="6" />
              <Skeleton w="16" h="8" />
            </HStack>
          </HStack>

          {/* Home Team */}
          <HStack justify="space-between" align="center" gap="2">
            <HStack gap="3" align="center" flex="1" minW="0">
              <SkeletonCircle size="8" />
              <Skeleton w="70%" h="4" />
            </HStack>
            <HStack gap="2" align="center">
              <Skeleton w="6" h="6" />
              <Skeleton w="16" h="8" />
            </HStack>
          </HStack>

          {/* Venue Info */}
          <HStack gap="2" align="center" flexWrap="wrap">
            <Skeleton w="24" h="5" />
            <Skeleton w="20" h="5" />
            <Skeleton w="16" h="5" />
          </HStack>

          {/* Game-level odds skeleton */}
          <Box mt="2" pt="2" borderTop="1px solid" borderColor="gray.200">
            <HStack
              justify="space-between"
              align="center"
              fontSize="xs"
              w="full"
            >
              <Skeleton w="50%" h="2.5" />
              <Skeleton w="35%" h="2.5" />
            </HStack>
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

// Game-level odds display (Total and Sportsbook)
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
        <Text color="gray.500">No odds yet</Text>
      </HStack>
    );
  }

  return (
    <HStack justify="space-between" align="center" fontSize="xs">
      {/* Over/Under */}
      {odds.overUnder !== null && (
        <Text color="gray.600" fontWeight="medium">
          Total:{" "}
          <Text as="span" color="gray.800" fontWeight="semibold">
            O/U {odds.overUnder}
          </Text>
        </Text>
      )}

      {/* Sportsbook */}
      {odds.sportsbook && (
        <Text color="gray.500" fontSize="2xs">
          via {odds.sportsbook}
        </Text>
      )}
    </HStack>
  );
};

// Convert MLB games to the expected format
const convertMLBGameToGame = (
  rawGame: any,
  mlbTeamProfiles?: any,
  mlbStadiums?: any,
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

  const getStadium = (stadiumId: number) => {
    if (!mlbStadiums?.data) return null;
    return mlbStadiums.data.find(
      (stadium: any) => stadium.StadiumID === stadiumId,
    );
  };

  // Check if this is a game that should be filtered out
  const gameStatus = getStatus(rawGame.Status);

  // Filter out cancelled games (NotNecessary, Cancelled, Postponed, etc.)
  if (gameStatus === GameStatus.CANCELLED) {
    return null; // This will be filtered out
  }

  // Also filter out games that are marked as "upcoming" but the game time is in the past
  const gameTime = new Date(rawGame.DateTime);
  const now = new Date();
  const isPastGame = gameTime < now;

  if (isPastGame && gameStatus === GameStatus.UPCOMING) {
    return null; // This will be filtered out
  }

  // Get team profiles for better names and logos
  const homeTeamProfile = getTeamProfile(rawGame.HomeTeam);
  const awayTeamProfile = getTeamProfile(rawGame.AwayTeam);
  const stadium = getStadium(rawGame.StadiumID);
  const gameId = rawGame.GameID?.toString() || "";

  const convertedGame = {
    id: gameId,
    homeTeam: {
      name: homeTeamProfile
        ? `${homeTeamProfile.City} ${homeTeamProfile.Name}`
        : rawGame.HomeTeam || "",
      score: rawGame.HomeTeamRuns || 0,
      logo: homeTeamProfile?.WikipediaLogoUrl,
    },
    awayTeam: {
      name: awayTeamProfile
        ? `${awayTeamProfile.City} ${awayTeamProfile.Name}`
        : rawGame.AwayTeam || "",
      score: rawGame.AwayTeamRuns || 0,
      logo: awayTeamProfile?.WikipediaLogoUrl,
    },
    time: rawGame.DateTime || new Date().toISOString(),
    date: rawGame.DateTime
      ? convertUtcToLocalDate(rawGame.DateTime)
      : new Date().toISOString().split("T")[0],
    status: getStatus(rawGame.Status),
    quarter: rawGame.Inning
      ? `${rawGame.InningHalf === "B" ? "Bot" : "Top"} ${rawGame.Inning}`
      : undefined,
    // Location/Venue information
    stadium: stadium?.Name,
    city: stadium?.City,
    state: stadium?.State,
    country: stadium?.Country,
    capacity: stadium?.Capacity,
    surface: stadium?.Surface,
    weather: rawGame.Weather || rawGame.WeatherCondition,
    temperature: rawGame.Temperature || rawGame.TempF,
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
    odds: getGameOdds(gameId, oddsData),
  };

  return convertedGame;
};

// Convert schedule game to Game format
const convertScheduleGameToGame = (
  scheduleGame: MLBScheduleGame,
  mlbTeamProfiles?: any,
  mlbStadiums?: any,
  oddsData?: any,
): Game | null => {
  // Map API status to our status format
  const getStatus = (apiStatus?: string): GameStatus => {
    if (!apiStatus) return GameStatus.UPCOMING;
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

  // Check if this is a game that should be filtered out
  const gameStatus = getStatus(scheduleGame.Status);

  // Filter out cancelled games (NotNecessary, Cancelled, Postponed, etc.)
  if (gameStatus === GameStatus.CANCELLED) {
    return null; // This will be filtered out
  }

  // Also filter out games that are marked as "upcoming" but the game time is in the past
  if (scheduleGame.DateTime) {
    const gameTime = new Date(scheduleGame.DateTime);
    const now = new Date();
    const isPastGame = gameTime < now;

    if (isPastGame && gameStatus === GameStatus.UPCOMING) {
      return null; // This will be filtered out
    }
  }

  // Get team profiles for better names and logos
  const homeTeamProfile = getTeamProfile(scheduleGame.HomeTeam || "");
  const awayTeamProfile = getTeamProfile(scheduleGame.AwayTeam || "");
  const stadium = getStadium(scheduleGame.StadiumID);
  const gameId = scheduleGame.GameID?.toString() || "";

  const convertedDate = scheduleGame.DateTime
    ? convertUtcToLocalDate(scheduleGame.DateTime)
    : new Date().toISOString().split("T")[0];

  const convertedGame = {
    id: gameId,
    homeTeam: {
      name: homeTeamProfile
        ? `${homeTeamProfile.City} ${homeTeamProfile.Name}`
        : scheduleGame.HomeTeam || "",
      score: scheduleGame.HomeTeamRuns || 0,
      logo: homeTeamProfile?.WikipediaLogoUrl,
    },
    awayTeam: {
      name: awayTeamProfile
        ? `${awayTeamProfile.City} ${awayTeamProfile.Name}`
        : scheduleGame.AwayTeam || "",
      score: scheduleGame.AwayTeamRuns || 0,
      logo: awayTeamProfile?.WikipediaLogoUrl,
    },
    time: scheduleGame.DateTime || new Date().toISOString(),
    date: convertedDate,
    status: getStatus(scheduleGame.Status),
    quarter: scheduleGame.Inning
      ? `${scheduleGame.InningHalf === "B" ? "Bot" : "Top"} ${scheduleGame.Inning}`
      : undefined,
    // Location/Venue information
    stadium: stadium?.Name,
    city: stadium?.City,
    state: stadium?.State,
    country: stadium?.Country,
    capacity: stadium?.Capacity,
    surface: stadium?.Surface,
    weather: scheduleGame.ForecastDescription,
    temperature: scheduleGame.ForecastTempHigh,
    stadiumId: scheduleGame.StadiumID, // Store stadium ID for potential future lookup
    division: homeTeamProfile?.Division, // Store division for display
    // Postseason flag - determine based on the game date using config
    isPostseason: isPostseasonDate(League.MLB, convertedDate),
    // Odds information
    odds: getGameOdds(gameId, oddsData),
  };

  return convertedGame;
};

// Live Games Component
export function Live() {
  // Get selectedLeague from Redux
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );
  const navigate = useNavigate();

  // Fetch data hooks
  const {
    fetchMLBScores,
    fetchMLBTeamProfiles,
    fetchMLBStadiums,
    mlbScores,
    mlbTeamProfiles,
    mlbStadiums,
    mlbOddsByDate,
  } = useArb();

  // Fetch data on mount
  useEffect(() => {
    if (selectedLeague === League.MLB) {
      fetchMLBScores();
      fetchMLBTeamProfiles();
      fetchMLBStadiums();
    }
  }, [selectedLeague, fetchMLBScores, fetchMLBTeamProfiles, fetchMLBStadiums]);

  // Format time from DateTime (convert UTC to local time)
  const formatTime = (dateTime: string) => {
    try {
      // Parse the UTC datetime string and convert to local time
      const utcDate = new Date(dateTime);

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const dayName = days[utcDate.getDay()];
      const monthName = months[utcDate.getMonth()];
      const day = utcDate.getDate();

      // Add ordinal suffix to day
      const getOrdinalSuffix = (day: number) => {
        if (day >= 11 && day <= 13) return "th";
        switch (day % 10) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
          default:
            return "th";
        }
      };

      // Format time in user's local timezone
      const time = utcDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return `${dayName}. ${monthName} ${day}${getOrdinalSuffix(day)} at ${time}`;
    } catch {
      return "TBD";
    }
  };

  // Get all games - use the same logic as Scores component
  const allGames =
    selectedLeague === League.MLB && mlbScores
      ? mlbScores.data
          .map((game) =>
            convertMLBGameToGame(
              game,
              mlbTeamProfiles,
              mlbStadiums,
              mlbOddsByDate,
            ),
          )
          .filter((game): game is Game => game !== null)
      : [];

  // Filter only live games
  const liveGames = allGames.filter((game) => game.status === GameStatus.LIVE);

  // Sort live games by start time (most recent first)
  const sortedLiveGames = [...liveGames].sort((a, b) => {
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();
    return timeB - timeA; // Most recent first
  });

  // Get status badge
  const getStatusBadge = (status: GameStatus, quarter?: string) => {
    switch (status) {
      case GameStatus.LIVE:
        return (
          <Badge
            colorScheme="red"
            variant="solid"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
            display="flex"
            alignItems="center"
            gap="1"
          >
            <Wifi size={12} />
            {titleize("Live")}
          </Badge>
        );
      case GameStatus.FINAL:
        return (
          <Badge
            colorScheme="gray"
            variant="solid"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            {titleize("Final")}
          </Badge>
        );
      case GameStatus.UPCOMING:
        return (
          <Badge
            colorScheme="blue"
            variant="outline"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            {quarter ? titleize(quarter) : titleize("TBD")}
          </Badge>
        );
      default:
        return null;
    }
  };

  // Show loading state while fetching data
  if (selectedLeague === League.MLB && !mlbScores) {
    return (
      <Box
        minH="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Spinner size="lg" color="red.500" />
          <Text color="gray.600">Loading live games...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p="4">
      <VStack gap="4" align="stretch">
        {/* Header */}
        {/* <HStack gap="2" align="center">
          <Wifi size={20} color="red" />
          <Text fontSize="lg" fontWeight="bold" color="gray.500">
            Live Games
          </Text>
        </HStack> */}

        {/* Games List */}
        {sortedLiveGames.length === 0 ? (
          <VStack gap="4" align="center" py="8">
            <Wifi size={48} color="gray" />
            <VStack gap="2" align="center">
              <Text fontSize="lg" fontWeight="semibold" color="gray.600">
                No Live Games
              </Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                There are no live games at the moment.
              </Text>
            </VStack>
          </VStack>
        ) : (
          <VStack gap="3" align="stretch">
            {sortedLiveGames.map((game) => (
              <Card.Root
                key={game.id}
                cursor="pointer"
                transition="all 0.2s"
                onClick={() => {
                  navigate(`/scores/${selectedLeague}/${game.id}`);
                }}
              >
                <Card.Body p="4">
                  <VStack align="stretch" gap="3">
                    {/* Time and Status Header */}
                    <HStack justify="space-between" align="center">
                      <Text fontSize="xs" color="gray.500">
                        {formatTime(game.time)}
                      </Text>
                      <HStack gap="2" align="center">
                        {getStatusBadge(game.status, game.quarter)}
                        {game.quarter && (
                          <Text
                            fontSize="xs"
                            color="gray.600"
                            fontWeight="medium"
                          >
                            {game.quarter}
                          </Text>
                        )}
                      </HStack>
                    </HStack>

                    {/* Location Information */}
                    {(game.stadium || game.city) && (
                      <HStack
                        justify="space-between"
                        align="flex-start"
                        gap="3"
                      >
                        <VStack gap="1" align="stretch" flex="1">
                          {game.stadium && (
                            <Text
                              fontSize="xs"
                              fontWeight="medium"
                              color="gray.700"
                            >
                              {game.stadium}
                            </Text>
                          )}
                          <HStack
                            gap="2"
                            align="center"
                            fontSize="xs"
                            color="gray.600"
                          >
                            {game.city && (
                              <Text fontWeight="medium">{game.city}</Text>
                            )}
                            {game.state && (
                              <Text color="gray.500">{game.state}</Text>
                            )}
                            {game.capacity && (
                              <Text color="gray.500">
                                {game.capacity.toLocaleString()} seats
                              </Text>
                            )}
                            {game.surface && game.surface !== "Grass" && (
                              <Text color="text.400">{game.surface}</Text>
                            )}
                          </HStack>
                          {game.division && (
                            <Text fontSize="xs" color="gray.500">
                              {game.division} Division
                            </Text>
                          )}
                        </VStack>

                        {/* Bases Icon for MLB Live Games */}
                        {selectedLeague === League.MLB &&
                          game.status === GameStatus.LIVE && (
                            <Bases
                              runnerOnFirst={game.runnerOnFirst || false}
                              runnerOnSecond={game.runnerOnSecond || false}
                              runnerOnThird={game.runnerOnThird || false}
                              size="sm"
                            />
                          )}
                      </HStack>
                    )}

                    {/* Away Team */}
                    <HStack justify="space-between" align="center">
                      <HStack gap="3" align="center" flex="1">
                        <Box
                          w="8"
                          h="8"
                          bg="gray.300"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          overflow="hidden"
                          flexShrink="0"
                        >
                          {game.awayTeam.logo ? (
                            <Image
                              src={game.awayTeam.logo}
                              alt={game.awayTeam.name}
                              w="full"
                              h="full"
                              objectFit="cover"
                            />
                          ) : (
                            <Box
                              w="full"
                              h="full"
                              bg="gray.300"
                              borderRadius="full"
                            />
                          )}
                        </Box>
                        <Text
                          fontSize="sm"
                          color="gray.900"
                          fontWeight="medium"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {game.awayTeam.name}
                        </Text>
                      </HStack>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="gray.900"
                        minW="8"
                        textAlign="right"
                      >
                        {game.awayTeam.score}
                      </Text>
                    </HStack>

                    {/* Home Team */}
                    <HStack justify="space-between" align="center">
                      <HStack gap="3" align="center" flex="1">
                        <Box
                          w="8"
                          h="8"
                          bg="gray.300"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          overflow="hidden"
                          flexShrink="0"
                        >
                          {game.homeTeam.logo ? (
                            <Image
                              src={game.homeTeam.logo}
                              alt={game.homeTeam.name}
                              w="full"
                              h="full"
                              objectFit="cover"
                            />
                          ) : (
                            <Box
                              w="full"
                              h="full"
                              bg="gray.300"
                              borderRadius="full"
                            />
                          )}
                        </Box>
                        <Text
                          fontSize="sm"
                          color="gray.900"
                          fontWeight="medium"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {game.homeTeam.name}
                        </Text>
                      </HStack>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="gray.900"
                        minW="8"
                        textAlign="right"
                      >
                        {game.homeTeam.score}
                      </Text>
                    </HStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}

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
      fetchMLBScores();
      fetchMLBTeamProfiles();
      fetchMLBStadiums();
    }
  }, [selectedLeague, fetchMLBScores, fetchMLBTeamProfiles, fetchMLBStadiums]);

  // Initialize selected date to today only on first load (when selectedDate is empty)
  useEffect(() => {
    if (
      selectedLeague === League.MLB &&
      mlbScores?.data &&
      mlbScores.data.length > 0 &&
      !selectedDate
    ) {
      const todayString = getCurrentLocalDate();

      // Check if there are games today
      const gamesToday = mlbScores.data!.some((game) => {
        if (game?.DateTime) {
          const gameDateString = convertUtcToLocalDate(game.DateTime);
          return gameDateString === todayString;
        }
        return false;
      });

      if (gamesToday) {
        // If there are games today, set to today
        dispatch(setSelectedDate(todayString));
      } else {
        // If no games today, find the most recent game date
        const gameDates = mlbScores
          .data!.map((game) => {
            if (game?.DateTime) {
              return convertUtcToLocalDate(game.DateTime);
            }
            return null;
          })
          .filter(Boolean)
          .sort()
          .reverse(); // Most recent first

        if (gameDates.length > 0) {
          const mostRecentGameDate = gameDates[0];
          if (mostRecentGameDate) {
            dispatch(setSelectedDate(mostRecentGameDate));
          }
        }
      }
    }
  }, [selectedLeague, mlbScores, selectedDate, dispatch]);

  // Fetch schedule data only for postseason dates
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

  // Fetch odds data for the selected date
  useEffect(() => {
    if (selectedLeague === League.MLB && selectedDate) {
      fetchMLBOddsByDate(selectedDate);
    }
  }, [selectedLeague, selectedDate, fetchMLBOddsByDate]);

  // Fetch current-games data for the date picker range (7 days back + 7 days forward)
  useEffect(() => {
    if (selectedLeague === League.MLB) {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 7); // 7 days back

      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 7); // 7 days forward

      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      fetchCurrentGames(startDateStr, endDateStr);
    }
  }, [selectedLeague, fetchCurrentGames]);

  // Fetch box score data for runner information

  // Format time from DateTime (convert UTC to local time)
  const formatTime = (dateTime: string) => {
    try {
      // Parse the UTC datetime string and convert to local time
      const utcDate = new Date(dateTime);

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const dayName = days[utcDate.getDay()];
      const monthName = months[utcDate.getMonth()];
      const day = utcDate.getDate();

      // Add ordinal suffix to day
      const getOrdinalSuffix = (day: number) => {
        if (day >= 11 && day <= 13) return "th";
        switch (day % 10) {
          case 1:
            return "st";
          case 2:
            return "nd";
          case 3:
            return "rd";
          default:
            return "th";
        }
      };

      // Format time in user's local timezone
      const time = utcDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return `${dayName}. ${monthName} ${day}${getOrdinalSuffix(day)} at ${time}`;
    } catch {
      return "TBD";
    }
  };

  // Handle back from box score
  const handleBackFromBoxScore = () => {
    setSelectedGameId(null);
    setSelectedGameDate(null);
  };

  // Show box score detail if a game is selected
  if (selectedGameId && selectedGameDate) {
    return (
      <BoxScoreDetail
        gameId={selectedGameId}
        sport={selectedLeague}
        onBack={handleBackFromBoxScore}
      />
    );
  }

  // Get all games intelligently combining scores and current-games data
  const allGames = (() => {
    if (selectedLeague !== League.MLB) return [];

    const games: Game[] = [];
    const now = new Date();

    // Add games from scores data (past and current games with actual scores)
    if (mlbScores?.data) {
      const scoreGames = mlbScores.data
        .map((game) =>
          convertMLBGameToGame(
            game,
            mlbTeamProfiles,
            mlbStadiums,
            mlbOddsByDate,
          ),
        )
        .filter((game): game is Game => game !== null);
      games.push(...scoreGames);
    }

    // Add games from current-games data (future games and any missing past games)
    if (currentGames?.data) {
      const currentGamesList = currentGames.data
        .map((game) =>
          convertScheduleGameToGame(
            game,
            mlbTeamProfiles,
            mlbStadiums,
            mlbOddsByDate,
          ),
        )
        .filter((game): game is Game => game !== null);

      // Only add games that are in the future or not already covered by scores data
      const existingGameIds = new Set(games.map((g) => g.id));
      const futureGames = currentGamesList.filter((game) => {
        const gameTime = new Date(game.time);
        const isFuture = gameTime > now;
        const isNotAlreadyCovered = !existingGameIds.has(game.id);
        return isFuture || isNotAlreadyCovered;
      });

      games.push(...futureGames);
    }

    // Add games from schedule data (only for postseason dates)
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

      // Only add postseason games not already covered
      const existingGameIds = new Set(games.map((g) => g.id));
      const newPostseasonGames = scheduleGames.filter(
        (game) => !existingGameIds.has(game.id),
      );
      games.push(...newPostseasonGames);
    }

    // Deduplicate games by ID, keeping the most recent/complete version
    const gameMap = new Map<string, Game>();
    games.forEach((game) => {
      const existingGame = gameMap.get(game.id);
      if (!existingGame) {
        gameMap.set(game.id, game);
      } else {
        // If game already exists, prefer the one with more complete data
        // (e.g., from scores data over current-games data for live/completed games)
        if (
          game.status === GameStatus.LIVE ||
          game.status === GameStatus.FINAL
        ) {
          gameMap.set(game.id, game);
        }
      }
    });

    const deduplicatedGames = Array.from(gameMap.values());
    return deduplicatedGames;
  })();

  // Filter games by selected date
  const filteredGames = allGames.filter((game) => {
    // Use the pre-converted game.date field instead of converting game.time
    const matches = game.date === selectedDate;

    return matches;
  });

  // Sort games: LIVE games first, then by start time in ascending order
  const sortedGames = [...filteredGames].sort((a, b) => {
    // Live games first
    if (a.status === GameStatus.LIVE && b.status !== GameStatus.LIVE) return -1;
    if (b.status === GameStatus.LIVE && a.status !== GameStatus.LIVE) return 1;

    // Then sort by time (with error handling)
    const isValidA = isValidDate(a.time);
    const isValidB = isValidDate(b.time);

    // If either date is invalid, put it at the end
    if (!isValidA && !isValidB) return 0;
    if (!isValidA) return 1;
    if (!isValidB) return -1;

    try {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeA - timeB;
    } catch (error) {
      console.warn("Error sorting games by time:", error);
      return 0;
    }
  });
  const getStatusBadge = (status: GameStatus, quarter?: string) => {
    switch (status) {
      case GameStatus.LIVE:
        return (
          <Badge
            variant="solid"
            bg="danger.100"
            color="text.100"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            {quarter ? titleize(quarter) : titleize("Live")}
          </Badge>
        );
      case GameStatus.FINAL:
        return (
          <Badge
            variant="solid"
            bg="danger.100"
            color="text.100"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            {titleize("Final")}
          </Badge>
        );
      case GameStatus.UPCOMING:
        return (
          <Badge
            variant="solid"
            bg="danger.100"
            color="text.100"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            {titleize("Upcoming")}
          </Badge>
        );
      default:
        return null;
    }
  };

  // Show loading state for MLB only on initial load (not when changing dates)
  if (selectedLeague === League.MLB && mlbScoresLoading && !selectedDate) {
    return (
      <Box
        minH="100vh"
        bg="primary.25"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Spinner size="lg" color="red.500" />
          <Text color="gray.600">Loading MLB scores...</Text>
        </VStack>
      </Box>
    );
  }

  // Show skeleton cards when fetching date data
  if (
    selectedLeague === League.MLB &&
    isFetchingDateData &&
    !sortedGames.length
  ) {
    return (
      <Box minH="100vh" bg="primary.25" p="4">
        <VStack gap="3" align="stretch">
          {Array.from({ length: 3 }, (_, index) => (
            <GameCardSkeleton key={`skeleton-${index}`} />
          ))}
        </VStack>
      </Box>
    );
  }

  // Show error state for MLB
  if (selectedLeague === League.MLB && mlbError) {
    return (
      <Box
        minH="100vh"
        bg="primary.25"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Text color="red.500" fontSize="lg" fontWeight="semibold">
            Failed to load MLB scores
          </Text>
          <Text color="gray.600" textAlign="center">
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
              <Card.Root
                bg="primary.25"
                borderRadius="12px"
                shadow="sm"
                border="1px"
                borderColor="gray.200"
              >
                <Card.Body p="8" textAlign="center">
                  <VStack gap="4">
                    <Spinner size="lg" color="red.500" />
                    <Text color="gray.600">Loading games...</Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ) : (
              <Card.Root
                bg="primary.25"
                borderRadius="12px"
                shadow="sm"
                border="1px"
                borderColor="gray.200"
              >
                <Card.Body p="8" textAlign="center">
                  <VStack gap="4">
                    <Box
                      w="12"
                      h="12"
                      bg="gray.200"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="2xl" color="gray.400">
                        😭
                      </Text>
                    </Box>
                    <VStack gap="2">
                      <Text
                        fontSize="lg"
                        fontWeight="semibold"
                        color="gray.900"
                      >
                        No Games on {getDateDisplayName(selectedDate)}
                      </Text>
                      <Text fontSize="sm" color="gray.600" textAlign="center">
                        There are no games scheduled for this date. Try
                        selecting a different date.
                      </Text>
                    </VStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            )
          ) : (
            <VStack gap="3" align="stretch">
              {/* <HStack gap="2" align="center">
                <Calendar size={20} color="gray" />
                <Text fontSize="lg" fontWeight="bold" color="gray.500">
                  Games on {getDateDisplayName(selectedDate)}
                  </Text>
              </HStack> */}
              {isFetchingDateData
                ? // Show skeleton cards while loading
                  Array.from({ length: 3 }, (_, index) => (
                    <GameCardSkeleton key={`skeleton-${index}`} />
                  ))
                : sortedGames.map((game) => {
                    return (
                      <Card.Root
                        key={game.id}
                        bg="primary.25"
                        borderRadius="12px"
                        shadow="sm"
                        border="1px"
                        borderColor="gray.200"
                        _active={{ transform: "scale(0.98)" }}
                        transition="all 0.2s"
                        cursor="pointer"
                        onClick={() => handleGameClick(game.id, game.date)}
                      >
                        <Card.Body p="4">
                          <VStack align="stretch" gap="3">
                            {/* Time and Status Header */}
                            <HStack justify="space-between" align="center">
                              <Text fontSize="xs" color="gray.500">
                                {formatTime(game.time)}
                              </Text>
                              <HStack gap="2" align="center">
                                {getStatusBadge(game.status, game.quarter)}
                                {game.isPostseason && (
                                  <Badge
                                    variant="solid"
                                    bg="gold"
                                    color="text.400"
                                    fontSize="xs"
                                    px="2"
                                    py="1"
                                    borderRadius="full"
                                  >
                                    Postseason
                                  </Badge>
                                )}
                                {game.status === GameStatus.LIVE && (
                                  <Badge
                                    variant="solid"
                                    bg="danger.100"
                                    color="text.400"
                                    fontSize="xs"
                                    px="2"
                                    py="1"
                                    borderRadius="full"
                                    display="flex"
                                    alignItems="center"
                                    gap="1"
                                  >
                                    <Wifi size={12} />
                                    Live
                                  </Badge>
                                )}
                              </HStack>
                            </HStack>

                            {/* Location Information */}
                            {(game.stadium || game.city) && (
                              <HStack
                                justify="space-between"
                                align="center"
                                gap="3"
                              >
                                <HStack gap="2" align="center" flexWrap="wrap">
                                  {game.stadium && (
                                    <Badge
                                      variant="outline"
                                      colorScheme="gray"
                                      fontSize="xs"
                                      px="2"
                                      py="1"
                                      borderRadius="full"
                                    >
                                      {game.stadium}
                                    </Badge>
                                  )}
                                  {game.city && game.state && (
                                    <Badge
                                      variant="outline"
                                      colorScheme="blue"
                                      fontSize="xs"
                                      px="2"
                                      py="1"
                                      borderRadius="full"
                                    >
                                      {game.city}, {game.state}
                                    </Badge>
                                  )}
                                  {game.capacity && (
                                    <Badge
                                      variant="outline"
                                      colorScheme="green"
                                      fontSize="xs"
                                      px="2"
                                      py="1"
                                      borderRadius="full"
                                    >
                                      {game.capacity.toLocaleString()} seats
                                    </Badge>
                                  )}
                                  {game.surface && game.surface !== "Grass" && (
                                    <Badge
                                      variant="outline"
                                      color="text.400"
                                      fontSize="xs"
                                      px="2"
                                      py="1"
                                      borderRadius="full"
                                    >
                                      {game.surface}
                                    </Badge>
                                  )}
                                  {game.division && (
                                    <Badge
                                      variant="outline"
                                      colorScheme="orange"
                                      fontSize="xs"
                                      px="2"
                                      py="1"
                                      borderRadius="full"
                                    >
                                      {game.division} Division
                                    </Badge>
                                  )}
                                </HStack>

                                {/* Bases Icon for MLB Live Games */}
                                {selectedLeague === League.MLB &&
                                  game.status === GameStatus.LIVE && (
                                    <Bases
                                      runnerOnFirst={
                                        game.runnerOnFirst || false
                                      }
                                      runnerOnSecond={
                                        game.runnerOnSecond || false
                                      }
                                      runnerOnThird={
                                        game.runnerOnThird || false
                                      }
                                      size="sm"
                                    />
                                  )}
                              </HStack>
                            )}

                            {/* Away Team */}
                            <HStack
                              justify="space-between"
                              align="center"
                              gap="2"
                            >
                              <HStack gap="3" align="center" flex="1" minW="0">
                                <Box
                                  w="8"
                                  h="8"
                                  bg="gray.300"
                                  borderRadius="full"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  overflow="hidden"
                                  flexShrink="0"
                                >
                                  {game.awayTeam.logo ? (
                                    <Image
                                      src={game.awayTeam.logo}
                                      alt={game.awayTeam.name}
                                      w="full"
                                      h="full"
                                      objectFit="cover"
                                    />
                                  ) : (
                                    <Box
                                      w="full"
                                      h="full"
                                      bg="gray.300"
                                      borderRadius="full"
                                    />
                                  )}
                                </Box>
                                <Text
                                  fontSize="sm"
                                  color="gray.900"
                                  fontWeight="medium"
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                  whiteSpace="nowrap"
                                  flex="1"
                                  minW="0"
                                >
                                  {game.awayTeam.name}
                                </Text>
                              </HStack>
                              <HStack gap="2" align="center" flexShrink="0">
                                <Text
                                  fontSize="lg"
                                  fontWeight="bold"
                                  color="gray.900"
                                  minW="8"
                                  textAlign="right"
                                >
                                  {game.awayTeam.score}
                                </Text>
                                {(game.odds ||
                                  oddsLoading ||
                                  (mlbOddsByDate?.data &&
                                    mlbOddsByDate.data.some(
                                      (odds: any) =>
                                        odds.GameId?.toString() === game.id,
                                    ))) && (
                                  <Box
                                    p="2"
                                    bg="primary.25"
                                    borderRadius="6px"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    w="24"
                                    flexShrink="0"
                                  >
                                    <TeamOddsDisplay
                                      odds={game.odds}
                                      isAway={true}
                                      isLoading={oddsLoading && !game.odds}
                                    />
                                  </Box>
                                )}
                              </HStack>
                            </HStack>

                            {/* Home Team */}
                            <HStack
                              justify="space-between"
                              align="center"
                              gap="2"
                            >
                              <HStack gap="3" align="center" flex="1" minW="0">
                                <Box
                                  w="8"
                                  h="8"
                                  bg="gray.300"
                                  borderRadius="full"
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                  overflow="hidden"
                                  flexShrink="0"
                                >
                                  {game.homeTeam.logo ? (
                                    <Image
                                      src={game.homeTeam.logo}
                                      alt={game.homeTeam.name}
                                      w="full"
                                      h="full"
                                      objectFit="cover"
                                    />
                                  ) : (
                                    <Box
                                      w="full"
                                      h="full"
                                      bg="gray.300"
                                      borderRadius="full"
                                    />
                                  )}
                                </Box>
                                <Text
                                  fontSize="sm"
                                  color="gray.900"
                                  fontWeight="medium"
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                  whiteSpace="nowrap"
                                  flex="1"
                                  minW="0"
                                >
                                  {game.homeTeam.name}
                                </Text>
                              </HStack>
                              <HStack gap="2" align="center" flexShrink="0">
                                <Text
                                  fontSize="lg"
                                  fontWeight="bold"
                                  color="gray.900"
                                  minW="8"
                                  textAlign="right"
                                >
                                  {game.homeTeam.score}
                                </Text>
                                {(game.odds ||
                                  oddsLoading ||
                                  (mlbOddsByDate?.data &&
                                    mlbOddsByDate.data.some(
                                      (odds: any) =>
                                        odds.GameId?.toString() === game.id,
                                    ))) && (
                                  <Box
                                    p="2"
                                    bg="primary.25"
                                    borderRadius="6px"
                                    border="1px solid"
                                    borderColor="gray.200"
                                    w="24"
                                    flexShrink="0"
                                  >
                                    <TeamOddsDisplay
                                      odds={game.odds}
                                      isAway={false}
                                      isLoading={oddsLoading && !game.odds}
                                    />
                                  </Box>
                                )}
                              </HStack>
                            </HStack>

                            {/* Game-level odds (Total and Sportsbook) */}
                            {(game.odds ||
                              oddsLoading ||
                              (mlbOddsByDate?.data &&
                                mlbOddsByDate.data.some(
                                  (odds: any) =>
                                    odds.GameId?.toString() === game.id,
                                ))) && (
                              <Box
                                mt="2"
                                pt="2"
                                borderTop="1px solid"
                                borderColor="gray.200"
                              >
                                <GameOddsDisplay
                                  odds={game.odds}
                                  isLoading={oddsLoading && !game.odds}
                                />
                              </Box>
                            )}
                          </VStack>
                        </Card.Body>
                      </Card.Root>
                    );
                  })}
            </VStack>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}
