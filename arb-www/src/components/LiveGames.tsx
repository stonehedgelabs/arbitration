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

// Internal imports - config
import { GameStatus } from "../config";

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
}

interface LiveGamesSectionProps {
  games: LiveGame[];
  onGameClick?: (gameId: string) => void;
}

export function LiveGames({ games, onGameClick }: LiveGamesSectionProps) {
  const liveGames = games.filter((game) => game.status === GameStatus.LIVE);

  return (
    <Box minH="100vh" bg="gray.50">
      <VStack gap="4" align="stretch" p="4" pb="20">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold" color="gray.900">
            Live Games
          </Text>
          <Badge
            variant="solid"
            bg="red.500"
            color="white"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            {liveGames.length} Live
          </Badge>
        </HStack>

        {/* Games List */}
        <VStack gap="4" align="stretch">
          {liveGames.length === 0 ? (
            <Card.Root
              bg="white"
              borderRadius="12px"
              shadow="sm"
              border="1px"
              borderColor="gray.200"
            >
              <Card.Body p="8" textAlign="center">
                <VStack gap="4">
                  <Box
                    w="16"
                    h="16"
                    bg="gray.200"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="2xl">📺</Text>
                  </Box>
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                      No Live Games
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      There are no live games happening right now. Check back
                      during game times for live play-by-play coverage.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          ) : (
            liveGames.map((game) => (
              <Card.Root
                key={game.id}
                bg="white"
                borderRadius="12px"
                shadow="sm"
                border="1px"
                borderColor="gray.200"
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
                  bg="red.500"
                  borderRadius="12px 0 0 12px"
                />

                <Card.Body p="4" pl="6">
                  <VStack align="stretch" gap="4">
                    {/* Live Status and Quarter */}
                    <HStack justify="space-between" align="center">
                      <HStack gap="2" align="center">
                        <Box w="2" h="2" borderRadius="full" bg="red.500" />
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color="red.500"
                        >
                          LIVE
                        </Text>
                        {game.quarter && (
                          <Badge
                            variant="solid"
                            bg="gray.100"
                            color="gray.700"
                            fontSize="xs"
                            px="2"
                            py="1"
                            borderRadius="full"
                          >
                            {game.quarter} {game.time}
                          </Badge>
                        )}
                      </HStack>
                    </HStack>

                    {/* Away Team */}
                    <HStack justify="space-between" align="center">
                      <HStack gap="3" align="center">
                        <Box
                          w="8"
                          h="8"
                          borderRadius="full"
                          bg="gray.200"
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
                              bg="gray.200"
                              borderRadius="full"
                            />
                          )}
                        </Box>
                        <VStack align="start" gap="0">
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.900"
                          >
                            {game.awayTeam.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Away
                          </Text>
                        </VStack>
                      </HStack>
                      <Text fontSize="lg" fontWeight="bold" color="gray.900">
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
                          bg="gray.200"
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
                              bg="gray.200"
                              borderRadius="full"
                            />
                          )}
                        </Box>
                        <VStack align="start" gap="0">
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="gray.900"
                          >
                            {game.homeTeam.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Home
                          </Text>
                        </VStack>
                      </HStack>
                      <Text fontSize="lg" fontWeight="bold" color="gray.900">
                        {game.homeTeam.score}
                      </Text>
                    </HStack>

                    {/* Tap to view play-by-play */}
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      textAlign="center"
                      pt="2"
                      borderTop="1px"
                      borderColor="gray.100"
                    >
                      Tap to view live play-by-play →
                    </Text>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))
          )}
        </VStack>
      </VStack>
    </Box>
  );
}
