// React imports
import { useEffect, useState, useRef } from "react";

// Third-party library imports
import {
  Badge,
  Box,
  Button,
  Card,
  HStack,
  IconButton,
  Image,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  AlertTriangle,
  ArrowLeft,
  Circle,
  RefreshCw,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

// Internal imports - components
import { Skeleton, SkeletonCircle } from "./Skeleton";

// Internal imports - config
import { buildApiUrl, League } from "../config";

// Internal imports - schema
import { Play } from "../schema/mlb/playbyplay";

// Internal imports - services
import useArb from "../services/Arb";

// Internal imports - store
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { fetchBoxScore } from "../store/slices/sportsDataSlice";

// Internal imports - utils
import { formatRelativeTime, getPlayIcon, getPlayLabel } from "../utils";

// Interface for the actual API response structure
interface ActualPlayByPlayResponse {
  league: string;
  game_id: string;
  data: Play[];
}

interface PlayByPlayMLBProps {
  gameId?: string;
  onBack: () => void;
}

// Maximum number of play-by-play events to keep in memory
const MAX_EVENTS = 50;

export function PlayByPlayMLB({ gameId, onBack }: PlayByPlayMLBProps) {
  // Get gameId from URL params if not provided as prop
  const urlParams = new URLSearchParams(window.location.search);
  const gameIdFromUrl = urlParams.get("gameId");
  const actualGameId = gameId || gameIdFromUrl;

  // Get league from URL path (e.g., /scores/mlb/76782 -> mlb)
  const pathParts = window.location.pathname.split("/");
  const leagueFromUrl = pathParts[2]; // /scores/mlb/76782 -> mlb

  // Get box-score data from Redux state
  const dispatch = useAppDispatch();
  const boxScoreData = useAppSelector((state) => state.sportsData.boxScoreData);
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );

  // Use league from URL if available, otherwise fall back to Redux state
  const currentLeague = leagueFromUrl || selectedLeague;

  // Get all data from Redux state
  const { mlbTeamProfiles, fetchMLBTeamProfiles } = useArb();

  // Get current game data from box-score
  const currentGame = actualGameId
    ? boxScoreData[actualGameId as keyof typeof boxScoreData]
    : null;

  // Reset fetch ref when game ID changes
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [actualGameId]);

  // Single useEffect to handle all data fetching
  useEffect(() => {
    if (!actualGameId || hasFetchedRef.current) return;

    hasFetchedRef.current = true;

    // Always fetch team profiles if needed (they might be lost on refresh)
    if (
      currentLeague === League.MLB &&
      (!mlbTeamProfiles || mlbTeamProfiles.data.length === 0)
    ) {
      fetchMLBTeamProfiles();
    }

    // Fetch box score if it doesn't exist
    if (!currentGame) {
      dispatch(fetchBoxScore({ league: currentLeague, gameId: actualGameId }));
    }

    // Fetch play-by-play data
    fetchPlayByPlay();
  }, [actualGameId]); // Only depend on actualGameId to prevent multiple triggers

  // Ensure team profiles are always available (for refresh scenarios)
  useEffect(() => {
    if (
      currentLeague === League.MLB &&
      (!mlbTeamProfiles || mlbTeamProfiles.data.length === 0)
    ) {
      fetchMLBTeamProfiles();
    }
  }, [currentLeague, mlbTeamProfiles, fetchMLBTeamProfiles]);

  // Create team ID to logo mapping from the fetched data
  const teamIdToLogo =
    mlbTeamProfiles?.data?.reduce(
      (acc: Record<number, string>, team) => {
        acc[team.TeamID] = team.WikipediaLogoUrl;
        return acc;
      },
      {} as Record<number, string>,
    ) || {};

  // Create team ID to team info mapping from the fetched data
  const teamIdToInfo =
    mlbTeamProfiles?.data?.reduce(
      (
        acc: Record<
          number,
          { name: string; city: string; abbreviation: string }
        >,
        team,
      ) => {
        acc[team.TeamID] = {
          name: team.Name,
          city: team.City,
          abbreviation: team.Key,
        };
        return acc;
      },
      {} as Record<
        number,
        { name: string; city: string; abbreviation: string }
      >,
    ) || {};

  // Debug logging

  if (!actualGameId) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Text color="red.500" fontSize="lg" fontWeight="semibold">
            No Game Selected
          </Text>
          <Text color="gray.600" textAlign="center">
            Please select a game to view play-by-play data.
          </Text>
          <Button onClick={onBack}>Go Back</Button>
        </VStack>
      </Box>
    );
  }
  const [playByPlayData, setPlayByPlayData] =
    useState<ActualPlayByPlayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  // Format event description using the utility function
  const formatEventDescription = (play: Play): string => {
    return getPlayLabel(play);
  };

  // Get the appropriate icon component for a play
  const getPlayIconComponent = (play: Play) => {
    const iconType = getPlayIcon(play);
    const iconProps = { size: 16, color: "#6B7280" }; // Grey color

    switch (iconType) {
      case "strikeout":
        return <Zap {...iconProps} />;
      case "walk":
        return <TrendingUp {...iconProps} />;
      case "hit":
        return <Target {...iconProps} />;
      case "out":
        return <X {...iconProps} />;
      case "sacrifice":
        return <Circle {...iconProps} />;
      case "error":
        return <AlertTriangle {...iconProps} />;
      default:
        return <Circle {...iconProps} />;
    }
  };

  // Format inning display (Top 9, Bot 9, etc.)
  const formatInning = (inningNumber: number, inningHalf: string): string => {
    const half = inningHalf === "T" ? "Top" : "Bot";
    return `${half} ${inningNumber}`;
  };

  // Format timestamp for display as relative time using centralized utility
  const formatTimestamp = (timestamp: string): string => {
    // Debug logging to see what's happening

    return formatRelativeTime(timestamp);
  };

  // Fetch play-by-play data
  const fetchPlayByPlay = async () => {
    try {
      setLoading(true);
      const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
      const params: Record<string, string> = {
        league: League.MLB,
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

      // Debug logging

      // Limit to latest events
      const limitedData = {
        ...data,
        data: data.data.slice(0, MAX_EVENTS),
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
  };

  // Manual refresh
  const handleRefresh = () => {
    fetchPlayByPlay();
  };

  // Get game data for team name lookups
  const gameData = currentGame?.data?.Game;

  if (loading && !playByPlayData) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Spinner size="lg" color="red.500" />
          <Text color="gray.600">Loading play-by-play...</Text>
        </VStack>
      </Box>
    );
  }

  // Don't render until we have the current game data
  if (!currentGame || !gameData) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Spinner size="lg" color="red.500" />
          <Text color="gray.600">Loading game data...</Text>
        </VStack>
      </Box>
    );
  }

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
          <Text color="gray.600" textAlign="center">
            {error}
          </Text>
          <Button onClick={handleRefresh} colorScheme="red">
            Try Again
          </Button>
        </VStack>
      </Box>
    );
  }

  if (
    !playByPlayData ||
    !playByPlayData.data ||
    playByPlayData.data.length === 0
  ) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Text color="gray.600" fontSize="lg" fontWeight="semibold">
            No play-by-play data available for this game.
          </Text>
          <Text color="gray.600">The game data is missing or incomplete.</Text>
          <Button onClick={onBack}>Go Back</Button>
        </VStack>
      </Box>
    );
  }

  // Extract plays from the actual API response structure and sort by time DESC (newest first)
  const plays = [...playByPlayData.data].sort(
    (a, b) => new Date(b.Updated).getTime() - new Date(a.Updated).getTime(),
  );

  // Get team names using team IDs from box score data
  const awayTeamId = gameData?.AwayTeamID;
  const homeTeamId = gameData?.HomeTeamID;

  // Use team profile data if available, otherwise fall back to box score team names
  const awayTeam =
    awayTeamId && teamIdToInfo[awayTeamId]
      ? `${teamIdToInfo[awayTeamId].city} ${teamIdToInfo[awayTeamId].name}`
      : gameData?.AwayTeam || "Away Team";

  const homeTeam =
    homeTeamId && teamIdToInfo[homeTeamId]
      ? `${teamIdToInfo[homeTeamId].city} ${teamIdToInfo[homeTeamId].name}`
      : gameData?.HomeTeam || "Home Team";

  // Function to get team logo for a play
  const getTeamLogoForPlay = (play: Play): string | null => {
    // For most plays, the hitter is the acting player, so use HitterTeamID
    // For some defensive plays, we might want to use PitcherTeamID
    // For now, let's use HitterTeamID as the primary acting player
    const actingTeamId = play.HitterTeamID;
    const logo = teamIdToLogo[actingTeamId] || null;
    return logo;
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="primary.25" borderBottom="1px" borderColor="border.100" p="4">
        <HStack justify="space-between" align="center">
          <HStack gap="3">
            <IconButton
              aria-label="Go back"
              variant="ghost"
              onClick={onBack}
              colorScheme="gray"
              size="md"
            >
              <ArrowLeft size={20} />
            </IconButton>
            <VStack align="start" gap="0">
              <Text fontSize="lg" fontWeight="bold">
                {awayTeam} @ {homeTeam}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Play-by-Play
              </Text>
              {currentGame && (
                <HStack gap="2" mt="1">
                  <Text fontSize="sm" fontWeight="medium">
                    {currentGame.AwayTeamRuns || 0} -{" "}
                    {currentGame.HomeTeamRuns || 0}
                  </Text>
                  {currentGame.Inning && currentGame.InningHalf && (
                    <Text fontSize="xs" color="gray.500">
                      {currentGame.InningHalf === "T" ? "Top" : "Bot"}{" "}
                      {currentGame.Inning}
                    </Text>
                  )}
                </HStack>
              )}
            </VStack>
          </HStack>

          <HStack gap="2">
            <Badge colorScheme="red" variant="solid">
              Live
            </Badge>
            <IconButton
              aria-label="Refresh"
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              loading={loading}
            >
              <RefreshCw size={16} />
            </IconButton>
          </HStack>
        </HStack>
      </Box>

      {/* Game Status */}
      <Box bg="primary.25" p="4" borderBottom="1px" borderColor="border.100">
        <HStack justify="space-between" align="center">
          <VStack align="start" gap="1">
            <Text fontSize="sm" fontWeight="medium">
              {currentGame?.Status || "Live Game"}
            </Text>
            <Text fontSize="xs" color="gray.600">
              Play-by-Play Events
            </Text>
            {currentGame && (
              <VStack align="start" gap="2" mt="1">
                <HStack gap="4">
                  <Text fontSize="xs" color="gray.500">
                    Hits: {currentGame.AwayTeamHits || 0} -{" "}
                    {currentGame.HomeTeamHits || 0}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    Errors: {currentGame.AwayTeamErrors || 0} -{" "}
                    {currentGame.HomeTeamErrors || 0}
                  </Text>
                </HStack>
                {(currentGame.CurrentPitcher || currentGame.CurrentHitter) && (
                  <HStack gap="4">
                    {currentGame.CurrentPitcher && (
                      <Text fontSize="xs" color="gray.600">
                        Pitcher: {currentGame.CurrentPitcher}
                      </Text>
                    )}
                    {currentGame.CurrentHitter && (
                      <Text fontSize="xs" color="gray.600">
                        Batter: {currentGame.CurrentHitter}
                      </Text>
                    )}
                  </HStack>
                )}
              </VStack>
            )}
          </VStack>

          <VStack align="end" gap="1">
            <Text fontSize="xs" color="gray.600">
              {plays.length} events
            </Text>
            <Text fontSize="xs" color="gray.600">
              Live
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Play-by-Play Events */}
      <Box p="4">
        <VStack gap="2" align="stretch">
          {loading ? (
            // Show skeleton events while loading
            Array.from({ length: 5 }, (_, index) => (
              <Card.Root key={`skeleton-${index}`} bg="primary.200" shadow="sm">
                <Card.Body p="3">
                  <HStack justify="space-between" align="start" gap="3">
                    {/* Team logo and play icon skeleton */}
                    <HStack gap="2" align="center">
                      <SkeletonCircle size="6" />
                      <Skeleton w="4" h="4" />
                    </HStack>

                    {/* Play description skeleton */}
                    <VStack align="start" gap="1" flex="1" minW="0">
                      <Skeleton w="80%" h="4" />
                      <Skeleton w="60%" h="3" />
                    </VStack>

                    {/* Time and score skeleton */}
                    <VStack align="end" gap="1" minW="0">
                      <Skeleton w="12" h="3" />
                      <Skeleton w="8" h="3" />
                    </VStack>
                  </HStack>
                </Card.Body>
              </Card.Root>
            ))
          ) : plays.length === 0 ? (
            <Card.Root>
              <Card.Body p="6">
                <VStack gap="2">
                  <Text color="gray.600">No events yet</Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Play-by-play events will appear here as they happen
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          ) : (
            // Display latest 50 events (most recent first)
            plays.map((play) => {
              const teamLogo = getTeamLogoForPlay(play);
              return (
                <Card.Root key={play.PlayID} bg="primary.200" shadow="sm">
                  <Card.Body p="3">
                    <HStack justify="space-between" align="start" gap="3">
                      {/* Team logo and play icon */}
                      <HStack gap="2" align="center">
                        {/* Team logo */}
                        {teamLogo && (
                          <Image
                            src={teamLogo}
                            alt="Team logo"
                            boxSize="24px"
                            objectFit="contain"
                          />
                        )}
                        {/* Play icon */}
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          minW="20px"
                        >
                          {getPlayIconComponent(play)}
                        </Box>
                      </HStack>

                      {/* Main content */}
                      <VStack align="start" gap="1" flex="1">
                        <Text fontSize="sm" fontWeight="medium">
                          {formatEventDescription(play)}
                        </Text>
                      </VStack>

                      {/* Right side info */}
                      <VStack align="end" gap="1">
                        <Text fontSize="xs" color="gray.500">
                          {formatTimestamp(play.Updated)}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {formatInning(play.InningNumber, play.InningHalf)}
                        </Text>
                        {currentGame && (
                          <Text
                            fontSize="xs"
                            color="gray.600"
                            fontWeight="medium"
                          >
                            {currentGame.AwayTeam}{" "}
                            {currentGame.AwayTeamRuns || 0} -{" "}
                            {currentGame.HomeTeamRuns || 0}{" "}
                            {currentGame.HomeTeam}
                          </Text>
                        )}
                        {play.Balls !== undefined &&
                          play.Strikes !== undefined && (
                            <Text fontSize="xs" color="gray.400">
                              {play.Balls}-{play.Strikes}
                            </Text>
                          )}
                      </VStack>
                    </HStack>
                  </Card.Body>
                </Card.Root>
              );
            })
          )}
        </VStack>
      </Box>
    </Box>
  );
}
