import { useEffect } from "react";
import { Box, VStack, HStack, Text, Image, Flex } from "@chakra-ui/react";
import useArb from "../../services/Arb.ts";
import { useAppSelector, useAppDispatch } from "../../store/hooks.ts";
import { fetchBoxScore } from "../../store/slices/sportsDataSlice.ts";

// Internal imports - components
import { Bases } from "../Bases.tsx";
import { InningBadge } from "../badge";

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
  const reduxBoxScore = boxScoreData[gameId as keyof typeof boxScoreData];

  // Fetch data when component mounts
  useEffect(() => {
    fetchTeamProfiles(League.MLB);
    fetchStadiums(League.MLB);
  }, [fetchTeamProfiles, fetchStadiums]);

  // Fetch box score data
  useEffect(() => {
    if (gameId && league && !reduxBoxScore) {
      dispatch(fetchBoxScore({ league: League.MLB, gameId }));
    }
  }, [gameId, dispatch]);

  // Show loading state if no game data yet
  if (!reduxBoxScore?.data?.Game && !mlbBoxScore?.data?.Game) {
    return (
      <Box
        minH="100vh"
        bg="primary.25"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Text color="gray.600" fontSize="lg" fontWeight="semibold">
            Loading Game Data...
          </Text>
          <Text color="gray.500" textAlign="center">
            Fetching game information
          </Text>
        </VStack>
      </Box>
    );
  }

  // Get game data - prioritize Redux data if available
  const game = reduxBoxScore?.data?.Game || mlbBoxScore?.data?.Game;

  if (!game) {
    return (
      <Box
        minH="100vh"
        bg="primary.25"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Text color="gray.600" fontSize="lg" fontWeight="semibold">
            No Game Data
          </Text>
          <Text color="gray.500" textAlign="center">
            Unable to load game information
          </Text>
        </VStack>
      </Box>
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
      <Box
        minH="100vh"
        bg="primary.25"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Text color="gray.600" fontSize="lg" fontWeight="semibold">
            Team Data Not Found
          </Text>
          <Text color="gray.500" textAlign="center">
            Unable to load team information
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <HideVerticalScroll bg="primary.25">
      {/* Main Game Information - NO HEADER in V2 */}
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
                borderRadius="full"
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
                    objectFit="cover"
                  />
                ) : (
                  <Box w="full" h="full" bg="text.200" borderRadius="full" />
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
                      borderRadius="full"
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
                      borderRadius="full"
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
                    objectFit="cover"
                  />
                ) : (
                  <Box w="full" h="full" bg="text.200" />
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
                      borderRadius="full"
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

          {/* Bottom row - Game info */}
          <HStack gap="2" w="full" justify={"center"}>
            <HStack gap="4" align="center">
              {stadium && (
                <Text fontSize="xs" color="text.400">
                  {orEmpty(stadium.Name)} •
                </Text>
              )}
            </HStack>
            {game.Weather && (
              <Text fontSize="xs" color="text.400">
                {orEmpty(game.Weather)}
                {game.Temperature && ` • ${game.Temperature}°F`}
              </Text>
            )}

            {/* TV and Odds Information */}
            <VStack gap="0" align="center" lineHeight="1">
              {/* Odds Information */}
              {(() => {
                const odds = (() => {
                  // Check if odds are directly on the game object (schedule format)
                  if (game.HomeTeamMoneyLine !== undefined) {
                    return {
                      homeMoneyLine: game.HomeTeamMoneyLine,
                      awayMoneyLine: game.AwayTeamMoneyLine,
                      homePointSpread: game.PointSpreadHomeTeamMoneyLine,
                      awayPointSpread: game.PointSpreadAwayTeamMoneyLine,
                      overUnder: game.OverUnder,
                      sportsbook: game.Sportsbook || "Unknown",
                    };
                  }

                  // Check if odds are in PregameOdds/LiveOdds arrays (scores format)
                  if (game.PregameOdds || game.LiveOdds) {
                    const pregameOdds = game.PregameOdds?.[0];
                    const liveOdds = game.LiveOdds?.[0];
                    const oddsEntry = liveOdds || pregameOdds;

                    if (oddsEntry) {
                      return {
                        homeMoneyLine: oddsEntry.HomeTeamMoneyLine,
                        awayMoneyLine: oddsEntry.AwayTeamMoneyLine,
                        homePointSpread: oddsEntry.PointSpreadHomeTeamMoneyLine,
                        awayPointSpread: oddsEntry.PointSpreadAwayTeamMoneyLine,
                        overUnder: oddsEntry.OverUnder,
                        sportsbook: oddsEntry.Sportsbook || "Unknown",
                      };
                    }
                  }

                  return null;
                })();

                if (!odds) return null;

                return (
                  <HStack>
                    <Text fontSize="xs" color="text.400">
                      {odds.homeMoneyLine && odds.awayMoneyLine && (
                        <>
                          ML: {odds.awayMoneyLine}/{odds.homeMoneyLine} •
                        </>
                      )}
                    </Text>
                    <Text fontSize="xs" color="text.400">
                      {odds.overUnder && <> • O/U: {odds.overUnder}</>}
                    </Text>
                  </HStack>
                );
              })()}
            </VStack>
          </HStack>
        </VStack>
      </Box>
    </HideVerticalScroll>
  );
}
