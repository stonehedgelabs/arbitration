import { useEffect } from "react";
import { Box, VStack, Text, Image, Flex, Table } from "@chakra-ui/react";
import useArb from "../../services/Arb.ts";
import { useAppSelector, useAppDispatch } from "../../store/hooks.ts";
import { fetchBoxScore } from "../../store/slices/sportsDataSlice.ts";

// Internal imports - components
import { QuarterBadge, StatusBadge } from "../badge";
import { NBASkeleton } from "./NBASkeleton.tsx";
import { ErrorState } from "../ErrorStates";

// Internal imports - containers
import { HideVerticalScroll } from "../containers";

// Internal imports - utils
import { orEmpty, extractDataFromResponse } from "../../utils.ts";

// Internal imports - config
import { mapApiStatusToGameStatus, League, GameStatus } from "../../config.ts";

interface BoxScoreDetailNBAProps {
  gameId?: string;
  league?: string;
}

export function BoxScoreDetailNBA({ gameId, league }: BoxScoreDetailNBAProps) {
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
    fetchTeamProfiles(League.NBA);
    fetchStadiums(League.NBA);
  }, []);

  // Fetch box score data
  useEffect(() => {
    if (gameId && league && !reduxBoxScore) {
      dispatch(fetchBoxScore({ league: League.NBA, gameId }));
    }
  }, []);

  // Show loading state if we're loading or if no game data yet and no error
  if (
    isLoadingThisGame ||
    (!reduxBoxScore?.data?.Game && !reduxBoxScore?.data && !boxScoreError)
  ) {
    return <NBASkeleton />;
  }

  // Show error state if there's an error and no data
  if (boxScoreError && !reduxBoxScore?.data?.Game && !reduxBoxScore?.data) {
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
  // For NBA, the data structure matches the new format directly
  const game = reduxBoxScore?.data?.Game || reduxBoxScore?.data;

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
      {/* Main Game Information */}
      <Box px="6" py="2">
        {/* Game Title */}
        {game.SeriesInfo && (
          <VStack gap="1" mb="4">
            <Text textAlign="center" fontSize="sm" color="text.400">
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
                  leaderText = `Series tied ${awayWins}-${awayWins}`;
                }

                return `Game ${gameNumber} of ${maxLength}, ${leaderText}`;
              })()}
            </Text>
            {/* Game Time */}
            <Text textAlign="center" fontSize="xs" color="text.400">
              {new Date(game.DateTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
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
                borderRadius="sm"
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
                {orEmpty(game.AwayTeamScore?.toString())}
              </Text>
              {/* Away Team Odds */}
              {(() => {
                const hasOdds =
                  game.AwayTeamMoneyLine !== undefined ||
                  game.PointSpread !== undefined;
                if (!hasOdds) return null;

                return (
                  <VStack gap="1" align="center" fontSize="xs">
                    {game.AwayTeamMoneyLine !== undefined && (
                      <Text color="text.400">
                        ML: {game.AwayTeamMoneyLine > 0 ? "+" : ""}
                        {game.AwayTeamMoneyLine}
                      </Text>
                    )}
                    {game.PointSpread !== undefined && (
                      <Text color="text.400">
                        Spread: {game.PointSpread > 0 ? "+" : ""}
                        {game.PointSpread}
                      </Text>
                    )}
                  </VStack>
                );
              })()}
            </VStack>

            {/* Center - Game State */}
            <VStack gap="4" align="center" flex="1">
              {/* Show Quarter badge for live games, status text for others */}
              {mapApiStatusToGameStatus(game.Status) === GameStatus.LIVE &&
              game.Quarter ? (
                <QuarterBadge
                  quarter={game.Quarter}
                  timeRemaining={game.TimeRemaining}
                  timeRemainingMinutes={game.TimeRemainingMinutes}
                  timeRemainingSeconds={game.TimeRemainingSeconds}
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
                {orEmpty(game.HomeTeamScore?.toString())}
              </Text>
              {/* Home Team Odds */}
              {(() => {
                const hasOdds =
                  game.HomeTeamMoneyLine !== undefined ||
                  game.PointSpread !== undefined;
                if (!hasOdds) return null;

                return (
                  <VStack gap="1" align="center" fontSize="xs">
                    {game.HomeTeamMoneyLine !== undefined && (
                      <Text color="text.400">
                        ML: {game.HomeTeamMoneyLine > 0 ? "+" : ""}
                        {game.HomeTeamMoneyLine}
                      </Text>
                    )}
                    {game.PointSpread !== undefined && (
                      <Text color="text.400">
                        Spread: {game.PointSpread > 0 ? "+" : ""}
                        {-game.PointSpread}
                      </Text>
                    )}
                  </VStack>
                );
              })()}
            </VStack>
          </Flex>

          {/* Bottom row - Game info */}
          <VStack gap="2" w="full" align="center">
            {/* Stadium Information */}
            {stadium && (
              <Text fontSize="xs" color="text.400">
                {orEmpty(stadium.Name)}
              </Text>
            )}
          </VStack>

          {/* Quarter-by-Quarter Scores Table */}
          {game.Quarters && game.Quarters.length > 0 && (
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
                      {game.Quarters.map((quarter: any, index: number) => (
                        <Table.ColumnHeader
                          key={quarter.QuarterID || index}
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
                        {game.AwayTeam}
                      </Table.Cell>
                      {game.Quarters.map((quarter: any, index: number) => (
                        <Table.Cell
                          key={quarter.QuarterID || index}
                          fontSize="2xs"
                          color="text.400"
                          textAlign="center"
                          px="1"
                          py="1"
                        >
                          {quarter.AwayScore}
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
                        {game.AwayTeamScore}
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
                      {game.Quarters.map((quarter: any, index: number) => (
                        <Table.Cell
                          key={quarter.QuarterID || index}
                          fontSize="2xs"
                          color="text.400"
                          textAlign="center"
                          px="1"
                          py="1"
                        >
                          {quarter.HomeScore}
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
                        {game.HomeTeamScore}
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
