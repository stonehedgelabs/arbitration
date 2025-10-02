import { Calendar, Wifi } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import {
  Badge,
  Card,
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Spinner,
} from "@chakra-ui/react";
import useArb from "../services/Arb";
import { BoxScoreDetail } from "./BoxScoreDetail";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { setSelectedDate } from "../store/slices/sportsDataSlice";

interface Team {
  name: string;
  score: number;
  logo?: string;
}

interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: "live" | "final" | "upcoming" | "cancelled";
  time: string;
  date: string; // Add date field for GameByDate API
  quarter?: string;
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
}

interface ScoresSectionProps {
  games: Game[];
  selectedLeague?: string;
}

// Date utility functions
const getDateRange = () => {
  const today = new Date();
  const dates = [];

  // 7 days before today
  for (let i = 7; i > 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push({
      date: date.toISOString().split("T")[0],
      display: formatDateDisplay(date),
      isToday: false,
    });
  }

  // Today (centered)
  dates.push({
    date: today.toISOString().split("T")[0],
    display: "Today",
    isToday: true,
  });

  // 7 days after today
  for (let i = 1; i <= 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push({
      date: date.toISOString().split("T")[0],
      display: formatDateDisplay(date),
      isToday: false,
    });
  }

  return dates;
};

const formatDateDisplay = (date: Date) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayName = days[date.getDay()];
  const month = months[date.getMonth()];
  const day = date.getDate();

  return `${dayName} ${month} ${day}`;
};

// Helper function to safely parse dates
const isValidDate = (dateString: string): boolean => {
  if (!dateString || dateString.trim() === "") return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Bases Icon Component
const BasesIcon = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap="1">
      {/* Home Plate (bottom) */}
      <Box
        w="6px"
        h="6px"
        bg="gray.300"
        border="1px solid"
        borderColor="gray.400"
        transform="rotate(45deg)"
      />

      {/* First and Third Base (middle row) */}
      <Box display="flex" gap="3">
        {/* First Base */}
        <Box
          w="6px"
          h="6px"
          bg="gray.300"
          border="1px solid"
          borderColor="gray.400"
          transform="rotate(45deg)"
        />
        {/* Third Base */}
        <Box
          w="6px"
          h="6px"
          bg="gray.300"
          border="1px solid"
          borderColor="gray.400"
          transform="rotate(45deg)"
        />
      </Box>

      {/* Second Base (top) */}
      <Box
        w="6px"
        h="6px"
        bg="gray.300"
        border="1px solid"
        borderColor="gray.400"
        transform="rotate(45deg)"
      />
    </Box>
  );
};

