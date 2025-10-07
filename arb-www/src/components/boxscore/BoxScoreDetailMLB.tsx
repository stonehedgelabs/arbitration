import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  IconButton,
  Image,
  Flex,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";
import useArb from "../../services/Arb.ts";
import { useAppSelector, useAppDispatch } from "../../store/hooks.ts";
import {
  fetchBoxScore,
  setBoxscoreView,
  findRedditGameThread,
} from "../../store/slices/sportsDataSlice.ts";

// Internal imports - components
import { Skeleton, SkeletonCircle } from "../Skeleton.tsx";
import { Bases } from "../Bases.tsx";
import { InningBadge } from "../badge";

// Internal imports - containers
import { HideVerticalScroll, HideHorizontalScroll } from "../containers";

// Internal imports - social components
import { BoxScoreSocial } from "./social/BoxScoreSocial";

// Internal imports - utils
import { orEmpty } from "../../utils.ts";

// Internal imports - config
import {
  mapApiStatusToGameStatus,
  getStatusDisplayText,
  League,
} from "../../config.ts";

// Internal imports - teams data
import { allTeams, getTeamSubredditByName } from "../../teams.ts";

interface BoxScoreDetailMLBProps {
  gameId: string;
  onBack: () => void;
}

// Box Score Skeleton Components
const BoxScoreHeaderSkeleton = () => {
  return (
    <Box
      bg="text.200"
      px="4"
      py="3"
      borderBottom="1px"
      borderColor="border.100"
    >
      <HStack justify="space-between" align="center">
        <Skeleton w="8" h="8" borderRadius="md" bg="text.200" />
        <Skeleton w="16" h="4" bg="text.200" />
      </HStack>
    </Box>
  );
};

const BoxScoreMainSkeleton = () => {
  return (
    <Box px="8" py="4">
      {/* Game Title Skeleton */}
      <Skeleton w="80%" h="4" mx="auto" mb="4" bg="text.200" />

      {/* Scoreboard Skeleton */}
      <Flex justify="space-between" align="center" mb="4">
        {/* Away Team */}
        <VStack gap="3" align="center" flex="1">
          <SkeletonCircle size="12" bg="text.200" />
          <VStack gap="1" align="center">
            <Skeleton w="20" h="3" bg="text.200" />
            <Skeleton w="16" h="3" bg="text.200" />
          </VStack>
          <Skeleton w="16" h="12" bg="text.200" />
          {/* Strikes */}
          <VStack gap="1" align="center">
            <HStack gap="0.5">
              <Skeleton w="2" h="2" borderRadius="full" bg="text.200" />
              <Skeleton w="2" h="2" borderRadius="full" bg="text.200" />
            </HStack>
            <Skeleton w="12" h="3" bg="text.200" />
          </VStack>
        </VStack>

        {/* Center - Game State */}
        <VStack gap="4" align="center" flex="1">
          <Skeleton w="24" h="4" bg="text.200" />
          {/* Baseball Diamond */}
          <Skeleton w="12" h="12" borderRadius="md" bg="text.200" />
        </VStack>

        {/* Home Team */}
        <VStack gap="3" align="center" flex="1">
          <SkeletonCircle size="12" bg="text.200" />
          <VStack gap="1" align="center">
            <Skeleton w="20" h="3" bg="text.200" />
            <Skeleton w="16" h="3" bg="text.200" />
          </VStack>
          <Skeleton w="16" h="12" bg="text.200" />
          {/* Balls */}
          <VStack gap="1" align="center">
            <HStack gap="0.5">
              <Skeleton w="2" h="2" borderRadius="full" bg="text.200" />
              <Skeleton w="2" h="2" borderRadius="full" bg="text.200" />
              <Skeleton w="2" h="2" borderRadius="full" bg="text.200" />
              <Skeleton w="2" h="2" borderRadius="full" bg="text.200" />
            </HStack>
            <Skeleton w="12" h="3" bg="text.200" />
          </VStack>
        </VStack>
      </Flex>
    </Box>
  );
};

