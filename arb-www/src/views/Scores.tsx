// React imports
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Third-party library imports
import { Box, Card, HStack, Text, VStack } from "@chakra-ui/react";

// Internal imports - components
import { Skeleton, SkeletonCircle } from "../components/Skeleton";
import {
  MLBScoreCard,
  NBAScoreCard,
  NFLScoreCard,
  NHLScoreCard,
  GenericScoreCard,
} from "../components/cards/score";
import { ErrorState } from "../components/ErrorStates";

// Internal imports - config
import {
  isPostseasonDate,
  League,
  GameStatus,
  mapApiStatusToGameStatus,
  buildApiUrl,
} from "../config";

// Internal imports - components
import { DatePicker } from "../components/DatePicker";

// Internal imports - containers
import { HideVerticalScroll } from "../components/containers";

// Internal imports - schema
// import { MLBScheduleGame } from "../schema"; // No longer needed as we use generic types

// Internal imports - store
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setSelectedDate } from "../store/slices/sportsDataSlice";

// Internal imports - utils
import {
  convertUtcToLocalDate,
  getCurrentLocalDate,
  parseLocalDate,
} from "../utils.ts";

interface Team {
  name: string;
  score: number;
  logo?: string;
}

interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: GameStatus;
  time: string;
  date: string; // Add date field for GameByDate API
  quarter?: string;
  inningHalf?: string;
  // Location/Venue information
  stadium?: string;
  city?: string;
  state?: string;
  country?: string;
  capacity?: number;
  surface?: string;
  weather?: string;
  temperature?: number;
  stadiumId?: number;
  division?: string;
  // Postseason flag
  isPostseason?: boolean;
  // League
  league: League;
  // Base runners
  runnerOnFirst?: boolean;
  runnerOnSecond?: boolean;
  runnerOnThird?: boolean;
  // Odds information
  odds?: {
    homeMoneyLine?: number;
    awayMoneyLine?: number;
    homePointSpread?: number;
    awayPointSpread?: number;
    overUnder?: number;
    sportsbook?: string;
    homeTeam?: {
      moneyLine?: number;
      pointSpread?: number;
    };
    awayTeam?: {
      moneyLine?: number;
      pointSpread?: number;
    };
    total?: number;
    totalOverOdds?: number;
    totalUnderOdds?: number;
  };
}

// Helper function to get game odds
const getGameOdds = (gameId: string, oddsData: any) => {
  if (!oddsData?.data) return null;

  const gameOdds = oddsData.data.find(
    (odds: any) => odds.GameId?.toString() === gameId,
  );

  if (!gameOdds) return null;

  return {
    homeMoneyLine: gameOdds.HomeMoneyLine,
    awayMoneyLine: gameOdds.AwayMoneyLine,
    homePointSpread: gameOdds.HomePointSpread,
    awayPointSpread: gameOdds.AwayPointSpread,
    overUnder: gameOdds.OverUnder,
    sportsbook: gameOdds.Sportsbook,
    homeTeam: {
      moneyLine: gameOdds.HomeMoneyLine,
      pointSpread: gameOdds.HomePointSpread,
    },
    awayTeam: {
      moneyLine: gameOdds.AwayMoneyLine,
      pointSpread: gameOdds.AwayPointSpread,
    },
    total: gameOdds.OverUnder,
    totalOverOdds: gameOdds.OverOdds,
    totalUnderOdds: gameOdds.UnderOdds,
  };
};

// Helper component for team odds display
const TeamOddsDisplay = ({
  odds,
  isAway = false,
  isLoading = false,
}: {
  odds: Game["odds"];
  isAway?: boolean;
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <VStack gap="1" align="stretch" fontSize="xs" w="full">
        {/* Money Line skeleton */}
        <HStack justify="space-between" align="center" w="full">
          <Skeleton w="30%" h="2.5" />
          <Skeleton w="40%" h="2.5" />
        </HStack>
        {/* Point Spread skeleton */}
        <HStack justify="space-between" align="center" w="full">
          <Skeleton w="35%" h="2.5" />
          <Skeleton w="25%" h="2.5" />
        </HStack>
      </VStack>
    );
  }

  if (!odds) {
    return (
      <VStack gap="1" align="stretch" fontSize="xs" w="full">
        <Text color="text.500" textAlign="center">
          No odds
        </Text>
      </VStack>
    );
  }

  const teamOdds = isAway ? odds.awayTeam : odds.homeTeam;
  const total = odds.total;

  return (
    <VStack gap="1" align="stretch" fontSize="xs" w="full">
      {/* Money Line */}
      <HStack justify="space-between" align="center" w="full">
        <Text color="text.500">ML</Text>
        <Text
          color={teamOdds?.moneyLine > 0 ? "green.500" : "text.400"}
          fontWeight="medium"
        >
          {teamOdds?.moneyLine > 0 ? "+" : ""}
          {teamOdds?.moneyLine || "—"}
        </Text>
      </HStack>
      {/* Point Spread */}
      <HStack justify="space-between" align="center" w="full">
        <Text color="text.500">Spread</Text>
        <Text
          color={teamOdds?.pointSpread > 0 ? "green.500" : "text.400"}
          fontWeight="medium"
        >
          {teamOdds?.pointSpread > 0 ? "+" : ""}
          {teamOdds?.pointSpread || "—"}
        </Text>
      </HStack>
    </VStack>
  );
};

