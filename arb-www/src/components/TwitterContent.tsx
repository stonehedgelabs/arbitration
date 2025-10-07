// React imports
import { useEffect, useRef, useState, memo, useCallback } from "react";

// Third-party library imports
import {
  Box,
  Button,
  Flex,
  HStack,
  Spinner,
  Text,
  VStack,
  IconButton,
  Switch,
} from "@chakra-ui/react";
import { MessageCircle, Twitter, RefreshCw } from "lucide-react";
import { Tweet } from "react-tweet";

// Internal imports - components
import { SearchBar } from "./SearchBar";
import { TwitterCardSkeleton } from "./Skeleton";

// Internal imports - store
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearTwitterData,
  fetchTwitterData,
  loadMoreTwitterData,
  setTwitterHasSearched,
  setTwitterSearchQuery,
  setTwitterSortKind,
} from "../store/slices/sportsDataSlice";

interface TwitterContentProps {
  defaultTweetCount?: number;
  initialSearchQuery?: string;
}

export const TwitterContent = memo(function TwitterContent({
  initialSearchQuery,
}: TwitterContentProps) {
  const dispatch = useAppDispatch();
  const {
    twitterData,
    twitterLoading,
    twitterLoadingMore,
    twitterError,
    twitterHasSearched,
    twitterSearchQuery,
    twitterSortKind,
  } = useAppSelector((state) => state.sportsData);

  const [isSearching, setIsSearching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  // Set initial search query if provided
  useEffect(() => {
    if (initialSearchQuery && !twitterHasSearched) {
      dispatch(setTwitterSearchQuery(initialSearchQuery));
    }
  }, [initialSearchQuery, twitterHasSearched, dispatch]);

  // No need to initialize from Redux state since we're using it directly

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !twitterLoadingMore &&
          twitterData?.next_cursor
        ) {
          dispatch(
            loadMoreTwitterData({
              query: twitterSearchQuery,
              filter: twitterSortKind,
              cursor: twitterData.next_cursor,
            }),
          );
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [
    dispatch,
    twitterLoadingMore,
    twitterData?.next_cursor,
    twitterSearchQuery,
    twitterSortKind,
  ]);

  const handleSearch = useCallback(async () => {
    if (!twitterSearchQuery.trim()) {
      return;
    }

    setIsSearching(true);
    dispatch(setTwitterHasSearched(true));
    dispatch(clearTwitterData());

    try {
      const result = await dispatch(
        fetchTwitterData({
          query: twitterSearchQuery.trim(),
          filter: twitterSortKind,
        }),
      );

      // Check if the action was rejected
      if (fetchTwitterData.rejected.match(result)) {
        console.error("❌ Twitter search failed:", result.error);
      }
    } catch (error) {
      console.error("❌ Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  }, [twitterSearchQuery, twitterSortKind, dispatch]);

  // Debounced search effect
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Only search if there's a query and it's not empty
    if (twitterSearchQuery.trim()) {
      // Set new timeout for 1 second
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch();
      }, 1000);
    } else {
      // If query is empty, clear the search state
      dispatch(setTwitterHasSearched(false));
      dispatch(clearTwitterData());
    }

    // Cleanup timeout on unmount or when query changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [twitterSearchQuery, handleSearch, dispatch]);

  // Trigger new search when sort kind changes
  useEffect(() => {
    if (twitterHasSearched && twitterSearchQuery.trim()) {
      handleSearch();
    }
  }, [twitterSortKind, twitterHasSearched, twitterSearchQuery, handleSearch]);

  const handleClearSearch = () => {
    dispatch(setTwitterSearchQuery(""));
    dispatch(setTwitterHasSearched(false));
    dispatch(clearTwitterData());
  };

  const handleRefresh = () => {
    if (twitterSearchQuery.trim()) {
      dispatch(
        fetchTwitterData({
          query: twitterSearchQuery.trim(),
          filter: twitterSortKind,
        }),
      );
    }
  };

  return (
    <VStack align="stretch">
      {/* Search Bar */}
      <SearchBar
        placeholder="Search for tweets..."
        value={twitterSearchQuery}
        onChange={(value) => dispatch(setTwitterSearchQuery(value))}
        onSearch={() => {}} // No-op since we're using debounced search
        isLoading={isSearching}
      />

      {/* Twitter Header with Sort Toggle and Refresh */}
      {twitterHasSearched && (
        <HStack justify="space-between" align="center" py="2">
          {/* Twitter Sort Toggle */}
          <HStack gap="2" align="center">
            <Text fontSize="xs" color="text.400">
              Top
            </Text>
            <Switch.Root
              size="xs"
              checked={twitterSortKind === "latest"}
              onCheckedChange={(e) => {
                const newSort = e.checked ? "latest" : "top";
                dispatch(setTwitterSortKind(newSort));
              }}
            >
              <Switch.HiddenInput />
              <Switch.Control />
            </Switch.Root>
            <Text fontSize="xs" color="text.400">
              Latest
            </Text>
          </HStack>
          {/* Refresh Button */}
          <IconButton
            aria-label="Refresh tweets"
            size="sm"
            variant="ghost"
            color="text.400"
            onClick={handleRefresh}
            loading={twitterLoading}
          >
            <RefreshCw size={16} />
          </IconButton>
        </HStack>
      )}

      {/* Content */}
      {!twitterHasSearched ? (
        // Initial state - no search yet
        <VStack gap="6" align="center" py="12">
          <Box
            w="20"
            h="20"
            bg="primary.200"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Twitter size={32} color="#1DA1F2" />
          </Box>
          <VStack gap="3" align="center">
            <Text fontSize="lg" fontWeight="semibold" color="text.400">
              Find Tweets
            </Text>
            <Text fontSize="sm" color="text.500" textAlign="center" maxW="md">
              Search for tweets about your favorite teams, players, or games.
            </Text>
          </VStack>
        </VStack>
      ) : twitterLoading ? (
        // Loading state
        <VStack gap="4" align="stretch">
          {Array.from({ length: 3 }, (_, index) => (
            <TwitterCardSkeleton key={`skeleton-${index}`} />
          ))}
        </VStack>
      ) : twitterError ? (
        // Error state
        <VStack gap="4" align="center" py="8">
          <Text color="red.500" fontSize="lg" fontWeight="semibold">
            Error loading tweets
          </Text>
          <Text color="text.400" textAlign="center">
            {twitterError}
          </Text>
          <Button onClick={handleSearch} colorScheme="red" variant="outline">
            Try Again
          </Button>
        </VStack>
      ) : !twitterData?.tweets || twitterData.tweets.length === 0 ? (
        // No results state
        <VStack gap="4" align="center" py="8">
          <Box
            w="12"
            h="12"
            bg="primary.200"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Twitter size={24} color="#1DA1F2" />
          </Box>
          <Text fontSize="lg" fontWeight="semibold" color="text.400">
            Search for something to find tweets
          </Text>
          <Text color="text.500" textAlign="center">
            Enter a search term above to discover what's happening on Twitter.
          </Text>
        </VStack>
      ) : (
        // Results state
        <VStack align="stretch">
          {/* Search Results Header */}
          <VStack gap="2" align="start">
            <Text fontSize="xs" color="text.500">
              Results for "{twitterSearchQuery}"
            </Text>
            <Text fontSize="xs" color="text.500">
              {twitterData.tweets.length} tweet
              {twitterData.tweets.length !== 1 ? "s" : ""} found
            </Text>
          </VStack>

          {/* Tweets */}
          {twitterData.tweets.map((tweet: any, index: number) => (
            <Box
              key={tweet.id || index}
              bg="primary.25"
              borderRadius="12px"
              // p="4"
              border="1px"
              borderColor="text.300"
              _hover={{ borderColor: "text.400" }}
              transition="border-color 0.2s"
            >
              <Tweet id={tweet.id} />
            </Box>
          ))}

          {/* Load More Trigger */}
          {twitterData.next_cursor && (
            <Box ref={loadMoreRef} py="4">
              {twitterLoadingMore ? (
                <Flex justify="center" align="center" py="4">
                  <Spinner size="sm" color="buttons.primary.bg" />
                  <Text ml="2" fontSize="sm" color="text.500">
                    Loading more tweets...
                  </Text>
                </Flex>
              ) : (
                <Box h="4" />
              )}
            </Box>
          )}
        </VStack>
      )}
    </VStack>
  );
});
