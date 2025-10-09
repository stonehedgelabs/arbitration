import { useCallback } from "react";
import { Box, Card, HStack, Image, Text, VStack } from "@chakra-ui/react";

import { Skeleton } from "../Skeleton";
import { Bases } from "../Bases";
import {
  PostseasonBadge,
  LiveBadge,
  StadiumBadge,
  LocationBadge,
  DivisionBadge,
  StatusBadge,
  InningBadge,
} from "../badge";

import { GameStatus, League } from "../../config";

import { orEmpty, toLocalTime } from "../../utils";

import { useAppDispatch } from "../../store/hooks";
import { findRedditGameThread } from "../../store/slices/sportsDataSlice";

import { getTeamSubredditByName } from "../../teams";

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
  date: string;
  quarter?: string;
  inningHalf?: string;
  stadium?: string;
  city?: string;
  state?: string;
  division?: string;
  isPostseason?: boolean;
  odds?: any;
  runnerOnFirst?: boolean;
  runnerOnSecond?: boolean;
  runnerOnThird?: boolean;
}

interface MLBScoreCardProps {
  game: Game;
  onGameClick: (gameId: string, gameDate: string) => void;
  oddsLoading?: boolean;
  oddsByDate?: any;
}

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

  return (
    <VStack gap="1" align="stretch" fontSize="xs" w="full">
      {/* Money Line */}
      <HStack justify="space-between" align="center" w="full">
        <Text color="text.500">ML</Text>
        <Text color="text.400" fontWeight="medium">
          {teamOdds?.moneyLine > 0 ? "+" : ""}
          {teamOdds?.moneyLine || "—"}
        </Text>
      </HStack>
      {/* Point Spread */}
      <HStack justify="space-between" align="center" w="full">
        <Text color="text.500">Spread</Text>
        <Text color="text.400" fontWeight="medium">
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

// Helper function to get status badge
const getStatusBadge = (
  status: GameStatus,
  quarter?: string,
  inningHalf?: string,
) => {
  // For MLB games with quarter information, use InningBadge
  if (
    quarter &&
    (status === GameStatus.LIVE || status === GameStatus.UPCOMING)
  ) {
    return (
      <InningBadge
        inningNumber={parseInt(quarter) || 1}
        inningHalf={inningHalf}
        league={League.MLB}
        size="sm"
      />
    );
  }
  // For other cases, use StatusBadge
  return <StatusBadge status={status} quarter={quarter} />;
};

// Helper function to format time
const formatTime = (dateTime: string) => {
  return toLocalTime(dateTime);
};

export function MLBScoreCard({
  game,
  onGameClick,
  oddsLoading,
  oddsByDate,
}: MLBScoreCardProps) {
  const dispatch = useAppDispatch();

  // Enhanced click handler that navigates to the new V2 route
  const handleGameClick = useCallback(async () => {
    // Call the original onGameClick with the new route format
    onGameClick(game.id, game.date);

    // Find subreddits for both teams using the new function
    const awaySubreddit = getTeamSubredditByName(
      game.awayTeam.name,
      League.MLB,
    );
    const homeSubreddit = getTeamSubredditByName(
      game.homeTeam.name,
      League.MLB,
    );

    // Search for game threads for both teams
    if (awaySubreddit) {
      dispatch(
        findRedditGameThread({
          subreddit: awaySubreddit.replace("r/", ""),
          league: "mlb",
        }),
      );
    }
    if (homeSubreddit) {
      dispatch(
        findRedditGameThread({
          subreddit: homeSubreddit.replace("r/", ""),
          league: "mlb",
        }),
      );
    }
  }, [
    onGameClick,
    game.id,
    game.date,
    game.awayTeam.name,
    game.homeTeam.name,
    dispatch,
  ]);

  return (
    <Card.Root
      key={game.id}
      bg="primary.25"
      borderRadius="12px"
      shadow="sm"
      border="1px"
      borderColor="text.400"
      _active={{ transform: "scale(0.98)" }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={handleGameClick}
    >
      <Card.Body p="4">
        <VStack align="stretch" gap="3">
          {/* Time and Status Header */}
          <HStack justify="space-between" align="center">
            <Text fontSize="xs" color="text.400">
              {formatTime(game.time)}
            </Text>
            <HStack gap="2" align="center">
              {getStatusBadge(game.status, game.quarter, game.inningHalf)}
              {game.isPostseason && <PostseasonBadge />}
              {game.status === GameStatus.LIVE && <LiveBadge />}
            </HStack>
          </HStack>

          {/* Location Information */}
          {(game.stadium || game.city) && (
            <HStack justify="space-between" align="center" gap="3">
              <HStack gap="2" align="center" flexWrap="wrap">
                {game.stadium && (
                  <StadiumBadge stadium={orEmpty(game.stadium)} size="xs" />
                )}
                {game.city && game.state && (
                  <LocationBadge
                    city={orEmpty(game.city)}
                    state={orEmpty(game.state)}
                    size="xs"
                  />
                )}
                {game.division && (
                  <DivisionBadge division={orEmpty(game.division)} size="xs" />
                )}
              </HStack>

              {/* Bases Icon for MLB Live Games */}
              {game.status === GameStatus.LIVE && (
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
          <HStack justify="space-between" align="center" gap="2">
            <HStack gap="3" align="center" flex="1" minW="0">
              <Box
                w="8"
                h="8"
                bg="text.200"
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
                    alt={orEmpty(game.awayTeam.name)}
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                ) : (
                  <Box w="full" h="full" bg="text.200" borderRadius="full" />
                )}
              </Box>
              <Text
                fontSize="sm"
                color="text.400"
                fontWeight="medium"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                flex="1"
                minW="0"
              >
                {orEmpty(game.awayTeam.name)}
              </Text>
            </HStack>
            <HStack gap="2" align="center" flexShrink="0">
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="text.400"
                minW="8"
                textAlign="right"
              >
                {orEmpty(game.awayTeam.score.toString())}
              </Text>
              {(game.odds ||
                oddsLoading ||
                (oddsByDate?.data &&
                  oddsByDate.data.some(
                    (odds: any) => odds.GameId?.toString() === game.id,
                  ))) && (
                <Box
                  p="2"
                  bg="primary.25"
                  borderRadius="6px"
                  border="1px solid"
                  borderColor="text.400"
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
          <HStack justify="space-between" align="center" gap="2">
            <HStack gap="3" align="center" flex="1" minW="0">
              <Box
                w="8"
                h="8"
                bg="text.200"
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
                    alt={orEmpty(game.homeTeam.name)}
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                ) : (
                  <Box w="full" h="full" bg="text.200" borderRadius="full" />
                )}
              </Box>
              <Text
                fontSize="sm"
                color="text.400"
                fontWeight="medium"
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                flex="1"
                minW="0"
              >
                {orEmpty(game.homeTeam.name)}
              </Text>
            </HStack>
            <HStack gap="2" align="center" flexShrink="0">
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="text.400"
                minW="8"
                textAlign="right"
              >
                {orEmpty(game.homeTeam.score.toString())}
              </Text>
              {(game.odds ||
                oddsLoading ||
                (oddsByDate?.data &&
                  oddsByDate.data.some(
                    (odds: any) => odds.GameId?.toString() === game.id,
                  ))) && (
                <Box
                  p="2"
                  bg="primary.25"
                  borderRadius="6px"
                  border="1px solid"
                  borderColor="text.400"
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
            (oddsByDate?.data &&
              oddsByDate.data.some(
                (odds: any) => odds.GameId?.toString() === game.id,
              ))) && (
            <Box mt="2" pt="2" borderTop="1px solid" borderColor="text.400">
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
}
