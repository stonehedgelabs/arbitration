import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, VStack, HStack, Text, Spinner } from "@chakra-ui/react";
import { motion } from "motion/react";

import { BackButton } from "../components/BackButton";
import { BoxScoreDetailMLB } from "../components/boxscore/BoxScoreDetailMLB";
import { UnifiedGameFeed } from "../components/UnifiedGameFeed";
import { Skeleton } from "../components/Skeleton";

import { useAppSelector, useAppDispatch } from "../store/hooks";
import { fetchBoxScore } from "../store/slices/sportsDataSlice";
import { League } from "../config";

interface GameDetailV2Props {
  onBack: () => void;
}

export function GameDetailV2({ onBack }: GameDetailV2Props) {
  const { league, gameId } = useParams<{ league: string; gameId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const boxScoreData = useAppSelector((state) => state.sportsData.boxScoreData);
  const boxScoreLoading = useAppSelector(
    (state) => state.sportsData.boxScoreLoading,
  );
  const boxScoreError = useAppSelector(
    (state) => state.sportsData.boxScoreError,
  );
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );

  const [gameData, setGameData] = useState<any>(null);

  // Fetch box score data when component mounts
  useEffect(() => {
    if (gameId && league) {
      // dispatch(fetchBoxScore({ league, gameId }));
    }
  }, [gameId, league, dispatch]);

  // Extract game data from box score
  useEffect(() => {
    if (boxScoreData[gameId || ""]?.data?.Game) {
      setGameData(boxScoreData[gameId || ""].data.Game);
    }
  }, [boxScoreData, gameId]);

  // Handle refresh
  const handleRefresh = async () => {
    if (gameId && league) {
      //  dispatch(fetchBoxScore({ league, gameId }));
    }
  };

  if (boxScoreLoading && !gameData) {
    return (
      <Box minH="100vh" bg="primary.25">
        {/* Header Skeleton */}
        <Box
          bg="primary.25"
          borderBottom="1px"
          borderColor="border.100"
          px="4"
          py="3"
        >
          <HStack justify="space-between" align="center">
            <Skeleton w="8" h="8" borderRadius="md" />
            <Skeleton w="16" h="4" />
          </HStack>
        </Box>

        {/* Content Skeleton */}
        <VStack gap="4" p="4">
          <Skeleton w="full" h="200px" borderRadius="lg" />
          <Skeleton w="full" h="300px" borderRadius="lg" />
        </VStack>
      </Box>
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
            <BackButton onBack={onBack} />
            <Text fontSize="lg" fontWeight="semibold" color="text.400">
              Game Details
            </Text>
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
            <BackButton onBack={onBack} />
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
  const awayTeam = gameData.AwayTeam || "Away Team";
  const homeTeam = gameData.HomeTeam || "Home Team";

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      <Box minH="100vh" bg="primary.25">
        {/* Header */}
        <Box
          bg="primary.25"
          borderBottom="1px"
          borderColor="border.100"
          px="4"
          py="3"
          position="sticky"
          top="0"
          zIndex="10"
        >
          <HStack justify="space-between" align="center">
            <BackButton onBack={onBack} />
            <Text fontSize="lg" fontWeight="semibold" color="text.400">
              {awayTeam} vs {homeTeam}
            </Text>
            <Box w="8" /> {/* Spacer */}
          </HStack>
        </Box>

        {/* Content */}
        <VStack gap="0" align="stretch">
          {/* Box Score Section - Compressed */}
          <Box
            bg="primary.25"
            borderBottom="1px"
            borderColor="border.100"
            maxH="300px"
            overflow="hidden"
          >
            {selectedLeague === League.MLB ? (
              <Box transform="scale(0.8)" transformOrigin="top center">
                <BoxScoreDetailMLB
                  gameId={gameId || ""}
                  onBack={onBack}
                  hideHeader={true}
                  hideSocial={true}
                />
              </Box>
            ) : (
              <VStack
                gap="4"
                p="4"
                align="center"
                justify="center"
                minH="200px"
              >
                <Text color="text.400" fontSize="lg" fontWeight="semibold">
                  {selectedLeague.toUpperCase()} Box Score
                </Text>
                <Text color="text.500" textAlign="center">
                  Box score details for {selectedLeague.toUpperCase()} are not
                  yet supported.
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
              league={selectedLeague as League}
              onRefresh={handleRefresh}
            />
          </Box>
        </VStack>
      </Box>
    </motion.div>
  );
}
