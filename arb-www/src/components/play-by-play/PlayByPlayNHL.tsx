// React imports
import { useEffect, useState, useRef, useCallback } from "react";

// Third-party library imports
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  HStack,
  IconButton,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ArrowLeft, RefreshCw } from "lucide-react";

// Internal imports - components
import { Skeleton, SkeletonCircle } from "../Skeleton.tsx";
import { QuarterBadge } from "../badge";

// Internal imports - config
import {
  buildApiUrl,
  League,
  PLAY_BY_PLAY_CONFIG,
  mapApiStatusToGameStatus,
  getStatusDisplayText,
} from "../../config.ts";

// Internal imports - schema
import { Play } from "../../schema/nhl/playbyplay.ts";

// Internal imports - services
import useArb from "../../services/Arb.ts";

// Internal imports - store
import { useAppSelector, useAppDispatch } from "../../store/hooks.ts";
import { fetchBoxScore } from "../../store/slices/sportsDataSlice.ts";

// Internal imports - utils
import {
  formatRelativeESTTime,
  getPlayLabel,
  getPlayTitle,
  orEmpty,
} from "../../utils.ts";

// Interface for the actual API response structure
interface ActualPlayByPlayResponse {
  league: string;
  game_id: string;
  data: Play[];
}

interface PlayByPlayNHLProps {
  gameId?: string;
  onBack: () => void;
}

// Refs to prevent duplicate fetches
const hasFetchedRef = { current: false };

