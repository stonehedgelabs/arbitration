import { Heart } from "lucide-react";
import {
  Badge,
  Card,
  Box,
  VStack,
  HStack,
  Text,
  Image,
} from "@chakra-ui/react";

interface Team {
  name: string;
  score: number;
  logo?: string;
}

interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: "live" | "final" | "upcoming";
  time: string;
  quarter?: string;
}

interface ScoresSectionProps {
  games: Game[];
  onGameClick?: (gameId: string) => void;
  favoriteTeams: string[];
  onToggleFavorite: (teamName: string) => void;
}

export function Scores({
  games,
  onGameClick,
  favoriteTeams,
  onToggleFavorite,
}: ScoresSectionProps) {
  const getStatusBadge = (status: string, quarter?: string) => {
    switch (status) {
      case "live":
        return (
          <Badge
            variant="solid"
            bg="red.500"
            color="white"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            {quarter || "LIVE"}
          </Badge>
        );
      case "final":
        return (
          <Badge
            variant="solid"
            bg="gray.300"
            color="gray.700"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            FINAL
          </Badge>
        );
      case "upcoming":
        return (
          <Badge
            variant="solid"
            bg="gray.300"
            color="gray.700"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            UPCOMING
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatTime = (time: string) => {
    // Convert time to "X:XX PM ET" format if needed
    return time.includes("ET") ? time : `${time} ET`;
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <VStack gap="4" align="stretch" p="4" pb="20">
        {/* Header */}
        <Text fontSize="2xl" fontWeight="bold" color="gray.900">
          Today's Games
        </Text>

        {/* Games List */}
        <VStack gap="4" align="stretch">
          {games.length === 0 ? (
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
                    w="12"
                    h="12"
                    bg="gray.200"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="2xl">🏈</Text>
                  </Box>
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                      No Games Today
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      There are no games scheduled for today. Check back later
                      for updates.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          ) : (
            games.map((game) => (
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
              >
                <Card.Body p="4">
                  <VStack align="stretch" gap="3">
                    {/* Time and Status Header */}
                    <HStack justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.500">
                        {formatTime(game.time)}
                      </Text>
                      {getStatusBadge(game.status, game.quarter)}
                    </HStack>

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
                      <HStack gap="3" align="center">
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="gray.900"
                          minW="8"
                          textAlign="right"
                        >
                          {game.awayTeam.score}
                        </Text>
                        <Box
                          cursor="pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(game.awayTeam.name);
                          }}
                          _hover={{ transform: "scale(1.1)" }}
                          transition="all 0.2s"
                        >
                          <Box
                            w="4"
                            h="4"
                            color={
                              favoriteTeams.includes(game.awayTeam.name)
                                ? "red.500"
                                : "gray.400"
                            }
                          >
                            <Heart
                              size={16}
                              fill={
                                favoriteTeams.includes(game.awayTeam.name)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </Box>
                        </Box>
                      </HStack>
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
                      <HStack gap="3" align="center">
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="gray.900"
                          minW="8"
                          textAlign="right"
                        >
                          {game.homeTeam.score}
                        </Text>
                        <Box
                          cursor="pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(game.homeTeam.name);
                          }}
                          _hover={{ transform: "scale(1.1)" }}
                          transition="all 0.2s"
                        >
                          <Box
                            w="4"
                            h="4"
                            color={
                              favoriteTeams.includes(game.homeTeam.name)
                                ? "red.500"
                                : "gray.400"
                            }
                          >
                            <Heart
                              size={16}
                              fill={
                                favoriteTeams.includes(game.homeTeam.name)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          </Box>
                        </Box>
                      </HStack>
                    </HStack>
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
