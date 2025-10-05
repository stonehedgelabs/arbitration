import { ArrowLeft, Clock, Wifi } from "lucide-react";
import {
  Badge,
  Box,
  Button,
  Card,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { InningBadge } from "../badge";
import { League } from "../../config";

interface PlayEvent {
  id: string;
  time: string;
  quarter: string;
  team: string;
  description: string;
  type:
    | "touchdown"
    | "field_goal"
    | "turnover"
    | "penalty"
    | "timeout"
    | "other";
}

interface LiveGame {
  id: string;
  homeTeam: { name: string; score: number };
  awayTeam: { name: string; score: number };
  status: string;
  quarter?: string;
}

interface LivePlayByPlayViewProps {
  game: LiveGame;
  plays: PlayEvent[];
  onBack: () => void;
}

export function LivePlayByPlay({
  game,
  plays,
  onBack,
}: LivePlayByPlayViewProps) {
  // Function to generate a short title from the description
  const getPlayTitle = (description: string): string => {
    // Extract the main action from the description
    const desc = description.toLowerCase();

    // Common patterns for different sports
    if (desc.includes("touchdown")) {
      return "Touchdown";
    } else if (desc.includes("field goal")) {
      return "Field Goal";
    } else if (desc.includes("interception")) {
      return "Interception";
    } else if (desc.includes("fumble")) {
      return "Fumble";
    } else if (desc.includes("sack")) {
      return "Sack";
    } else if (desc.includes("penalty")) {
      return "Penalty";
    } else if (desc.includes("timeout")) {
      return "Timeout";
    } else {
      // Fallback: use first few words of description
      const words = description.split(" ");
      return words.slice(0, 3).join(" ");
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case "touchdown":
        return (
          <Badge bg="green.500" color="white" fontSize="xs">
            TD
          </Badge>
        );
      case "field_goal":
        return (
          <Badge bg="blue.500" color="white" fontSize="xs">
            FG
          </Badge>
        );
      case "turnover":
        return (
          <Badge bg="orange.500" color="white" fontSize="xs">
            TO
          </Badge>
        );
      case "penalty":
        return (
          <Badge bg="yellow.500" color="white" fontSize="xs">
            PEN
          </Badge>
        );
      default:
        return null;
    }
  };

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
              Live Play-by-Play
            </Text>
          </Box>
          <Box w="8" />
        </HStack>
      </Box>

      <Box pb="4">
        {/* Game Status Card */}
        <Card.Root m="4" mb="3" borderLeft="4px" borderLeftColor="danger.500">
          <Card.Body p="4">
            {/* Live indicator */}
            <HStack justify="space-between" mb="3">
              <HStack gap="2">
                <Box w="2" h="2" bg="danger.500" borderRadius="full" />
                <Text
                  fontSize="xs"
                  fontWeight="medium"
                  color="danger.500"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Live
                </Text>
                <Box w="3" h="3">
                  <Wifi size={12} color="var(--chakra-colors-danger-500)" />
                </Box>
              </HStack>
              {game.quarter && (
                <Badge variant="outline" fontSize="xs">
                  {game.quarter}
                </Badge>
              )}
            </HStack>

            {/* Teams and Score */}
            <VStack gap="3">
              <HStack justify="space-between" w="full">
                <HStack gap="3">
                  <Box
                    w="8"
                    h="8"
                    bg="text.200"
                    borderRadius="full"
                    flexShrink="0"
                  />
                  <VStack gap="0" align="start">
                    <Text fontWeight="medium">{game.awayTeam.name}</Text>
                    <Text fontSize="xs" color="text.500">
                      Away
                    </Text>
                  </VStack>
                </HStack>
                <Text fontFamily="mono" fontSize="2xl" fontWeight="medium">
                  {game.awayTeam.score}
                </Text>
              </HStack>

              <HStack justify="space-between" w="full">
                <HStack gap="3">
                  <Box
                    w="8"
                    h="8"
                    bg="text.200"
                    borderRadius="full"
                    flexShrink="0"
                  />
                  <VStack gap="0" align="start">
                    <Text fontWeight="medium">{game.homeTeam.name}</Text>
                    <Text fontSize="xs" color="text.500">
                      Home
                    </Text>
                  </VStack>
                </HStack>
                <Text fontFamily="mono" fontSize="2xl" fontWeight="medium">
                  {game.homeTeam.score}
                </Text>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Auto-refresh indicator */}
        <Box mx="4" mb="3" p="2" bg="text.200" borderRadius="lg">
          <HStack justify="center" gap="2">
            <Box w="1.5" h="1.5" bg="green.500" borderRadius="full" />
            <Text fontSize="xs" color="text.500" textAlign="center">
              Auto-refreshing every 30 seconds
            </Text>
          </HStack>
        </Box>

        {/* Play by Play */}
        <VStack gap="3" px="4" pb="20">
          <Text fontWeight="medium">Recent Plays</Text>

          {plays.length === 0 ? (
            <Card.Root borderStyle="dashed">
              <Card.Body p="6" textAlign="center">
                <Box
                  w="12"
                  h="12"
                  bg="text.200"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mx="auto"
                  mb="3"
                >
                  <Box w="6" h="6">
                    <Clock size={24} color="var(--chakra-colors-text-500)" />
                  </Box>
                </Box>
                <Text fontSize="sm" color="text.500">
                  Waiting for live updates...
                </Text>
              </Card.Body>
            </Card.Root>
          ) : (
            <VStack gap="2" w="full">
              {plays.map((play, index) => (
                <Card.Root
                  key={play.id}
                  borderLeft="4px"
                  borderLeftColor="primary.500"
                  bg={index === 0 ? "accent.100" : undefined}
                >
                  <Card.Body p="3">
                    <HStack align="start" gap="3">
                      <Box flex="1" minW="0">
                        <HStack gap="2" mb="2" flexWrap="wrap">
                          <InningBadge
                            inningNumber={parseInt(play.quarter) || 1}
                            league={League.MLB}
                            size="sm"
                          />
                          <HStack gap="1">
                            <Box w="3" h="3">
                              <Clock
                                size={12}
                                color="var(--chakra-colors-text-500)"
                              />
                            </Box>
                            <Text fontSize="xs" color="text.400">
                              {play.time}
                            </Text>
                          </HStack>
                          {getEventBadge(play.type)}
                          {index === 0 && (
                            <Badge bg="green.500" color="white" fontSize="xs">
                              Latest
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="text.500" mb="1" truncate>
                          {play.team}
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          lineHeight="tight"
                        >
                          {getPlayTitle(play.description)}
                        </Text>
                        <Text fontSize="xs" color="text.500" lineHeight="tight">
                          {play.description}
                        </Text>
                      </Box>
                    </HStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </VStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
