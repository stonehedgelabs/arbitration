import { Box, VStack, HStack, Text, Spinner } from "@chakra-ui/react";
import { motion, AnimatePresence } from "motion/react";
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
import { RefreshButton } from "../../RefreshButton";
import { Toggle } from "../../Toggle";

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
        <Toggle
          variant="buttons"
          size="xs"
          items={[
            { id: "reddit", label: "Reddit", value: "reddit" },
            { id: "twitter", label: "Twitter", value: "twitter" },
          ]}
          selectedValue={socialPlatform}
          onSelectionChange={handlePlatformToggle}
        />
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
                    <Toggle
                      variant="switch"
                      leftLabel="Top"
                      rightLabel="Latest"
                      checked={redditSortKind === "new"}
                      onCheckedChange={(checked) => {
                        const newSort = checked ? "new" : "top";
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
                      items={[]} // Not used for switch variant
                      selectedValue={redditSortKind}
                      onSelectionChange={() => {}} // Not used for switch variant
                    />
                    {/* Refresh Button */}
                    <RefreshButton
                      onClick={handleRedditRefresh}
                      loading={redditCommentsLoading}
                      size="xs"
                      ariaLabel="Refresh Reddit comments"
                    />
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
