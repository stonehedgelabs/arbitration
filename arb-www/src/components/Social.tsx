import { useEffect, useRef, useState } from "react";
import {
  Box,
  VStack,
  Flex,
  Text,
  Input,
  Button,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { Search, X, MessageCircle } from "lucide-react";
import { Tweet } from "react-tweet";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchTwitterData,
  loadMoreTwitterData,
  setTwitterSearchQuery,
  setTwitterHasSearched,
  clearTwitterData,
} from "../store/slices/sportsDataSlice";
import useArb from "../services/Arb";

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
    if (selectedLeague === "mlb") {
      fetchMLBScores();
      fetchMLBTeamProfiles();
      fetchMLBStadiums();
    }
  }, [selectedLeague, fetchMLBScores, fetchMLBTeamProfiles, fetchMLBStadiums]);

  // Generate team names from live games
  const getLiveGameTeamNames = () => {
    if (selectedLeague === "mlb" && mlbScores?.data) {
      console.log("Social: Checking for live games...", {
        totalGames: mlbScores.data.length,
        gameStatuses: mlbScores.data.map((g) => ({
          id: g.GameID,
          status: g.Status,
          home: g.HomeTeam,
          away: g.AwayTeam,
        })),
      });

      // Use the same status detection logic as the Scores component
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

      console.log("Social: All games processed:", allGames);

      const liveGames = allGames.filter((game) => game.status === "live");
      console.log("Social: Live games found:", liveGames);

      // Extract team names from live games
      const teamNames: string[] = [];
      liveGames.forEach((game) => {
        if (game.homeTeam.name) teamNames.push(game.homeTeam.name);
        if (game.awayTeam.name) teamNames.push(game.awayTeam.name);
      });

      console.log("Social: Team names extracted:", teamNames);
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
    const query = teamNames.join(" OR ");
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
        console.log("Social: Generated query from live games:", {
          teamNames,
          sportsQuery,
        });
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
      console.log("Social: Data loaded, regenerating query...");
      const teamNames = getLiveGameTeamNames();
      const sportsQuery = generateSportsQuery(teamNames);
      console.log("Social: Regenerated query from live games:", {
        teamNames,
        sportsQuery,
      });
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
        console.log("Social: Cursor hasn't changed, stopping infinite loop");
        return;
      }

      // Prevent too many attempts with same cursor
      if (loadMoreAttempts.current >= 3) {
        console.log(
          "Social: Too many load more attempts, stopping to prevent infinite loop",
        );
        return;
      }

      const query = twitterSearchQuery || generatedQuery;
      if (query.trim()) {
        isLoadingMore.current = true;
        lastCursor.current = twitterData.next_cursor;
        loadMoreAttempts.current += 1;
        console.log(
          "Social: Loading more tweets with cursor:",
          twitterData.next_cursor,
          `(attempt ${loadMoreAttempts.current})`,
        );
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
    <Box minH="100vh" bg="gray.50">
      <VStack gap="4" align="stretch" p="4" pb="20">
        {/* Header */}
        <VStack gap="4" align="stretch">
          <Text fontSize="2xl" fontWeight="bold" color="gray.900">
            Social Feed
          </Text>

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
              bg="white"
              borderColor="gray.300"
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px #3182ce",
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
              borderRadius="lg"
              p="1"
              position="relative"
              h="10"
              align="center"
              w="fit-content"
            >
              <Button
                flex="1"
                h="8"
                borderRadius="md"
                bg={tweetFilter === "top" ? "white" : "transparent"}
                color={tweetFilter === "top" ? "blue.600" : "gray.600"}
                fontWeight="medium"
                fontSize="sm"
                onClick={() => setTweetFilter("top")}
                _hover={{ bg: tweetFilter === "top" ? "white" : "gray.200" }}
                boxShadow={tweetFilter === "top" ? "sm" : "none"}
                px="4"
              >
                Top
              </Button>
              <Button
                flex="1"
                h="8"
                borderRadius="md"
                bg={tweetFilter === "latest" ? "white" : "transparent"}
                color={tweetFilter === "latest" ? "blue.600" : "gray.600"}
                fontWeight="medium"
                fontSize="sm"
                onClick={() => setTweetFilter("latest")}
                _hover={{ bg: tweetFilter === "latest" ? "white" : "gray.200" }}
                boxShadow={tweetFilter === "latest" ? "sm" : "none"}
                px="4"
              >
                Latest
              </Button>
            </Flex>
          </Box>

          {/* Search Button */}
          <Button
            onClick={() => {
              const query = twitterSearchQuery || generatedQuery;
              if (query.trim()) {
                dispatch(setTwitterHasSearched(true));
                dispatch(fetchTwitterData({ query, filter: tweetFilter }));
              }
            }}
            colorScheme="blue"
            size="md"
            disabled={
              !(twitterSearchQuery || generatedQuery)?.trim() || twitterLoading
            }
          >
            <Search size={16} style={{ marginRight: "8px" }} />
            Search Tweets
          </Button>
        </VStack>

        {/* Loading State */}
        {twitterLoading && (
          <VStack gap="4" py="8">
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.600">Searching for tweets...</Text>
          </VStack>
        )}

        {/* Typing Indicator */}
        {isTyping && !twitterLoading && (
          <VStack gap="4" py="8">
            <Text color="gray.500" fontSize="sm">
              Waiting for you to finish typing...
            </Text>
          </VStack>
        )}

        {/* Error State */}
        {twitterError && (
          <VStack gap="4" py="8">
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
            <VStack gap="4" py="8">
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
            <VStack gap="2" align="stretch">
              <Text color="gray.600" fontSize="sm">
                Found {twitterData.tweets.length} tweets
              </Text>
              {twitterData.tweets.map((tweet) => (
                <Box key={tweet.id}>
                  <Tweet id={tweet.id} />
                </Box>
              ))}

              {/* Load More Indicator */}
              {twitterLoadingMore && (
                <VStack gap="2" py="4">
                  <Spinner size="sm" color="blue.500" />
                  <Text color="gray.500" fontSize="sm">
                    Loading more tweets...
                  </Text>
                </VStack>
              )}

              {/* End of results indicator */}
              {!twitterData.has_next_page && !twitterLoadingMore && (
                <Text color="gray.400" fontSize="sm" textAlign="center" py="4">
                  No more tweets to load
                </Text>
              )}
            </VStack>
          )}
      </VStack>
    </Box>
  );
}
