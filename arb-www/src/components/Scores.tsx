import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
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

interface Team {
  name: string;
  score: number;
  logo?: string;
}

interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: "live" | "final" | "upcoming";
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
  favoriteTeams: string[];
  onToggleFavorite: (teamName: string) => void;
  selectedLeague?: string;
}

export function Scores({
  games,
  favoriteTeams,
  onToggleFavorite,
  selectedLeague,
}: ScoresSectionProps) {
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

  // Fetch MLB scores and team profiles when MLB league is selected
  useEffect(() => {
    fetchMLBScores();
    fetchMLBTeamProfiles();
    fetchMLBStadiums();
  }, [fetchMLBScores, fetchMLBTeamProfiles, fetchMLBStadiums]);

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

      // Format in user's local timezone
      return utcDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "TBD";
    }
  };

  // Convert MLB games to the expected format
  const convertMLBGameToGame = (rawGame: any): Game => {
    // Map API status to our status format
    const getStatus = (apiStatus: string) => {
      switch (apiStatus) {
        case "Final":
        case "Completed":
          return "final";
        case "InProgress":
        case "Live":
          return "live";
        default:
          return "upcoming";
      }
    };

    // Get team profiles for better names and logos
    const homeTeamProfile = getTeamProfile(rawGame.HomeTeam);
    const awayTeamProfile = getTeamProfile(rawGame.AwayTeam);
    const stadium = getStadium(rawGame.StadiumID);

    return {
      id: rawGame.GameID?.toString() || "",
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
      time: rawGame.DateTime || "", // Store raw datetime for proper timezone conversion
      date: rawGame.Day ? rawGame.Day.split("T")[0] : "", // Extract YYYY-MM-DD from ISO date
      quarter: rawGame.Inning
        ? `${rawGame.Inning}${rawGame.InningHalf || ""}`
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
      <BoxScoreDetail gameId={selectedGameId} onBack={handleBackFromBoxScore} />
    );
  }

  // Determine which games to display and sort them
  const allGames =
    selectedLeague === "mlb" && mlbScores
      ? mlbScores.data.map(convertMLBGameToGame)
      : games;

  // Sort games: live first, then by datetime (most recent first)
  const sortedGames = allGames.sort((a, b) => {
    // Live games come first
    if (a.status === "live" && b.status !== "live") return -1;
    if (b.status === "live" && a.status !== "live") return 1;

    // If both are live or both are not live, sort by datetime (most recent first)
    const timeA = new Date(a.time).getTime();
    const timeB = new Date(b.time).getTime();
    return timeB - timeA; // DESC order (most recent first)
  });

  // Group games by status and time
  const groupedGames = {
    live: sortedGames.filter((game) => game.status === "live"),
    recent: sortedGames.filter((game) => {
      if (game.status === "live") return false;
      const gameTime = new Date(game.time).getTime();
      const now = new Date().getTime();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      return gameTime >= oneDayAgo;
    }),
    upcoming: sortedGames.filter((game) => {
      if (game.status === "live") return false;
      const gameTime = new Date(game.time).getTime();
      const now = new Date().getTime();
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      return gameTime < oneDayAgo;
    }),
  };
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
          {selectedLeague === "mlb" ? "MLB Games" : "Today's Games"}
        </Text>

        {/* Games List */}
        <VStack gap="4" align="stretch">
          {allGames.length === 0 ? (
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
                      No Games Today
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      There are no games scheduled for today. Check back later
                      for updates.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          ) : (
            <>
              {/* Live Games */}
              {groupedGames.live.length > 0 && (
                <VStack gap="3" align="stretch">
                  <Text fontSize="lg" fontWeight="bold" color="red.600" px="2">
                    🔴 Live Games
                  </Text>
                  {groupedGames.live.map((game) => (
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
                              @ {formatTime(game.time)}
                            </Text>
                            {getStatusBadge(game.status, game.quarter)}
                          </HStack>

                          {/* Location Information */}
                          {(game.stadium || game.city) && (
                            <VStack gap="1" align="stretch">
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
                            <HStack gap="3" align="center">
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="gray.900"
                                minW="8"
                                textAlign="right"
                              >
                                {game.awayTeam.score}
                              </Text>
                              <Box
                                cursor="pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavorite(game.awayTeam.name);
                                }}
                                _hover={{ transform: "scale(1.1)" }}
                                transition="all 0.2s"
                              >
                                <Box
                                  w="4"
                                  h="4"
                                  color={
                                    favoriteTeams.includes(game.awayTeam.name)
                                      ? "red.500"
                                      : "gray.400"
                                  }
                                >
                                  <Heart
                                    size={16}
                                    fill={
                                      favoriteTeams.includes(game.awayTeam.name)
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                </Box>
                              </Box>
                            </HStack>
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
                            <HStack gap="3" align="center">
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color="gray.900"
                                minW="8"
                                textAlign="right"
                              >
                                {game.homeTeam.score}
                              </Text>
                              <Box
                                cursor="pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavorite(game.homeTeam.name);
                                }}
                                _hover={{ transform: "scale(1.1)" }}
                                transition="all 0.2s"
                              >
                                <Box
                                  w="4"
                                  h="4"
                                  color={
                                    favoriteTeams.includes(game.homeTeam.name)
                                      ? "red.500"
                                      : "gray.400"
                                  }
                                >
                                  <Heart
                                    size={16}
                                    fill={
                                      favoriteTeams.includes(game.homeTeam.name)
                                        ? "currentColor"
                                        : "none"
                                    }
                                  />
                                </Box>
                              </Box>
                            </HStack>
                          </HStack>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </VStack>
              )}

              {/* Recent Games */}
              {groupedGames.recent.length > 0 && (
                <VStack gap="3" align="stretch">
                  <Text fontSize="lg" fontWeight="bold" color="gray.700" px="2">
                    ⏰ Recent Games
                  </Text>
                  {groupedGames.recent.map((game) => (
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
                              @ {formatTime(game.time)}
                            </Text>
                            {getStatusBadge(game.status, game.quarter)}
                          </HStack>

                          {/* Location Information */}
                          {(game.stadium || game.city) && (
                            <VStack gap="1" align="stretch">
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
                                  <Text color="gray.500">• {game.surface}</Text>
                                )}
                                {game.division && (
                                  <Text color="gray.500">
                                    • {game.division}
                                  </Text>
                                )}
                              </HStack>
                            </VStack>
                          )}

                          {/* Teams */}
                          <VStack gap="3" align="stretch">
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
                              <HStack gap="3" align="center">
                                <Text
                                  fontSize="lg"
                                  fontWeight="bold"
                                  color="gray.900"
                                  minW="8"
                                  textAlign="right"
                                >
                                  {game.awayTeam.score}
                                </Text>
                                <Box
                                  cursor="pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(game.awayTeam.name);
                                  }}
                                  _hover={{ transform: "scale(1.1)" }}
                                  transition="all 0.2s"
                                >
                                  <Box
                                    w="4"
                                    h="4"
                                    color={
                                      favoriteTeams.includes(game.awayTeam.name)
                                        ? "red.500"
                                        : "gray.400"
                                    }
                                  >
                                    <Heart
                                      size={16}
                                      fill={
                                        favoriteTeams.includes(
                                          game.awayTeam.name,
                                        )
                                          ? "currentColor"
                                          : "none"
                                      }
                                    />
                                  </Box>
                                </Box>
                              </HStack>
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
                              <HStack gap="3" align="center">
                                <Text
                                  fontSize="lg"
                                  fontWeight="bold"
                                  color="gray.900"
                                  minW="8"
                                  textAlign="right"
                                >
                                  {game.homeTeam.score}
                                </Text>
                                <Box
                                  cursor="pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(game.homeTeam.name);
                                  }}
                                  _hover={{ transform: "scale(1.1)" }}
                                  transition="all 0.2s"
                                >
                                  <Box
                                    w="4"
                                    h="4"
                                    color={
                                      favoriteTeams.includes(game.homeTeam.name)
                                        ? "red.500"
                                        : "gray.400"
                                    }
                                  >
                                    <Heart
                                      size={16}
                                      fill={
                                        favoriteTeams.includes(
                                          game.homeTeam.name,
                                        )
                                          ? "currentColor"
                                          : "none"
                                      }
                                    />
                                  </Box>
                                </Box>
                              </HStack>
                            </HStack>
                          </VStack>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </VStack>
              )}

              {/* Upcoming Games */}
              {groupedGames.upcoming.length > 0 && (
                <VStack gap="3" align="stretch">
                  <Text fontSize="lg" fontWeight="bold" color="blue.600" px="2">
                    📅 Upcoming Games
                  </Text>
                  {groupedGames.upcoming.map((game) => (
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
                              @ {formatTime(game.time)}
                            </Text>
                            {getStatusBadge(game.status, game.quarter)}
                          </HStack>

                          {/* Location Information */}
                          {(game.stadium || game.city) && (
                            <VStack gap="1" align="stretch">
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
                                  <Text color="gray.500">• {game.surface}</Text>
                                )}
                                {game.division && (
                                  <Text color="gray.500">
                                    • {game.division}
                                  </Text>
                                )}
                              </HStack>
                            </VStack>
                          )}

                          {/* Teams */}
                          <VStack gap="3" align="stretch">
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
                              <HStack gap="3" align="center">
                                <Text
                                  fontSize="lg"
                                  fontWeight="bold"
                                  color="gray.900"
                                  minW="8"
                                  textAlign="right"
                                >
                                  {game.awayTeam.score}
                                </Text>
                                <Box
                                  cursor="pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(game.awayTeam.name);
                                  }}
                                  _hover={{ transform: "scale(1.1)" }}
                                  transition="all 0.2s"
                                >
                                  <Box
                                    w="4"
                                    h="4"
                                    color={
                                      favoriteTeams.includes(game.awayTeam.name)
                                        ? "red.500"
                                        : "gray.400"
                                    }
                                  >
                                    <Heart
                                      size={16}
                                      fill={
                                        favoriteTeams.includes(
                                          game.awayTeam.name,
                                        )
                                          ? "currentColor"
                                          : "none"
                                      }
                                    />
                                  </Box>
                                </Box>
                              </HStack>
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
                              <HStack gap="3" align="center">
                                <Text
                                  fontSize="lg"
                                  fontWeight="bold"
                                  color="gray.900"
                                  minW="8"
                                  textAlign="right"
                                >
                                  {game.homeTeam.score}
                                </Text>
                                <Box
                                  cursor="pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(game.homeTeam.name);
                                  }}
                                  _hover={{ transform: "scale(1.1)" }}
                                  transition="all 0.2s"
                                >
                                  <Box
                                    w="4"
                                    h="4"
                                    color={
                                      favoriteTeams.includes(game.homeTeam.name)
                                        ? "red.500"
                                        : "gray.400"
                                    }
                                  >
                                    <Heart
                                      size={16}
                                      fill={
                                        favoriteTeams.includes(
                                          game.homeTeam.name,
                                        )
                                          ? "currentColor"
                                          : "none"
                                      }
                                    />
                                  </Box>
                                </Box>
                              </HStack>
                            </HStack>
                          </VStack>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </VStack>
              )}
            </>
          )}
        </VStack>
      </VStack>
    </Box>
  );
}