const BoxScoreStatsSkeleton = () => {
  return (
    <Box px="8" py="4">
      {/* Team Tabs */}
      <VStack gap="2" mb="4">
        <Skeleton w="100%" h="16" borderRadius="md" bg="text.200" />
        <Skeleton w="100%" h="8" borderRadius="md" bg="text.200" />
      </VStack>

      {/* Stats Table */}
      <VStack gap="2" align="stretch">
        {Array.from({ length: 6 }, (_, index) => (
          <HStack key={index} justify="space-between" align="center" py="2">
            <Skeleton w="16" h="4" bg="text.200" />
            <Skeleton w="8" h="4" bg="text.200" />
            <Skeleton w="8" h="4" bg="text.200" />
            <Skeleton w="8" h="4" bg="text.200" />
            <Skeleton w="8" h="4" bg="text.200" />
            <Skeleton w="8" h="4" bg="text.200" />
            <Skeleton w="8" h="4" bg="text.200" />
            <Skeleton w="8" h="4" bg="text.200" />
            <Skeleton w="8" h="4" bg="text.200" />
            <Skeleton w="8" h="4" bg="text.200" />
            <Skeleton w="8" h="4" bg="text.200" />
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

const BoxScoreGameInfoSkeleton = () => {
  return (
    <Box px="8" py="4">
      <Skeleton w="full" h="32" borderRadius="lg" bg="text.200" />
    </Box>
  );
};

export function BoxScoreDetailMLB({ gameId, onBack }: BoxScoreDetailMLBProps) {
  const {
    mlbBoxScore,
    teamProfiles,
    stadiums,
    fetchTeamProfiles,
    fetchStadiums,
  } = useArb();

  // Get league from URL path (e.g., /scores/mlb/76782 -> mlb)
  const pathParts = window.location.pathname.split("/");
  const leagueFromUrl = pathParts[2]; // /scores/mlb/76782 -> mlb

  // Get selectedLeague from Redux state
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );

  // Use league from URL if available, otherwise fall back to Redux state
  const currentLeague = leagueFromUrl || selectedLeague;

  // Get box score data from Redux state (persists across navigation)
  const dispatch = useAppDispatch();
  const boxScoreData = useAppSelector((state) => state.sportsData.boxScoreData);
  const reduxBoxScore = boxScoreData[gameId as keyof typeof boxScoreData];
  const [selectedTeam, setSelectedTeam] = useState<"away" | "home">("away");

  // Get boxscore view state
  const boxscoreView = useAppSelector((state) => state.sportsData.boxscoreView);

  // Helper function to get odds for this specific game
  const getGameOdds = () => {
    if (!game) return null;

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
      const selectedOdds = liveOdds || pregameOdds;

      if (!selectedOdds) return null;

      return {
        homeMoneyLine: selectedOdds.HomeTeamMoneyLine,
        awayMoneyLine: selectedOdds.AwayTeamMoneyLine,
        homePointSpread: selectedOdds.PointSpreadHomeTeamMoneyLine,
        awayPointSpread: selectedOdds.PointSpreadAwayTeamMoneyLine,
        overUnder: selectedOdds.OverUnder,
        sportsbook: selectedOdds.Sportsbook || "Unknown",
      };
    }

    return null;
  };

  useEffect(() => {
    // Only fetch if we don't have the data
    if (reduxBoxScore) {
      return;
    }

    // Use Redux thunk to fetch box score data
    dispatch(fetchBoxScore({ league: currentLeague, gameId }));
  }, [gameId, dispatch, reduxBoxScore, currentLeague]);

  // Separate useEffect for supporting data to avoid dependency issues
  useEffect(() => {
    // Fetch supporting data - service layer will handle duplicate prevention
    fetchTeamProfiles(currentLeague);
    fetchStadiums(currentLeague);
  }, [currentLeague, fetchTeamProfiles, fetchStadiums]);

  // Use Redux data if available, otherwise use local data
  const gameData = reduxBoxScore || mlbBoxScore;
  const game = gameData?.data?.Game;

  // Get odds for this game
  const gameOdds = getGameOdds();

  // Helper function to get stadium information
  const getStadiumInfo = () => {
    if (!stadiums?.data || !game?.StadiumID) return null;
    return stadiums.data.find(
      (stadium: any) => stadium.StadiumID === game.StadiumID,
    );
  };

  const stadium = getStadiumInfo();

  // Get team profiles for colors and logos
  const awayTeamProfile = teamProfiles?.data?.find(
    (team) => team.Key === game?.AwayTeam,
  );
  const homeTeamProfile = teamProfiles?.data?.find(
    (team) => team.Key === game?.HomeTeam,
  );

  // Reddit thread request when game data is available
  useEffect(() => {
    if (game && awayTeamProfile && homeTeamProfile) {
      // Find subreddits for both teams using the new function
      const awaySubreddit = getTeamSubredditByName(
        awayTeamProfile.Name,
        selectedLeague as League,
      );
      const homeSubreddit = getTeamSubredditByName(
        homeTeamProfile.Name,
        selectedLeague as League,
      );

      // Search for game threads for both teams
      if (awaySubreddit) {
        dispatch(
          findRedditGameThread({
            subreddit: awaySubreddit.replace("r/", ""),
            league: currentLeague,
          }),
        );
      }
      if (homeSubreddit) {
        dispatch(
          findRedditGameThread({
            subreddit: homeSubreddit.replace("r/", ""),
            league: currentLeague,
          }),
        );
      }
    }
  }, [game, awayTeamProfile, homeTeamProfile, dispatch]);

  // Show loading state only if we don't have data in Redux and we're not currently fetching
  if (!reduxBoxScore && !mlbBoxScore?.data) {
    return (
      <Box minH="100vh" bg="text.200">
        <BoxScoreHeaderSkeleton />
        <BoxScoreMainSkeleton />
        <BoxScoreStatsSkeleton />
        <BoxScoreGameInfoSkeleton />
      </Box>
    );
  }

  const awayTeamColor = awayTeamProfile?.PrimaryColor || "#1a365d";
  const homeTeamColor = homeTeamProfile?.PrimaryColor || "#1a365d";

  // Toggle handler for Stats/Social view
  const handleViewToggle = (view: "stats" | "social") => {
    dispatch(setBoxscoreView(view));
  };

  // Helper function to get team subreddit
  const getTeamSubreddit = (teamName: string) => {
    const team = allTeams.find((t) => t.name === teamName);
    return team?.subreddit || "r/baseball";
  };

  return (
    <HideVerticalScroll minH="100vh" bg="primary.25">
      {/* Header with Back Button */}
      <Box px="4" py="3" borderBottom="1px" borderColor="border.100">
        <HStack justify="space-between" align="center">
          <IconButton
            aria-label="Go back"
            variant="ghost"
            size="sm"
            onClick={onBack}
            color="text.500"
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Text fontSize="sm"></Text>
        </HStack>
      </Box>

      {/* Main Game Information */}
      <Box px="8" py="4">
        {/* Game Title */}
        {game.SeriesInfo && (
          <Text textAlign="center" fontSize="sm" color="text.400" mb="4">
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

        {/* Stats/Social Toggle */}
        <HStack justify="center" mb="4">
          <Box bg="text.100" borderRadius="lg" p="1" display="flex" gap="0">
            <Button
              size="xs"
              variant="ghost"
              onClick={() => handleViewToggle("stats")}
              bg={boxscoreView === "stats" ? "white" : "transparent"}
              color={boxscoreView === "stats" ? "text.600" : "text.400"}
              borderRadius="md"
              px="2"
              fontSize="xs"
              height="6"
              _hover={{
                bg: boxscoreView === "stats" ? "white" : "text.50",
              }}
              _active={{
                bg: boxscoreView === "stats" ? "white" : "text.50",
              }}
              boxShadow={boxscoreView === "stats" ? "sm" : "none"}
            >
              Stats
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => handleViewToggle("social")}
              bg={boxscoreView === "social" ? "white" : "transparent"}
              color={boxscoreView === "social" ? "text.600" : "text.400"}
              borderRadius="md"
              px="2"
              fontSize="xs"
              height="6"
              _hover={{
                bg: boxscoreView === "social" ? "white" : "text.50",
              }}
              _active={{
                bg: boxscoreView === "social" ? "white" : "text.50",
              }}
              boxShadow={boxscoreView === "social" ? "sm" : "none"}
            >
              Social
            </Button>
          </Box>
        </HStack>

        {/* Scoreboard */}
        <VStack gap="4" mb="4">
          {/* Top row - Team info and scores */}
          <Flex justify="space-between" align="center" w="full">
            {/* Away Team */}
            <VStack gap="2" align="center" flex="1">
              {awayTeamProfile?.WikipediaLogoUrl ? (
                <Image
                  src={awayTeamProfile.WikipediaLogoUrl}
                  alt={game.AwayTeam}
                  boxSize="12"
                />
              ) : (
                <Box boxSize="12" bg="primary.25" borderRadius="full" />
              )}
              <VStack gap="0" align="center">
                <Text fontSize="xs" color="text.400">
                  5 {game.AwayTeam}
                </Text>
                <Text fontSize="xs" color="text.400">
                  90-72
                </Text>
              </VStack>
              <Text fontSize="4xl" fontWeight="bold" color="text.400">
                {game.AwayTeamRuns || 0}
              </Text>
            </VStack>

            {/* Center - Game State */}
            <VStack gap="3" align="center" flex="1">
              {game.Status === "Final" ? (
                <Text fontSize="sm" color="text.400" fontWeight="medium">
                  Final
                </Text>
              ) : game.Inning && game.InningHalf ? (
                <InningBadge
                  inningNumber={game.Inning}
                  inningHalf={game.InningHalf}
                  league={selectedLeague as League}
                  size="md"
                />
              ) : (
                <Text fontSize="sm" color="text.400" fontWeight="medium">
                  {game.InningDescription ||
                    getStatusDisplayText(
                      mapApiStatusToGameStatus(game.Status || ""),
                    )}
                </Text>
              )}
              {/* Baseball Diamond with Base Runners */}
              <Bases
                runnerOnFirst={game.RunnerOnFirst}
                runnerOnSecond={game.RunnerOnSecond}
                runnerOnThird={game.RunnerOnThird}
                size="md"
              />
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
                <Box boxSize="12" bg="text.200" borderRadius="full" />
              )}
              <VStack gap="0" align="center">
                <Text fontSize="xs" color="text.400">
                  4 {game.HomeTeam}
                </Text>
                <Text fontSize="xs" color="text.400">
                  92-70
                </Text>
              </VStack>
              <Text fontSize="4xl" fontWeight="bold" color="text.400">
                {game.HomeTeamRuns || 0}
              </Text>
            </VStack>
          </Flex>

          {/* Bottom row - Balls, Outs, Strikes */}
          <Flex justify="space-between" align="center" w="full">
            {/* Strikes for Away Team (left side) */}
            <VStack gap="0.5" align="center" flex="1">
              <HStack gap="0.5">
                {[1, 2].map((i) => (
                  <Box
                    key={i}
                    w="2"
                    h="2"
                    borderRadius="full"
                    bg={
                      game.Strikes && game.Strikes >= i ? "red.500" : "text.300"
                    }
                  />
                ))}
              </HStack>
              <Text fontSize="xs" color="text.500">
                Strikes
              </Text>
            </VStack>

            {/* Outs - centered */}
            <VStack gap="0.5" align="center" flex="1">
              <HStack gap="0.5">
                {[1, 2].map((i) => (
                  <Box
                    key={i}
                    w="2"
                    h="2"
                    borderRadius="full"
                    bg={game.Outs && game.Outs >= i ? "yellow.500" : "text.300"}
                  />
                ))}
              </HStack>
              <Text fontSize="xs" color="text.500">
                Outs
              </Text>
            </VStack>

            {/* Balls for Home Team (right side) */}
            <VStack gap="0.5" align="center" flex="1">
              <HStack gap="0.5">
                {[1, 2, 3, 4].map((i) => (
                  <Box
                    key={i}
                    w="2"
                    h="2"
                    borderRadius="full"
                    bg={game.Balls && game.Balls >= i ? "blue.500" : "text.300"}
                  />
                ))}
              </HStack>
              <Text fontSize="xs" color="text.500">
                Balls
              </Text>
            </VStack>
          </Flex>
        </VStack>

        {/* Game Metadata - 3 Sections */}
        <VStack gap="2" mb="6">
          {/* 1. TV Station */}
          <Box textAlign="center">
            <Text fontSize="xs" color="text.400" lineHeight="1.2">
              TV: {orEmpty(game.Channel)}
            </Text>
          </Box>

          {/* 2. Weather and Venue */}
          <Box textAlign="center">
            <VStack gap="0.5" fontSize="xs" color="text.400" lineHeight="1.2">
              {/* Weather */}
              <HStack justify="center" gap="1.5">
                <HStack gap="0.5">
                  <Text lineHeight="1.2">☀️</Text>
                  <Text lineHeight="1.2">
                    {game.ForecastTempHigh
                      ? `${game.ForecastTempHigh}° F`
                      : "72° F"}
                  </Text>
                  <Text lineHeight="1.2">
                    ({orEmpty(game.ForecastDescription)})
                  </Text>
                </HStack>
                {game.ForecastWindSpeed && (
                  <>
                    <Text lineHeight="1.2">•</Text>
                    <Text lineHeight="1.2">
                      Wind: {game.ForecastWindSpeed} mph
                    </Text>
                  </>
                )}
              </HStack>
              {/* Venue */}
              {stadium && (
                <Text lineHeight="1.2">
                  {stadium.Name &&
                    orEmpty(stadium.Name) !== "--" &&
                    orEmpty(stadium.Name)}
                  {stadium.City &&
                    orEmpty(stadium.City) !== "--" &&
                    `, ${orEmpty(stadium.City)}`}
                  {stadium.State &&
                    orEmpty(stadium.State) !== "--" &&
                    `, ${orEmpty(stadium.State)}`}
                </Text>
              )}
            </VStack>
          </Box>

          {/* 3. Odds */}
          {gameOdds && (
            <Box textAlign="center">
              <VStack gap="0.5" fontSize="xs" color="text.400" lineHeight="1.2">
                <HStack gap="2">
                  {gameOdds.awayMoneyLine !== null &&
                    gameOdds.awayMoneyLine !== undefined && (
                      <Text lineHeight="1.2">
                        {game.AwayTeam}{" "}
                        {gameOdds.awayMoneyLine > 0
                          ? `+${gameOdds.awayMoneyLine}`
                          : gameOdds.awayMoneyLine}
                      </Text>
                    )}
                  {gameOdds.homeMoneyLine !== null &&
                    gameOdds.homeMoneyLine !== undefined && (
                      <Text lineHeight="1.2">
                        {game.HomeTeam}{" "}
                        {gameOdds.homeMoneyLine > 0
                          ? `+${gameOdds.homeMoneyLine}`
                          : gameOdds.homeMoneyLine}
                      </Text>
                    )}
                </HStack>
                {gameOdds.overUnder !== null && (
                  <Text lineHeight="1.2">O/U {gameOdds.overUnder}</Text>
                )}
                {gameOdds.sportsbook && (
                  <Text fontSize="2xs" color="text.500" lineHeight="1.2">
                    via {orEmpty(gameOdds.sportsbook)}
                  </Text>
                )}
              </VStack>
            </Box>
          )}
        </VStack>

        {/* Conditional Content: Stats or Social */}
        {boxscoreView === "stats" ? (
          <>
            {/* {(game.CurrentPitcher || game.CurrentHitter) && (
          <Box mb="6" p="4" bg="text.200" borderRadius="md">
            <Text fontSize="sm" fontWeight="semibold" mb="3" color="text.400">
              Current At-Bat
            </Text>
            <HStack justify="space-between" gap="4">
              {game.CurrentPitcher && (
                <VStack align="center" gap="1">
                  <Text fontSize="xs" color="text.400">
                    Pitcher
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {orEmpty(game.CurrentPitcher)}
                  </Text>
                </VStack>
              )}
              {game.CurrentHitter && (
                <VStack align="center" gap="1">
                  <Text fontSize="xs" color="text.400">
                    Batter
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {orEmpty(game.CurrentHitter)}
                  </Text>
                </VStack>
              )}
            </HStack>
          </Box>
        )} */}

            {/* Starting Pitchers */}
            {/* {(game.AwayTeamStartingPitcher || game.HomeTeamStartingPitcher) && (
          <Box mb="6" p="4" bg="text.200" borderRadius="md">
            <Text fontSize="sm" fontWeight="semibold" mb="3" color="text.400">
              Starting Pitchers
            </Text>
            <HStack justify="space-between" gap="4">
              {game.AwayTeamStartingPitcher && (
                <VStack align="center" gap="1">
                  <Text fontSize="xs" color="text.400">
                    {game.AwayTeam}
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {orEmpty(game.AwayTeamStartingPitcher)}
                  </Text>
                </VStack>
              )}
              {game.HomeTeamStartingPitcher && (
                <VStack align="center" gap="1">
                  <Text fontSize="xs" color="text.400">
                    {game.HomeTeam}
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {orEmpty(game.HomeTeamStartingPitcher)}
                  </Text>
                </VStack>
              )}
            </HStack>
          </Box>
        )} */}

            {/* <Box mt="8">
          <Text fontSize="lg" fontWeight="bold" mb="4">
            Pitcher Information
          </Text>

          <VStack gap="3" align="stretch">
            {/* Starting Pitchers */}
            <Box bg="primary.50" p="4" borderRadius="lg" mb="4">
              <Text fontSize="md" fontWeight="bold" mb="3">
                Starting Pitchers
              </Text>
              <VStack gap="2" align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.400">
                    {game.AwayTeam}:
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {orEmpty(game.AwayTeamStartingPitcher) || "TBD"}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="text.400">
                    {game.HomeTeam}:
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {orEmpty(game.HomeTeamStartingPitcher) || "TBD"}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* {(game.WinningPitcher ||
              game.LosingPitcher ||
              game.SavingPitcher) && (
              <Box bg="text.200" p="4" borderRadius="lg">
                <Text fontSize="md" fontWeight="bold" mb="3" color="text.400">
                  Game Results
                </Text>
                <VStack gap="2" align="stretch">
                  {game.WinningPitcher && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="text.400">
                        Winning Pitcher:
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color="text.400">
                        {game.WinningPitcher}
                      </Text>
                    </HStack>
                  )}
                  {game.LosingPitcher && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="text.400">
                        Losing Pitcher:
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color="text.400">
                        {game.LosingPitcher}
                      </Text>
                    </HStack>
                  )}
                  {game.SavingPitcher && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="text.400">
                        Save:
                      </Text>
                      <Text fontSize="sm" fontWeight="medium" color="text.400">
                        {game.SavingPitcher}
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>
            )} */}
            {/* </VStack>
        </Box> */}

            <Text fontSize="lg" fontWeight="bold" mb="4">
              Game Information
            </Text>
            {/* Innings Summary */}
            {game.Innings && game.Innings.length > 0 && (
              <Box bg="primary.25" p="4" borderRadius="lg" mb="6">
                <Text fontSize="sm" fontWeight="bold" mb="3">
                  Innings Summary
                </Text>
                <HideHorizontalScroll>
                  <VStack gap="1" align="stretch">
                    {/* Inning Numbers Header */}
                    <HStack gap="1" minW="fit-content">
                      <Box minW="8" p="1">
                        <Text fontSize="2xs" color="text.400">
                          Inning
                        </Text>
                      </Box>
                      {game.Innings.slice(0, 9).map((inning, index) => (
                        <Box key={index} minW="8" p="1">
                          <Text fontSize="2xs" color="text.400">
                            {inning.InningNumber}
                          </Text>
                        </Box>
                      ))}
                    </HStack>

                    {/* Away Team Scores */}
                    <HStack gap="1" minW="fit-content">
                      <Box minW="8" p="1">
                        <Text
                          fontSize="2xs"
                          color="text.400"
                          fontWeight="medium"
                        >
                          {game.AwayTeam}
                        </Text>
                      </Box>
                      {game.Innings.slice(0, 9).map((inning, index) => (
                        <Box key={index} minW="8" p="1">
                          <Text fontSize="xs" fontWeight="medium">
                            {inning.AwayTeamRuns}
                          </Text>
                        </Box>
                      ))}
                    </HStack>

                    {/* Home Team Scores */}
                    <HStack gap="1" minW="fit-content">
                      <Box minW="8" p="1">
                        <Text
                          fontSize="2xs"
                          color="text.400"
                          fontWeight="medium"
                        >
                          {game.HomeTeam}
                        </Text>
                      </Box>
                      {game.Innings.slice(0, 9).map((inning, index) => (
                        <Box key={index} minW="8" p="1">
                          <Text fontSize="xs" fontWeight="medium">
                            {inning.HomeTeamRuns}
                          </Text>
                        </Box>
                      ))}
                    </HStack>
                  </VStack>
                </HideHorizontalScroll>
              </Box>
            )}

            {/* Team Selection Toggle */}
            <Box mb="6">
              <Flex
                // bg="primary.300"
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
                  color="text.400"
                  fontWeight="bold"
                  fontSize="lg"
                  onClick={() => setSelectedTeam("away")}
                  boxShadow={
                    selectedTeam === "away"
                      ? "0 4px 8px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)"
                      : "0 2px 4px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.1)"
                  }
                  borderRight="1px solid"
                  borderColor="text.300"
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
                  color="text.400"
                  fontWeight="bold"
                  fontSize="lg"
                  onClick={() => setSelectedTeam("home")}
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
              <VStack gap="3" align="stretch">
                {/* Team Stats */}
                <Box bg="primary.50" p="4" borderRadius="lg">
                  <Text fontSize="md" fontWeight="bold" mb="3">
                    {selectedTeam === "away" ? game.AwayTeam : game.HomeTeam}{" "}
                    Team Stats
                  </Text>
                  <HStack justify="space-between" wrap="wrap" gap="4">
                    <VStack gap="1" align="center">
                      <Text fontSize="sm" color="text.400">
                        Runs
                      </Text>
                      <Text fontSize="lg" fontWeight="bold">
                        {selectedTeam === "away"
                          ? game.AwayTeamRuns || 0
                          : game.HomeTeamRuns || 0}
                      </Text>
                    </VStack>
                    <VStack gap="1" align="center">
                      <Text fontSize="sm" color="text.400">
                        Hits
                      </Text>
                      <Text fontSize="lg" fontWeight="bold">
                        {selectedTeam === "away"
                          ? game.AwayTeamHits || 0
                          : game.HomeTeamHits || 0}
                      </Text>
                    </VStack>
                    <VStack gap="1" align="center">
                      <Text fontSize="sm" color="text.400">
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
                {/* {(selectedTeam === "away"
              ? game.AwayTeamStartingPitcher
              : game.HomeTeamStartingPitcher) && (
              <Box bg="text.200" p="4" borderRadius="lg">
                <Text fontSize="md" fontWeight="bold" mb="3">
                  Starting Pitcher
                </Text>
                <Text fontSize="sm">
                  {selectedTeam === "away"
                    ? orEmpty(game.AwayTeamStartingPitcher)
                    : orEmpty(game.HomeTeamStartingPitcher)}
                </Text>
              </Box>
            )} */}

                {/* Current Game State */}
                {/* {game.CurrentPitcher && (
              <Box bg="text.200" p="4" borderRadius="lg">
                <Text fontSize="md" fontWeight="bold" mb="3">
                  Current Pitcher
                </Text>
                <Text fontSize="sm">{orEmpty(game.CurrentPitcher)}</Text>
              </Box>
            )} */}

                {/* Game Status */}
                <Box bg="primary.50" p="4" borderRadius="lg">
                  <Text fontSize="md" fontWeight="bold" mb="3">
                    Game Status
                  </Text>
                  <VStack gap="2" align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="text.400">
                        Status:
                      </Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {getStatusDisplayText(
                          mapApiStatusToGameStatus(game.Status || ""),
                        )}
                      </Text>
                    </HStack>
                    {game.Inning && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="text.400">
                          Inning:
                        </Text>
                        {game.InningHalf ? (
                          <InningBadge
                            inningNumber={game.Inning}
                            inningHalf={game.InningHalf}
                            league={selectedLeague as League}
                            size="sm"
                          />
                        ) : (
                          <Text fontSize="sm" fontWeight="medium">
                            {game.Inning}
                          </Text>
                        )}
                      </HStack>
                    )}
                    {game.Outs !== undefined && game.Outs !== null && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="text.400">
                          Outs:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {game.Outs}
                        </Text>
                      </HStack>
                    )}
                    {game.Balls !== undefined && game.Balls !== null && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="text.400">
                          Balls:
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {game.Balls}
                        </Text>
                      </HStack>
                    )}
                    {game.Strikes !== undefined && game.Strikes !== null && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="text.400">
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
                <HideHorizontalScroll
                  bg="text.200"
                  borderRadius="lg"
                  border="1px"
                  borderColor="border.100"
                >
                  <Box as="table" w="full" minW="600px">
                    <Box as="thead" bg="text.200">
                      <Box as="tr">
                        <Box
                          as="th"
                          px="2"
                          py="1"
                          textAlign="left"
                          fontSize="xs"
                          fontWeight="bold"
                          color="text.400"
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
                          color="text.400"
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
                          color="text.400"
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
                          color="text.400"
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
                          color="text.400"
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
                          color="text.400"
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
                          color="text.400"
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
                          color="text.400"
                        >
                          AVG
                        </Box>
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {gameData?.data?.PlayerGames.filter(
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
                            bg={index % 2 === 0 ? "primary.25" : "primary.200"}
                          >
                            <Box as="td" px="2" py="1" fontSize="xs">
                              <HStack align="center" gap="1">
                                <Text fontSize="2xs" color="text.400">
                                  {player.Position}
                                </Text>
                                <Text fontWeight="medium">{player.Name}</Text>
                              </HStack>
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
                </HideHorizontalScroll>
              </Box>

              {/* Pitchers */}
              <Box>
                <Text fontSize="md" fontWeight="bold" mb="3">
                  Pitchers
                </Text>
                <HideHorizontalScroll
                  bg="text.200"
                  borderRadius="lg"
                  border="1px"
                  borderColor="border.100"
                >
                  <Box as="table" w="full" minW="600px">
                    <Box as="thead" bg="text.200">
                      <Box as="tr">
                        <Box
                          as="th"
                          px="2"
                          py="1"
                          textAlign="left"
                          fontSize="xs"
                          fontWeight="bold"
                          color="text.400"
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
                          color="text.400"
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
                          color="text.400"
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
                          color="text.400"
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
                          color="text.400"
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
                          color="text.400"
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
                          color="text.400"
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
                          color="text.400"
                        >
                          ERA
                        </Box>
                      </Box>
                    </Box>
                    <Box as="tbody">
                      {gameData?.data?.PlayerGames.filter(
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
                            bg={index % 2 === 0 ? "primary.25" : "text.200"}
                          >
                            <Box as="td" px="2" py="1" fontSize="xs">
                              <HStack align="center" gap="1">
                                <Text fontSize="2xs" color="text.400">
                                  {player.Position}
                                </Text>
                                <Text fontWeight="medium">{player.Name}</Text>
                              </HStack>
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
                </HideHorizontalScroll>
              </Box>
            </Box>
          </>
        ) : (
          <Box px="2" py="2">
            <BoxScoreSocial
              gameId={gameId}
              awayTeam={awayTeamProfile?.Name || game.AwayTeam}
              homeTeam={homeTeamProfile?.Name || game.HomeTeam}
              awayTeamSubreddit={getTeamSubredditByName(
                awayTeamProfile?.Name || game.AwayTeam,
                selectedLeague as League,
              )}
              homeTeamSubreddit={getTeamSubredditByName(
                homeTeamProfile?.Name || game.HomeTeam,
                selectedLeague as League,
              )}
              league={selectedLeague as League}
            />
          </Box>
        )}
      </Box>
    </HideVerticalScroll>
  );
}
