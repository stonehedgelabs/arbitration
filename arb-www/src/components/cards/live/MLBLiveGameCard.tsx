// Third-party library imports
import { Box, Card, HStack, Image, Text, VStack } from "@chakra-ui/react";

// Internal imports - components
import { PostseasonBadge, StadiumBadge, InningBadge } from "../../badge";

// Internal imports - config
import { GameStatus, League } from "../../../config";

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

interface MLBLiveGameCardProps {
  game: LiveGame;
  onGameClick?: (gameId: string) => void;
}

export function MLBLiveGameCard({ game, onGameClick }: MLBLiveGameCardProps) {
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
      onClick={() => onGameClick?.(game.id)}
      overflow="hidden"
      position="relative"
    >
      {/* Red vertical indicator */}
      <Box
        position="absolute"
        left="0"
        top="0"
        bottom="0"
        w="4"
        bg="danger.500"
        borderRadius="12px 0 0 12px"
      />

      <Card.Body p="4" pl="6">
        <VStack align="stretch" gap="4">
          {/* Live Status Indicator */}
          <HStack justify="space-between" align="center">
            <HStack gap="2" align="center">
              <Box w="2" h="2" borderRadius="full" bg="danger.500" />
            </HStack>
          </HStack>

          {/* Badges Row */}
          <HStack gap="2" align="center" wrap="wrap">
            {/* Playoffs Badge */}
            {game.isPostseason && <PostseasonBadge />}

            {/* Game Place Badge with Chevron */}
            {game.quarter && (
              <InningBadge
                inningNumber={parseInt(game.quarter) || 1}
                inningHalf={game.inningHalf}
                league={League.MLB}
                size="sm"
                showChevron={true}
              />
            )}

            {/* Venue Badge */}
            {game.stadium && <StadiumBadge stadium={game.stadium} />}
          </HStack>

          {/* Away Team */}
          <HStack justify="space-between" align="center">
            <HStack gap="3" align="center">
              <Box
                w="8"
                h="8"
                borderRadius="full"
                bg="text.200"
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
                  <Box w="full" h="full" bg="text.200" borderRadius="full" />
                )}
              </Box>
              <VStack align="start" gap="0">
                <Text fontSize="sm" fontWeight="medium" color="text.400">
                  {game.awayTeam.name}
                </Text>
                <Text fontSize="xs" color="text.500">
                  Away
                </Text>
              </VStack>
            </HStack>
            <Text fontSize="lg" fontWeight="bold" color="text.400">
              {game.awayTeam.score}
            </Text>
          </HStack>

          {/* Home Team */}
          <HStack justify="space-between" align="center">
            <HStack gap="3" align="center">
              <Box
                w="8"
                h="8"
                borderRadius="full"
                bg="text.200"
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
                  <Box w="full" h="full" bg="text.200" borderRadius="full" />
                )}
              </Box>
              <VStack align="start" gap="0">
                <Text fontSize="sm" fontWeight="medium" color="text.400">
                  {game.homeTeam.name}
                </Text>
                <Text fontSize="xs" color="text.500">
                  Home
                </Text>
              </VStack>
            </HStack>
            <Text fontSize="lg" fontWeight="bold" color="text.400">
              {game.homeTeam.score}
            </Text>
          </HStack>

          {/* Tap to view play-by-play */}
          <Text
            fontSize="xs"
            color="text.500"
            textAlign="center"
            pt="2"
            borderTop="1px"
            borderColor="text.200"
          >
            Tap to view live play-by-play →
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
