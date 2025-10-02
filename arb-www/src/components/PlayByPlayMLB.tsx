import { useEffect, useState, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Card,
  Badge,
  Button,
  IconButton,
  Image,
} from "@chakra-ui/react";
import { ArrowLeft, RefreshCw, Zap, TrendingUp, Target, X, AlertTriangle, Circle } from "lucide-react";
import { Play } from "../schema/mlb/playbyplay";
import { PLAY_BY_PLAY_CONFIG, buildApiUrl } from "../config";
import { getPlayLabel, getPlayIcon } from "../utils";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { fetchBoxScore } from "../store/slices/sportsDataSlice";
import useArb from "../services/Arb";

// Interface for the actual API response structure
interface ActualPlayByPlayResponse {
  league: string;
  game_id: string;
  data: Play[];
}

interface PlayByPlayMLBProps {
  gameId?: string;
  onBack: () => void;
}

// Maximum number of play-by-play events to keep in memory
const MAX_EVENTS = 50;

export function PlayByPlayMLB({ gameId, onBack }: PlayByPlayMLBProps) {
  // Get gameId from URL params if not provided as prop
  const urlParams = new URLSearchParams(window.location.search);
  const gameIdFromUrl = urlParams.get('gameId');
  const actualGameId = gameId || gameIdFromUrl;

  // Get league from URL path (e.g., /scores/mlb/76782 -> mlb)
  const pathParts = window.location.pathname.split('/');
  const leagueFromUrl = pathParts[2]; // /scores/mlb/76782 -> mlb

  // Get box-score data from Redux state
  const dispatch = useAppDispatch();
  const boxScoreData = useAppSelector((state) => state.sportsData.boxScoreData);
  const selectedLeague = useAppSelector((state) => state.sportsData.selectedLeague);
  
  // Use league from URL if available, otherwise fall back to Redux state
  const currentLeague = leagueFromUrl || selectedLeague;

  // Get all data from Redux state
  const { 
    mlbTeamProfiles, 
    fetchMLBTeamProfiles
  } = useArb();

  // Get current game data from box-score
  const currentGame = actualGameId ? boxScoreData[actualGameId as keyof typeof boxScoreData] : null;

  // Fetch ALL data when component loads
  useEffect(() => {
    if (currentLeague === 'mlb') {
      // Fetch team profiles for logos
      if (!mlbTeamProfiles || mlbTeamProfiles.data.length === 0) {
        console.log('Fetching MLB team profiles...');
        fetchMLBTeamProfiles();
      }
    }
  }, [currentLeague]); // Removed mlbTeamProfiles and fetchMLBTeamProfiles to prevent loops

  // Create team ID to logo mapping from the fetched data
  const teamIdToLogo = mlbTeamProfiles?.data?.reduce((acc: Record<number, string>, team) => {
    acc[team.TeamID] = team.WikipediaLogoUrl;
    return acc;
  }, {} as Record<number, string>) || {};

  // Fetch box score if it doesn't exist
  useEffect(() => {
    console.log('useEffect triggered - actualGameId:', actualGameId, 'currentGame:', currentGame, 'currentLeague:', currentLeague);
    if (actualGameId && !currentGame) {
      console.log('Box score not found for game', actualGameId, '- fetching from API');
      dispatch(fetchBoxScore({ league: currentLeague, gameId: actualGameId }));
    } else if (actualGameId && currentGame) {
      console.log('Box score already exists for game', actualGameId);
    } else {
      console.log('No game ID or no current game');
    }
  }, [actualGameId, currentGame, currentLeague, dispatch]);

  // Debug logging
  console.log('PlayByPlayMLB - actualGameId:', actualGameId);
  console.log('PlayByPlayMLB - currentGame:', currentGame);
  console.log('PlayByPlayMLB - mlbTeamProfiles:', mlbTeamProfiles);
  console.log('PlayByPlayMLB - teamIdToLogo:', teamIdToLogo);

  if (!actualGameId) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack gap="4">
          <Text color="red.500" fontSize="lg" fontWeight="semibold">
            No Game Selected
          </Text>
          <Text color="gray.600" textAlign="center">
            Please select a game to view play-by-play data.
          </Text>
          <Button onClick={onBack}>Go Back</Button>
        </VStack>
      </Box>
    );
  }
  const [playByPlayData, setPlayByPlayData] = useState<ActualPlayByPlayResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastTimestamp, setLastTimestamp] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const intervalRef = useRef<number | null>(null);
  const timeUpdateRef = useRef<number | null>(null);

  // Format event description using the utility function
  const formatEventDescription = (play: Play): string => {
    return getPlayLabel(play);
  };

  // Get the appropriate icon component for a play
  const getPlayIconComponent = (play: Play) => {
    const iconType = getPlayIcon(play);
    const iconProps = { size: 16, color: "#6B7280" }; // Grey color
    
    switch (iconType) {
      case 'strikeout':
        return <Zap {...iconProps} />;
      case 'walk':
        return <TrendingUp {...iconProps} />;
      case 'hit':
        return <Target {...iconProps} />;
      case 'out':
        return <X {...iconProps} />;
      case 'sacrifice':
        return <Circle {...iconProps} />;
      case 'error':
        return <AlertTriangle {...iconProps} />;
      default:
        return <Circle {...iconProps} />;
    }
  };

  // Format inning display (Top 9, Bot 9, etc.)
  const formatInning = (inningNumber: number, inningHalf: string): string => {
    const half = inningHalf === 'T' ? 'Top' : 'Bot';
    return `${half} ${inningNumber}`;
  };

  // Format timestamp for display as relative time
  const formatTimestamp = (timestamp: string): string => {
    try {
      // Parse the UTC timestamp and convert to local time
      const utcDate = new Date(timestamp + 'Z'); // Ensure it's treated as UTC
      const localDate = new Date(utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000));
      
      const diffInSeconds = Math.floor((currentTime.getTime() - localDate.getTime()) / 1000);
      
      // Handle future timestamps or invalid dates
      if (diffInSeconds < 0) {
        return "Just now";
      }
      
      if (diffInSeconds < 60) {
        return `${diffInSeconds} sec${diffInSeconds !== 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
      }
    } catch {
      return "Just now";
    }
  };

  // Fetch play-by-play data
  const fetchPlayByPlay = async (isInitial = false) => {
    try {
      const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
      const params: Record<string, string> = {
        league: 'mlb',
        game_id: actualGameId,
        interval: '1min',
        t: now.toString() // Send as string to our backend, but it will be converted to int
      };
      
      if (lastTimestamp) {
        params.last_timestamp = lastTimestamp;
      }
      
      const url = buildApiUrl('/api/v1/play-by-play', params);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch play-by-play data: ${response.statusText}`);
      }
      
      const data: ActualPlayByPlayResponse = await response.json();
      
      // Debug logging
      console.log('Play-by-play API response:', data);
      console.log('Plays data:', data.data);
      console.log('Number of plays:', data.data.length);

      if (isInitial) {
        // For initial load, limit to latest events
        const limitedData = {
          ...data,
          data: data.data.slice(0, MAX_EVENTS)
        };
        setPlayByPlayData(limitedData);
        setLastTimestamp(now.toString());
      } else {
        // For subsequent fetches, append new events and limit to latest events
        setPlayByPlayData(prev => {
          if (!prev) return data;
          
          // Merge new plays with existing ones, avoiding duplicates
          const existingPlayIds = new Set(prev.data.map(p => p.PlayID));
          const newPlays = data.data.filter(p => !existingPlayIds.has(p.PlayID));
          
          // Combine and sort by timestamp, then limit to latest events
          const allPlays = [...newPlays, ...prev.data]
            .sort((a, b) => b.Updated.localeCompare(a.Updated))
            .slice(0, MAX_EVENTS);
          
          return {
            ...data,
            data: allPlays
          };
        });
        setLastTimestamp(now.toString());
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching play-by-play data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch play-by-play data');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchPlayByPlay(true);
  }, [actualGameId]);

  // Set up polling
  useEffect(() => {
    if (playByPlayData) {
      intervalRef.current = setInterval(() => {
        fetchPlayByPlay(false);
      }, PLAY_BY_PLAY_CONFIG.refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playByPlayData, gameId, lastTimestamp]);

  // Update current time every 10 seconds for relative time display
  useEffect(() => {
    timeUpdateRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Update every 10 seconds

    return () => {
      if (timeUpdateRef.current) {
        clearInterval(timeUpdateRef.current);
      }
    };
  }, []);

  // Manual refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchPlayByPlay(false);
  };

  if (loading && !playByPlayData) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack gap="4">
          <Spinner size="lg" color="red.500" />
          <Text color="gray.600">Loading play-by-play...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack gap="4">
          <Text color="red.500" fontSize="lg" fontWeight="semibold">
            Error loading play-by-play
          </Text>
          <Text color="gray.600" textAlign="center">
            {error}
          </Text>
          <Button onClick={handleRefresh} colorScheme="red">
            Try Again
          </Button>
        </VStack>
      </Box>
    );
  }

  if (!playByPlayData || !playByPlayData.data || playByPlayData.data.length === 0) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <VStack gap="4">
          <Text color="gray.600" fontSize="lg" fontWeight="semibold">
            No play-by-play data available for this game.
          </Text>
          <Text color="gray.600">The game data is missing or incomplete.</Text>
          <Button onClick={onBack}>Go Back</Button>
        </VStack>
      </Box>
    );
  }

  // Extract plays from the actual API response structure and sort by time DESC (newest first)
  const plays = [...playByPlayData.data].sort((a, b) => 
    new Date(b.Updated).getTime() - new Date(a.Updated).getTime()
  );
  
  // Get team names from box score data
  const awayTeam = currentGame?.awayTeam?.name || currentGame?.AwayTeam || "Away Team";
  const homeTeam = currentGame?.homeTeam?.name || currentGame?.HomeTeam || "Home Team";

  // Function to get team logo for a play
  const getTeamLogoForPlay = (play: Play): string | null => {
    // For most plays, the hitter is the acting player, so use HitterTeamID
    // For some defensive plays, we might want to use PitcherTeamID
    // For now, let's use HitterTeamID as the primary acting player
    const actingTeamId = play.HitterTeamID;
    const logo = teamIdToLogo[actingTeamId] || null;
    console.log(`Play ${play.PlayID}: HitterTeamID=${actingTeamId}, logo=${logo}`);
    return logo;
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" borderBottom="1px" borderColor="gray.200" p="4">
        <HStack justify="space-between" align="center">
          <HStack gap="3">
            <IconButton
              aria-label="Go back"
              variant="ghost"
              onClick={onBack}
              colorScheme="gray"
              size="md"
            >
              <ArrowLeft size={20} />
            </IconButton>
            <VStack align="start" gap="0">
              <Text fontSize="lg" fontWeight="bold">
                {awayTeam} @ {homeTeam}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Play-by-Play
              </Text>
              {currentGame && (
                <HStack gap="2" mt="1">
                  <Text fontSize="sm" fontWeight="medium">
                    {currentGame.AwayTeamRuns || 0} - {currentGame.HomeTeamRuns || 0}
                  </Text>
                  {currentGame.Inning && currentGame.InningHalf && (
                    <Text fontSize="xs" color="gray.500">
                      {currentGame.InningHalf === 'T' ? 'Top' : 'Bot'} {currentGame.Inning}
                    </Text>
                  )}
                </HStack>
              )}
            </VStack>
          </HStack>
          
          <HStack gap="2">
            <Badge colorScheme="red" variant="solid">
              Live
            </Badge>
                   <IconButton
                     aria-label="Refresh"
                     size="sm"
                     variant="ghost"
                     onClick={handleRefresh}
                     loading={loading}
                   >
              <RefreshCw size={16} />
            </IconButton>
          </HStack>
        </HStack>
      </Box>

      {/* Game Status */}
      <Box bg="white" p="4" borderBottom="1px" borderColor="gray.200">
        <HStack justify="space-between" align="center">
          <VStack align="start" gap="1">
            <Text fontSize="sm" fontWeight="medium">
              {currentGame?.Status || 'Live Game'}
            </Text>
            <Text fontSize="xs" color="gray.600">
              Play-by-Play Events
            </Text>
            {currentGame && (
              <HStack gap="4" mt="1">
                <Text fontSize="xs" color="gray.500">
                  Hits: {currentGame.AwayTeamHits || 0} - {currentGame.HomeTeamHits || 0}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Errors: {currentGame.AwayTeamErrors || 0} - {currentGame.HomeTeamErrors || 0}
                </Text>
              </HStack>
            )}
          </VStack>
          
          <VStack align="end" gap="1">
            <Text fontSize="xs" color="gray.600">
              {plays.length} events
            </Text>
            <Text fontSize="xs" color="gray.600">
              Live
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Play-by-Play Events */}
      <Box p="4">
        <VStack gap="2" align="stretch">
          {plays.length === 0 ? (
            <Card.Root>
              <Card.Body p="6">
                <VStack gap="2">
                  <Text color="gray.600">No events yet</Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Play-by-play events will appear here as they happen
                  </Text>
                </VStack>
              </Card.Body>
            </Card.Root>
          ) : (
            // Display latest 50 events (most recent first)
            plays.map((play) => {
              const teamLogo = getTeamLogoForPlay(play);
              return (
                <Card.Root key={play.PlayID} bg="white" shadow="sm">
                  <Card.Body p="3">
                    <HStack justify="space-between" align="start" gap="3">
                      {/* Team logo and play icon */}
                      <HStack gap="2" align="center">
                        {/* Team logo */}
                        {teamLogo && (
                          <Image
                            src={teamLogo}
                            alt="Team logo"
                            boxSize="24px"
                            objectFit="contain"
                          />
                        )}
                        {/* Play icon */}
                        <Box display="flex" alignItems="center" justifyContent="center" minW="20px">
                          {getPlayIconComponent(play)}
                        </Box>
                      </HStack>
                      
                      {/* Main content */}
                      <VStack align="start" gap="1" flex="1">
                      <Text fontSize="sm" fontWeight="medium">
                        {formatEventDescription(play)}
                      </Text>
                    </VStack>
                    
                    {/* Right side info */}
                    <VStack align="end" gap="1">
                      <Text fontSize="xs" color="gray.500">
                        {formatTimestamp(play.Updated)}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatInning(play.InningNumber, play.InningHalf)}
                      </Text>
                      {currentGame && (
                        <Text fontSize="xs" color="gray.600" fontWeight="medium">
                          {currentGame.AwayTeam} {currentGame.AwayTeamRuns || 0} - {currentGame.HomeTeamRuns || 0} {currentGame.HomeTeam}
                        </Text>
                      )}
                      {play.Balls !== undefined && play.Strikes !== undefined && (
                        <Text fontSize="xs" color="gray.400">
                          {play.Balls}-{play.Strikes}
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                </Card.Body>
              </Card.Root>
              );
            })
          )}
        </VStack>
      </Box>
    </Box>
  );
}
