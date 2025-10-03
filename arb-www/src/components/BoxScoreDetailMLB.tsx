import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  IconButton,
  Image,
  Flex,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import useArb from "../services/Arb";
import { useAppSelector } from "../store/hooks";

// Internal imports - components
import { Skeleton, SkeletonCircle } from "./Skeleton";

interface BoxScoreDetailMLBProps {
  gameId: string;
  onBack: () => void;
}

export function BoxScoreDetailMLB({ gameId, onBack }: BoxScoreDetailMLBProps) {
  const {
    mlbBoxScore,
    mlbTeamProfiles,
    fetchMLBBoxScore,
    fetchMLBTeamProfiles,
  } = useArb();
  const [selectedTeam, setSelectedTeam] = useState<"away" | "home">("away");

  // Get odds data from Redux store
  const mlbOddsByDate = useAppSelector((state) => state.sportsData.oddsByDate);

  // Helper function to get odds for this specific game
  const getGameOdds = () => {
    if (!mlbOddsByDate?.data) return null;

    const gameOdds = mlbOddsByDate.data.find(
      (odds: any) => odds.GameId?.toString() === gameId,
    );
    if (!gameOdds) return null;

    // Get the first available odds (prefer pregame odds)
    const pregameOdds = gameOdds.PregameOdds?.[0];
    const liveOdds = gameOdds.LiveOdds?.[0];
    const odds = pregameOdds || liveOdds;

    if (!odds) return null;

    return {
      homeMoneyLine: odds.HomeMoneyLine,
      awayMoneyLine: odds.AwayMoneyLine,
      homePointSpread: odds.HomePointSpread,
      awayPointSpread: odds.AwayPointSpread,
      overUnder: odds.OverUnder,
      sportsbook: odds.Sportsbook || "Unknown",
    };
  };

  const gameOdds = getGameOdds();

  useEffect(() => {
    fetchMLBBoxScore(gameId);
    fetchMLBTeamProfiles();
  }, [gameId]); // Removed function dependencies to prevent loops

  // Show loading state while data is being fetched
  if (!mlbBoxScore?.data) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Spinner size="lg" />
          <Text>Loading box score...</Text>
        </VStack>
      </Box>
    );
  }

  const game = mlbBoxScore.data.Game;

  // Get team profiles for colors and logos
  const awayTeamProfile = mlbTeamProfiles?.data?.find(
    (team) => team.Key === game.AwayTeam,
  );
  const homeTeamProfile = mlbTeamProfiles?.data?.find(
    (team) => team.Key === game.HomeTeam,
  );

  const awayTeamColor = awayTeamProfile?.PrimaryColor || "#1a365d";
  const homeTeamColor = homeTeamProfile?.PrimaryColor || "#1a365d";

  return (
    <Box minH="100vh" bg="white">
      {/* Header with Back Button */}
      <Box bg="white" px="4" py="3" borderBottom="1px" borderColor="gray.200">
        <HStack justify="space-between" align="center">
          <IconButton
            aria-label="Go back"
            variant="ghost"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Text fontSize="sm" color="gray.600"></Text>
        </HStack>
      </Box>

      {/* Main Game Information */}
      <Box px="4" py="6">
        {/* Game Title */}
        {game.SeriesInfo && (
          <Text textAlign="center" fontSize="sm" color="gray.600" mb="6">
            {(() => {
              const series = game.SeriesInfo;
              const awayWins = series.AwayTeamWins || 0;
              const homeWins = series.HomeTeamWins || 0;
              const gameNumber = series.GameNumber || 1;
              const maxLength = series.MaxLength || 1;

              // Determine series leader
              let leaderText = "";
              if (awayWins > homeWins) {
                leaderText = `${game.AwayTeam} lead series ${awayWins}-${homeWins}`;
              } else if (homeWins > awayWins) {
                leaderText = `${game.HomeTeam} lead series ${homeWins}-${awayWins}`;
              } else {
                leaderText = `Series tied ${awayWins}-${homeWins}`;
              }

              return `Game ${gameNumber} of ${maxLength}, ${leaderText}`;
            })()}
          </Text>
        )}

        {/* Scoreboard */}
        <Flex justify="space-between" align="center" mb="6">
          {/* Away Team */}
          <VStack gap="2" align="center" flex="1">
            {awayTeamProfile?.WikipediaLogoUrl ? (
              <Image
                src={awayTeamProfile.WikipediaLogoUrl}
                alt={game.AwayTeam}
                boxSize="12"
              />
            ) : (
              <Box boxSize="12" bg="gray.200" borderRadius="full" />
            )}
            <VStack gap="0" align="center">
              <Text fontSize="xs" color="gray.600">
                5 {game.AwayTeam}
              </Text>
              <Text fontSize="xs" color="gray.600">
                90-72
              </Text>
            </VStack>
            <Text fontSize="4xl" fontWeight="bold" color="gray.800">
              {game.AwayTeamRuns || 0}
            </Text>
          </VStack>

          {/* Center - Game State */}
          <VStack gap="3" align="center" flex="1">
            <Text fontSize="sm" color="gray.600" fontWeight="medium">
              {game.InningDescription || "TBD"}
            </Text>
            {/* Baseball Diamond */}
            <Box position="relative" w="16" h="16">
              <Box
                position="absolute"
                top="2"
                left="2"
                w="3"
                h="3"
                bg="gray.400"
                borderRadius="full"
              />
              <Box
                position="absolute"
                top="2"
                right="2"
                w="3"
                h="3"
                bg="gray.400"
                borderRadius="full"
              />
              <Box
                position="absolute"
                bottom="2"
                left="1/2"
                transform="translateX(-50%)"
                w="3"
                h="3"
                bg="gray.200"
                borderRadius="full"
              />
            </Box>
          </VStack>

          {/* Home Team */}
          <VStack gap="2" align="center" flex="1">
            {homeTeamProfile?.WikipediaLogoUrl ? (
              <Image
                src={homeTeamProfile.WikipediaLogoUrl}
                alt={game.HomeTeam}
                boxSize="12"
              />
            ) : (
              <Box boxSize="12" bg="gray.200" borderRadius="full" />
            )}
            <VStack gap="0" align="center">
              <Text fontSize="xs" color="gray.600">
                4 {game.HomeTeam}
              </Text>
              <Text fontSize="xs" color="gray.600">
                92-70
              </Text>
            </VStack>
            <Text fontSize="4xl" fontWeight="bold" color="gray.800">
              {game.HomeTeamRuns || 0}
            </Text>
          </VStack>
        </Flex>

        {/* Game Metadata */}
        <HStack justify="center" gap="4" mb="6" fontSize="xs" color="gray.600">
          <Text>TV: {game.Channel || "TBD"}</Text>
          <Text>•</Text>
          <HStack gap="1">
            <Text>☀️</Text>
            <Text>72° F</Text>
          </HStack>
          {gameOdds && (
            <>
              <Text>•</Text>
              <HStack gap="2">
                {gameOdds.awayMoneyLine !== null &&
                  gameOdds.awayMoneyLine !== undefined && (
                    <Text>
                      {game.AwayTeam}{" "}
                      {gameOdds.awayMoneyLine > 0
                        ? `+${gameOdds.awayMoneyLine}`
                        : gameOdds.awayMoneyLine}
                    </Text>
                  )}
                {gameOdds.homeMoneyLine !== null &&
                  gameOdds.homeMoneyLine !== undefined && (
                    <Text>
                      {game.HomeTeam}{" "}
                      {gameOdds.homeMoneyLine > 0
                        ? `+${gameOdds.homeMoneyLine}`
                        : gameOdds.homeMoneyLine}
                    </Text>
                  )}
                {gameOdds.overUnder !== null && (
                  <Text>O/U {gameOdds.overUnder}</Text>
                )}
                {gameOdds.sportsbook && (
                  <Text fontSize="2xs" color="gray.500">
                    via {gameOdds.sportsbook}
                  </Text>
                )}
              </HStack>
            </>
          )}
        </HStack>

        {/* Stats Tab */}
        <Box mb="6">
          <Text
            fontSize="sm"
            fontWeight="medium"
            color="purple.600"
            borderBottom="2px"
            borderColor="purple.600"
            display="inline-block"
            pb="1"
          >
            STATS
          </Text>
        </Box>

        {/* Innings Summary */}
        {game.Innings && game.Innings.length > 0 && (
          <Box bg="gray.50" p="4" borderRadius="lg" mb="6">
            <Text fontSize="sm" fontWeight="bold" mb="3">
              Innings Summary
            </Text>
            <Box overflowX="auto">
              <HStack gap="1" minW="fit-content">
                {game.Innings.slice(0, 9).map((inning, index) => (
                  <VStack key={index} gap="0.5" minW="8" align="center" p="1">
                    <Text fontSize="2xs" color="gray.600">
                      {inning.InningNumber}
                    </Text>
                    <Text fontSize="xs" fontWeight="medium">
                      {inning.AwayTeamRuns}
                    </Text>
                    <Text fontSize="xs" fontWeight="medium">
                      {inning.HomeTeamRuns}
                    </Text>
                  </VStack>
                ))}
              </HStack>
            </Box>
          </Box>
        )}

        {/* Team Selection Toggle */}
        <Box mb="6">
          <Flex
            bg="gray.100"
            borderRadius="xl"
            p="1"
            position="relative"
            h="16"
            align="center"
            gap="0"
          >
            <Button
              flex="1"
              h="14"
              borderRadius="xl"
              borderTopRightRadius="none"
              borderBottomRightRadius="none"
              bg={
                selectedTeam === "away"
                  ? "linear-gradient(145deg, #ffffff, #f7f7f7)"
                  : "linear-gradient(145deg, #e5e7eb, #d1d5db)"
              }
              color="gray.800"
              fontWeight="bold"
              fontSize="lg"
              onClick={() => setSelectedTeam("away")}
              _hover={{
                bg:
                  selectedTeam === "away"
                    ? "linear-gradient(145deg, #ffffff, #f7f7f7)"
                    : "linear-gradient(145deg, #d1d5db, #9ca3af)",
              }}
              boxShadow={
                selectedTeam === "away"
                  ? "0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)"
                  : "0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.1)"
              }
              borderRight="1px solid"
              borderColor="gray.300"
            >
              <HStack gap="2">
                {awayTeamProfile?.WikipediaLogoUrl && (
                  <Image
                    src={awayTeamProfile.WikipediaLogoUrl}
                    alt={game.AwayTeam}
                    boxSize="8"
                  />
                )}
                <Text>{game.AwayTeam}</Text>
              </HStack>
            </Button>
            <Button
              flex="1"
              h="14"
              borderRadius="xl"
              borderTopLeftRadius="none"
              borderBottomLeftRadius="none"
              bg={
                selectedTeam === "home"
                  ? "linear-gradient(145deg, #ffffff, #f7f7f7)"
                  : "linear-gradient(145deg, #e5e7eb, #d1d5db)"
              }
              color="gray.800"
              fontWeight="bold"
              fontSize="lg"
              onClick={() => setSelectedTeam("home")}
              _hover={{
                bg:
                  selectedTeam === "home"
                    ? "linear-gradient(145deg, #ffffff, #f7f7f7)"
                    : "linear-gradient(145deg, #d1d5db, #9ca3af)",
              }}
              boxShadow={
                selectedTeam === "home"
                  ? "0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)"
                  : "0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.1)"
              }
            >
              <HStack gap="2">
                {homeTeamProfile?.WikipediaLogoUrl && (
                  <Image
                    src={homeTeamProfile.WikipediaLogoUrl}
                    alt={game.HomeTeam}
                    boxSize="8"
                  />
                )}
                <Text>{game.HomeTeam}</Text>
              </HStack>
            </Button>
          </Flex>
        </Box>

        {/* Game Information */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb="4">
            Game Information
          </Text>

          <VStack gap="3" align="stretch">
            {/* Team Stats */}
            <Box bg="gray.50" p="4" borderRadius="lg">
              <Text fontSize="md" fontWeight="bold" mb="3">
                {selectedTeam === "away" ? game.AwayTeam : game.HomeTeam} Team
                Stats
              </Text>
              <HStack justify="space-between" wrap="wrap" gap="4">
                <VStack gap="1" align="center">
                  <Text fontSize="sm" color="gray.600">
                    Runs
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {selectedTeam === "away"
                      ? game.AwayTeamRuns || 0
                      : game.HomeTeamRuns || 0}
                  </Text>
                </VStack>
                <VStack gap="1" align="center">
                  <Text fontSize="sm" color="gray.600">
                    Hits
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {selectedTeam === "away"
                      ? game.AwayTeamHits || 0
                      : game.HomeTeamHits || 0}
                  </Text>
                </VStack>
                <VStack gap="1" align="center">
                  <Text fontSize="sm" color="gray.600">
                    Errors
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {selectedTeam === "away"
                      ? game.AwayTeamErrors || 0
                      : game.HomeTeamErrors || 0}
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Pitcher Information */}
            {(selectedTeam === "away"
              ? game.AwayTeamStartingPitcher
              : game.HomeTeamStartingPitcher) && (
              <Box bg="gray.50" p="4" borderRadius="lg">
                <Text fontSize="md" fontWeight="bold" mb="3">
                  Starting Pitcher
                </Text>
                <Text fontSize="sm">
                  {selectedTeam === "away"
                    ? game.AwayTeamStartingPitcher
                    : game.HomeTeamStartingPitcher}
                </Text>
              </Box>
            )}

            {/* Current Game State */}
            {game.CurrentPitcher && (
              <Box bg="gray.50" p="4" borderRadius="lg">
                <Text fontSize="md" fontWeight="bold" mb="3">
                  Current Pitcher
                </Text>
                <Text fontSize="sm">{game.CurrentPitcher}</Text>
              </Box>
            )}

            {/* Game Status */}
            <Box bg="gray.50" p="4" borderRadius="lg">
              <Text fontSize="md" fontWeight="bold" mb="3">
                Game Status
              </Text>
              <VStack gap="2" align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Status:
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {game.Status || "TBD"}
                  </Text>
                </HStack>
                {game.Inning && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Inning:
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {game.Inning}
                      {game.InningHalf || ""}
                    </Text>
                  </HStack>
                )}
                {game.Outs !== undefined && game.Outs !== null && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Outs:
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {game.Outs}
                    </Text>
                  </HStack>
                )}
                {game.Balls !== undefined && game.Balls !== null && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Balls:
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {game.Balls}
                    </Text>
                  </HStack>
                )}
                {game.Strikes !== undefined && game.Strikes !== null && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      Strikes:
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {game.Strikes}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Box>
          </VStack>
        </Box>

        {/* Pitcher Information */}
        <Box mt="8">
          <Text fontSize="lg" fontWeight="bold" mb="4">
            Pitcher Information
          </Text>

          <VStack gap="3" align="stretch">
            {/* Starting Pitchers */}
            <Box bg="gray.50" p="4" borderRadius="lg">
              <Text fontSize="md" fontWeight="bold" mb="3">
                Starting Pitchers
              </Text>
              <VStack gap="2" align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    {game.AwayTeam}:
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {game.AwayTeamStartingPitcher || "TBD"}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    {game.HomeTeam}:
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {game.HomeTeamStartingPitcher || "TBD"}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Current Pitcher */}
            {game.CurrentPitcher && (
              <Box bg="gray.50" p="4" borderRadius="lg">
                <Text fontSize="md" fontWeight="bold" mb="3">
                  Current Pitcher
                </Text>
                <Text fontSize="sm">{game.CurrentPitcher}</Text>
              </Box>
            )}

            {/* Winning/Losing Pitchers (for completed games) */}
            {(game.WinningPitcher ||
              game.LosingPitcher ||
              game.SavingPitcher) && (
              <Box bg="gray.50" p="4" borderRadius="lg">
                <Text fontSize="md" fontWeight="bold" mb="3" color="gray.600">
                  Game Results
                </Text>
                <VStack gap="2" align="stretch">
                  {game.WinningPitcher && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Winning Pitcher:
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        {game.WinningPitcher}
                      </Text>
                    </HStack>
                  )}
                  {game.LosingPitcher && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Losing Pitcher:
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        {game.LosingPitcher}
                      </Text>
                    </HStack>
                  )}
                  {game.SavingPitcher && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Save:
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        {game.SavingPitcher}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Player Stats */}
        <Box mt="8">
          <Text fontSize="lg" fontWeight="bold" mb="4">
            Player Stats
          </Text>

          {/* Batters */}
          <Box mb="6">
            <Text fontSize="md" fontWeight="bold" mb="3">
              Batters
            </Text>
            <Box
              overflowX="auto"
              bg="white"
              borderRadius="lg"
              border="1px"
              borderColor="gray.200"
            >
              <Box as="table" w="full" minW="600px">
                <Box as="thead" bg="gray.50">
                  <Box as="tr">
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="left"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      Player
                    </Box>
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="center"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      AB
                    </Box>
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="center"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      R
                    </Box>
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="center"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      H
                    </Box>
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="center"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      RBI
                    </Box>
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="center"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      BB
                    </Box>
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="center"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      SO
                    </Box>
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="center"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      AVG
                    </Box>
                  </Box>
                </Box>
                <Box as="tbody">
                  {mlbBoxScore.data.PlayerGames.filter(
                    (player) =>
                      player.TeamID ===
                      (selectedTeam === "away"
                        ? game.AwayTeamID
                        : game.HomeTeamID),
                  )
                    .filter((player) => player.PositionCategory !== "P")
                    .slice(0, 10)
                    .map((player, index) => (
                      <Box
                        as="tr"
                        key={player.PlayerID}
                        bg={index % 2 === 0 ? "white" : "gray.50"}
                      >
                        <Box as="td" px="2" py="1" fontSize="xs">
                          <VStack align="start" gap="0">
                            <Text fontWeight="medium">{player.Name}</Text>
                            <Text fontSize="2xs" color="gray.600">
                              {player.Position}
                            </Text>
                          </VStack>
                        </Box>
                        <Box
                          as="td"
                          px="2"
                          py="1"
                          textAlign="center"
                          fontSize="xs"
                        >
                          {player.AtBats || 0}
                        </Box>
                        <Box
                          as="td"
                          px="2"
                          py="1"
                          textAlign="center"
                          fontSize="xs"
                        >
                          {player.Runs || 0}
                        </Box>
                        <Box
                          as="td"
                          px="2"
                          py="1"
                          textAlign="center"
                          fontSize="xs"
                        >
                          {player.Hits || 0}
                        </Box>
                        <Box
                          as="td"
                          px="2"
                          py="1"
                          textAlign="center"
                          fontSize="xs"
                        >
                          {player.RunsBattedIn || 0}
                        </Box>
                        <Box
                          as="td"
                          px="2"
                          py="1"
                          textAlign="center"
                          fontSize="xs"
                        >
                          {player.Walks || 0}
                        </Box>
                        <Box
                          as="td"
                          px="2"
                          py="1"
                          textAlign="center"
                          fontSize="xs"
                        >
                          {player.Strikeouts || 0}
                        </Box>
                        <Box
                          as="td"
                          px="2"
                          py="1"
                          textAlign="center"
                          fontSize="xs"
                        >
                          {player.BattingAverage
                            ? player.BattingAverage.toFixed(3)
                            : ".000"}
                        </Box>
                      </Box>
                    ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Pitchers */}
          <Box>
            <Text fontSize="md" fontWeight="bold" mb="3">
              Pitchers
            </Text>
            <Box
              overflowX="auto"
              bg="white"
              borderRadius="lg"
              border="1px"
              borderColor="gray.200"
            >
              <Box as="table" w="full" minW="600px">
                <Box as="thead" bg="gray.50">
                  <Box as="tr">
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="left"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      Player
                    </Box>
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="center"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      IP
                    </Box>
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="center"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      H
                    </Box>
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="center"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      R
                    </Box>
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="center"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      ER
                    </Box>
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="center"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      BB
                    </Box>
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="center"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      SO
                    </Box>
                    <Box
                      as="th"
                      px="2"
                      py="1"
                      textAlign="center"
                      fontSize="xs"
                      fontWeight="bold"
                      color="gray.700"
                    >
                      ERA
                    </Box>
                  </Box>
                </Box>
                <Box as="tbody">
                  {mlbBoxScore.data.PlayerGames.filter(
                    (player) =>
                      player.TeamID ===
                      (selectedTeam === "away"
                        ? game.AwayTeamID
                        : game.HomeTeamID),
                  )
                    .filter((player) => player.PositionCategory === "P")
                    .slice(0, 10)
                    .map((player, index) => (
                      <Box
                        as="tr"
                        key={player.PlayerID}
                        bg={index % 2 === 0 ? "white" : "gray.50"}
                      >
                        <Box as="td" px="2" py="1" fontSize="xs">
                          <VStack align="start" gap="0">
                            <Text fontWeight="medium">{player.Name}</Text>
                            <Text fontSize="2xs" color="gray.600">
                              {player.Position}
                            </Text>
                          </VStack>
                        </Box>
                        <Box
                          as="td"
                          px="2"
                          py="1"
                          textAlign="center"
                          fontSize="xs"
                        >
                          {player.InningsPitchedDecimal
                            ? player.InningsPitchedDecimal.toFixed(1)
                            : "0.0"}
                        </Box>
                        <Box
                          as="td"
                          px="2"
                          py="1"
                          textAlign="center"
                          fontSize="xs"
                        >
                          {player.PitchingHits || 0}
                        </Box>
                        <Box
                          as="td"
                          px="2"
                          py="1"
                          textAlign="center"
                          fontSize="xs"
                        >
                          {player.PitchingRuns || 0}
                        </Box>
                        <Box
                          as="td"
                          px="2"
                          py="1"
                          textAlign="center"
                          fontSize="xs"
                        >
                          {player.PitchingEarnedRuns || 0}
                        </Box>
                        <Box
                          as="td"
                          px="2"
                          py="1"
                          textAlign="center"
                          fontSize="xs"
                        >
                          {player.PitchingWalks || 0}
                        </Box>
                        <Box
                          as="td"
                          px="2"
                          py="1"
                          textAlign="center"
                          fontSize="xs"
                        >
                          {player.PitchingStrikeouts || 0}
                        </Box>
                        <Box
                          as="td"
                          px="2"
                          py="1"
                          textAlign="center"
                          fontSize="xs"
                        >
                          {player.EarnedRunAverage
                            ? player.EarnedRunAverage.toFixed(2)
                            : "0.00"}
                        </Box>
                      </Box>
                    ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
