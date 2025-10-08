import { useEffect, useState, useRef, useCallback } from "react";
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
import { BackButton } from "../BackButton";

import { Skeleton, SkeletonCircle } from "../Skeleton.tsx";
import { Bases } from "../Bases.tsx";
import { InningBadge, LiveBadge } from "../badge";
import { RefreshButton } from "../RefreshButton";

import {
  buildApiUrl,
  League,
  PLAY_BY_PLAY_CONFIG,
  mapApiStatusToGameStatus,
  getStatusDisplayText,
} from "../../config.ts";

import { Play } from "../../schema/mlb/playbyplay.ts";

import useArb from "../../services/Arb.ts";

import { useAppSelector, useAppDispatch } from "../../store/hooks.ts";
import { fetchBoxScore } from "../../store/slices/sportsDataSlice.ts";

import {
  formatRelativeESTTime,
  getPlayLabel,
  getPlayTitle,
  orEmpty,
  formatInningWithIcon,
} from "../../utils.ts";

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

// PBP Card Skeleton Component
const PBPCardSkeleton = () => {
  return (
    <Card.Root bg="primary.100" shadow="sm">
      <Card.Body p="3">
        <HStack justify="space-between" align="start" gap="3">
          {/* Team logo skeleton */}
          <HStack gap="2" align="center">
            <SkeletonCircle size="6" />
          </HStack>

          {/* Main content skeleton */}
          <VStack align="start" gap="1" flex="1">
            <Skeleton w="60%" h="4" />
            <Skeleton w="90%" h="3" />
          </VStack>

          {/* Right side info skeleton */}
          <VStack align="end" gap="1">
            <Skeleton w="12" h="3" />
            <Skeleton w="16" h="3" />
            <Skeleton w="20" h="3" />
            <Skeleton w="8" h="3" />
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};

// Header Skeleton Component
const HeaderSkeleton = () => {
  return (
    <Box
      bg="primary.25"
      borderBottom="1px"
      borderColor="border.100"
      px="8"
      py="4"
    >
      <HStack justify="space-between" align="center" mb="4">
        <HStack gap="3">
          <Skeleton w="8" h="8" borderRadius="md" />
          <VStack align="start" gap="0">
            {/* <Skeleton w="48" h="5" mb="2" /> */}
          </VStack>
        </HStack>
        <HStack gap="2">
          <Skeleton w="12" h="6" borderRadius="md" />
          <Skeleton w="8" h="8" borderRadius="md" />
        </HStack>
      </HStack>

      {/* Team vs Team Layout */}
      <Flex justify="space-between" align="center" gap="4">
        {/* Away Team */}
        <VStack gap="2" align="center" flex="1">
          <SkeletonCircle size="12" />
          <VStack gap="0.5" align="center">
            <Skeleton w="20" h="3" />
            <Skeleton w="16" h="3" />
          </VStack>
          <Skeleton w="8" h="8" />
          {/* Strikes */}
          <VStack gap="0.5" align="center">
            <HStack gap="0.5">
              <Skeleton w="2" h="2" borderRadius="full" />
              <Skeleton w="2" h="2" borderRadius="full" />
            </HStack>
            <Skeleton w="12" h="3" />
          </VStack>
        </VStack>

        {/* Center - Game State */}
        <VStack gap="3" align="center" flex="1">
          <Skeleton w="24" h="4" />
          {/* Baseball Diamond */}
          <Skeleton w="12" h="12" borderRadius="md" />
        </VStack>

        {/* Home Team */}
        <VStack gap="2" align="center" flex="1">
          <SkeletonCircle size="12" />
          <VStack gap="0.5" align="center">
            <Skeleton w="20" h="3" />
            <Skeleton w="16" h="3" />
          </VStack>
          <Skeleton w="8" h="8" />
          {/* Balls */}
          <VStack gap="0.5" align="center">
            <HStack gap="0.5">
              <Skeleton w="2" h="2" borderRadius="full" />
              <Skeleton w="2" h="2" borderRadius="full" />
              <Skeleton w="2" h="2" borderRadius="full" />
              <Skeleton w="2" h="2" borderRadius="full" />
            </HStack>
            <Skeleton w="12" h="3" />
          </VStack>
        </VStack>
      </Flex>
    </Box>
  );
};

// Game Status Skeleton Component
const GameStatusSkeleton = () => {
  return (
    <Box bg="primary.25" p="4" borderBottom="1px" borderColor="border.100">
      <HStack justify="space-between" align="center">
        <VStack align="start" gap="1">
          <Text fontSize="sm" fontWeight="medium" color="gray.400">
            Live Game
          </Text>
          <Text fontSize="xs" color="text.400">
            Play-by-Play Events
          </Text>
          <VStack align="start" gap="2" mt="1">
            <HStack gap="4">
              <Text fontSize="xs" color="text.400">
                Hits: -- - --
              </Text>
              <Text fontSize="xs" color="text.400">
                Errors: -- - --
              </Text>
            </HStack>
            <HStack gap="4">
              <Text fontSize="xs" color="text.400">
                Pitcher: --
              </Text>
              <Text fontSize="xs" color="text.400">
                Batter: --
              </Text>
            </HStack>
          </VStack>
        </VStack>
        <VStack align="end" gap="1">
          <Text fontSize="xs" color="text.400">
            0 events
          </Text>
          <Text fontSize="xs" color="text.400">
            Live
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

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
  const boxScoreRequests = useAppSelector(
    (state) => state.sportsData.boxScoreRequests,
  );
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );

  // Use league from URL if available, otherwise fall back to Redux state
  const currentLeague = leagueFromUrl || selectedLeague;

  // Get all data from Redux state
  const { teamProfiles, fetchTeamProfiles } = useArb();

  // Get current game data from box-score
  const currentGame = actualGameId
    ? boxScoreData[actualGameId as keyof typeof boxScoreData]?.data?.Game
    : null;

  // Use currentGame as the game data
  const gameData = currentGame;

  // Reset fetch ref when game ID changes
  useEffect(() => {
    hasFetchedRef.current = false;
  }, [actualGameId]);

  // Single useEffect to handle all data fetching
  useEffect(() => {
    if (!actualGameId || hasFetchedRef.current) return;

    hasFetchedRef.current = true;

    // Always fetch team profiles - service layer will handle duplicate prevention
    fetchTeamProfiles(currentLeague);

    // Fetch box score if it doesn't exist and not currently being requested
    if (!currentGame && !boxScoreRequests.includes(actualGameId)) {
      dispatch(fetchBoxScore({ league: currentLeague, gameId: actualGameId }));
    }

    // Fetch play-by-play data
    fetchPlayByPlay();
  }, [actualGameId]); // Only depend on actualGameId to prevent multiple triggers

  // Create team ID to logo mapping from the fetched data
  const teamIdToLogo =
    teamProfiles?.data?.reduce(
      (acc: Record<number, string>, team) => {
        acc[team.TeamID] = team.WikipediaLogoUrl;
        return acc;
      },
      {} as Record<number, string>,
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
          <Text color="text.400" textAlign="center">
            Please select a game to view play-by-play data.
          </Text>
          <BackButton onClick={onBack} variant="text">
            Go Back
          </BackButton>
        </VStack>
      </Box>
    );
  }
  const [playByPlayData, setPlayByPlayData] =
    useState<ActualPlayByPlayResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  // Format event description using the utility function
  const formatEventDescription = (play: Play): string => {
    return getPlayLabel(play);
  };

  // Format timestamp for display as relative time using centralized utility
  const formatTimestamp = (timestamp: string): string => {
    // Debug logging to see what's happening

    return formatRelativeESTTime(timestamp);
  };

  // Fetch play-by-play data
  const fetchPlayByPlay = useCallback(async () => {
    try {
      setLoading(true);
      const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
      const params: Record<string, string> = {
        league: currentLeague,
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

      // Limit to latest events (keep the most recent events, not the oldest)
      const limitedData = {
        ...data,
        data: data.data.slice(-PLAY_BY_PLAY_CONFIG.maxEventsInMemory),
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

  // gameData is already defined above

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
  if (
    !loading &&
    (!playByPlayData ||
      !playByPlayData.data ||
      playByPlayData.data.length === 0)
  ) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Text color="text.400" fontSize="lg" fontWeight="semibold">
            No play-by-play data available for this game.
          </Text>
          <Text color="text.400">The game data is missing or incomplete.</Text>
          <BackButton onClick={onBack} variant="text">
            Go Back
          </BackButton>
        </VStack>
      </Box>
    );
  }

  // Extract plays from the actual API response structure and sort by time DESC (newest first)
  const plays = playByPlayData?.data
    ? [...playByPlayData.data].sort(
        (a, b) => new Date(b.Updated).getTime() - new Date(a.Updated).getTime(),
      )
    : [];

  // Get team names using team IDs from box score data
  const awayTeamId = gameData?.AwayTeamID;
  const homeTeamId = gameData?.HomeTeamID;

  // Function to get team logo for a play
  const getTeamLogoForPlay = (play: Play): string | null => {
    // For most plays, the hitter is the acting player, so use HitterTeamID
    // For some defensive plays, we might want to use PitcherTeamID
    // For now, let's use HitterTeamID as the primary acting player
    const actingTeamId = play.HitterTeamID;
    const logo = teamIdToLogo[actingTeamId] || null;
    return logo;
  };

  // Show loading state with skeletons only if we're actively loading and don't have play-by-play data
  if (loading && !playByPlayData) {
    return (
      <Box minH="100vh" bg="primary.25">
        <HeaderSkeleton />
        <GameStatusSkeleton />
        <Box px="8" py="4">
          <VStack gap="2" align="stretch">
            {Array.from({ length: 8 }, (_, index) => (
              <PBPCardSkeleton key={`skeleton-${index}`} />
            ))}
          </VStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="primary.25">
      {/* Header */}
      <Box bg="primary.25" borderBottom="1px" borderColor="border.100" p="4">
        <HStack justify="space-between" align="center" mb="4">
          <HStack gap="3">
            <BackButton onClick={onBack} size="md" />
            <VStack align="start" gap="0">
              {/* <Text fontSize="lg" fontWeight="bold">
                Play-by-Play
              </Text> */}
            </VStack>
          </HStack>

          <HStack gap="2">
            {loading ? (
              <Skeleton w="12" h="6" borderRadius="full" />
            ) : (
              <LiveBadge size="sm" showIcon={true} text="Live" />
            )}
            <RefreshButton
              onClick={handleRefresh}
              loading={loading}
              size="sm"
              ariaLabel="Refresh"
            />
          </HStack>
        </HStack>

        {/* Team vs Team Layout */}
        <VStack gap="4">
          {/* Top row - Team info and scores */}
          <Flex justify="space-between" align="center" w="full">
            {/* Away Team */}
            <VStack gap="2" align="center" flex="1">
              {loading ? (
                <SkeletonCircle size="12" />
              ) : teamIdToLogo[awayTeamId] ? (
                <Image
                  src={teamIdToLogo[awayTeamId]}
                  alt={orEmpty(currentGame?.AwayTeam)}
                  boxSize="12"
                />
              ) : (
                <Box boxSize="12" bg="gray.200" borderRadius="full" />
              )}
              <VStack gap="0.5" align="center">
                {loading ? (
                  <>
                    <Skeleton w="20" h="3" />
                    <Skeleton w="8" h="3" />
                  </>
                ) : (
                  <>
                    <Text fontSize="xs" color="text.400">
                      {orEmpty(currentGame?.AwayTeam)}
                    </Text>
                    <Text fontSize="xs" color="text.400">
                      --
                    </Text>
                  </>
                )}
              </VStack>
              {loading ? (
                <Skeleton w="16" h="12" />
              ) : (
                <Text fontSize="4xl" fontWeight="bold" color="text.400">
                  {currentGame?.AwayTeamRuns || 0}
                </Text>
              )}
            </VStack>

            {/* Center - Game State */}
            <VStack gap="3" align="center" flex="1">
              {loading ? (
                <Skeleton w="24" h="4" />
              ) : currentGame?.Status === "Final" ? (
                <Text fontSize="sm" color="text.400" fontWeight="medium">
                  Final
                </Text>
              ) : currentGame?.Inning && currentGame?.InningHalf ? (
                <InningBadge
                  inningNumber={currentGame.Inning}
                  inningHalf={currentGame.InningHalf}
                  league={currentLeague as League}
                  size="md"
                />
              ) : (
                <Text fontSize="sm" color="text.400" fontWeight="medium">
                  {currentGame?.InningDescription ||
                    getStatusDisplayText(
                      mapApiStatusToGameStatus(currentGame?.Status || ""),
                    )}
                </Text>
              )}
              {/* Baseball Diamond with Base Runners */}
              {loading ? (
                <Skeleton w="16" h="16" borderRadius="md" />
              ) : (
                <Bases
                  runnerOnFirst={currentGame?.RunnerOnFirst}
                  runnerOnSecond={currentGame?.RunnerOnSecond}
                  runnerOnThird={currentGame?.RunnerOnThird}
                  size="md"
                />
              )}
            </VStack>

            {/* Home Team */}
            <VStack gap="2" align="center" flex="1">
              {loading ? (
                <SkeletonCircle size="12" />
              ) : teamIdToLogo[homeTeamId] ? (
                <Image
                  src={teamIdToLogo[homeTeamId]}
                  alt={orEmpty(currentGame?.HomeTeam)}
                  boxSize="12"
                />
              ) : (
                <Box boxSize="12" bg="gray.200" borderRadius="full" />
              )}
              <VStack gap="0.5" align="center">
                {loading ? (
                  <>
                    <Skeleton w="20" h="3" />
                    <Skeleton w="8" h="3" />
                  </>
                ) : (
                  <>
                    <Text fontSize="xs" color="text.400">
                      {orEmpty(currentGame?.HomeTeam)}
                    </Text>
                    <Text fontSize="xs" color="text.400">
                      --
                    </Text>
                  </>
                )}
              </VStack>
              {loading ? (
                <Skeleton w="16" h="12" />
              ) : (
                <Text fontSize="4xl" fontWeight="bold" color="text.400">
                  {currentGame?.HomeTeamRuns || 0}
                </Text>
              )}
            </VStack>
          </Flex>

          {/* Bottom row - Balls, Outs, Strikes */}
          <Flex justify="space-between" align="center" w="full">
            {/* Strikes for Away Team (left side) */}
            <VStack gap="0.5" align="center" flex="1">
              {loading ? (
                <>
                  <HStack gap="0.5">
                    <Skeleton w="2" h="2" borderRadius="full" />
                    <Skeleton w="2" h="2" borderRadius="full" />
                  </HStack>
                  <Skeleton w="12" h="3" />
                </>
              ) : (
                <>
                  <HStack gap="0.5">
                    {[1, 2].map((i) => (
                      <Box
                        key={i}
                        w="2"
                        h="2"
                        borderRadius="full"
                        bg={
                          currentGame?.Strikes && currentGame.Strikes >= i
                            ? "red.500"
                            : "text.400"
                        }
                      />
                    ))}
                  </HStack>
                  <Text fontSize="xs" color="text.400">
                    Strikes
                  </Text>
                </>
              )}
            </VStack>

            {/* Outs - centered */}
            <VStack gap="0.5" align="center" flex="1">
              {loading ? (
                <>
                  <HStack gap="0.5">
                    <Skeleton w="2" h="2" borderRadius="full" />
                    <Skeleton w="2" h="2" borderRadius="full" />
                  </HStack>
                  <Skeleton w="8" h="3" />
                </>
              ) : (
                <>
                  <HStack gap="0.5">
                    {[1, 2].map((i) => (
                      <Box
                        key={i}
                        w="2"
                        h="2"
                        borderRadius="full"
                        bg={
                          currentGame?.Outs && currentGame.Outs >= i
                            ? "yellow.500"
                            : "text.400"
                        }
                      />
                    ))}
                  </HStack>
                  <Text fontSize="xs" color="text.400">
                    Outs
                  </Text>
                </>
              )}
            </VStack>

            {/* Balls for Home Team (right side) */}
            <VStack gap="0.5" align="center" flex="1">
              {loading ? (
                <>
                  <HStack gap="0.5">
                    <Skeleton w="2" h="2" borderRadius="full" />
                    <Skeleton w="2" h="2" borderRadius="full" />
                    <Skeleton w="2" h="2" borderRadius="full" />
                    <Skeleton w="2" h="2" borderRadius="full" />
                  </HStack>
                  <Skeleton w="10" h="3" />
                </>
              ) : (
                <>
                  <HStack gap="0.5">
                    {[1, 2, 3, 4].map((i) => (
                      <Box
                        key={i}
                        w="2"
                        h="2"
                        borderRadius="full"
                        bg={
                          currentGame?.Balls && currentGame.Balls >= i
                            ? "buttons.primary.bg"
                            : "text.400"
                        }
                      />
                    ))}
                  </HStack>
                  <Text fontSize="xs" color="text.400">
                    Balls
                  </Text>
                </>
              )}
            </VStack>
          </Flex>
        </VStack>
      </Box>

      {/* Game Status */}
      <Box
        bg="primary.25"
        px="8"
        py="4"
        borderBottom="1px"
        borderColor="border.100"
      >
        <HStack justify="space-between" align="center">
          <VStack align="start" gap="1">
            {loading ? (
              <Skeleton w="20" h="4" />
            ) : (
              <Text fontSize="sm" fontWeight="medium">
                {getStatusDisplayText(
                  mapApiStatusToGameStatus(currentGame?.Status || ""),
                )}
              </Text>
            )}
            <Text fontSize="xs" color="text.400">
              Play-by-Play Events
            </Text>
            {loading ? (
              <VStack align="start" gap="2" mt="1">
                <HStack gap="4">
                  <Skeleton w="24" h="3" />
                  <Skeleton w="24" h="3" />
                </HStack>
                <HStack gap="4">
                  <Skeleton w="32" h="3" />
                  <Skeleton w="32" h="3" />
                </HStack>
              </VStack>
            ) : (
              currentGame && (
                <VStack align="start" gap="2" mt="1">
                  <HStack gap="4">
                    <Text fontSize="xs" color="text.400">
                      Hits: {currentGame.AwayTeamHits || 0} -{" "}
                      {currentGame.HomeTeamHits || 0}
                    </Text>
                    <Text fontSize="xs" color="text.400">
                      Errors: {currentGame.AwayTeamErrors || 0} -{" "}
                      {currentGame.HomeTeamErrors || 0}
                    </Text>
                  </HStack>
                  {(orEmpty(currentGame.CurrentPitcher) !== "--" ||
                    orEmpty(currentGame.CurrentHitter) !== "--") && (
                    <HStack gap="4">
                      {orEmpty(currentGame.CurrentPitcher) !== "--" && (
                        <Text fontSize="xs" color="text.400">
                          Pitcher: {orEmpty(currentGame.CurrentPitcher)}
                        </Text>
                      )}
                      {orEmpty(currentGame.CurrentHitter) !== "--" && (
                        <Text fontSize="xs" color="text.400">
                          Batter: {orEmpty(currentGame.CurrentHitter)}
                        </Text>
                      )}
                    </HStack>
                  )}
                </VStack>
              )
            )}
          </VStack>

          <VStack align="end" gap="1">
            {loading ? (
              <>
                <Skeleton w="16" h="3" />
                <Skeleton w="12" h="3" />
              </>
            ) : (
              <>
                <Text fontSize="xs" color="text.400">
                  {plays.length} events
                </Text>
                <Text fontSize="xs" color="text.400">
                  Live
                </Text>
              </>
            )}
          </VStack>
        </HStack>
      </Box>

      {/* Play-by-Play Events */}
      <Box px="8" py="4">
        <VStack gap="2" align="stretch">
          {loading ? (
            // Show skeleton events while loading
            Array.from({ length: 8 }, (_, index) => (
              <PBPCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : !playByPlayData || plays.length === 0 ? (
            <Card.Root>
              <Card.Body p="6">
                <VStack gap="2">
                  <Text color="text.400">No events yet</Text>
                  <Text fontSize="sm" color="text.400" textAlign="center">
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
                <Card.Root key={play.PlayID} bg="primary.50" shadow="sm">
                  <Card.Body p="3">
                    <HStack justify="space-between" align="start" gap="3">
                      {/* Team logo */}
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
                      </HStack>

                      {/* Main content */}
                      <VStack align="start" gap="1" flex="1">
                        <Text fontSize="sm" fontWeight="medium">
                          {getPlayTitle(play)}
                        </Text>
                        <Text fontSize="xs" color="text.400">
                          {formatEventDescription(play)}
                        </Text>
                      </VStack>

                      {/* Right side info */}
                      <VStack align="end" gap="1">
                        <Text fontSize="xs" color="text.400">
                          {formatRelativeESTTime(play.Updated)}
                        </Text>
                        <InningBadge
                          inningNumber={play.InningNumber}
                          inningHalf={play.InningHalf}
                          league={currentLeague as League}
                          size="sm"
                        />
                        {currentGame && (
                          <Text
                            fontSize="xs"
                            color="text.400"
                            fontWeight="medium"
                          >
                            {orEmpty(currentGame.AwayTeam)}{" "}
                            {currentGame.AwayTeamRuns || 0} -{" "}
                            {currentGame.HomeTeamRuns || 0}{" "}
                            {orEmpty(currentGame.HomeTeam)}
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