// Live Games Component
export function Live({ games, selectedLeague }: ScoresSectionProps) {
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector((state) => state.sportsData.selectedDate);

  // Fetch data hooks
  const {
    fetchMLBScores,
    fetchMLBTeamProfiles,
    fetchMLBStadiums,
    mlbScores,
    mlbTeamProfiles,
    mlbStadiums,
  } = useArb();

  // Fetch data on mount
  useEffect(() => {
    if (selectedLeague === "mlb") {
      fetchMLBScores();
      fetchMLBTeamProfiles();
      fetchMLBStadiums();
    }
  }, [selectedLeague, fetchMLBScores, fetchMLBTeamProfiles, fetchMLBStadiums]);

  // Helper function to get team profile by abbreviation
  const getTeamProfile = (teamAbbr: string) => {
    if (!mlbTeamProfiles?.data) return null;
    return mlbTeamProfiles.data.find((team) => team.Key === teamAbbr);
  };

  // Helper function to get stadium by ID
  const getStadium = (stadiumId: number) => {
    if (!mlbStadiums?.data) return null;
    return mlbStadiums.data.find((stadium) => stadium.StadiumID === stadiumId);
  };

  // Format time from DateTime (convert UTC to local time)
  const formatTime = (dateTime: string) => {
    try {
      // Parse the UTC datetime string and convert to local time
      const utcDate = new Date(dateTime);

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = days[utcDate.getDay()];
      const month = utcDate.getMonth() + 1;
      const day = utcDate.getDate();
      const year = utcDate.getFullYear();

      // Format time in user's local timezone
      const time = utcDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return `${dayName} ${month}/${day}/${year} at ${time}`;
    } catch {
      return "TBD";
    }
  };

  // Convert MLB games to the expected format
  const convertMLBGameToGame = (rawGame: any): Game => {
    // Map API status to our status format
    const getStatus = (
      apiStatus: string,
    ): "live" | "final" | "upcoming" | "cancelled" => {
      switch (apiStatus) {
        case "Final":
        case "Completed":
          return "final";
        case "InProgress":
        case "In Progress":
        case "Live":
          return "live";
        case "NotNecessary":
        case "Cancelled":
        case "Postponed":
        case "Suspended":
          return "cancelled";
        default:
          return "upcoming";
      }
    };

    // Check if this is a game that should be filtered out
    const gameStatus = getStatus(rawGame.Status);

    // Filter out cancelled games (NotNecessary, Cancelled, Postponed, etc.)
    if (gameStatus === "cancelled") {
      return null; // This will be filtered out
    }

    // Also filter out games that are marked as "upcoming" but the game time is in the past
    const gameTime = new Date(rawGame.DateTime);
    const now = new Date();
    const isPastGame = gameTime < now;

    if (isPastGame && gameStatus === "upcoming") {
      return null; // This will be filtered out
    }

    // Get team profiles for better names and logos
    const homeTeamProfile = getTeamProfile(rawGame.HomeTeam);
    const awayTeamProfile = getTeamProfile(rawGame.AwayTeam);
    const stadium = getStadium(rawGame.StadiumID);
    const gameId = rawGame.GameID?.toString() || "";

    const convertedGame = {
      id: gameId,
      homeTeam: {
        name: homeTeamProfile
          ? `${homeTeamProfile.City} ${homeTeamProfile.Name}`
          : rawGame.HomeTeam || "",
        score: rawGame.HomeTeamRuns || 0,
        logo: homeTeamProfile?.WikipediaLogoUrl,
      },
      awayTeam: {
        name: awayTeamProfile
          ? `${awayTeamProfile.City} ${awayTeamProfile.Name}`
          : rawGame.AwayTeam || "",
        score: rawGame.AwayTeamRuns || 0,
        logo: awayTeamProfile?.WikipediaLogoUrl,
      },
      time: rawGame.DateTime || new Date().toISOString(),
      date: rawGame.DateTime
        ? new Date(rawGame.DateTime).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      status: getStatus(rawGame.Status),
      quarter: rawGame.Inning
        ? `${rawGame.InningHalf === "B" ? "Bot" : "Top"} ${rawGame.Inning}`
        : undefined,
      // Location/Venue information
      stadium: stadium?.Name,
      city: stadium?.City,
      state: stadium?.State,
      country: stadium?.Country,
      capacity: stadium?.Capacity,
      surface: stadium?.Surface,
      weather: rawGame.Weather || rawGame.WeatherCondition,
      temperature: rawGame.Temperature || rawGame.TempF,
      stadiumId: rawGame.StadiumID, // Store stadium ID for potential future lookup
      division: homeTeamProfile?.Division, // Store division for display
    };

    return convertedGame;
  };

  // Get all games - use the same logic as Scores component
  const allGames =
    selectedLeague === "mlb" && mlbScores
      ? mlbScores.data
          .map(convertMLBGameToGame)
          .filter((game): game is Game => game !== null)
      : games;

  // Debug logging
  console.log("Live component debug:", {
    selectedLeague,
    allGames: allGames.length,
    allGameStatuses: allGames.map((g) => ({
      id: g.id,
      status: g.status,
      teams: `${g.awayTeam.name} @ ${g.homeTeam.name}`,
    })),
    rawGames: allGames, // Show the full game objects
  });

  // Filter only live games
  const liveGames = allGames.filter((game) => game.status === "live");

  // Debug live games specifically
  console.log("Live games found:", {
    totalLiveGames: liveGames.length,
    liveGames: liveGames.map((g) => ({
      id: g.id,
      status: g.status,
      teams: `${g.awayTeam.name} @ ${g.homeTeam.name}`,
      time: g.time,
      quarter: g.quarter,
    })),
  });

  // Sort live games by start time (most recent first)
  const sortedLiveGames = [...liveGames].sort((a, b) => {
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();
    return timeB - timeA; // Most recent first
  });

  // Get status badge
  const getStatusBadge = (status: string, quarter?: string) => {
    switch (status) {
      case "live":
        return (
          <Badge
            colorScheme="red"
            variant="solid"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
            display="flex"
            alignItems="center"
            gap="1"
          >
            <Wifi size={12} />
            Live
          </Badge>
        );
      case "final":
        return (
          <Badge
            colorScheme="gray"
            variant="solid"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            Final
          </Badge>
        );
      case "upcoming":
        return (
          <Badge
            colorScheme="blue"
            variant="outline"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            {quarter || "TBD"}
          </Badge>
        );
      default:
        return null;
    }
  };

  // Show loading state while fetching data
  if (selectedLeague === "mlb" && !mlbScores) {
    return (
      <Box
        minH="200px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Spinner size="lg" color="red.500" />
          <Text color="gray.600">Loading live games...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box p="4">
      <VStack gap="4" align="stretch">
        {/* Header */}
        <HStack gap="2" align="center">
          <Wifi size={20} color="red" />
          <Text fontSize="lg" fontWeight="bold" color="gray.500">
            Live Games
          </Text>
        </HStack>

        {/* Games List */}
        {sortedLiveGames.length === 0 ? (
          <VStack gap="4" align="center" py="8">
            <Wifi size={48} color="gray" />
            <VStack gap="2" align="center">
              <Text fontSize="lg" fontWeight="semibold" color="gray.600">
                No Live Games
              </Text>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                There are no live games at the moment.
              </Text>
            </VStack>
          </VStack>
        ) : (
          <VStack gap="3" align="stretch">
            {sortedLiveGames.map((game) => (
              <Card.Root
                key={game.id}
                cursor="pointer"
                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                transition="all 0.2s"
                onClick={() => {
                  // Handle game click - you can add navigation logic here
                  console.log("Clicked game:", game.id);
                }}
              >
                <Card.Body p="4">
                  <VStack align="stretch" gap="3">
                    {/* Time and Status Header */}
                    <HStack justify="space-between" align="center">
                      <Text fontSize="sm" color="gray.500">
                        {formatTime(game.time)}
                      </Text>
                      <HStack gap="2" align="center">
                        {getStatusBadge(game.status, game.quarter)}
                        {game.quarter && (
                          <Text
                            fontSize="xs"
                            color="gray.600"
                            fontWeight="medium"
                          >
                            {game.quarter}
                          </Text>
                        )}
                      </HStack>
                    </HStack>

                    {/* Location Information */}
                    {(game.stadium || game.city) && (
                      <HStack
                        justify="space-between"
                        align="flex-start"
                        gap="3"
                      >
                        <VStack gap="1" align="stretch" flex="1">
                          {game.stadium && (
                            <Text
                              fontSize="xs"
                              fontWeight="medium"
                              color="gray.700"
                            >
                              {game.stadium}
                            </Text>
                          )}
                          <HStack
                            gap="2"
                            align="center"
                            fontSize="xs"
                            color="gray.600"
                          >
                            {game.city && (
                              <Text fontWeight="medium">{game.city}</Text>
                            )}
                            {game.state && (
                              <Text color="gray.500">{game.state}</Text>
                            )}
                            {game.capacity && (
                              <Text color="gray.500">
                                {game.capacity.toLocaleString()} seats
                              </Text>
                            )}
                            {game.surface && (
                              <Text color="gray.500">{game.surface}</Text>
                            )}
                          </HStack>
                          {game.division && (
                            <Text fontSize="xs" color="gray.500">
                              {game.division} Division
                            </Text>
                          )}
                        </VStack>

                        {/* Bases Icon for MLB Live Games */}
                        {selectedLeague === "mlb" && game.status === "live" && (
                          <BasesIcon />
                        )}
                      </HStack>
                    )}

                    {/* Away Team */}
                    <HStack justify="space-between" align="center">
                      <HStack gap="3" align="center" flex="1">
                        <Box
                          w="8"
                          h="8"
                          bg="gray.300"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          overflow="hidden"
                          flexShrink="0"
                        >
                          {game.awayTeam.logo ? (
                            <Image
                              src={game.awayTeam.logo}
                              alt={game.awayTeam.name}
                              w="full"
                              h="full"
                              objectFit="cover"
                            />
                          ) : (
                            <Box
                              w="full"
                              h="full"
                              bg="gray.300"
                              borderRadius="full"
                            />
                          )}
                        </Box>
                        <Text
                          fontSize="sm"
                          color="gray.900"
                          fontWeight="medium"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {game.awayTeam.name}
                        </Text>
                      </HStack>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="gray.900"
                        minW="8"
                        textAlign="right"
                      >
                        {game.awayTeam.score}
                      </Text>
                    </HStack>

                    {/* Home Team */}
                    <HStack justify="space-between" align="center">
                      <HStack gap="3" align="center" flex="1">
                        <Box
                          w="8"
                          h="8"
                          bg="gray.300"
                          borderRadius="full"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          overflow="hidden"
                          flexShrink="0"
                        >
                          {game.homeTeam.logo ? (
                            <Image
                              src={game.homeTeam.logo}
                              alt={game.homeTeam.name}
                              w="full"
                              h="full"
                              objectFit="cover"
                            />
                          ) : (
                            <Box
                              w="full"
                              h="full"
                              bg="gray.300"
                              borderRadius="full"
                            />
                          )}
                        </Box>
                        <Text
                          fontSize="sm"
                          color="gray.900"
                          fontWeight="medium"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          whiteSpace="nowrap"
                        >
                          {game.homeTeam.name}
                        </Text>
                      </HStack>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color="gray.900"
                        minW="8"
                        textAlign="right"
                      >
                        {game.homeTeam.score}
                      </Text>
                    </HStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}

export function Scores({ games, selectedLeague }: ScoresSectionProps) {
  const {
    mlbScores,
    mlbTeamProfiles,
    mlbStadiums,
    loading: mlbLoading,
    error: mlbError,
    fetchMLBScores,
    fetchMLBTeamProfiles,
    fetchMLBStadiums,
  } = useArb();

  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [selectedGameDate, setSelectedGameDate] = useState<string | null>(null);
  const [gameRunners, setGameRunners] = useState<
    Record<string, { first: boolean; second: boolean; third: boolean }>
  >({});
  const [loadingRunners, setLoadingRunners] = useState<Set<string>>(new Set());
  const dateSelectorRef = useRef<HTMLDivElement>(null);
  const fetchedGamesRef = useRef<Set<string>>(new Set());

  // Redux state
  const dispatch = useAppDispatch();
  const selectedDate = useAppSelector((state) => state.sportsData.selectedDate);

  // Fetch MLB scores and team profiles when MLB league is selected
  useEffect(() => {
    fetchMLBScores();
    fetchMLBTeamProfiles();
    fetchMLBStadiums();
  }, [fetchMLBScores, fetchMLBTeamProfiles, fetchMLBStadiums]);

  // Fetch box score data for runner information

  // Center "Today" in the date selector on mount and when league changes
  useEffect(() => {
    const centerToday = () => {
      if (dateSelectorRef.current) {
        const todayElement = dateSelectorRef.current.querySelector(
          '[data-date="today"]',
        );
        if (todayElement) {
          todayElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      }
    };

    // For MLB, wait a bit for data to load and DOM to update
    if (selectedLeague === "mlb") {
      const timeoutId = setTimeout(centerToday, 100);
      return () => clearTimeout(timeoutId);
    } else {
      centerToday();
    }
  }, [selectedLeague, mlbScores]);

  // Helper function to get team profile by abbreviation
  const getTeamProfile = (teamAbbr: string) => {
    if (!mlbTeamProfiles?.data) return null;
    return mlbTeamProfiles.data.find((team) => team.Key === teamAbbr);
  };

  // Helper function to get stadium by ID
  const getStadium = (stadiumId: number) => {
    if (!mlbStadiums?.data) return null;
    return mlbStadiums.data.find((stadium) => stadium.StadiumID === stadiumId);
  };

  // Format time from DateTime (convert UTC to local time)
  const formatTime = (dateTime: string) => {
    try {
      // Parse the UTC datetime string and convert to local time
      const utcDate = new Date(dateTime);

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = days[utcDate.getDay()];
      const month = utcDate.getMonth() + 1;
      const day = utcDate.getDate();
      const year = utcDate.getFullYear();

      // Format time in user's local timezone
      const time = utcDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      return `${dayName} ${month}/${day}/${year} at ${time}`;
    } catch {
      return "TBD";
    }
  };

  // Convert MLB games to the expected format
  const convertMLBGameToGame = (rawGame: any): Game => {
    // Map API status to our status format
    const getStatus = (
      apiStatus: string,
    ): "live" | "final" | "upcoming" | "cancelled" => {
      switch (apiStatus) {
        case "Final":
        case "Completed":
          return "final";
        case "InProgress":
        case "In Progress":
        case "Live":
          return "live";
        case "NotNecessary":
        case "Cancelled":
        case "Postponed":
        case "Suspended":
          return "cancelled";
        default:
          return "upcoming";
      }
    };

    // Check if this is a game that should be filtered out
    const gameStatus = getStatus(rawGame.Status);

    // Filter out cancelled games (NotNecessary, Cancelled, Postponed, etc.)
    if (gameStatus === "cancelled") {
      console.log("Filtering out cancelled game:", {
        id: rawGame.GameID,
        status: rawGame.Status,
        time: rawGame.DateTime,
        teams: `${rawGame.AwayTeam} @ ${rawGame.HomeTeam}`,
      });
      return null; // This will be filtered out
    }

    // Also filter out games that are marked as "upcoming" but the game time is in the past
    const gameTime = new Date(rawGame.DateTime);
    const now = new Date();
    const isPastGame = gameTime < now;

    if (isPastGame && gameStatus === "upcoming") {
      console.log("Filtering out potentially cancelled game (past time):", {
        id: rawGame.GameID,
        status: rawGame.Status,
        time: rawGame.DateTime,
        teams: `${rawGame.AwayTeam} @ ${rawGame.HomeTeam}`,
        isPast: isPastGame,
      });
      return null; // This will be filtered out
    }

    // Get team profiles for better names and logos
    const homeTeamProfile = getTeamProfile(rawGame.HomeTeam);
    const awayTeamProfile = getTeamProfile(rawGame.AwayTeam);
    const stadium = getStadium(rawGame.StadiumID);
    const gameId = rawGame.GameID?.toString() || "";

    const convertedGame = {
      id: gameId,
      homeTeam: {
        name: homeTeamProfile
          ? `${homeTeamProfile.City} ${homeTeamProfile.Name}`
          : rawGame.HomeTeam || "",
        score: rawGame.HomeTeamRuns || 0,
        logo: homeTeamProfile?.WikipediaLogoUrl,
      },
      awayTeam: {
        name: awayTeamProfile
          ? `${awayTeamProfile.City} ${awayTeamProfile.Name}`
          : rawGame.AwayTeam || "",
        score: rawGame.AwayTeamRuns || 0,
        logo: awayTeamProfile?.WikipediaLogoUrl,
      },
      status: getStatus(rawGame.Status || ""),
      time: rawGame.DateTime || new Date().toISOString(), // Store raw datetime for proper timezone conversion, fallback to current time
      date: rawGame.Day ? rawGame.Day.split("T")[0] : "", // Extract YYYY-MM-DD from ISO date
      quarter: rawGame.Inning
        ? `${rawGame.InningHalf === "B" ? "Bot" : "Top"} ${rawGame.Inning}`
        : undefined,
      // Location/Venue information
      stadium: stadium?.Name || rawGame.Stadium || rawGame.Venue,
      city: stadium?.City || homeTeamProfile?.City, // Use stadium city first, fallback to team profile city
      state: stadium?.State || rawGame.State || rawGame.StateProvince,
      country: stadium?.Country,
      capacity: stadium?.Capacity,
      surface: stadium?.Surface,
      weather: rawGame.Weather || rawGame.WeatherCondition,
      temperature: rawGame.Temperature || rawGame.TempF,
      stadiumId: rawGame.StadiumID, // Store stadium ID for potential future lookup
      division: homeTeamProfile?.Division, // Store division for display
    };

    return convertedGame;
  };

  // Handle game click for box score navigation
  const handleGameClick = (gameId: string, gameDate: string) => {
    setSelectedGameId(gameId);
    setSelectedGameDate(gameDate);
  };

  // Handle back from box score
  const handleBackFromBoxScore = () => {
    setSelectedGameId(null);
    setSelectedGameDate(null);
  };

  // Show box score detail if a game is selected
  if (selectedGameId && selectedGameDate) {
    return (
      <BoxScoreDetail
        gameId={selectedGameId}
        sport={selectedLeague}
        onBack={handleBackFromBoxScore}
      />
    );
  }

  // Get all games
  const allGames =
    selectedLeague === "mlb" && mlbScores
      ? mlbScores.data
          .map(convertMLBGameToGame)
          .filter((game): game is Game => game !== null)
      : games;

  // Filter games by selected date
  const filteredGames = allGames.filter((game) => {
    // Check if the date string is valid before parsing
    if (!isValidDate(game.time)) {
      console.warn("Invalid date for game:", game.id, game.time);
      return false;
    }

    try {
      const gameDate = new Date(game.time);
      // Use local date instead of UTC to avoid timezone issues
      const gameDateString = `${gameDate.getFullYear()}-${String(gameDate.getMonth() + 1).padStart(2, "0")}-${String(gameDate.getDate()).padStart(2, "0")}`;
      const matches = gameDateString === selectedDate;

      if (matches) {
        console.log("Game on selected date:", {
          id: game.id,
          status: game.status,
          time: game.time,
          teams: `${game.awayTeam.name} @ ${game.homeTeam.name}`,
          gameDate: gameDateString,
          selectedDate: selectedDate,
        });
      }

      return matches;
    } catch (error) {
      console.warn("Error parsing date for game:", game.id, game.time, error);
      return false;
    }
  });

  // Sort games: LIVE games first, then by start time in ascending order
  const sortedGames = [...filteredGames].sort((a, b) => {
    // Live games first
    if (a.status === "live" && b.status !== "live") return -1;
    if (b.status === "live" && a.status !== "live") return 1;

    // Then sort by time (with error handling)
    const isValidA = isValidDate(a.time);
    const isValidB = isValidDate(b.time);

    // If either date is invalid, put it at the end
    if (!isValidA && !isValidB) return 0;
    if (!isValidA) return 1;
    if (!isValidB) return -1;

    try {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeA - timeB;
    } catch (error) {
      console.warn("Error sorting games by time:", error);
      return 0;
    }
  });
  const getStatusBadge = (status: string, quarter?: string) => {
    switch (status) {
      case "live":
        return (
          <Badge
            variant="solid"
            bg="red.500"
            color="white"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            {quarter || "LIVE"}
          </Badge>
        );
      case "final":
        return (
          <Badge
            variant="solid"
            bg="gray.300"
            color="gray.700"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            FINAL
          </Badge>
        );
      case "upcoming":
        return (
          <Badge
            variant="solid"
            bg="gray.300"
            color="gray.700"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            UPCOMING
          </Badge>
        );
      default:
        return null;
    }
  };

  // Show loading state for MLB
  if (selectedLeague === "mlb" && mlbLoading) {
    return (
      <Box
        minH="100vh"
        bg="gray.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Spinner size="lg" color="red.500" />
          <Text color="gray.600">Loading MLB scores...</Text>
        </VStack>
      </Box>
    );
  }

  // Show error state for MLB
  if (selectedLeague === "mlb" && mlbError) {
    return (
      <Box
        minH="100vh"
        bg="gray.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Text color="red.500" fontSize="lg" fontWeight="semibold">
            Failed to load MLB scores
          </Text>
          <Text color="gray.600" textAlign="center">
            {mlbError}
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <VStack gap="4" align="stretch" p="4" pb="20">
        {/* Header */}
        <Text fontSize="2xl" fontWeight="bold" color="gray.900">
          Scores
        </Text>

        {/* Date Selector */}
        <Box>
          <Box
            ref={dateSelectorRef}
            display="flex"
            gap="2"
            overflowX="auto"
            pb="2"
            css={{
              "&::-webkit-scrollbar": {
                height: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
                borderRadius: "2px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#c1c1c1",
                borderRadius: "2px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "#a8a8a8",
              },
            }}
          >
            {getDateRange().map((dateInfo) => (
              <Box
                key={dateInfo.date}
                data-date={dateInfo.isToday ? "today" : undefined}
                onClick={() => dispatch(setSelectedDate(dateInfo.date))}
                cursor="pointer"
                px="2"
                py="1"
                borderRadius="md"
                bg={selectedDate === dateInfo.date ? "red.50" : "transparent"}
                borderBottom={
                  selectedDate === dateInfo.date
                    ? "2px solid"
                    : "2px solid transparent"
                }
                borderBottomColor={
                  selectedDate === dateInfo.date ? "red.500" : "transparent"
                }
                _hover={{
                  bg: selectedDate === dateInfo.date ? "red.50" : "gray.50",
                }}
                minW="fit-content"
                whiteSpace="nowrap"
              >
                <Text
                  fontSize="xs"
                  fontWeight={
                    selectedDate === dateInfo.date ? "semibold" : "normal"
                  }
                  color={
                    selectedDate === dateInfo.date ? "red.600" : "gray.600"
                  }
                >
                  {dateInfo.display}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Games List */}
        <VStack gap="4" align="stretch">
          {sortedGames.length === 0 ? (
            <Card.Root
              bg="white"
              borderRadius="12px"
              shadow="sm"
              border="1px"
              borderColor="gray.200"
            >
              <Card.Body p="8" textAlign="center">
                <VStack gap="4">
                  <Box
                    w="12"
                    h="12"
                    bg="gray.200"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="2xl">🏈</Text>
                  </Box>
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                      No Games on{" "}
                      {getDateRange().find((d) => d.date === selectedDate)
                        ?.display || "This Date"}
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      There are no games scheduled for this date. Try selecting
                      a different date.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          ) : (
            <VStack gap="3" align="stretch">
              {/* <HStack gap="2" align="center">
                <Calendar size={20} color="gray" />
                <Text fontSize="lg" fontWeight="bold" color="gray.500">
                  Games on {getDateRange().find(d => d.date === selectedDate)?.display || 'Selected Date'}
                  </Text>
              </HStack> */}
              {sortedGames.map((game) => (
                <Card.Root
                  key={game.id}
                  bg="white"
                  borderRadius="12px"
                  shadow="sm"
                  border="1px"
                  borderColor="gray.200"
                  _active={{ transform: "scale(0.98)" }}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={() => handleGameClick(game.id, game.date)}
                >
                  <Card.Body p="4">
                    <VStack align="stretch" gap="3">
                      {/* Time and Status Header */}
                      <HStack justify="space-between" align="center">
                        <Text fontSize="sm" color="gray.500">
                          {formatTime(game.time)}
                        </Text>
                        <HStack gap="2" align="center">
                          {getStatusBadge(game.status, game.quarter)}
                          {game.status === "live" && (
                            <Badge
                              variant="solid"
                              bg="red.500"
                              color="white"
                              fontSize="xs"
                              px="2"
                              py="1"
                              borderRadius="full"
                              display="flex"
                              alignItems="center"
                              gap="1"
                            >
                              <Wifi size={12} />
                              Live
                            </Badge>
                          )}
                        </HStack>
                      </HStack>

                      {/* Location Information */}
                      {(game.stadium || game.city) && (
                        <HStack
                          justify="space-between"
                          align="flex-start"
                          gap="3"
                        >
                          <VStack gap="1" align="stretch" flex="1">
                            {game.stadium && (
                              <Text
                                fontSize="xs"
                                fontWeight="medium"
                                color="gray.700"
                              >
                                {game.stadium}
                              </Text>
                            )}
                            <HStack
                              gap="2"
                              align="center"
                              fontSize="xs"
                              color="gray.600"
                            >
                              {game.city && (
                                <Text fontWeight="medium">{game.city}</Text>
                              )}
                              {game.state && (
                                <Text color="gray.500">{game.state}</Text>
                              )}
                              {game.capacity && (
                                <Text color="gray.500">
                                  {game.capacity.toLocaleString()} seats
                                </Text>
                              )}
                              {game.surface && (
                                <Text color="gray.500">{game.surface}</Text>
                              )}
                            </HStack>
                            {game.division && (
                              <Text fontSize="xs" color="gray.500">
                                {game.division} Division
                              </Text>
                            )}
                          </VStack>

                          {/* Bases Icon for MLB Live Games */}
                          {selectedLeague === "mlb" &&
                            game.status === "live" && <BasesIcon />}
                        </HStack>
                      )}

                      {/* Away Team */}
                      <HStack justify="space-between" align="center">
                        <HStack gap="3" align="center" flex="1">
                          <Box
                            w="8"
                            h="8"
                            bg="gray.300"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            overflow="hidden"
                            flexShrink="0"
                          >
                            {game.awayTeam.logo ? (
                              <Image
                                src={game.awayTeam.logo}
                                alt={game.awayTeam.name}
                                w="full"
                                h="full"
                                objectFit="cover"
                              />
                            ) : (
                              <Box
                                w="full"
                                h="full"
                                bg="gray.300"
                                borderRadius="full"
                              />
                            )}
                          </Box>
                          <Text
                            fontSize="sm"
                            color="gray.900"
                            fontWeight="medium"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            whiteSpace="nowrap"
                          >
                            {game.awayTeam.name}
                          </Text>
                        </HStack>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="gray.900"
                          minW="8"
                          textAlign="right"
                        >
                          {game.awayTeam.score}
                        </Text>
                      </HStack>

                      {/* Home Team */}
                      <HStack justify="space-between" align="center">
                        <HStack gap="3" align="center" flex="1">
                          <Box
                            w="8"
                            h="8"
                            bg="gray.300"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            overflow="hidden"
                            flexShrink="0"
                          >
                            {game.homeTeam.logo ? (
                              <Image
                                src={game.homeTeam.logo}
                                alt={game.homeTeam.name}
                                w="full"
                                h="full"
                                objectFit="cover"
                              />
                            ) : (
                              <Box
                                w="full"
                                h="full"
                                bg="gray.300"
                                borderRadius="full"
                              />
                            )}
                          </Box>
                          <Text
                            fontSize="sm"
                            color="gray.900"
                            fontWeight="medium"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            whiteSpace="nowrap"
                          >
                            {game.homeTeam.name}
                          </Text>
                        </HStack>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          color="gray.900"
                          minW="8"
                          textAlign="right"
                        >
                          {game.homeTeam.score}
                        </Text>
                      </HStack>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </VStack>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}
