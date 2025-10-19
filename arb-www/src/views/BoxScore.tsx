import { useEffect, useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Box, VStack, Text } from "@chakra-ui/react";
import { motion } from "motion/react";

import { BoxScoreDetailMLB } from "../components/boxscore/MLB.tsx";
import { BoxScoreDetailNFL } from "../components/boxscore/NFL.tsx";
import { BoxScoreDetailNBA } from "../components/boxscore/NBA.tsx";
import { UnifiedGameFeed } from "../components/UnifiedGameFeed.tsx";
import { TopNavigation } from "../components/TopNavigation.tsx";
import { AppLayout } from "../components/containers/AppLayout.tsx";

import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import { setSelectedLeague } from "../store/slices/sportsDataSlice.ts";
import { League } from "../config.ts";
import useArb from "../services/Arb.ts";

interface BoxScoreProps {
  onBack: () => void;
}

// If you have a shared type for box scores, use that instead of 'any'.
type GameData = any;

/**
 * Extract the correct `Game` object from a league-specific API response.
 * Keeps the main component clean and league-agnostic.
 */
const extractGameFromGameData = (gameData: any, league: string): any => {
  if (!gameData) return undefined;

  switch (league.toLowerCase()) {
    case League.MLB:
      return gameData?.data?.Game;
    case League.NFL:
      // NFL data may nest differently depending on API source
      return gameData?.data?.Score;
    case League.NBA:
      // NBA feeds often wrap under .data.Game or similar
      return gameData?.data?.Game ?? gameData?.Game;
    default:
      return gameData?.data?.Game ?? gameData;
  }
};

export function BoxScore({ onBack }: BoxScoreProps) {
  const { league, gameId } = useParams<{ league: string; gameId: string }>();
  const dispatch = useAppDispatch();

  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );

  // Optional: if you cache per-game data keyed by gameId in Redux, read it here.
  const boxScoreCache = useAppSelector(
    (state) => state.sportsData.boxScoreData,
  ) as Record<string, GameData> | undefined;

  // Non-fetch source of gameData from navigation (e.g., list → details)
  const location = useLocation();
  const navState =
    (location.state as { gameData?: GameData } | undefined) ?? {};

  // "Dumb" way to get gameData without fetching: from nav state or cache
  const gameData: GameData | undefined = useMemo(() => {
    if (navState?.gameData) return navState.gameData;
    if (gameId && boxScoreCache && boxScoreCache[gameId]) {
      return boxScoreCache[gameId];
    }
    return undefined;
  }, [navState?.gameData, gameId, boxScoreCache]);

  // Keep league in global state for the rest of the app, but no fetching here
  useEffect(() => {
    if (league && league !== selectedLeague) {
      dispatch(setSelectedLeague(league));
    }
  }, [league, selectedLeague, dispatch]);

  const normalizedLeague = (league?.toLowerCase() as League) || League.MLB;

  // @ts-expect-error Who cares
  const leagueComponentMap: Record<League, React.ElementType> = {
    [League.MLB]: BoxScoreDetailMLB,
    [League.NFL]: BoxScoreDetailNFL,
    [League.NBA]: BoxScoreDetailNBA,
  };

  const DetailComponent = leagueComponentMap[normalizedLeague];

  // Optional friendly labels from team profiles if we already have them (no fetch)
  const { teamProfiles, standings, fetchStandings } = useArb();

  // Fetch standings for NFL, NBA, and MLB
  useEffect(() => {
    if (
      (normalizedLeague === League.NFL ||
        normalizedLeague === League.NBA ||
        normalizedLeague === League.MLB) &&
      !standings
    ) {
      const currentYear = new Date().getFullYear();
      fetchStandings(normalizedLeague, currentYear);
    }
  }, [normalizedLeague, standings, fetchStandings]);

  // Extract the game object based on the league
  const game = extractGameFromGameData(gameData, normalizedLeague);

  const awayTeamProfile = useMemo(() => {
    if (!teamProfiles?.data || !game?.AwayTeamID) return undefined;
    return teamProfiles.data.find((t: any) => t.TeamID === game.AwayTeamID);
  }, [teamProfiles?.data, game?.AwayTeamID]);

  const homeTeamProfile = useMemo(() => {
    if (!teamProfiles?.data || !game?.HomeTeamID) return undefined;
    return teamProfiles.data.find((t: any) => t.TeamID === game.HomeTeamID);
  }, [teamProfiles?.data, game?.HomeTeamID]);

  const awayTeam = awayTeamProfile?.Name || game?.AwayTeam;
  const homeTeam = homeTeamProfile?.Name || game?.HomeTeam;
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
          {/* Top Navigation */}
          <TopNavigation showLeagueSelector={false} onBack={onBack} />

          {/* Content */}
          <Box flex="1" bg="primary.25">
            <VStack align="stretch">
              {/* Box Score Section */}
              <Box bg="primary.25">
                {DetailComponent ? (
                  <DetailComponent
                    key={gameId}
                    standings={standings}
                    gameId={gameId}
                    league={normalizedLeague}
                    gameData={gameData}
                  />
                ) : (
                  <VStack gap="4" p="4" align="center" justify="center">
                    <Text color="text.400" fontSize="lg" fontWeight="semibold">
                      {normalizedLeague.toUpperCase()} Box Score
                    </Text>
                    <Text color="text.500" textAlign="center">
                      Box score details for {normalizedLeague.toUpperCase()} are
                      not yet supported.
                    </Text>
                  </VStack>
                )}
              </Box>

              {/* Unified Feed Section */}
              <Box flex="1" bg="primary.25" minH="calc(100vh - 300px)">
                <UnifiedGameFeed
                  key={gameId}
                  gameId={gameId as string}
                  league={normalizedLeague}
                  awayTeam={awayTeam}
                  homeTeam={homeTeam}
                  awayTeamKey={awayTeamKey}
                  homeTeamKey={homeTeamKey}
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
