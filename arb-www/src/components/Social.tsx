// React imports
import { useEffect, useRef, useState } from "react";

// Third-party library imports
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { MessageCircle, Search, X } from "lucide-react";
import { Tweet } from "react-tweet";

// Internal imports - components
import { TwitterCardSkeleton } from "./Skeleton";

// Internal imports - config
import { League, GameStatus, mapApiStatusToGameStatus } from "../config";

// Internal imports - services
import useArb from "../services/Arb";

// Internal imports - store
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearTwitterData,
  fetchTwitterData,
  loadMoreTwitterData,
  setTwitterHasSearched,
  setTwitterSearchQuery,
} from "../store/slices/sportsDataSlice";

interface SocialSectionProps {
  selectedLeague: string;
}

export function Social({ selectedLeague }: SocialSectionProps) {
  const dispatch = useAppDispatch();
  const {
    twitterData,
    twitterLoading,
    twitterLoadingMore,
    twitterError,
    twitterSearchQuery,
  } = useAppSelector((state) => state.sportsData);

  const hasInitialized = useRef(false);
  const isLoadingMore = useRef(false);
  const lastCursor = useRef<string | null>(null);
  const loadMoreAttempts = useRef(0);
  const [isTyping, setIsTyping] = useState(false);
  const [generatedQuery, setGeneratedQuery] = useState("");
  const [tweetFilter, setTweetFilter] = useState<"top" | "latest">("top");

  // Fetch data hooks
  const {
    fetchMLBScores,
    fetchMLBTeamProfiles,
    fetchMLBStadiums,
    mlbScores,
    mlbTeamProfiles,
  } = useArb();

  // Fetch data on mount
  useEffect(() => {
    if (selectedLeague === League.MLB) {
      fetchMLBScores();
      fetchMLBTeamProfiles();
      fetchMLBStadiums();
    }
  }, [selectedLeague, fetchMLBScores, fetchMLBTeamProfiles, fetchMLBStadiums]);

  // Generate team names from live games
  const getLiveGameTeamNames = () => {
    if (selectedLeague === League.MLB && mlbScores?.data) {
      // Use the same status detection logic as the Scores component
      const getStatus = (apiStatus: string): GameStatus => {
        return mapApiStatusToGameStatus(apiStatus);
      };

      // Convert MLB games to the same format as Live component
      const allGames = mlbScores.data.map((game) => {
        // Simple conversion to get team names
        const homeTeamProfile = mlbTeamProfiles?.data?.find(
          (team: any) =>
            team.Name === game.HomeTeam || team.Key === game.HomeTeam,
        );
        const awayTeamProfile = mlbTeamProfiles?.data?.find(
          (team: any) =>
            team.Name === game.AwayTeam || team.Key === game.AwayTeam,
        );

        const gameStatus = getStatus(game.Status);

        return {
          id: game.GameID?.toString() || "",
          homeTeam: {
            name: homeTeamProfile
              ? `${homeTeamProfile.City} ${homeTeamProfile.Name}`
              : game.HomeTeam || "",
          },
          awayTeam: {
            name: awayTeamProfile
              ? `${awayTeamProfile.City} ${awayTeamProfile.Name}`
              : game.AwayTeam || "",
          },
          status: gameStatus,
          originalStatus: game.Status,
        };
      });

      const liveGames = allGames.filter(
        (game) => game.status === GameStatus.LIVE,
      );

      // Extract team names from live games
      const teamNames: string[] = [];
      liveGames.forEach((game) => {
        if (game.homeTeam.name) teamNames.push(game.homeTeam.name);
        if (game.awayTeam.name) teamNames.push(game.awayTeam.name);
      });

      return teamNames;
    }
    return [];
  };

  // Generate sports query from team names
  const generateSportsQuery = (teamNames: string[]) => {
    if (teamNames.length === 0) {
      // If no live games, use the selected league name
      const query = selectedLeague.toUpperCase();
      setGeneratedQuery(query);
      return query;
    }
    const query = teamNames.join(" AND ");
    setGeneratedQuery(query);
    return query;
  };

  // Debounced search effect - waits 2 seconds after user stops typing
  useEffect(() => {
    const performSearch = async () => {
      if (twitterSearchQuery.trim()) {
        // User provided a search query
        setIsTyping(false); // User stopped typing, search is starting
        dispatch(setTwitterHasSearched(true));
        lastCursor.current = null; // Reset cursor for new search
        loadMoreAttempts.current = 0; // Reset attempts counter
        dispatch(
          fetchTwitterData({ query: twitterSearchQuery, filter: tweetFilter }),
        );
      } else if (!hasInitialized.current) {
        // Initial load - generate query from live games
        const teamNames = getLiveGameTeamNames();
        const sportsQuery = generateSportsQuery(teamNames);
        dispatch(setTwitterHasSearched(true));
        lastCursor.current = null; // Reset cursor for new search
        loadMoreAttempts.current = 0; // Reset attempts counter
        dispatch(fetchTwitterData({ query: sportsQuery, filter: tweetFilter }));
        hasInitialized.current = true;
      }
    };

    // Only debounce if user is typing (not initial load)
    if (twitterSearchQuery.trim() && hasInitialized.current) {
      setIsTyping(true); // User is typing, show typing indicator
      const timeoutId = setTimeout(performSearch, 2000); // 2 second delay
      return () => clearTimeout(timeoutId);
    } else {
      // For initial load or empty query, run immediately
      performSearch();
    }
  }, [
    twitterSearchQuery,
    selectedLeague,
    dispatch,
    mlbScores,
    mlbTeamProfiles,
  ]);

  // Regenerate query when data becomes available and no user search is active
  useEffect(() => {
    if (
      !twitterSearchQuery.trim() &&
      mlbScores?.data &&
      mlbTeamProfiles?.data &&
      hasInitialized.current
    ) {
      const teamNames = getLiveGameTeamNames();
      const sportsQuery = generateSportsQuery(teamNames);
      lastCursor.current = null; // Reset cursor for new search
      loadMoreAttempts.current = 0; // Reset attempts counter
      dispatch(fetchTwitterData({ query: sportsQuery, filter: tweetFilter }));
    }
  }, [
    mlbScores?.data,
    mlbTeamProfiles?.data,
    twitterSearchQuery,
    dispatch,
    tweetFilter,
  ]);

  // Trigger search when filter changes
  useEffect(() => {
    if (hasInitialized.current) {
      const query = twitterSearchQuery || generatedQuery;
      if (query.trim()) {
        lastCursor.current = null; // Reset cursor for new filter
        loadMoreAttempts.current = 0; // Reset attempts counter
        dispatch(fetchTwitterData({ query, filter: tweetFilter }));
      }
    }
  }, [tweetFilter, dispatch, twitterSearchQuery, generatedQuery]);

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    dispatch(setTwitterSearchQuery(value));
    if (value.trim()) {
      dispatch(clearTwitterData());
    }
  };

  const clearSearch = () => {
    dispatch(setTwitterSearchQuery(""));
    dispatch(clearTwitterData());
    dispatch(setTwitterHasSearched(false));
    setGeneratedQuery("");
    lastCursor.current = null;
    loadMoreAttempts.current = 0;
  };

  // Load more tweets function
  const loadMoreTweets = () => {
    if (
      twitterData?.has_next_page &&
      twitterData?.next_cursor &&
      !twitterLoadingMore &&
      !twitterLoading &&
      !isLoadingMore.current
    ) {
      // Check if cursor has actually changed
      if (lastCursor.current === twitterData.next_cursor) {
        return;
      }

      // Prevent too many attempts with same cursor
      if (loadMoreAttempts.current >= 3) {
        return;
      }

      const query = twitterSearchQuery || generatedQuery;
      if (query.trim()) {
        isLoadingMore.current = true;
        lastCursor.current = twitterData.next_cursor;
        loadMoreAttempts.current += 1;
        dispatch(
          loadMoreTwitterData({
            query,
            filter: tweetFilter,
            cursor: twitterData.next_cursor,
          }),
        );
      }
    }
  };

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000 // Load more when 1000px from bottom
      ) {
        loadMoreTweets();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    twitterData,
    twitterLoadingMore,
    twitterSearchQuery,
    generatedQuery,
    tweetFilter,
    dispatch,
  ]);

  // Reset loading ref when load more completes
  useEffect(() => {
    if (!twitterLoadingMore) {
      isLoadingMore.current = false;
      // Reset attempts counter when we successfully load more
      if (twitterData?.tweets && twitterData.tweets.length > 0) {
        loadMoreAttempts.current = 0;
      }
    }
  }, [twitterLoadingMore, twitterData?.tweets]);

  return (
    <Box minH="100vh" bg="primary.25">
      <VStack gap="3" align="stretch" p="4" pb="20">
        {/* Header */}
        {/* <Text fontSize="2xl" fontWeight="bold" color="gray.900">
          Social Feed
        </Text> */}

        {/* Search Bar */}
        <Box position="relative">
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#a0aec0",
              zIndex: 1,
            }}
          />
          <Input
            type="text"
            placeholder="Search tweets, teams, players..."
            value={twitterSearchQuery || generatedQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            pl="10"
            pr="12"
            bg="primary.200"
            borderColor="border.100"
            _focus={{
              borderColor: "accent.100",
              boxShadow: "0 0 0 1px var(--chakra-colors-accent-100)",
            }}
          />
          {(twitterSearchQuery || generatedQuery) && (
            <IconButton
              aria-label="Clear search"
              size="sm"
              position="absolute"
              right="2"
              top="50%"
              transform="translateY(-50%)"
              variant="ghost"
              onClick={clearSearch}
            >
              <X size={16} />
            </IconButton>
          )}
        </Box>

        {/* Filter Toggle */}
        <Box>
          <Flex
            bg="gray.100"
            borderRadius="md"
            p="0.5"
            position="relative"
            h="7"
            align="center"
            w="fit-content"
          >
            <Button
              flex="1"
              h="6"
              borderRadius="sm"
              bg={tweetFilter === "top" ? "white" : "transparent"}
              color={tweetFilter === "top" ? "blue.600" : "gray.600"}
              fontWeight="medium"
              fontSize="xs"
              onClick={() => setTweetFilter("top")}
              boxShadow={tweetFilter === "top" ? "sm" : "none"}
              px="3"
            >
              Top
            </Button>
            <Button
              flex="1"
              h="6"
              borderRadius="sm"
              bg={tweetFilter === "latest" ? "white" : "transparent"}
              color={tweetFilter === "latest" ? "blue.600" : "gray.600"}
              fontWeight="medium"
              fontSize="xs"
              onClick={() => setTweetFilter("latest")}
              boxShadow={tweetFilter === "latest" ? "sm" : "none"}
              px="3"
            >
              Latest
            </Button>
          </Flex>
        </Box>

        {/* Loading State */}
        {twitterLoading && (
          <VStack gap="4" align="stretch">
            <Text color="gray.600" fontSize="sm" mb="2">
              Searching for tweets...
            </Text>
            {Array.from({ length: 4 }, (_, index) => (
              <TwitterCardSkeleton key={`skeleton-${index}`} />
            ))}
          </VStack>
        )}

        {/* Typing Indicator */}
        {isTyping && !twitterLoading && (
          <VStack gap="2" py="4">
            <Text color="gray.500" fontSize="sm">
              Waiting for you to finish typing...
            </Text>
          </VStack>
        )}

        {/* Error State */}
        {twitterError && (
          <VStack gap="2" py="4">
            <MessageCircle size={48} color="#e53e3e" />
            <Text color="red.500" textAlign="center" maxW="md">
              {twitterError}
            </Text>
            <Button
              onClick={() => {
                if (twitterSearchQuery.trim()) {
                  dispatch(
                    fetchTwitterData({
                      query: twitterSearchQuery,
                      filter: tweetFilter,
                    }),
                  );
                } else {
                  const teamNames = getLiveGameTeamNames();
                  const sportsQuery = generateSportsQuery(teamNames);
                  dispatch(
                    fetchTwitterData({
                      query: sportsQuery,
                      filter: tweetFilter,
                    }),
                  );
                }
              }}
              colorScheme="red"
              variant="outline"
            >
              Try Again
            </Button>
          </VStack>
        )}

        {/* No Tweets Found */}
        {!twitterLoading &&
          !twitterError &&
          twitterData &&
          twitterData.tweets.length === 0 && (
            <VStack gap="2" py="4">
              <MessageCircle size={48} color="#a0aec0" />
              <Text color="gray.500" textAlign="center" maxW="md">
                No tweets found for "{twitterSearchQuery || "sports"}"
              </Text>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                Try searching for specific teams, players, or keywords
              </Text>
            </VStack>
          )}

        {/* Tweets */}
        {!twitterLoading &&
          !twitterError &&
          twitterData &&
          twitterData.tweets.length > 0 && (
            <VStack gap="0" align="stretch">
              <Text color="gray.600" fontSize="sm" mb="2">
                Found {twitterData?.tweets.length || 0} tweets
              </Text>
              {twitterData?.tweets.map((tweet) => (
                <Box
                  key={tweet.id}

                  // mb={index < twitterData.tweets.length - 1 ? "8px" : "0"}
                >
                  <Tweet id={tweet.id} />
                </Box>
              ))}

              {/* Load More Indicator */}
              {twitterLoadingMore && (
                <VStack gap="1" py="2">
                  <Spinner size="sm" color="blue.500" />
                  <Text color="gray.500" fontSize="sm">
                    Loading more tweets...
                  </Text>
                </VStack>
              )}

              {/* End of results indicator */}
              {!twitterData?.has_next_page && !twitterLoadingMore && (
                <Text color="gray.400" fontSize="sm" textAlign="center" py="2">
                  No more tweets to load
                </Text>
              )}
            </VStack>
          )}
      </VStack>
    </Box>
  );
}
