import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import { motion } from "motion/react";

import { BackButton } from "../components/BackButton.tsx";
import { BoxScoreDetailMLB } from "../components/boxscore/MLB.tsx";
import { UnifiedGameFeed } from "../components/UnifiedGameFeed.tsx";
import { MLBSkeleton } from "../components/boxscore/MLBSkeleton.tsx";
import { UnifiedGameFeedSkeleton } from "../components/UnifiedGameFeedSkeleton.tsx";
import { TopNavigation } from "../components/TopNavigation.tsx";
import { AppLayout } from "../components/containers/AppLayout.tsx";

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

  // Get team profiles
  const { teamProfiles, fetchTeamProfiles } = useArb();

  // Redux state
  const boxScoreData = useAppSelector((state) => state.sportsData.boxScoreData);
  const boxScoreError = useAppSelector(
    (state) => state.sportsData.boxScoreError,
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
      dispatch(fetchBoxScore({ league, gameId }));
      fetchTeamProfiles(league);
    }
  }, [gameId, league, dispatch, fetchTeamProfiles]);

  useEffect(() => {
    if (!selectedLeague && league) {
      dispatch(setSelectedLeague(league));
    }
  }, [selectedLeague, league, dispatch]);

  // Extract game data from box score
  useEffect(() => {
    if (boxScoreData[gameId || ""]?.data?.Game) {
      setGameData(boxScoreData[gameId || ""].data.Game);
    }
  }, [boxScoreData, gameId]);

  if (!gameData) {
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

  if (boxScoreError) {
    return (
      <Box minH="100vh" bg="primary.25">
        <Box
          bg="primary.25"
          borderBottom="1px"
          borderColor="border.100"
          px="4"
          py="3"
        >
          <HStack justify="space-between" align="center">
            <BackButton onClick={onBack} />
            <Box w="8" /> {/* Spacer */}
          </HStack>
        </Box>

        <VStack gap="4" p="4" align="center" justify="center" minH="60vh">
          <Text color="red.500" fontSize="lg" fontWeight="semibold">
            Error Loading Game
          </Text>
          <Text color="text.400" textAlign="center">
            {boxScoreError}
          </Text>
        </VStack>
      </Box>
    );
  }

  if (!gameData) {
    return (
      <Box minH="100vh" bg="primary.25">
        <Box
          bg="primary.25"
          borderBottom="1px"
          borderColor="border.100"
          px="4"
          py="3"
        >
          <HStack justify="space-between" align="center">
            <BackButton onClick={onBack} />
            <Text fontSize="lg" fontWeight="semibold" color="text.400">
              Game Details
            </Text>
            <Box w="8" /> {/* Spacer */}
          </HStack>
        </Box>

        <VStack gap="4" p="4" align="center" justify="center" minH="60vh">
          <Text color="text.400" fontSize="lg" fontWeight="semibold">
            No Game Data
          </Text>
          <Text color="text.500" textAlign="center">
            Unable to load game information
          </Text>
        </VStack>
      </Box>
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
