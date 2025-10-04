// Third-party library imports
import {
  Box,
  Button,
  Card,
  HStack,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ArrowLeft, Clock, MapPin } from "lucide-react";

// Internal imports - config
import { League } from "../../config.ts";

interface PlayerStat {
  name: string;
  position: string;
  completions?: number;
  attempts?: number;
  yards: number;
  touchdowns: number;
  interceptions?: number;
  carries?: number;
  receptions?: number;
  targets?: number;
  longest?: number;
}

interface TeamStats {
  firstDowns: number;
  totalYards: number;
  passingYards: number;
  rushingYards: number;
  turnovers: number;
  penalties: number;
  penaltyYards: number;
  timeOfPossession: string;
}

interface BoxScoreData {
  id: string;
  homeTeam: {
    name: string;
    city: string;
    abbreviation: string;
    score: number;
    quarterScores: number[];
    stats: TeamStats;
    passingStats: PlayerStat[];
    rushingStats: PlayerStat[];
    receivingStats: PlayerStat[];
  };
  awayTeam: {
    name: string;
    city: string;
    abbreviation: string;
    score: number;
    quarterScores: number[];
    stats: TeamStats;
    passingStats: PlayerStat[];
    rushingStats: PlayerStat[];
    receivingStats: PlayerStat[];
  };
  gameInfo?: {
    date: string;
    time: string;
    venue: string;
    attendance: string;
    weather?: string;
    status: string;
  };
}

interface BoxScoreViewProps {
  game: BoxScoreData;
  sport: string;
  onBack: () => void;
}

