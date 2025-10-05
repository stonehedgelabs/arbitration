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
import { TwitterCardSkeleton } from "../components/Skeleton";

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

// Internal imports - utils
import { orEmpty } from "../utils.ts";

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
    twitterHasSearched,
    twitterSearchQuery,
  } = useAppSelector((state) => state.sportsData);

  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Initialize search query from Redux state
  useEffect(() => {
    if (twitterSearchQuery) {
      setSearchInput(twitterSearchQuery);
    }
  }, [twitterSearchQuery]);

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
          twitterData?.nextToken
        ) {
          dispatch(loadMoreTwitterData());
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
  }, [dispatch, twitterLoadingMore, twitterData?.nextToken]);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    setIsSearching(true);
    dispatch(setTwitterSearchQuery(searchInput.trim()));
    dispatch(setTwitterHasSearched(true));
    dispatch(clearTwitterData());

    try {
      await dispatch(fetchTwitterData({ query: searchInput.trim() }));
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    dispatch(setTwitterSearchQuery(""));
    dispatch(setTwitterHasSearched(false));
    dispatch(clearTwitterData());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Box minH="100vh" bg="primary.25">
      <VStack gap="4" align="stretch" p="4" pb="20">
        {/* Header */}
        <VStack gap="4" align="stretch">
          <Text fontSize="2xl" fontWeight="bold" color="text.400">
            Social
          </Text>

          {/* Search Bar */}
          <Flex gap="2" align="center">
            <Input
              placeholder="Search for tweets..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              bg="primary.25"
              borderColor="text.300"
              _focus={{
                borderColor: "accent.400",
                boxShadow: "0 0 0 1px var(--chakra-colors-accent-400)",
              }}
              flex="1"
            />
            <IconButton
              aria-label="Search"
              icon={<Search size={20} />}
              onClick={handleSearch}
              isLoading={isSearching}
              bg="accent.400"
              color="white"
              _hover={{ bg: "accent.500" }}
              _active={{ bg: "accent.600" }}
            />
            {twitterHasSearched && (
              <IconButton
                aria-label="Clear search"
                icon={<X size={20} />}
                onClick={handleClearSearch}
                variant="ghost"
                color="text.400"
                _hover={{ bg: "text.200" }}
              />
            )}
          </Flex>
        </VStack>

        {/* Content */}
        {!twitterHasSearched ? (
          // Initial state - no search yet
          <VStack gap="6" align="center" py="12">
            <Box
              w="20"
              h="20"
              bg="text.200"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <MessageCircle size={32} color="var(--chakra-colors-text-400)" />
            </Box>
            <VStack gap="3" align="center">
              <Text fontSize="lg" fontWeight="semibold" color="text.400">
                Search for Sports Tweets
              </Text>
              <Text fontSize="sm" color="text.500" textAlign="center" maxW="md">
                Enter a search term to find tweets about your favorite teams,
                players, or games.
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
            <Text fontSize="lg" fontWeight="semibold" color="text.400">
              No tweets found
            </Text>
            <Text color="text.500" textAlign="center">
              Try a different search term or check back later.
            </Text>
          </VStack>
        ) : (
          // Results state
          <VStack gap="4" align="stretch">
            {/* Search Results Header */}
            <VStack gap="2" align="start">
              <Text fontSize="sm" color="text.500">
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
                p="4"
                border="1px"
                borderColor="text.300"
                _hover={{ borderColor: "text.400" }}
                transition="border-color 0.2s"
              >
                <Tweet id={tweet.id} />
              </Box>
            ))}

            {/* Load More Trigger */}
            {twitterData.nextToken && (
              <Box ref={loadMoreRef} py="4">
                {twitterLoadingMore ? (
                  <Flex justify="center" align="center" py="4">
                    <Spinner size="sm" color="accent.400" />
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
    </Box>
  );
}