// Helper component for game odds display
const GameOddsDisplay = ({
  odds,
  isLoading = false,
}: {
  odds: Game["odds"];
  isLoading?: boolean;
}) => {
  if (isLoading) {
    return (
      <HStack justify="space-between" align="center" fontSize="xs" w="full">
        {/* Total skeleton */}
        <Skeleton w="50%" h="2.5" />
        {/* Sportsbook skeleton */}
        <Skeleton w="35%" h="2.5" />
      </HStack>
    );
  }

  if (!odds) {
    return (
      <HStack justify="space-between" align="center" fontSize="xs" w="full">
        <Text color="text.500">No odds available</Text>
      </HStack>
    );
  }

  return (
    <HStack justify="space-between" align="center" fontSize="xs" w="full">
      <Text color="text.500">
        Total: {odds.total || "—"} ({odds.totalOverOdds > 0 ? "+" : ""}
        {odds.totalOverOdds || "—"})
      </Text>
      <Text color="text.500" fontSize="2xs">
        {odds.sportsbook || "—"}
      </Text>
    </HStack>
  );
};

// Game Card Skeleton Component
const GameCardSkeleton = () => {
  return (
    <Card.Root
      variant="outline"
      size="sm"
      transition="all 0.2s"
      bg="primary.25"
      borderRadius="12px"
      shadow="sm"
      border="1px"
      borderColor="text.400"
    >
      <Card.Body p="4">
        <VStack gap="3" align="stretch">
          {/* Game Status and Time */}
          <HStack justify="space-between" align="center">
            <Skeleton w="20%" h="3" />
            <HStack gap="2">
              <Skeleton w="12" h="5" borderRadius="full" />
              <Skeleton w="16" h="5" borderRadius="full" />
            </HStack>
          </HStack>

          {/* Location */}
          <HStack gap="2" flexWrap="wrap">
            <Skeleton w="24" h="5" borderRadius="full" />
            <Skeleton w="20" h="5" borderRadius="full" />
          </HStack>

          {/* Away Team */}
          <HStack justify="space-between" align="center">
            <HStack gap="3" align="center">
              <SkeletonCircle size="8" />
              <VStack align="start" gap="1">
                <Skeleton w="24" h="3" />
                <Skeleton w="16" h="2" />
              </VStack>
            </HStack>
            <HStack gap="2" align="center">
              <Skeleton w="6" h="5" />
              <Skeleton w="20" h="8" borderRadius="6px" />
            </HStack>
          </HStack>

          {/* Home Team */}
          <HStack justify="space-between" align="center">
            <HStack gap="3" align="center">
              <SkeletonCircle size="8" />
              <VStack align="start" gap="1">
                <Skeleton w="24" h="3" />
                <Skeleton w="16" h="2" />
              </VStack>
            </HStack>
            <HStack gap="2" align="center">
              <Skeleton w="6" h="5" />
              <Skeleton w="20" h="8" borderRadius="6px" />
            </HStack>
          </HStack>

          {/* Game Odds */}
          <Box pt="2" borderTop="1px" borderColor="text.200">
            <Skeleton w="full" h="3" />
          </Box>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

// Convert game data to Game format (works for all leagues)
const convertGameToGame = (
  rawGame: any,
  teamProfiles: any,
  stadiums: any,
  league: League,
  oddsData?: any,
): Game | null => {
  // Map API status to our status format
  const getStatus = (apiStatus: string): GameStatus => {
    return mapApiStatusToGameStatus(apiStatus);
  };

  // Helper functions to get team profiles and stadiums
  const getTeamProfile = (teamName: string) => {
    if (!teamProfiles?.data) return null;
    return teamProfiles.data.find(
      (team: any) => team.Name === teamName || team.Key === teamName,
    );
  };

  const getStadium = (stadiumId?: number) => {
    if (!stadiums?.data || !stadiumId) return null;
    return stadiums.data.find(
      (stadium: any) => stadium.StadiumID === stadiumId,
    );
  };

  // Get team profiles
  const homeTeamProfile = getTeamProfile(rawGame.HomeTeam);
  const awayTeamProfile = getTeamProfile(rawGame.AwayTeam);

  // Get stadium
  const stadium = getStadium(rawGame.StadiumID);

  if (!homeTeamProfile || !awayTeamProfile) {
    return null;
  }

  const gameId = rawGame.GameID.toString();

  const convertedGame: Game = {
    id: gameId,
    homeTeam: {
      name: homeTeamProfile.Name,
      score: rawGame.HomeTeamRuns || 0,
      logo: homeTeamProfile.WikipediaLogoUrl,
    },
    awayTeam: {
      name: awayTeamProfile.Name,
      score: rawGame.AwayTeamRuns || 0,
      logo: awayTeamProfile.WikipediaLogoUrl,
    },
    status: getStatus(rawGame.Status),
    time: rawGame.DateTime || "",
    date: rawGame.DateTime
      ? convertUtcToLocalDate(rawGame.DateTime)
      : new Date().toISOString().split("T")[0],
    quarter: rawGame.Inning || undefined,
    inningHalf: rawGame.InningHalf || undefined,
    // Location/Venue information
    stadium: stadium?.Name,
    city: stadium?.City,
    state: stadium?.State,
    country: stadium?.Country,
    capacity: stadium?.Capacity,
    surface: stadium?.Surface,
    weather: rawGame.Weather,
    temperature: rawGame.Temperature,
    stadiumId: rawGame.StadiumID, // Store stadium ID for potential future lookup
    division: homeTeamProfile?.Division, // Store division for display
    // Postseason flag - determine based on the game date using config
    isPostseason: isPostseasonDate(
      league,
      rawGame.DateTime
        ? convertUtcToLocalDate(rawGame.DateTime)
        : new Date().toISOString().split("T")[0],
    ),
    // Base runners
    runnerOnFirst: rawGame.RunnerOnFirst || false,
    runnerOnSecond: rawGame.RunnerOnSecond || false,
    runnerOnThird: rawGame.RunnerOnThird || false,
    // Odds information
    odds: getGameOdds(gameId, oddsData) || undefined,
    // League
    league: league,
  };

  return convertedGame;
};

// Convert schedule game to Game format
const convertScheduleGameToGame = (
  scheduleGame: any, // Changed from MLBScheduleGame to any for generic support
  teamProfiles: any,
  stadiums: any,
  league: League,
  oddsData?: any,
): Game | null => {
  // Map API status to our status format
  const getStatus = (apiStatus: string): GameStatus => {
    return mapApiStatusToGameStatus(apiStatus);
  };

  // Helper functions to get team profiles and stadiums
  const getTeamProfile = (teamName: string) => {
    if (!teamProfiles?.data) return null;
    return teamProfiles.data.find(
      (team: any) => team.Name === teamName || team.Key === teamName,
    );
  };

  const getStadium = (stadiumId?: number) => {
    if (!stadiums?.data || !stadiumId) return null;
    return stadiums.data.find(
      (stadium: any) => stadium.StadiumID === stadiumId,
    );
  };

  // Get team profiles
  const homeTeamProfile = getTeamProfile(scheduleGame.HomeTeam || "");
  const awayTeamProfile = getTeamProfile(scheduleGame.AwayTeam || "");

  // Get stadium
  const stadium = getStadium(scheduleGame.StadiumID);

  if (!homeTeamProfile || !awayTeamProfile) {
    return null;
  }

  const gameId = scheduleGame.GameID.toString();
  const convertedDate = scheduleGame.DateTime
    ? convertUtcToLocalDate(scheduleGame.DateTime)
    : new Date().toISOString().split("T")[0];

  const convertedGame: Game = {
    id: gameId,
    homeTeam: {
      name: homeTeamProfile.Name,
      score: scheduleGame.HomeTeamRuns || 0,
      logo: homeTeamProfile.WikipediaLogoUrl,
    },
    awayTeam: {
      name: awayTeamProfile.Name,
      score: scheduleGame.AwayTeamRuns || 0,
      logo: awayTeamProfile.WikipediaLogoUrl,
    },
    status: getStatus(scheduleGame.Status || ""),
    time: scheduleGame.DateTime || "",
    date: convertedDate,
    quarter: scheduleGame.Inning?.toString() || undefined,
    inningHalf: scheduleGame.InningHalf || undefined,
    // Location/Venue information
    stadium: stadium?.Name,
    city: stadium?.City,
    state: stadium?.State,
    country: stadium?.Country,
    capacity: stadium?.Capacity,
    surface: stadium?.Surface,
    weather: undefined, // Weather not available in schedule data
    temperature: undefined, // Temperature not available in schedule data
    stadiumId: scheduleGame.StadiumID, // Store stadium ID for potential future lookup
    division: homeTeamProfile?.Division, // Store division for display
    // Postseason flag - determine based on the game date using config
    isPostseason: isPostseasonDate(league, convertedDate),
    // Base runners
    runnerOnFirst: scheduleGame.RunnerOnFirst || false,
    runnerOnSecond: scheduleGame.RunnerOnSecond || false,
    runnerOnThird: scheduleGame.RunnerOnThird || false,
    // Odds information
    odds: getGameOdds(gameId, oddsData) || undefined,
    // League
    league: league,
  };

  return convertedGame;
};

// League-specific score card component
const ScoreCard = ({
  game,
  onGameClick,
  oddsLoading,
  oddsByDate,
}: {
  game: Game;
  onGameClick: (gameId: string, gameDate: string) => void;
  oddsLoading?: boolean;
  oddsByDate?: any;
}) => {
  switch (game.league) {
    case League.MLB:
      return (
        <MLBScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
    case League.NBA:
      return (
        <NBAScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
    case League.NFL:
      return (
        <NFLScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
    case League.NHL:
      return (
        <NHLScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
    default:
      return (
        <GenericScoreCard
          game={game}
          onGameClick={onGameClick}
          oddsLoading={oddsLoading}
          oddsByDate={oddsByDate}
        />
      );
  }
};

export function Scores() {
  // Get selectedLeague from Redux
  const selectedLeague = useAppSelector(
    (state) => state.sportsData.selectedLeague,
  );

  // Generic league data state (replaces MLB-specific state)
  const [leagueData, setLeagueData] = useState<{
    [league: string]: {
      scores: any;
      teamProfiles: any;
      stadiums: any;
      schedule: any;
      odds: any;
      loading: boolean;
      error: string | null;
    };
  }>({});

  // Redux state
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector((state) => state.sportsData.selectedDate);
  const navigate = useNavigate();

  // Handle game click for box score navigation
  const handleGameClick = (gameId: string) => {
    navigate(`/scores/${selectedLeague}/${gameId}`);
  };

  // Generic fetch functions for all leagues
  const fetchScoresForLeague = async (league: string, date: string) => {
    console.log(`🏀 Fetching scores for ${league.toUpperCase()}`);

    // Set loading state
    setLeagueData((prev) => ({
      ...prev,
      [league]: {
        ...prev[league],
        loading: true,
        error: null,
      },
    }));

    try {
      const apiUrl = buildApiUrl("/api/v1/scores", { league, date });
      console.log(`🌐 Making request to: ${apiUrl}`);
      const response = await fetch(apiUrl);
      console.log(`📡 Response status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Scores received for ${league}:`, data);
        setLeagueData((prev) => ({
          ...prev,
          [league]: {
            ...prev[league],
            scores: data,
            loading: false,
            error: null,
          },
        }));
      } else {
        console.log(
          `ℹ️ Scores not supported for ${league}: ${response.status}`,
        );
        setLeagueData((prev) => ({
          ...prev,
          [league]: {
            ...prev[league],
            loading: false,
            error: `Scores not supported for ${league}`,
          },
        }));
      }
    } catch (error) {
      console.error(`❌ Error fetching scores for ${league}:`, error);
      setLeagueData((prev) => ({
        ...prev,
        [league]: {
          ...prev[league],
          loading: false,
          error: `Error fetching scores for ${league}`,
        },
      }));
    }
  };

  const fetchTeamProfilesForLeague = async (league: string) => {
    console.log(`🏀 Fetching team profiles for ${league.toUpperCase()}`);
    try {
      const apiUrl = buildApiUrl("/api/team-profile", { league });
      console.log(`🌐 Making request to: ${apiUrl}`);
      const response = await fetch(apiUrl);
      console.log(`📡 Response status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Team profiles received for ${league}:`, data);
        setLeagueData((prev) => ({
          ...prev,
          [league]: {
            ...prev[league],
            teamProfiles: data,
          },
        }));
      } else {
        console.log(
          `ℹ️ Team profiles not supported for ${league}: ${response.status}`,
        );
      }
    } catch (error) {
      console.error(`❌ Error fetching team profiles for ${league}:`, error);
    }
  };

  const fetchStadiumsForLeague = async (league: string) => {
    console.log(`🏀 Fetching stadiums for ${league.toUpperCase()}`);
    try {
      const apiUrl = buildApiUrl("/api/v1/venues", { league });
      console.log(`🌐 Making request to: ${apiUrl}`);
      const response = await fetch(apiUrl);
      console.log(`📡 Response status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Stadiums received for ${league}:`, data);
        setLeagueData((prev) => ({
          ...prev,
          [league]: {
            ...prev[league],
            stadiums: data,
          },
        }));
      } else {
        console.log(
          `ℹ️ Stadiums not supported for ${league}: ${response.status}`,
        );
      }
    } catch (error) {
      console.error(`❌ Error fetching stadiums for ${league}:`, error);
    }
  };

  const fetchOddsForLeague = async (league: string, date: string) => {
    console.log(`🏀 Fetching odds for ${league.toUpperCase()}`);
    try {
      const apiUrl = buildApiUrl("/api/v1/odds-by-date", { league, date });
      console.log(`🌐 Making request to: ${apiUrl}`);
      const response = await fetch(apiUrl);
      console.log(`📡 Response status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Odds received for ${league}:`, data);
        setLeagueData((prev) => ({
          ...prev,
          [league]: {
            ...prev[league],
            odds: data,
          },
        }));
      } else {
        console.log(`ℹ️ Odds not supported for ${league}: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error fetching odds for ${league}:`, error);
    }
  };

  const fetchScheduleForLeague = async (league: string, date: string) => {
    console.log(`🏀 Fetching schedule for ${league.toUpperCase()}`);
    try {
      const apiUrl = buildApiUrl("/api/v1/schedule", { league, date });
      console.log(`🌐 Making request to: ${apiUrl}`);
      const response = await fetch(apiUrl);
      console.log(`📡 Response status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Schedule received for ${league}:`, data);
        setLeagueData((prev) => ({
          ...prev,
          [league]: {
            ...prev[league],
            schedule: data,
          },
        }));
      } else {
        console.log(
          `ℹ️ Schedule not supported for ${league}: ${response.status}`,
        );
      }
    } catch (error) {
      console.error(`❌ Error fetching schedule for ${league}:`, error);
    }
  };

  // Initialize selected date to today only on first load (when selectedDate is empty)
  useEffect(() => {
    if (!selectedDate) {
      const today = getCurrentLocalDate();
      dispatch(setSelectedDate(today));
    }
  }, [selectedDate, dispatch]);

  // Fetch data when component mounts or league/date changes
  useEffect(() => {
    if (selectedDate) {
      // Always attempt to fetch data for the selected league
      // The backend will return errors for non-MLB leagues, which we handle gracefully

      // Fetch scores for the selected league
      fetchScoresForLeague(selectedLeague, selectedDate);

      // Fetch team profiles for the selected league
      fetchTeamProfilesForLeague(selectedLeague);

      // Fetch stadiums for the selected league (if supported)
      fetchStadiumsForLeague(selectedLeague);

      // Fetch odds for the selected league (if supported)
      fetchOddsForLeague(selectedLeague, selectedDate);

      // Fetch schedule for the selected league (if supported)
      fetchScheduleForLeague(selectedLeague, selectedDate);
    }
  }, [selectedLeague, selectedDate]);

  // Get all games based on the selected date and league
  const getAllGames = (): Game[] => {
    const currentLeagueData = leagueData[selectedLeague];

    if (!currentLeagueData) {
      return [];
    }

    // Check if this is a postseason date (only for MLB)
    const isPostseason =
      selectedLeague === League.MLB && selectedDate
        ? isPostseasonDate(selectedLeague as League, selectedDate)
        : false;

    if (isPostseason) {
      // Use schedule data for postseason
      if (currentLeagueData.schedule?.data && selectedDate) {
        const scheduleGames = currentLeagueData.schedule.data
          .map((game) =>
            convertScheduleGameToGame(
              game,
              currentLeagueData.teamProfiles,
              currentLeagueData.stadiums,
              selectedLeague as League,
              currentLeagueData.odds,
            ),
          )
          .filter((game): game is Game => game !== null);

        return scheduleGames;
      }
    } else {
      // Use regular scores data for regular season
      if (currentLeagueData.scores?.data) {
        const scoresGames = currentLeagueData.scores.data
          .map((game) =>
            convertGameToGame(
              game,
              currentLeagueData.teamProfiles,
              currentLeagueData.stadiums,
              selectedLeague as League,
              currentLeagueData.odds,
            ),
          )
          .filter((game): game is Game => game !== null);

        return scoresGames;
      }
    }

    return [];
  };

  const allGames = getAllGames();

  // Sort games by time (most recent first for live games, then by start time)
  const sortedGames = [...allGames].sort((a, b) => {
    // Live games first
    if (a.status === GameStatus.LIVE && b.status !== GameStatus.LIVE) {
      return -1;
    }
    if (b.status === GameStatus.LIVE && a.status !== GameStatus.LIVE) {
      return 1;
    }

    // Then sort by time
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();
    return timeB - timeA; // Most recent first
  });

  // Retry function for error state
  const handleRetry = () => {
    if (selectedDate) {
      // Clear the error and refetch all data for the current league
      setLeagueData((prev) => ({
        ...prev,
        [selectedLeague]: {
          ...prev[selectedLeague],
          error: null,
          loading: true,
        },
      }));

      console.log("> selected", selectedLeague);

      // Refetch all data
      fetchScoresForLeague(selectedLeague, selectedDate);
      fetchTeamProfilesForLeague(selectedLeague);
      fetchStadiumsForLeague(selectedLeague);
      fetchOddsForLeague(selectedLeague, selectedDate);
      fetchScheduleForLeague(selectedLeague, selectedDate);
    }
  };

  // Show error state if there's an error
  const currentLeagueData = leagueData[selectedLeague];
  if (currentLeagueData?.error) {
    return (
      <ErrorState
        title="Error Loading Scores"
        message={`Failed to load ${selectedLeague.toUpperCase()} scores. ${currentLeagueData.error}`}
        onRetry={handleRetry}
        showRetry={true}
        showBack={false}
        variant="error"
      />
    );
  }

  return (
    <HideVerticalScroll minH="100vh" bg="primary.25">
      <VStack gap="4" align="stretch" p="4" pb="20">
        {/* Date Selector */}
        <DatePicker selectedLeague={selectedLeague} />

        {/* Games List */}
        <VStack gap="4" align="stretch">
          {sortedGames.length === 0 ? (
            // Show loading state if we're fetching data, otherwise show no games
            currentLeagueData?.loading || !currentLeagueData ? (
              // Show skeleton cards while loading
              Array.from({ length: 3 }, (_, index) => (
                <GameCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : (
              <Card.Root
                bg="primary.25"
                borderRadius="12px"
                shadow="sm"
                border="1px"
                borderColor="text.400"
              >
                <Card.Body p="8" textAlign="center">
                  <VStack gap="4">
                    <Box
                      w="16"
                      h="16"
                      bg="primary.25"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="2xl">📺</Text>
                    </Box>
                    <VStack gap="2">
                      <Text
                        fontSize="lg"
                        fontWeight="semibold"
                        color="text.400"
                      >
                        {selectedLeague === League.MLB
                          ? "No Games"
                          : "Coming Soon"}
                      </Text>
                      <Text fontSize="sm" color="text.400" textAlign="center">
                        {selectedLeague === League.MLB ? (
                          <>
                            No games scheduled for{" "}
                            {selectedDate
                              ? parseLocalDate(selectedDate).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                  },
                                )
                              : "this date"}
                            .
                          </>
                        ) : (
                          <>
                            {selectedLeague.toUpperCase()} scores are not yet
                            available. We're working on adding support for{" "}
                            {selectedLeague.toUpperCase()} games.
                          </>
                        )}
                      </Text>
                    </VStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            )
          ) : (
            <VStack gap="4" align="stretch">
              {currentLeagueData?.loading
                ? // Show skeleton cards while loading
                  Array.from({ length: 3 }, (_, index) => (
                    <GameCardSkeleton key={`skeleton-${index}`} />
                  ))
                : sortedGames.map((game) => (
                    <ScoreCard
                      key={game.id}
                      game={game}
                      onGameClick={handleGameClick}
                      oddsLoading={currentLeagueData?.loading || false}
                      oddsByDate={currentLeagueData?.odds}
                    />
                  ))}
            </VStack>
          )}
        </VStack>
      </VStack>
    </HideVerticalScroll>
  );
}
