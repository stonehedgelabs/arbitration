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
import { ChevronRight } from "lucide-react";

// Internal imports - components
import { Skeleton, SkeletonCircle } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorStates";
import {
  MLBLiveGameCard,
  NBALiveGameCard,
  NFLLiveGameCard,
  NHLLiveGameCard,
  GenericLiveGameCard,
} from "../components/cards/live";

// Internal imports - config
import { GameStatus, League } from "../config";

interface Team {
  name: string;
  score: number;
  logo?: string;
}

interface LiveGame {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: GameStatus.LIVE;
  time: string;
  quarter?: string;
  inningHalf?: string;
  stadium?: string;
  city?: string;
  state?: string;
  isPostseason?: boolean;
  league: League;
}

interface LiveGamesSectionProps {
  games: LiveGame[];
  onGameClick?: (gameId: string) => void;
  loading?: boolean;
  selectedLeague: League;
  error?: string | null;
}

// Game Card Skeleton Component - EXACT same as Scores component
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
            </HStack>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

// League-specific card component
const LiveGameCard = ({
  game,
  onGameClick,
}: {
  game: LiveGame;
  onGameClick?: (gameId: string) => void;
}) => {
  switch (game.league) {
    case League.MLB:
      return <MLBLiveGameCard game={game} onGameClick={onGameClick} />;
    case League.NBA:
      return <NBALiveGameCard game={game} onGameClick={onGameClick} />;
    case League.NFL:
      return <NFLLiveGameCard game={game} onGameClick={onGameClick} />;
    case League.NHL:
      return <NHLLiveGameCard game={game} onGameClick={onGameClick} />;
    default:
      return <GenericLiveGameCard game={game} onGameClick={onGameClick} />;
  }
};

export function Live({
  games,
  onGameClick,
  loading = false,
  selectedLeague,
  error,
}: LiveGamesSectionProps) {
  const liveGames = games.filter((game) => game.status === GameStatus.LIVE);

  return (
    <Box minH="100vh" bg="primary.25">
      <VStack gap="4" align="stretch" p="4" pb="20">
        {/* Header */}
        {/* <HStack justify="space-between" align="center">
          <Badge
            variant="solid"
            bg="danger.100"
            color="text.400"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            {liveGames.length} Live
          </Badge>
        </HStack> */}

        {/* Games List */}
        <VStack gap="4" align="stretch">
          {error ? (
            // Show error state when there's an error (e.g., unsupported league)
            <ErrorState
              title="Error Loading Live Games"
              message={`Failed to load ${selectedLeague.toUpperCase()} live games. ${error}`}
              onRetry={() => window.location.reload()}
              showRetry={true}
              showBack={false}
              variant="error"
            />
          ) : loading ? (
            // Show skeleton cards while loading - EXACT same as Scores component
            Array.from({ length: 3 }, (_, index) => (
              <GameCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : liveGames.length === 0 ? (
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
                    <Text fontSize="lg" fontWeight="semibold" color="text.400">
                      No Live Games
                    </Text>
                    <Text fontSize="sm" color="text.400" textAlign="center">
                      There are no live games at the moment.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          ) : (
            liveGames.map((game) => (
              <LiveGameCard
                key={game.id}
                game={game}
                onGameClick={onGameClick}
              />
            ))
          )}
        </VStack>
      </VStack>
    </Box>
  );
}
