import { useEffect, useRef, useState } from "react";
import {
  Box,
  VStack,
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
  setTwitterSearchQuery,
  setTwitterHasSearched,
  clearTwitterData,
} from "../store/slices/sportsDataSlice";

interface SocialSectionProps {
  selectedLeague: string;
}

export function Social({ selectedLeague }: SocialSectionProps) {
  const dispatch = useAppDispatch();
  const { twitterData, twitterLoading, twitterError, twitterSearchQuery } =
    useAppSelector((state) => state.sportsData);

  const hasInitialized = useRef(false);
  const [isTyping, setIsTyping] = useState(false);

  // Generate team names from today's games
  const getTodayTeamNames = () => {
    // For now, return empty array since we need to implement proper data fetching
    // This will be updated when we have the proper league data structure
    return [];
  };

  // Generate sports query from team names
  const generateSportsQuery = (teamNames: string[]) => {
    if (teamNames.length === 0) {
      return "sports OR baseball OR basketball OR football OR hockey";
    }
    return teamNames.join(" OR ");
  };

  // Debounced search effect - waits 2 seconds after user stops typing
  useEffect(() => {
    const performSearch = async () => {
      if (twitterSearchQuery.trim()) {
        // User provided a search query
        setIsTyping(false); // User stopped typing, search is starting
        dispatch(setTwitterHasSearched(true));
        dispatch(fetchTwitterData(twitterSearchQuery));
      } else if (!hasInitialized.current) {
        // Initial load - generate one from today's games
        const teamNames = getTodayTeamNames();
        const sportsQuery = generateSportsQuery(teamNames);
        dispatch(setTwitterHasSearched(true));
        dispatch(fetchTwitterData(sportsQuery));
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
  }, [twitterSearchQuery, selectedLeague, dispatch]);

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
  };

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
            <Input
              type="text"
              placeholder="Search tweets, teams, players..."
              value={twitterSearchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              pr="12"
              bg="white"
              borderColor="gray.300"
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px #3182ce",
              }}
            />
            {twitterSearchQuery && (
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

          {/* Search Button */}
          <Button
            onClick={() => {
              if (twitterSearchQuery.trim()) {
                dispatch(setTwitterHasSearched(true));
                dispatch(fetchTwitterData(twitterSearchQuery));
              }
            }}
            colorScheme="blue"
            size="md"
            disabled={!twitterSearchQuery.trim() || twitterLoading}
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
                  dispatch(fetchTwitterData(twitterSearchQuery));
                } else {
                  const teamNames = getTodayTeamNames();
                  const sportsQuery = generateSportsQuery(teamNames);
                  dispatch(fetchTwitterData(sportsQuery));
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
            <VStack gap="4" align="stretch">
              <Text color="gray.600" fontSize="sm">
                Found {twitterData.tweets.length} tweets
              </Text>
              {twitterData.tweets.map((tweet) => (
                <Box
                  key={tweet.id}
                  bg="white"
                  borderRadius="12px"
                  shadow="sm"
                  border="1px"
                  borderColor="gray.200"
                  overflow="hidden"
                >
                  <Tweet id={tweet.id} />
                </Box>
              ))}
            </VStack>
          )}
      </VStack>
    </Box>
  );
}
