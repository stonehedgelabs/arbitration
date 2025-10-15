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
import { QuarterBadge, StatusBadge } from "../badge";
import { NFLSkeleton } from "./NFLSkeleton";
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

interface BoxScoreDetailNFLProps {
  gameId?: string;
  league?: string;
}

export function BoxScoreDetailNFL({ gameId, league }: BoxScoreDetailNFLProps) {
  const { teamProfiles, stadiums, fetchTeamProfiles, fetchStadiums } = useArb();

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
    fetchTeamProfiles(League.NFL);
    fetchStadiums(League.NFL);
  }, []);

  // Fetch box score data
  useEffect(() => {
    if (gameId && league && !reduxBoxScore) {
      dispatch(fetchBoxScore({ league: League.NFL, gameId }));
    }
  }, [dispatch]);

  // For NFL, the data structure has a 'Score' field (capital S) instead of 'Game'
  // Also handle case where data is returned directly without wrapper
  const game =
    reduxBoxScore?.data?.Score ||
    reduxBoxScore?.data?.score ||
    reduxBoxScore?.data?.Game ||
    reduxBoxScore?.data;

  // Show loading state if we're loading or if no game data yet and no error
  if (isLoadingThisGame || (!game && !boxScoreError)) {
    return <NFLSkeleton />;
  }

  // Show error state if there's an error and no data
  if (boxScoreError && !game) {
    return (
      <ErrorState
        title="Error Loading Game"
        message={boxScoreError}
        showBack={false}
        showRetry={false}
        variant="error"
      />
    );
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

  if (!awayTeamProfile || !homeTeamProfile) {
    return (
      <ErrorState
        title="Team Data Not Found"
        message="Unable to load team information"
        showBack={false}
        showRetry={false}
        variant="warning"
      />
    );
  }

  // Get quarter data for NFL
  const quarters = reduxBoxScore?.data?.Quarters || [];

  return (
    <HideVerticalScroll bg="primary.25">
      {/* Main Game Information - NO HEADER in V2 */}
      <Box px="6" py="2">
        {/* Game Title */}
        <VStack gap="1" mb="4">
          <Text textAlign="center" fontSize="xs" color="text.400">
            Week {game.Week} • {game.Season}
          </Text>
          {/* Game Time */}
          <Text textAlign="center" fontSize="xs" color="text.400">
            {new Date(game.DateTime).toLocaleString()}
          </Text>
        </VStack>

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
                  <Box w="full" h="full" bg="text.200" borderRadius="4xl" />
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
                {orEmpty(game.AwayScore?.toString())}
              </Text>
            </VStack>

            {/* VS and Game Status */}
            <VStack gap="2" align="center" flex="0 0 auto" px="4">
              <Text fontSize="xs" color="text.500" fontWeight="medium">
                VS
              </Text>
              {game.Status === GameStatus.IN_PROGRESS ? (
                <QuarterBadge
                  quarter={game.Quarter}
                  timeRemaining={game.TimeRemaining}
                  size="2xs"
                />
              ) : (
                <StatusBadge status={game.Status} size={"2xs"} />
              )}
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
                  <Box w="full" h="full" bg="text.200" borderRadius="100" />
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
                {orEmpty(game.HomeScore?.toString())}
              </Text>
            </VStack>
          </Flex>

          {/* Quarter-by-Quarter Scores Table */}
          {quarters.length > 0 && (
            <VStack gap="2" w="full" mt="4">
              <Box w="full" overflowX="auto">
                <Table.Root size="sm" variant="outline">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader
                        fontSize="2xs"
                        color="text.500"
                        textAlign="left"
                        bg="text.50"
                        px="2"
                        py="1"
                      ></Table.ColumnHeader>
                      {quarters.map((quarter: any, index: number) => (
                        <Table.ColumnHeader
                          key={quarter.Number || index}
                          fontSize="2xs"
                          color="text.500"
                          textAlign="center"
                          bg="text.50"
                          px="1"
                          py="1"
                        >
                          Q{quarter.Number}
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
                        {awayTeamProfile.Name}
                      </Table.Cell>
                      {quarters.map((quarter: any, index: number) => (
                        <Table.Cell
                          key={quarter.Number || index}
                          fontSize="2xs"
                          color="text.400"
                          textAlign="center"
                          px="1"
                          py="1"
                        >
                          {quarter.AwayTeamScore}
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
                        {game.AwayScore}
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
                        {homeTeamProfile.Name}
                      </Table.Cell>
                      {quarters.map((quarter: any, index: number) => (
                        <Table.Cell
                          key={quarter.Number || index}
                          fontSize="2xs"
                          color="text.400"
                          textAlign="center"
                          px="1"
                          py="1"
                        >
                          {quarter.HomeTeamScore}
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
                        {game.HomeScore}
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Box>
            </VStack>
          )}

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
        </VStack>
      </Box>
    </HideVerticalScroll>
  );
}