export function BoxScore({ game, sport, onBack }: BoxScoreViewProps) {
  const getQuarterLabels = () => {
    switch (sport) {
      case "nfl":
        return ["1st", "2nd", "3rd", "4th"];
      case "nba":
        return ["1st", "2nd", "3rd", "4th"];
      case League.MLB:
        return ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];
      case "nhl":
        return ["1st", "2nd", "3rd"];
      case "mls":
        return ["1st", "2nd"];
      default:
        return ["1st", "2nd", "3rd", "4th"];
    }
  };

  const quarters = getQuarterLabels();

  const StatRow = ({
    label,
    homeValue,
    awayValue,
  }: {
    label: string;
    homeValue: string | number;
    awayValue: string | number;
  }) => (
    <HStack
      justify="space-between"
      align="center"
      py="2"
      borderBottom="1px"
      borderColor="gray.100"
      _last={{ borderBottom: "none" }}
    >
      <Text fontSize="sm" textAlign="center" w="1/4">
        {awayValue}
      </Text>
      <Text fontSize="sm" fontWeight="medium" textAlign="center" flex="1">
        {label}
      </Text>
      <Text fontSize="sm" textAlign="center" w="1/4">
        {homeValue}
      </Text>
    </HStack>
  );

  return (
    <Box minH="100vh" bg="gray.50">
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
            <Text
              fontSize="lg"
              fontWeight="bold"
              textAlign="center"
              color="gray.900"
            >
              Box Score
            </Text>
          </Box>
          <Box w="8" />
        </HStack>
      </Box>

      <VStack gap="4" align="stretch" p="4" pb="20">
        {/* Game Overview Card */}
        <Card.Root
          bg="primary.25"
          borderRadius="12px"
          shadow="sm"
          border="1px"
          borderColor="border.100"
        >
          <Card.Body p="4">
            <VStack gap="4" align="stretch">
              {/* Teams and Scores */}
              <VStack gap="4" align="stretch">
                <HStack justify="space-between" align="center">
                  <HStack gap="3" align="center">
                    <Box
                      w="8"
                      h="8"
                      bg="gray.300"
                      borderRadius="full"
                      flexShrink="0"
                    />
                    <VStack align="start" gap="0">
                      <Text fontSize="sm" fontWeight="medium" color="gray.900">
                        {game.awayTeam.city}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {game.awayTeam.name}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color="gray.900"
                    fontFamily="mono"
                  >
                    {game.awayTeam.score}
                  </Text>
                </HStack>

                <HStack justify="space-between" align="center">
                  <HStack gap="3" align="center">
                    <Box
                      w="8"
                      h="8"
                      bg="gray.300"
                      borderRadius="full"
                      flexShrink="0"
                    />
                    <VStack align="start" gap="0">
                      <Text fontSize="sm" fontWeight="medium" color="gray.900">
                        {game.homeTeam.city}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {game.homeTeam.name}
                      </Text>
                    </VStack>
                  </HStack>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color="gray.900"
                    fontFamily="mono"
                  >
                    {game.homeTeam.score}
                  </Text>
                </HStack>
              </VStack>

              {/* Game Info */}
              {game.gameInfo && (
                <HStack
                  justify="center"
                  gap="4"
                  pt="3"
                  borderTop="1px"
                  borderColor="gray.100"
                >
                  <HStack gap="1" align="center">
                    <Box w="3" h="3" color="gray.500">
                      <Clock size={12} />
                    </Box>
                    <Text fontSize="xs" color="gray.500">
                      {game.gameInfo.status}
                    </Text>
                  </HStack>
                  <HStack gap="1" align="center">
                    <Box w="3" h="3" color="gray.500">
                      <MapPin size={12} />
                    </Box>
                    <Text fontSize="xs" color="gray.500">
                      {game.gameInfo.venue}
                    </Text>
                  </HStack>
                </HStack>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Scoring Summary */}
        <Card.Root
          bg="primary.25"
          borderRadius="12px"
          shadow="sm"
          border="1px"
          borderColor="border.100"
        >
          <Card.Header pb="2">
            <Card.Title fontSize="lg" fontWeight="semibold" color="gray.900">
              Scoring Summary
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <Box overflowX="auto">
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row borderBottom="1px" borderColor="border.100">
                    <Table.ColumnHeader
                      textAlign="left"
                      py="2"
                      fontSize="xs"
                      fontWeight="medium"
                      color="gray.600"
                    >
                      Team
                    </Table.ColumnHeader>
                    {quarters.map((quarter) => (
                      <Table.ColumnHeader
                        key={quarter}
                        textAlign="center"
                        py="2"
                        w="12"
                        fontSize="xs"
                        fontWeight="medium"
                        color="gray.600"
                      >
                        {quarter}
                      </Table.ColumnHeader>
                    ))}
                    <Table.ColumnHeader
                      textAlign="center"
                      py="2"
                      w="12"
                      fontSize="xs"
                      fontWeight="medium"
                      color="gray.600"
                    >
                      Total
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  <Table.Row borderBottom="1px" borderColor="gray.100">
                    <Table.Cell
                      py="2"
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.900"
                    >
                      {game.awayTeam.abbreviation}
                    </Table.Cell>
                    {game.awayTeam.quarterScores.map((score, index) => (
                      <Table.Cell
                        key={index}
                        textAlign="center"
                        py="2"
                        fontSize="sm"
                        color="gray.700"
                      >
                        {score}
                      </Table.Cell>
                    ))}
                    <Table.Cell
                      textAlign="center"
                      py="2"
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.900"
                    >
                      {game.awayTeam.score}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell
                      py="2"
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.900"
                    >
                      {game.homeTeam.abbreviation}
                    </Table.Cell>
                    {game.homeTeam.quarterScores.map((score, index) => (
                      <Table.Cell
                        key={index}
                        textAlign="center"
                        py="2"
                        fontSize="sm"
                        color="gray.700"
                      >
                        {score}
                      </Table.Cell>
                    ))}
                    <Table.Cell
                      textAlign="center"
                      py="2"
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.900"
                    >
                      {game.homeTeam.score}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Root>
            </Box>
          </Card.Body>
        </Card.Root>

        {/* Team Statistics */}
        <Card.Root
          bg="primary.25"
          borderRadius="12px"
          shadow="sm"
          border="1px"
          borderColor="border.100"
        >
          <Card.Header pb="2">
            <Card.Title fontSize="lg" fontWeight="semibold" color="gray.900">
              Team Statistics
            </Card.Title>
          </Card.Header>
          <Card.Body>
            <VStack gap="0" align="stretch">
              <HStack justify="space-between" align="center" mb="3">
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  textAlign="center"
                  w="1/4"
                  color="gray.600"
                >
                  {game.awayTeam.abbreviation}
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  textAlign="center"
                  flex="1"
                  color="gray.600"
                >
                  Statistic
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  textAlign="center"
                  w="1/4"
                  color="gray.600"
                >
                  {game.homeTeam.abbreviation}
                </Text>
              </HStack>
              <VStack gap="0" align="stretch">
                <StatRow
                  label="First Downs"
                  homeValue={game.homeTeam.stats.firstDowns}
                  awayValue={game.awayTeam.stats.firstDowns}
                />
                <StatRow
                  label="Total Yards"
                  homeValue={game.homeTeam.stats.totalYards}
                  awayValue={game.awayTeam.stats.totalYards}
                />
                <StatRow
                  label="Passing Yards"
                  homeValue={game.homeTeam.stats.passingYards}
                  awayValue={game.awayTeam.stats.passingYards}
                />
                <StatRow
                  label="Rushing Yards"
                  homeValue={game.homeTeam.stats.rushingYards}
                  awayValue={game.awayTeam.stats.rushingYards}
                />
                <StatRow
                  label="Turnovers"
                  homeValue={game.homeTeam.stats.turnovers}
                  awayValue={game.awayTeam.stats.turnovers}
                />
                <StatRow
                  label="Penalties"
                  homeValue={`${game.homeTeam.stats.penalties}-${game.homeTeam.stats.penaltyYards}`}
                  awayValue={`${game.awayTeam.stats.penalties}-${game.awayTeam.stats.penaltyYards}`}
                />
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
}
