import { TrendingUp, BarChart3 } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Box,
  VStack,
  HStack,
  Text,
  Progress,
} from "@chakra-ui/react";

interface BettingLine {
  id: string;
  playerName: string;
  position: string;
  team: string;
  opponent: string;
  gameTime: string;
  statType: string;
  line: number;
  odds: string;
  trend: "up" | "down" | "neutral";
  percentage: number;
  description: string;
  overUnder: "over" | "under";
  recommendation: string;
}

interface BetSectionProps {
  bettingLines: BettingLine[];
}

export function Bet({ bettingLines }: BetSectionProps) {
  const getPlayerInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const getOddsColor = (odds: string) => {
    return odds.startsWith("+") ? "green.500" : "red.500";
  };

  return (
    <Box minH="100vh" bg="primary.25">
      <VStack gap="4" align="stretch" p="4" pb="20">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold" color="gray.900">
            Betting Lines
          </Text>
          <Button
            variant="outline"
            size="sm"
            h="8"
            px="3"
            fontSize="xs"
            borderColor="gray.300"
            color="gray.700"
          >
            <Box w="3" h="3" mr="1">
              <BarChart3 size={12} />
            </Box>
            Live Odds
          </Button>
        </HStack>

        {/* Betting Lines */}
        <VStack gap="4" align="stretch">
          {bettingLines.length === 0 ? (
            <Card.Root
              bg="primary.200"
              borderRadius="12px"
              shadow="sm"
              border="1px"
              borderColor="border.100"
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
                    <Box w="6" h="6" color="gray.400">
                      <BarChart3 size={24} />
                    </Box>
                  </Box>
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                      No Betting Lines
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      There are no betting lines available for this league yet.
                      Check back later for player prop bets and insights.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          ) : (
            bettingLines.map((line) => (
              <Card.Root
                key={line.id}
                bg="primary.200"
                borderRadius="12px"
                shadow="sm"
                border="1px"
                borderColor="border.100"
                _active={{ transform: "scale(0.98)" }}
                transition="all 0.2s"
              >
                <Card.Body p="4">
                  <VStack align="stretch" gap="3">
                    {/* Player Header */}
                    <HStack justify="space-between" align="center">
                      <HStack gap="3" align="center">
                        <Box
                          w="10"
                          h="10"
                          bg="gray.600"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink="0"
                        >
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="text.400"
                          >
                            {getPlayerInitials(line.playerName)}
                          </Text>
                        </Box>
                        <VStack align="start" gap="0">
                          <HStack gap="2" align="center">
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color="gray.900"
                            >
                              {line.playerName}
                            </Text>
                            <Badge
                              variant="solid"
                              bg="gray.200"
                              color="gray.700"
                              fontSize="xs"
                              px="2"
                              py="1"
                              borderRadius="full"
                            >
                              {line.position}
                            </Badge>
                          </HStack>
                          <Text fontSize="xs" color="gray.500">
                            {line.team} @ {line.opponent} • {line.gameTime}
                          </Text>
                        </VStack>
                      </HStack>
                      <Box w="4" h="4" color="green.500">
                        <TrendingUp size={16} />
                      </Box>
                    </HStack>

                    {/* Description */}
                    <Text fontSize="sm" color="gray.700" lineHeight="1.5">
                      {line.description}
                    </Text>

                    {/* Betting Line */}
                    <Box bg="primary.25" borderRadius="8px" p="3">
                      <HStack justify="space-between" align="center" mb="2">
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color="gray.900"
                        >
                          {line.overUnder === "over" ? "Over" : "Under"}{" "}
                          {line.line} {line.statType}
                        </Text>
                        <HStack gap="2" align="center">
                          <Box
                            w="16"
                            h="2"
                            bg="gray.200"
                            borderRadius="full"
                            overflow="hidden"
                          >
                            <Box
                              w={`${line.percentage}%`}
                              h="full"
                              bg="green.500"
                              borderRadius="full"
                              transition="all 0.3s"
                            />
                          </Box>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color="green.500"
                          >
                            {line.percentage}%
                          </Text>
                        </HStack>
                      </HStack>
                    </Box>

                    {/* Action Row */}
                    <HStack justify="space-between" align="center">
                      <HStack gap="2" align="center">
                        <Button
                          variant="outline"
                          size="sm"
                          h="8"
                          px="3"
                          borderColor="gray.300"
                        >
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color={getOddsColor(line.odds)}
                          >
                            {line.odds}
                          </Text>
                        </Button>
                        <Text fontSize="xs" color="gray.500">
                          {line.recommendation}
                        </Text>
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
