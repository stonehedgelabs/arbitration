import { useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Flex,
  Table,
} from "@chakra-ui/react";
import useArb from "../../services/Arb.ts";
import { useAppSelector, useAppDispatch } from "../../store/hooks.ts";
import { fetchBoxScore } from "../../store/slices/sportsDataSlice.ts";

// Internal imports - components
import { Bases } from "../Bases.tsx";
import { InningBadge } from "../badge";
import { MLBSkeleton } from "./MLBSkeleton";
import { ErrorState } from "../ErrorStates";

// Internal imports - containers
import { HideVerticalScroll } from "../containers";

// Internal imports - utils
import { orEmpty, extractDataFromResponse } from "../../utils.ts";

// Internal imports - config
import {
  mapApiStatusToGameStatus,
  getStatusDisplayText,
  League,
  GameStatus,
} from "../../config.ts";

interface BoxScoreDetailMLBProps {
  gameId?: string;
  league?: string;
}

export function BoxScoreDetailMLB({ gameId, league }: BoxScoreDetailMLBProps) {
  const {
    mlbBoxScore,
    teamProfiles,
    stadiums,
    fetchTeamProfiles,
    fetchStadiums,
  } = useArb();

  // Get box score data from Redux state (persists across navigation)
  const dispatch = useAppDispatch();
  const boxScoreData = useAppSelector((state) => state.sportsData.boxScoreData);
  const boxScoreError = useAppSelector(
    (state) => state.sportsData.boxScoreError,
  );
  const boxScoreRequests = useAppSelector(
    (state) => state.sportsData.boxScoreRequests,
  );
  const reduxBoxScore = boxScoreData[gameId as keyof typeof boxScoreData];

  // Check if we're currently loading this specific game
  const isLoadingThisGame = boxScoreRequests.includes(gameId || "");

  // Fetch data when component mounts
  useEffect(() => {
    fetchTeamProfiles(League.MLB);
    fetchStadiums(League.MLB);
  }, []);

  // Fetch box score data
  useEffect(() => {
    if (gameId && league && !reduxBoxScore) {
      dispatch(fetchBoxScore({ league: League.MLB, gameId }));
    }
  }, []);

  // Show loading state if we're loading or if no game data yet and no error
  if (
    isLoadingThisGame ||
    (!reduxBoxScore?.data?.Game && !mlbBoxScore?.data?.Game && !boxScoreError)
  ) {
    return <MLBSkeleton />;
  }

  // Show error state if there's an error and no data
  if (boxScoreError && !reduxBoxScore?.data?.Game && !mlbBoxScore?.data?.Game) {
    return (
      <HideVerticalScroll bg="primary.25">
        <Box px="6" py="2">
          <ErrorState
            title="Error Loading Game"
            message={boxScoreError}
            showBack={false}
            showRetry={false}
            variant="error"
          />
        </Box>
      </HideVerticalScroll>
    );
  }

  // Get game data - prioritize Redux data if available
  const game = reduxBoxScore?.data?.Game || mlbBoxScore?.data?.Game;

  if (!game) {
    return null;
  }

  // Get team profiles
  const teamProfilesArray = extractDataFromResponse(teamProfiles);
  const awayTeamProfile = teamProfilesArray.find(
    (team: any) => team.TeamID === game.AwayTeamID,
  );
  const homeTeamProfile = teamProfilesArray.find(
    (team: any) => team.TeamID === game.HomeTeamID,
  );

  // Get stadium
  const stadiumsArray = extractDataFromResponse(stadiums);
  const stadium = stadiumsArray.find(
    (s: any) => s.StadiumID === game.StadiumID,
  );

  // If no team profiles, return null - parent component handles loading/error states
  if (!awayTeamProfile || !homeTeamProfile) {
    return null;
  }

  return (
    <HideVerticalScroll bg="primary.25">
      {/* Main Game Information - NO HEADER in V2 */}
      <Box px="6" py="2">
        {/* Game Title */}
        {game.SeriesInfo && (
          <VStack gap="1" mb="4">
            <Text textAlign="center" fontSize="xs" color="text.400">
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
            {/* Game Time */}
            <Text textAlign="center" fontSize="xs" color="text.400">
              {game.time}
            </Text>
          </VStack>
        )}

        {/* Scoreboard */}
        <VStack gap="2" mb="0">
          {/* Top row - Team info and scores */}
          <Flex justify="space-between" align="center" w="full">
            {/* Away Team */}
            <VStack gap="2" align="center" flex="1">
              <Box
                w="12"
                h="12"
                bg="text.200"
                borderRadius="4xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
              >
                {awayTeamProfile?.WikipediaLogoUrl ? (
                  <Image
                    src={awayTeamProfile.WikipediaLogoUrl}
                    alt={orEmpty(awayTeamProfile.Name)}
                    w="full"
                    h="full"
                    objectFit="contain"
                  />
                ) : (
                  <Box w="full" h="full" bg="text.200" borderRadius="sm" />
                )}
              </Box>
              <VStack gap="0" align="center">
                <Text fontSize="sm" fontWeight="semibold" color="text.400">
                  {orEmpty(awayTeamProfile.Name)}
                </Text>
                <Text fontSize="xs" color="text.500">
                  {orEmpty(awayTeamProfile.City)}
                </Text>
              </VStack>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color="text.400"
                textAlign="center"
              >
                {orEmpty(game.AwayTeamRuns?.toString())}
              </Text>
              {/* Strikes for away team */}
              <VStack gap="1" align="center">
                <HStack gap="1">
                  {Array.from({ length: 2 }, (_, i) => (
                    <Box
                      key={i}
                      w="2"
                      h="2"
                      borderRadius="sm"
                      bg={i < (game.Strikes || 0) ? "red.500" : "text.200"}
                    />
                  ))}
                </HStack>
                <Text fontSize="xs" color="text.500">
                  Strikes
                </Text>
              </VStack>
            </VStack>

            {/* Center - Game State */}
            <VStack gap="4" align="center" flex="1">
              {/* Show Inning badge for live games, status text for others */}
              {mapApiStatusToGameStatus(game.Status) === GameStatus.LIVE &&
              game.Inning ? (
                <InningBadge
                  inningNumber={parseInt(game.Inning) || 1}
                  inningHalf={game.InningHalf}
                  league={League.MLB}
                  size="md"
                />
              ) : (
                <Text fontSize="sm" fontWeight="semibold" color="text.400">
                  {getStatusDisplayText(mapApiStatusToGameStatus(game.Status))}
                </Text>
              )}
              {/* Baseball Diamond */}
              <Box
                w="12"
                h="12"
                bg="primary.25"
                borderRadius="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
              >
                <Bases
                  runnerOnFirst={game.RunnerOnFirst || false}
                  runnerOnSecond={game.RunnerOnSecond || false}
                  runnerOnThird={game.RunnerOnThird || false}
                  size="md"
                />
              </Box>
              {/* Outs */}
              <VStack gap="1" align="center" mt={12}>
                <HStack gap="1">
                  {Array.from({ length: 2 }, (_, i) => (
                    <Box
                      key={i}
                      w="2"
                      h="2"
                      borderRadius="sm"
                      bg={i < (game.Outs || 0) ? "yellow.500" : "text.200"}
                    />
                  ))}
                </HStack>
                <Text fontSize="xs" color="text.500">
                  Outs
                </Text>
              </VStack>
            </VStack>

            {/* Home Team */}
            <VStack gap="2" align="center" flex="1">
              <Box
                w="12"
                h="12"
                bg="text.200"
                borderRadius="4xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
              >
                {homeTeamProfile?.WikipediaLogoUrl ? (
                  <Image
                    src={homeTeamProfile.WikipediaLogoUrl}
                    alt={orEmpty(homeTeamProfile.Name)}
                    w="full"
                    h="full"
                    objectFit="contain"
                  />
                ) : (
                  <Box w="full" h="full" bg="text.200" borderRadius="4xl" />
                )}
              </Box>
              <VStack gap="0" align="center">
                <Text fontSize="sm" fontWeight="semibold" color="text.400">
                  {orEmpty(homeTeamProfile.Name)}
                </Text>
                <Text fontSize="xs" color="text.500">
                  {orEmpty(homeTeamProfile.City)}
                </Text>
              </VStack>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color="text.400"
                textAlign="center"
              >
                {orEmpty(game.HomeTeamRuns?.toString())}
              </Text>
              {/* Balls for home team */}
              <VStack gap="1" align="center">
                <HStack gap="1">
                  {Array.from({ length: 4 }, (_, i) => (
                    <Box
                      key={i}
                      w="2"
                      h="2"
                      borderRadius="sm"
                      bg={i < (game.Balls || 0) ? "blue.500" : "text.200"}
                    />
                  ))}
                </HStack>
                <Text fontSize="xs" color="text.500">
                  Balls
                </Text>
              </VStack>
            </VStack>
          </Flex>

          {/* Game Details */}
          <Box w="full" mt="4" p="4" bg="primary.100" borderRadius="md">
            <VStack gap="2" align="stretch">
              {/* Stadium */}
              {stadium && (
                <HStack justify="space-between" align="center">
                  <Text fontSize="xs" color="text.500">
                    Stadium
                  </Text>
                  <Text fontSize="xs" color="text.400" fontWeight="medium">
                    {stadium.Name}, {stadium.City}, {stadium.State}
                  </Text>
                </HStack>
              )}

              {/* Weather */}
              {game.ForecastDescription && (
                <HStack justify="space-between" align="center">
                  <Text fontSize="xs" color="text.500">
                    Weather
                  </Text>
                  <Text fontSize="xs" color="text.400" fontWeight="medium">
                    {game.ForecastDescription}
                    {game.ForecastTempHigh && `, ${game.ForecastTempHigh}°F`}
                  </Text>
                </HStack>
              )}

              {/* Channel */}
              {game.Channel && (
                <HStack justify="space-between" align="center">
                  <Text fontSize="xs" color="text.500">
                    Channel
                  </Text>
                  <Text fontSize="xs" color="text.400" fontWeight="medium">
                    {game.Channel}
                  </Text>
                </HStack>
              )}

              {/* Status */}
              <HStack justify="space-between" align="center">
                <Text fontSize="xs" color="text.500">
                  Status
                </Text>
                <Text fontSize="xs" color="text.400" fontWeight="medium">
                  {getStatusDisplayText(mapApiStatusToGameStatus(game.Status))}
                </Text>
              </HStack>
            </VStack>
          </Box>

          {/* Inning-by-Inning Scores Table */}
          {game.Innings && game.Innings.length > 0 && (
            <VStack gap="2" w="full" mt="4">
              <Box w="full" overflowX="auto">
                <Table.Root size="sm" variant="outline">
                  <Table.Header bg="primary.200">
                    <Table.Row>
                      <Table.ColumnHeader
                        fontSize="2xs"
                        color="text.500"
                        textAlign="left"
                        bg="text.50"
                        px="2"
                        py="1"
                      ></Table.ColumnHeader>
                      {game.Innings.map((inning: any) => (
                        <Table.ColumnHeader
                          key={inning.InningNumber}
                          fontSize="2xs"
                          color="text.500"
                          textAlign="center"
                          bg="text.50"
                          px="1"
                          py="1"
                        >
                          {inning.InningNumber}
                        </Table.ColumnHeader>
                      ))}
                      <Table.ColumnHeader
                        fontSize="2xs"
                        color="text.500"
                        textAlign="center"
                        bg="text.50"
                        fontWeight="semibold"
                        px="2"
                        py="1"
                      >
                        Total
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell
                        fontSize="2xs"
                        color="text.400"
                        fontWeight="medium"
                        px="2"
                        py="1"
                      >
                        {game.AwayTeam}
                      </Table.Cell>
                      {game.Innings.map((inning: any, index: number) => (
                        <Table.Cell
                          key={inning.InningID || index}
                          fontSize="2xs"
                          color="text.400"
                          textAlign="center"
                          px="1"
                          py="1"
                        >
                          {inning.AwayTeamRuns}
                        </Table.Cell>
                      ))}
                      <Table.Cell
                        fontSize="2xs"
                        color="text.400"
                        textAlign="center"
                        fontWeight="semibold"
                        px="2"
                        py="1"
                      >
                        {game.AwayTeamRuns}
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell
                        fontSize="2xs"
                        color="text.400"
                        fontWeight="medium"
                        px="2"
                        py="1"
                      >
                        {game.HomeTeam}
                      </Table.Cell>
                      {game.Innings.map((inning: any, index: number) => (
                        <Table.Cell
                          key={inning.InningID || index}
                          fontSize="2xs"
                          color="text.400"
                          textAlign="center"
                          px="1"
                          py="1"
                        >
                          {inning.HomeTeamRuns}
                        </Table.Cell>
                      ))}
                      <Table.Cell
                        fontSize="2xs"
                        color="text.400"
                        textAlign="center"
                        fontWeight="semibold"
                        px="2"
                        py="1"
                      >
                        {game.HomeTeamRuns}
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Box>
            </VStack>
          )}
        </VStack>
      </Box>
    </HideVerticalScroll>
  );
}
