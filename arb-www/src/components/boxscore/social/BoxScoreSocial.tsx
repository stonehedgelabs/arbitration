import { Box, VStack, HStack, Button, Text, Spinner } from "@chakra-ui/react";
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
import { League } from "../../../config";

interface BoxScoreSocialProps {
  gameId: string;
  awayTeam: string;
  homeTeam: string;
  awayTeamSubreddit?: string;
  homeTeamSubreddit?: string;
}

export function BoxScoreSocial({
  gameId,
  awayTeam,
  homeTeam,
  awayTeamSubreddit,
  homeTeamSubreddit,
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
      const awaySubreddit = getTeamSubredditByName(awayTeam, League.MLB);
      const homeSubreddit = getTeamSubredditByName(homeTeam, League.MLB);

      // Fetch comments for both teams if they have subreddits
      if (awaySubreddit) {
        dispatch(
          fetchRedditGameThreadComments({
            subreddit: awaySubreddit.replace("r/", ""),
            gameId,
            kind: redditSortKind,
          }),
        );
      }
      if (homeSubreddit) {
        dispatch(
          fetchRedditGameThreadComments({
            subreddit: homeSubreddit.replace("r/", ""),
            gameId,
            kind: redditSortKind,
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
      const awaySubreddit = getTeamSubredditByName(awayTeam, League.MLB);
      const homeSubreddit = getTeamSubredditByName(homeTeam, League.MLB);

      // Fetch comments for both teams if they have subreddits
      if (awaySubreddit) {
        dispatch(
          fetchRedditGameThreadComments({
            subreddit: awaySubreddit.replace("r/", ""),
            gameId,
            kind: redditSortKind,
          }),
        );
      }
      if (homeSubreddit) {
        dispatch(
          fetchRedditGameThreadComments({
            subreddit: homeSubreddit.replace("r/", ""),
            gameId,
            kind: redditSortKind,
          }),
        );
      }
    } else {
    }
  };

  // Generate a Twitter search query based on team names
  const twitterSearchQuery = `${homeTeam} vs ${awayTeam}`;

  return (
    <VStack gap="4" align="stretch">
      {/* Reddit/Twitter Toggle */}
      <HStack justify="center">
        <Box bg="text.100" borderRadius="lg" p="1" display="flex">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              console.log("🔴 REDDIT BUTTON CLICKED!");
              handlePlatformToggle("reddit");
            }}
            bg={socialPlatform === "reddit" ? "white" : "transparent"}
            color={socialPlatform === "reddit" ? "text.600" : "text.400"}
            borderRadius="md"
            px="6"
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
            size="sm"
            variant="ghost"
            onClick={() => handlePlatformToggle("twitter")}
            bg={socialPlatform === "twitter" ? "white" : "transparent"}
            color={socialPlatform === "twitter" ? "text.600" : "text.400"}
            borderRadius="md"
            px="6"
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
                  {/* Reddit Sort Toggle */}
                  <HStack justify="center" gap="2" py="2">
                    <Text fontSize="sm" color="text.400">
                      Sort by:
                    </Text>
                    <Button
                      size="sm"
                      variant={redditSortKind === "top" ? "solid" : "outline"}
                      colorScheme={redditSortKind === "top" ? "blue" : "gray"}
                      onClick={() => {
                        dispatch(setRedditSortKind("top"));
                        // Re-fetch comments with new sort
                        const awaySubreddit = getTeamSubredditByName(
                          awayTeam,
                          League.MLB,
                        );
                        const homeSubreddit = getTeamSubredditByName(
                          homeTeam,
                          League.MLB,
                        );
                        if (awaySubreddit) {
                          dispatch(
                            fetchRedditGameThreadComments({
                              subreddit: awaySubreddit.replace("r/", ""),
                              gameId,
                              kind: "top",
                            }),
                          );
                        }
                        if (homeSubreddit) {
                          dispatch(
                            fetchRedditGameThreadComments({
                              subreddit: homeSubreddit.replace("r/", ""),
                              gameId,
                              kind: "top",
                            }),
                          );
                        }
                      }}
                    >
                      Top
                    </Button>
                    <Button
                      size="sm"
                      variant={redditSortKind === "new" ? "solid" : "outline"}
                      colorScheme={redditSortKind === "new" ? "blue" : "gray"}
                      onClick={() => {
                        dispatch(setRedditSortKind("new"));
                        // Re-fetch comments with new sort
                        const awaySubreddit = getTeamSubredditByName(
                          awayTeam,
                          League.MLB,
                        );
                        const homeSubreddit = getTeamSubredditByName(
                          homeTeam,
                          League.MLB,
                        );
                        if (awaySubreddit) {
                          dispatch(
                            fetchRedditGameThreadComments({
                              subreddit: awaySubreddit.replace("r/", ""),
                              gameId,
                              kind: "new",
                            }),
                          );
                        }
                        if (homeSubreddit) {
                          dispatch(
                            fetchRedditGameThreadComments({
                              subreddit: homeSubreddit.replace("r/", ""),
                              gameId,
                              kind: "new",
                            }),
                          );
                        }
                      }}
                    >
                      Latest
                    </Button>
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
