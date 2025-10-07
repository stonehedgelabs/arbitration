import {
  Box,
  VStack,
  HStack,
  Button,
  Text,
  Spinner,
  IconButton,
  Switch,
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "motion/react";
import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  setSocialPlatform,
  fetchRedditGameThreadComments,
  setRedditSortKind,
} from "../../../store/slices/sportsDataSlice";
import { RedditContent } from "./RedditContent.tsx";
import { TwitterContent } from "../../TwitterContent";
import { getTeamSubredditByName } from "../../../teams";
import { League, REDDIT_CONFIG } from "../../../config";

interface BoxScoreSocialProps {
  gameId: string;
  awayTeam: string;
  homeTeam: string;
  awayTeamSubreddit?: string;
  homeTeamSubreddit?: string;
  league: League;
}

export function BoxScoreSocial({
  gameId,
  awayTeam,
  homeTeam,
  awayTeamSubreddit,
  homeTeamSubreddit,
  league,
}: BoxScoreSocialProps) {
  const dispatch = useAppDispatch();
  const socialPlatform = useAppSelector(
    (state) => state.sportsData.socialPlatform,
  );
  const redditCommentsLoading = useAppSelector(
    (state) => state.sportsData.redditCommentsLoading,
  );
  const redditCommentsError = useAppSelector(
    (state) => state.sportsData.redditCommentsError,
  );
  const redditCommentsData = useAppSelector(
    (state) => state.sportsData.redditCommentsData,
  );
  const redditHasSearched = useAppSelector(
    (state) => state.sportsData.redditHasSearched,
  );
  const redditSortKind = useAppSelector(
    (state) => state.sportsData.redditSortKind,
  );

  // Auto-fetch Reddit comments when component mounts if Reddit is the default platform
  useEffect(() => {
    if (socialPlatform === "reddit" && !redditHasSearched) {
      // Find subreddits for both teams using the new function
      const awaySubreddit = getTeamSubredditByName(awayTeam, league);
      const homeSubreddit = getTeamSubredditByName(homeTeam, league);

      // Fetch comments for both teams if they have subreddits
      if (awaySubreddit) {
        dispatch(
          fetchRedditGameThreadComments({
            subreddit: awaySubreddit.replace("r/", ""),
            gameId,
            kind: redditSortKind,
            bypassCache: REDDIT_CONFIG.bypassCacheOnRefresh,
          }),
        );
      }
      if (homeSubreddit) {
        dispatch(
          fetchRedditGameThreadComments({
            subreddit: homeSubreddit.replace("r/", ""),
            gameId,
            kind: redditSortKind,
            bypassCache: REDDIT_CONFIG.bypassCacheOnRefresh,
          }),
        );
      }
    }
  }, [socialPlatform, redditHasSearched, awayTeam, homeTeam, gameId, dispatch]);

  const handlePlatformToggle = (platform: "reddit" | "twitter") => {
    dispatch(setSocialPlatform(platform));

    // If switching to Reddit and we haven't searched yet, fetch comments
    if (platform === "reddit" && !redditHasSearched) {
      // Find subreddits for both teams using the new function
      const awaySubreddit = getTeamSubredditByName(awayTeam, league);
      const homeSubreddit = getTeamSubredditByName(homeTeam, league);

      // Fetch comments for both teams if they have subreddits
      if (awaySubreddit) {
        dispatch(
          fetchRedditGameThreadComments({
            subreddit: awaySubreddit.replace("r/", ""),
            gameId,
            kind: redditSortKind,
            bypassCache: REDDIT_CONFIG.bypassCacheOnRefresh,
          }),
        );
      }
      if (homeSubreddit) {
        dispatch(
          fetchRedditGameThreadComments({
            subreddit: homeSubreddit.replace("r/", ""),
            gameId,
            kind: redditSortKind,
            bypassCache: REDDIT_CONFIG.bypassCacheOnRefresh,
          }),
        );
      }
    } else {
    }
  };

  // Generate a Twitter search query based on team names
  const twitterSearchQuery = `${homeTeam} vs ${awayTeam}`;

  // Handle Reddit refresh
  const handleRedditRefresh = () => {
    const awaySubreddit = getTeamSubredditByName(awayTeam, league);
    const homeSubreddit = getTeamSubredditByName(homeTeam, league);

    if (awaySubreddit) {
      dispatch(
        fetchRedditGameThreadComments({
          subreddit: awaySubreddit.replace("r/", ""),
          gameId,
          kind: redditSortKind,
          bypassCache: REDDIT_CONFIG.bypassCacheOnRefresh,
        }),
      );
    }
    if (homeSubreddit) {
      dispatch(
        fetchRedditGameThreadComments({
          subreddit: homeSubreddit.replace("r/", ""),
          gameId,
          kind: redditSortKind,
          bypassCache: REDDIT_CONFIG.bypassCacheOnRefresh,
        }),
      );
    }
  };

  return (
    <VStack gap="4" align="stretch">
      {/* Reddit/Twitter Toggle */}
      <HStack justify="center">
        <Box bg="text.100" borderRadius="lg" p="1" display="flex">
          <Button
            size="xs"
            variant="ghost"
            onClick={() => {
              handlePlatformToggle("reddit");
            }}
            bg={socialPlatform === "reddit" ? "white" : "transparent"}
            color={socialPlatform === "reddit" ? "text.600" : "text.400"}
            borderRadius="md"
            px="2"
            fontSize="xs"
            height="6"
            _hover={{
              bg: socialPlatform === "reddit" ? "white" : "text.50",
            }}
            _active={{
              bg: socialPlatform === "reddit" ? "white" : "text.50",
            }}
            boxShadow={socialPlatform === "reddit" ? "sm" : "none"}
          >
            Reddit
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={() => handlePlatformToggle("twitter")}
            bg={socialPlatform === "twitter" ? "white" : "transparent"}
            color={socialPlatform === "twitter" ? "text.600" : "text.400"}
            borderRadius="md"
            px="2"
            fontSize="xs"
            height="6"
            _hover={{
              bg: socialPlatform === "twitter" ? "white" : "text.50",
            }}
            _active={{
              bg: socialPlatform === "twitter" ? "white" : "text.50",
            }}
            boxShadow={socialPlatform === "twitter" ? "sm" : "none"}
          >
            Twitter
          </Button>
        </Box>
      </HStack>

      {/* Content Area with Animation */}
      <Box minH="60vh">
        <AnimatePresence mode="wait">
          {socialPlatform === "reddit" ? (
            <motion.div
              key="reddit"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              {redditCommentsLoading ? (
                <VStack gap="4" py="8">
                  <Spinner size="lg" color="blue.500" />
                  <Text color="text.400" fontSize="sm">
                    Loading Reddit comments...
                  </Text>
                </VStack>
              ) : redditCommentsError ? (
                <VStack gap="4" py="8">
                  <Text color="red.500" fontSize="sm" textAlign="center">
                    {redditCommentsError}
                  </Text>
                  <Text color="text.400" fontSize="xs" textAlign="center">
                    No Reddit game thread found for this game
                  </Text>
                </VStack>
              ) : redditCommentsData ? (
                <VStack gap="4" align="stretch">
                  {/* Reddit Header with Sort Toggle and Refresh */}
                  <HStack justify="space-between" align="center" py="2">
                    {/* Reddit Sort Toggle */}
                    <HStack gap="2" align="center">
                      <Text fontSize="xs" color="text.400">
                        Top
                      </Text>
                      <Switch.Root
                        size="xs"
                        checked={redditSortKind === "new"}
                        onCheckedChange={(e) => {
                          const newSort = e.checked ? "new" : "top";
                          dispatch(setRedditSortKind(newSort));
                          // Re-fetch comments with new sort
                          const awaySubreddit = getTeamSubredditByName(
                            awayTeam,
                            league,
                          );
                          const homeSubreddit = getTeamSubredditByName(
                            homeTeam,
                            league,
                          );
                          if (awaySubreddit) {
                            dispatch(
                              fetchRedditGameThreadComments({
                                subreddit: awaySubreddit.replace("r/", ""),
                                gameId,
                                kind: newSort,
                                bypassCache: REDDIT_CONFIG.bypassCacheOnRefresh,
                              }),
                            );
                          }
                          if (homeSubreddit) {
                            dispatch(
                              fetchRedditGameThreadComments({
                                subreddit: homeSubreddit.replace("r/", ""),
                                gameId,
                                kind: newSort,
                                bypassCache: REDDIT_CONFIG.bypassCacheOnRefresh,
                              }),
                            );
                          }
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
                      aria-label="Refresh Reddit comments"
                      size="sm"
                      variant="ghost"
                      color="text.400"
                      onClick={handleRedditRefresh}
                      loading={redditCommentsLoading}
                    >
                      <RotateCcw size={16} />
                    </IconButton>
                  </HStack>

                  <RedditContent
                    gameId={gameId}
                    awayTeam={awayTeam}
                    homeTeam={homeTeam}
                    awayTeamSubreddit={awayTeamSubreddit}
                    homeTeamSubreddit={homeTeamSubreddit}
                    redditData={redditCommentsData}
                  />
                </VStack>
              ) : (
                <VStack gap="4" py="8">
                  <Text color="text.400" fontSize="sm" textAlign="center">
                    Click the Reddit tab to load game thread comments
                  </Text>
                </VStack>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="twitter"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TwitterContent initialSearchQuery={twitterSearchQuery} />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </VStack>
  );
}
