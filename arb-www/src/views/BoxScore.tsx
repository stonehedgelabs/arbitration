import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, VStack, Text } from "@chakra-ui/react";
import { motion } from "motion/react";

import { BoxScoreDetailMLB } from "../components/boxscore/MLB.tsx";
import { BoxScoreDetailNFL } from "../components/boxscore/NFL.tsx";
import { BoxScoreDetailNBA } from "../components/boxscore/NBA.tsx";
import { UnifiedGameFeed } from "../components/UnifiedGameFeed.tsx";
import { MLBSkeleton } from "../components/boxscore/MLBSkeleton.tsx";
import { UnifiedGameFeedSkeleton } from "../components/UnifiedGameFeedSkeleton.tsx";
import { TopNavigation } from "../components/TopNavigation.tsx";
import { AppLayout } from "../components/containers/AppLayout.tsx";
import { ErrorState } from "../components/ErrorStates.tsx";

import { useAppSelector, useAppDispatch } from "../store/hooks.ts";
import {
  fetchBoxScore,
  setSelectedLeague,
} from "../store/slices/sportsDataSlice.ts";
import { League } from "../config.ts";
import useArb from "../services/Arb.ts";

interface BoxScoreProps {
  onBack: () => void;
}

export function BoxScore({ onBack }: BoxScoreProps) {
  const { league, gameId } = useParams<{ league: string; gameId: string }>();
  const dispatch = useAppDispatch();

  // For NFL games, the gameId in the URL is actually the ScoreID
  // For other leagues, the gameId is the GameID
  const isNFL = league?.toLowerCase() === "nfl";
  const actualGameId = gameId; // For NFL, gameId is ScoreID; for others, it's GameID
  const scoreId: string | undefined = isNFL ? gameId : undefined; // For NFL, use gameId as scoreId; for others, no scoreId

  // Get team profiles
  const { teamProfiles, fetchTeamProfiles } = useArb();

  // Redux state
  const boxScoreData = useAppSelector((state) => state.sportsData.boxScoreData);
  const boxScoreError = useAppSelector(
    (state) => state.sportsData.boxScoreError,
  );
  const boxScoreRequests = useAppSelector(
    (state) => state.sportsData.boxScoreRequests,
  );
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );

  const { league: paramLeague } = useParams<{
    league: string;
    gameId: string;
  }>();

  const [gameData, setGameData] = useState<any>(null);

  // Fetch box score data and team profiles when component mounts
  useEffect(() => {
    if (league && gameId) {
      dispatch(
        fetchBoxScore({
          league,
          gameId: actualGameId as string,
          scoreId: scoreId,
        }),
      );
      fetchTeamProfiles(league);
    }
  }, [
    gameId,
    league,
    scoreId,
    actualGameId,
    isNFL,
    dispatch,
    fetchTeamProfiles,
  ]);

  useEffect(() => {
    if (!selectedLeague && league) {
      dispatch(setSelectedLeague(league));
    }
  }, [selectedLeague, league, dispatch]);

  // Extract game data from box score
  useEffect(() => {
    const boxScore = boxScoreData[actualGameId || ""]?.data;
    if (boxScore) {
      // For NFL, the data structure has a 'Score' field (capital S) instead of 'Game'
      const gameData = boxScore.Score || boxScore.score || boxScore.Game;
      if (gameData) {
        setGameData(gameData);
      }
    }
  }, [boxScoreData, actualGameId]);

  // Check if we're currently loading data for this specific game
  const isLoadingThisGame = boxScoreRequests.includes(actualGameId || "");

  // Show loading state if we're loading data for this game OR if we don't have data yet and no error
  if (isLoadingThisGame || (!gameData && !boxScoreError)) {
    return (
      <AppLayout>
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          <Box
            minH="100vh"
            bg="primary.25"
            display="flex"
            flexDirection="column"
          >
            {/* Top Navigation with Back Button */}
            <TopNavigation showLeagueSelector={false} onBack={onBack} />

            {/* Content */}
            <Box
              flex="1"
              minH="calc(100vh - 200px)"
              overflowY="auto"
              bg="primary.25"
            >
              <VStack gap="0" align="stretch">
                {/* Box Score Section - Compressed */}
                <Box
                  bg="primary.25"
                  borderBottom="1px"
                  borderColor="border.100"
                  maxH="250px"
                  overflow="hidden"
                >
                  <Box transform="scale(0.8)" transformOrigin="top center">
                    <MLBSkeleton />
                  </Box>
                </Box>

                {/* Unified Feed Section */}
                <Box flex="1" bg="primary.25" minH="calc(100vh - 300px)">
                  <UnifiedGameFeedSkeleton />
                </Box>
              </VStack>
            </Box>
          </Box>
        </motion.div>
      </AppLayout>
    );
  }

  // Show error state only if there's an error AND we're not loading AND we don't have data for this specific game
  if (boxScoreError && !isLoadingThisGame && !gameData) {
    return (
      <AppLayout>
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          <Box
            minH="100vh"
            bg="primary.25"
            display="flex"
            flexDirection="column"
          >
            {/* Top Navigation with Back Button */}
            <TopNavigation showLeagueSelector={false} onBack={onBack} />

            {/* Error Content */}
            <Box
              flex="1"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <ErrorState
                title="Error Loading Game"
                message={boxScoreError}
                onBack={onBack}
                showBack={true}
                showRetry={false}
                variant="error"
              />
            </Box>
          </Box>
        </motion.div>
      </AppLayout>
    );
  }

  // Get team names for the unified feed
  const awayTeamProfile = teamProfiles?.data?.find(
    (team: any) => team.TeamID === gameData?.AwayTeamID,
  );
  const homeTeamProfile = teamProfiles?.data?.find(
    (team: any) => team.TeamID === gameData?.HomeTeamID,
  );

  const awayTeam = awayTeamProfile?.Name || gameData?.AwayTeam || "Away Team";
  const homeTeam = homeTeamProfile?.Name || gameData?.HomeTeam || "Home Team";
  const awayTeamKey = awayTeamProfile?.Key;
  const homeTeamKey = homeTeamProfile?.Key;

  return (
    <AppLayout>
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <Box minH="100vh" bg="primary.25" display="flex" flexDirection="column">
          {/* Top Navigation with Back Button */}
          <TopNavigation showLeagueSelector={false} onBack={onBack} />

          {/* Content */}
          <Box
            flex="1"
            // minH="calc(100vh - 200px)"
            // overflowY="auto"
            bg="primary.25"
          >
            <VStack align="stretch">
              {/* Box Score Section - Compressed */}
              <Box bg="primary.25">
                {paramLeague === League.MLB ? (
                  <Box transformOrigin="top center">
                    <BoxScoreDetailMLB gameId={gameId} league={paramLeague} />
                  </Box>
                ) : paramLeague === League.NFL ? (
                  <Box transformOrigin="top center">
                    <BoxScoreDetailNFL gameId={gameId} league={paramLeague} />
                  </Box>
                ) : paramLeague === League.NBA ? (
                  <Box transformOrigin="top center">
                    <BoxScoreDetailNBA gameId={gameId} league={paramLeague} />
                  </Box>
                ) : (
                  <VStack
                    gap="4"
                    p="4"
                    align="center"
                    justify="center"
                    // minH="200px"
                  >
                    <Text color="text.400" fontSize="lg" fontWeight="semibold">
                      {selectedLeague.toUpperCase()} Box Score
                    </Text>
                    <Text color="text.500" textAlign="center">
                      Box score details for {selectedLeague.toUpperCase()} are
                      not yet supported.
                    </Text>
                  </VStack>
                )}
              </Box>

              {/* Unified Feed Section */}
              <Box flex="1" bg="primary.25" minH="calc(100vh - 300px)">
                <UnifiedGameFeed
                  gameId={gameId || ""}
                  awayTeam={awayTeam}
                  homeTeam={homeTeam}
                  awayTeamKey={awayTeamKey}
                  homeTeamKey={homeTeamKey}
                  league={selectedLeague as League}
                  gameData={gameData}
                />
              </Box>
            </VStack>
          </Box>
        </Box>
      </motion.div>
    </AppLayout>
  );
}