const GameStatusSkeleton = () => {
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
          <HStack justify="space-between" align="center">
            <Skeleton w="20%" h="3" />
            <Skeleton w="12" h="5" borderRadius="full" />
          </HStack>
          <HStack gap="2" flexWrap="wrap">
            <Skeleton w="24" h="5" borderRadius="full" />
            <Skeleton w="20" h="5" borderRadius="full" />
          </HStack>
          <HStack justify="space-between" align="center">
            <HStack gap="3" align="center">
              <SkeletonCircle size="8" />
              <VStack align="start" gap="1">
                <Skeleton w="24" h="3" />
                <Skeleton w="16" h="2" />
              </VStack>
            </HStack>
            <Skeleton w="6" h="5" />
          </HStack>
          <HStack justify="space-between" align="center">
            <HStack gap="3" align="center">
              <SkeletonCircle size="8" />
              <VStack align="start" gap="1">
                <Skeleton w="24" h="3" />
                <Skeleton w="16" h="2" />
              </VStack>
            </HStack>
            <Skeleton w="6" h="5" />
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

export function PlayByPlayNHL({ gameId, onBack }: PlayByPlayNHLProps) {
  // Get gameId from URL params if not provided as prop
  const urlParams = new URLSearchParams(window.location.search);
  const gameIdFromUrl = urlParams.get("gameId");
  const actualGameId = gameId || gameIdFromUrl;

  // Get league from URL path (e.g., /scores/nhl/76782 -> nhl)
  const pathParts = window.location.pathname.split("/");
  const leagueFromUrl = pathParts[2]; // /scores/nhl/76782 -> nhl

  // Get box-score data from Redux state
  const dispatch = useAppDispatch();
  const boxScoreData = useAppSelector((state) => state.sportsData.boxScoreData);
  const boxScoreRequests = useAppSelector(
    (state) => state.sportsData.boxScoreRequests,
  );
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );

  // Use league from URL if available, otherwise fall back to Redux state
  const currentLeague = leagueFromUrl || selectedLeague;

  // Get all data from Redux state
  const { nhlTeamProfiles, fetchNHLTeamProfiles } = useArb();

  // Get current game data from box-score
  const currentGame = actualGameId
    ? boxScoreData[actualGameId as keyof typeof boxScoreData]?.data?.Game
    : null;

  // Use currentGame as the game data
  const gameData = currentGame;

  // State for play-by-play data
  const [playByPlayData, setPlayByPlayData] =
    useState<ActualPlayByPlayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset fetch ref when game ID changes
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [actualGameId]);

  // Single useEffect to handle all data fetching
  useEffect(() => {
    if (!actualGameId || hasFetchedRef.current) return;

    hasFetchedRef.current = true;

    // Always fetch team profiles - service layer will handle duplicate prevention
    if (currentLeague === League.NHL) {
      fetchNHLTeamProfiles();
    }

    // Fetch box score if it doesn't exist and not currently being requested
    if (!currentGame && !boxScoreRequests.includes(actualGameId)) {
      dispatch(fetchBoxScore({ league: currentLeague, gameId: actualGameId }));
    }

    // Fetch play-by-play data
    fetchPlayByPlay();
  }, [actualGameId]); // Only depend on actualGameId to prevent multiple triggers

  // Create team ID to logo mapping from the fetched data
  const teamIdToLogo =
    nhlTeamProfiles?.data?.reduce(
      (acc, team) => {
        acc[team.TeamID] = team.WikipediaLogoUrl;
        return acc;
      },
      {} as Record<number, string>,
    ) || {};

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    return formatRelativeESTTime(timestamp);
  };

  // Fetch play-by-play data
  const fetchPlayByPlay = useCallback(async () => {
    try {
      setLoading(true);
      const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
      const params: Record<string, string> = {
        league: League.NHL,
        game_id: actualGameId,
        interval: "1min",
        t: now.toString(), // Send as string to our backend, but it will be converted to int
      };

      const url = buildApiUrl("/api/v1/play-by-play", params);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch play-by-play data: ${response.statusText}`,
        );
      }

      const data: ActualPlayByPlayResponse = await response.json();

      // Limit to latest events
      const limitedData = {
        ...data,
        data: data.data.slice(0, PLAY_BY_PLAY_CONFIG.maxEventsInMemory),
      };
      setPlayByPlayData(limitedData);

      setError(null);
    } catch (err) {
      console.error("Error fetching play-by-play data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch play-by-play data",
      );
    } finally {
      setLoading(false);
    }
  }, [actualGameId]);

  // Manual refresh
  const handleRefresh = () => {
    fetchPlayByPlay();
  };

  if (error) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Text color="red.500" fontSize="lg" fontWeight="semibold">
            Error loading play-by-play
          </Text>
          <Text color="text.400" textAlign="center">
            {error}
          </Text>
          <Button onClick={handleRefresh} colorScheme="red">
            Try Again
          </Button>
        </VStack>
      </Box>
    );
  }

  // Only show "No pbp data" message if we're not loading and have no data
  if (!loading && !playByPlayData?.data?.length) {
    return (
      <Box minH="100vh" bg="primary.25">
        {/* Header */}
        <Box
          bg="primary.25"
          borderBottom="1px"
          borderColor="border.100"
          position="sticky"
          top="0"
          zIndex="40"
        >
          <HStack gap="3" px="4" py="3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <Box w="4" h="4">
                <ArrowLeft size={16} />
              </Box>
            </Button>
            <Box flex="1">
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
                Play-by-Play
              </Text>
            </Box>
            <Box w="8" />
          </HStack>
        </Box>

        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <VStack gap="4">
            <Text color="text.400" fontSize="lg" fontWeight="semibold">
              No Play-by-Play Data
            </Text>
            <Text color="text.400" textAlign="center">
              Play-by-play data is not available for this game.
            </Text>
            <Button onClick={onBack}>Go Back</Button>
          </VStack>
        </Box>
      </Box>
    );
  }

  if (loading || !playByPlayData) {
    return (
      <Box minH="100vh" bg="primary.25">
        {/* Header */}
        <Box
          bg="primary.25"
          borderBottom="1px"
          borderColor="border.100"
          position="sticky"
          top="0"
          zIndex="40"
        >
          <HStack gap="3" px="4" py="3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <Box w="4" h="4">
                <ArrowLeft size={16} />
              </Box>
            </Button>
            <Box flex="1">
              <Text fontSize="lg" fontWeight="bold" textAlign="center">
                Play-by-Play
              </Text>
            </Box>
            <Box w="8" />
          </HStack>
        </Box>

        <VStack gap="4" p="4" pb="20">
          <GameStatusSkeleton />
          <GameStatusSkeleton />
          <GameStatusSkeleton />
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="primary.25">
      {/* Header */}
      <Box
        bg="primary.25"
        borderBottom="1px"
        borderColor="border.100"
        position="sticky"
        top="0"
        zIndex="40"
      >
        <HStack gap="3" px="4" py="3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <Box w="4" h="4">
              <ArrowLeft size={16} />
            </Box>
          </Button>
          <Box flex="1">
            <Text fontSize="lg" fontWeight="bold" textAlign="center">
              Play-by-Play
            </Text>
          </Box>
          <IconButton
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            isLoading={loading}
            aria-label="Refresh"
          >
            <Box w="4" h="4">
              <RefreshCw size={16} />
            </Box>
          </IconButton>
        </HStack>
      </Box>

      <VStack gap="4" p="4" pb="20">
        {/* Game Status Card */}
        {gameData && (
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
                  <Text fontSize="sm" fontWeight="medium" color="text.400">
                    {getStatusDisplayText(gameData.Status || "")}
                  </Text>
                  <HStack gap="2">
                    <QuarterBadge
                      quarterNumber={gameData.Period || 1}
                      league={League.NHL}
                      size="sm"
                    />
                    <Badge variant="outline" fontSize="xs">
                      {gameData.TimeRemainingMinutes || "20:00"}
                    </Badge>
                  </HStack>
                </HStack>

                {/* Location */}
                <HStack gap="2" flexWrap="wrap">
                  <Badge variant="outline" fontSize="xs">
                    {gameData.Arena || "TBD"}
                  </Badge>
                  <Badge variant="outline" fontSize="xs">
                    {gameData.City || "TBD"}
                  </Badge>
                </HStack>

                {/* Away Team */}
                <HStack justify="space-between" align="center">
                  <HStack gap="3" align="center">
                    <Image
                      src={teamIdToLogo[gameData.AwayTeamID] || ""}
                      alt={gameData.AwayTeam}
                      w="8"
                      h="8"
                      fallback={<SkeletonCircle size="8" />}
                    />
                    <VStack align="start" gap="1">
                      <Text fontSize="sm" fontWeight="medium">
                        {gameData.AwayTeam}
                      </Text>
                      <Text fontSize="xs" color="text.400">
                        Away
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack gap="2" align="center">
                    <Text fontFamily="mono" fontSize="lg" fontWeight="medium">
                      {gameData.AwayTeamScore || 0}
                    </Text>
                  </HStack>
                </HStack>

                {/* Home Team */}
                <HStack justify="space-between" align="center">
                  <HStack gap="3" align="center">
                    <Image
                      src={teamIdToLogo[gameData.HomeTeamID] || ""}
                      alt={gameData.HomeTeam}
                      w="8"
                      h="8"
                      fallback={<SkeletonCircle size="8" />}
                    />
                    <VStack align="start" gap="1">
                      <Text fontSize="sm" fontWeight="medium">
                        {gameData.HomeTeam}
                      </Text>
                      <Text fontSize="xs" color="text.400">
                        Home
                      </Text>
                    </VStack>
                  </HStack>
                  <HStack gap="2" align="center">
                    <Text fontFamily="mono" fontSize="lg" fontWeight="medium">
                      {gameData.HomeTeamScore || 0}
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        )}

        {/* Play-by-Play Events */}
        <VStack gap="3" align="stretch">
          <Text fontSize="sm" fontWeight="medium" color="text.400">
            Recent Plays
          </Text>
          {playByPlayData.data.map((play, index) => (
            <Card.Root
              key={`${play.PlayID}-${index}`}
              variant="outline"
              size="sm"
              transition="all 0.2s"
              bg={index === 0 ? "accent.100" : "primary.25"}
              borderRadius="12px"
              shadow="sm"
              border="1px"
              borderColor="text.400"
              borderLeft="4px"
              borderLeftColor="primary.500"
            >
              <Card.Body p="4">
                <VStack gap="2" align="stretch">
                  <HStack justify="space-between" align="center">
                    <HStack gap="2">
                      <QuarterBadge
                        quarterNumber={play.Period || 1}
                        league={League.NHL}
                        size="sm"
                      />
                      <Badge variant="outline" fontSize="xs">
                        {play.TimeRemainingMinutes || "20:00"}
                      </Badge>
                      {index === 0 && (
                        <Badge bg="green.500" color="white" fontSize="xs">
                          Latest
                        </Badge>
                      )}
                    </HStack>
                    <Text fontSize="xs" color="text.400">
                      {formatTimestamp(play.Updated || play.Created)}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="medium" color="text.400">
                    {play.Team}
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {getPlayTitle(play.Description)}
                  </Text>
                  <Text fontSize="xs" color="text.400">
                    {play.Description}
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}
