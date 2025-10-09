import { useEffect, useCallback, useState } from "react";
import { Box, VStack, HStack, Text, Image } from "@chakra-ui/react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, Twitter, Clock } from "lucide-react";

const RedditIcon = ({ size = 12 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
  </svg>
);

import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchRedditGameThreadComments,
  findRedditGameThread,
  fetchTwitterData,
} from "../store/slices/sportsDataSlice";
import { getTeamSubredditByName } from "../teams";
import {
  League,
  REDDIT_CONFIG,
  buildApiUrl,
  PLAY_BY_PLAY_CONFIG,
  UNIFIED_FEED_CONFIG,
} from "../config";
import { formatRelativeUTCTime, estToUTC } from "../utils";
import useArb from "../services/Arb";
import { InningBadge } from "./badge";

interface UnifiedGameFeedProps {
  gameId: string;
  awayTeam: string;
  homeTeam: string;
  awayTeamKey?: string;
  homeTeamKey?: string;
  league: League;
  gameData?: any; // Add game data for scores and inning info
}

interface FeedEvent {
  id: string;
  type: "reddit" | "twitter" | "pbp";
  timestamp: string;
  content: string;
  author?: string;
  score?: number;
  subreddit?: string;
  team?: "away" | "home" | "other";
}

interface ActualPlayByPlayResponse {
  league: string;
  game_id: string;
  data: PlayEvent[];
}

interface PlayEvent {
  PlayID: string;
  Description: string;
  Updated: string;
  Team: string;
  InningNumber?: number;
  InningHalf?: string;
  Balls?: number;
  Strikes?: number;
  Walks?: number;
  CurrentPitcher?: string;
  HitterTeamID?: number;
}

export function UnifiedGameFeed({
  gameId,
  awayTeam,
  homeTeam,
  awayTeamKey,
  homeTeamKey,
  league,
  gameData,
}: UnifiedGameFeedProps) {
  const dispatch = useAppDispatch();

  const { teamProfiles, fetchTeamProfiles } = useArb();

  const redditCommentsData = useAppSelector(
    (state) => state.sportsData.redditCommentsData,
  );
  const redditCommentsLoading = useAppSelector(
    (state) => state.sportsData.redditCommentsLoading,
  );
  const redditCommentsError = useAppSelector(
    (state) => state.sportsData.redditCommentsError,
  );
  const redditGameThreadFound = useAppSelector(
    (state) => state.sportsData.redditGameThreadFound,
  );
  const redditGameThreadLoading = useAppSelector(
    (state) => state.sportsData.redditGameThreadLoading,
  );
  const redditSortKind = useAppSelector(
    (state) => state.sportsData.redditSortKind,
  );
  const twitterData = useAppSelector((state) => state.sportsData.twitterData);

  const [playByPlayData, setPlayByPlayData] =
    useState<ActualPlayByPlayResponse | null>(null);
  const [pbpLoading, setPbpLoading] = useState(false);

  useEffect(() => {
    const awaySubreddit = getTeamSubredditByName(awayTeam, league);
    const homeSubreddit = getTeamSubredditByName(homeTeam, league);

    if (awaySubreddit) {
      dispatch(
        findRedditGameThread({
          subreddit: awaySubreddit.replace("r/", ""),
          league,
        }),
      );
    }
    if (homeSubreddit) {
      dispatch(
        findRedditGameThread({
          subreddit: homeSubreddit.replace("r/", ""),
          league,
        }),
      );
    }

    if (awayTeam && homeTeam) {
      const searchTerms = [
        awayTeam,
        homeTeam,
        awayTeamKey,
        homeTeamKey,
        "@MLB",
      ].filter(Boolean); // Remove any undefined values

      const twitterQuery = searchTerms.join(" OR ");

      dispatch(
        fetchTwitterData({
          query: twitterQuery,
          queryType: "Latest",
        }),
      );
    }
    // TODO: Add PBP data fetching here
  }, [gameId, awayTeam, homeTeam, awayTeamKey, homeTeamKey, league, dispatch]);

  // Step 2: Fetch Reddit comments only after thread is found
  useEffect(() => {
    if (!redditGameThreadFound || redditGameThreadLoading) {
      return; // Wait for thread to be found
    }

    const awaySubreddit = getTeamSubredditByName(awayTeam, league);
    const homeSubreddit = getTeamSubredditByName(homeTeam, league);

    // Now fetch comments since thread is found
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
  }, [
    redditGameThreadFound,
    redditGameThreadLoading,
    gameId,
    awayTeam,
    homeTeam,
    league,
    redditSortKind,
    dispatch,
  ]);

  // Fetch PBP data
  const fetchPlayByPlay = useCallback(async () => {
    if (!gameId || !league) return;

    try {
      setPbpLoading(true);

      const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
      const params: Record<string, string> = {
        league: league,
        game_id: gameId,
        interval: "1min",
        t: now.toString(),
      };

      const url = buildApiUrl("/api/v1/play-by-play", params);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch play-by-play data: ${response.statusText}`,
        );
      }

      const data: ActualPlayByPlayResponse = await response.json();

      // console.log("UnifiedGameFeed: Raw PBP API response:", data);
      // console.log("UnifiedGameFeed: PBP data array length:", data.data?.length);

      // Limit to latest events
      const limitedData = {
        ...data,
        data: data.data.slice(-PLAY_BY_PLAY_CONFIG.maxEventsInMemory),
      };

      // console.log("UnifiedGameFeed: Limited PBP data:", limitedData);
      setPlayByPlayData(limitedData);
    } catch (err) {
      // console.error("Error fetching play-by-play data:", err);
    } finally {
      setPbpLoading(false);
    }
  }, [gameId, league]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!UNIFIED_FEED_CONFIG.enableAutoRefresh) return;

    const refreshData = () => {
      // Refresh Reddit comments
      if (redditGameThreadFound && redditGameThreadFound.subreddit) {
        dispatch(
          fetchRedditGameThreadComments({
            subreddit: redditGameThreadFound.subreddit,
            gameId,
            bypassCache: true,
          }),
        );
      }

      // Refresh Twitter data
      if (awayTeam && homeTeam) {
        const searchTerms = [
          awayTeam,
          homeTeam,
          awayTeamKey,
          homeTeamKey,
          "@MLB",
        ].filter(Boolean);
        const query = searchTerms.join(" OR ");
        dispatch(fetchTwitterData({ query, queryType: "Latest" }));
      }

      // Refresh PBP data
      if (gameId && league) {
        fetchPlayByPlay();
      }
    };

    const interval = setInterval(
      refreshData,
      UNIFIED_FEED_CONFIG.autoRefreshInterval,
    );

    return () => clearInterval(interval);
  }, [
    UNIFIED_FEED_CONFIG.enableAutoRefresh,
    UNIFIED_FEED_CONFIG.autoRefreshInterval,
    redditGameThreadFound,
    gameId,
    awayTeam,
    homeTeam,
    awayTeamKey,
    homeTeamKey,
    league,
    dispatch,
    fetchPlayByPlay,
  ]);

  // Fetch team profiles and PBP data on mount
  useEffect(() => {
    fetchTeamProfiles(league);
    fetchPlayByPlay();
  }, [fetchTeamProfiles, fetchPlayByPlay, league]);

  // Combine and sort all events by timestamp
  const getAllEvents = useCallback((): FeedEvent[] => {
    const events: FeedEvent[] = [];

    // Add Reddit comments
    if (redditCommentsData?.posts?.[0]?.comments) {
      const comments = redditCommentsData.posts[0].comments;
      const awaySubreddit = getTeamSubredditByName(awayTeam, league)
        ?.replace("r/", "")
        .toLowerCase();
      const homeSubreddit = getTeamSubredditByName(homeTeam, league)
        ?.replace("r/", "")
        .toLowerCase();

      comments.forEach((comment) => {
        let team: "away" | "home" | "other";
        if (comment.subreddit.toLowerCase() === awaySubreddit) {
          team = "away";
        } else if (comment.subreddit.toLowerCase() === homeSubreddit) {
          team = "home";
        } else {
          team = "other";
        }

        // Skip comments from other subreddits for now
        if (team === "other") return;

        events.push({
          id: `reddit-${comment.id}`,
          type: "reddit",
          timestamp: comment.timestamp,
          content: comment.content,
          author: comment.author,
          score: comment.score,
          subreddit: comment.subreddit,
          team,
        });
      });
    }

    // Add Twitter data
    if (twitterData?.tweets) {
      const tweets = twitterData.tweets;
      tweets.forEach((tweet: any) => {
        // Extract author from URL or use a default
        const author = tweet.url
          ? tweet.url.split("/")[3] || "Unknown"
          : "Unknown";

        events.push({
          id: `twitter-${tweet.id}`,
          type: "twitter",
          timestamp: tweet.createdAt,
          content: tweet.text,
          author: author,
          team: "other", // Twitter posts are generally neutral
        });
      });
    }

    // Add PBP data
    if (playByPlayData?.data) {
      // console.log(
      //   "UnifiedGameFeed: Processing PBP data, count:",
      //   playByPlayData.data.length,
      // );
      playByPlayData.data.forEach((play: PlayEvent, index) => {
        // console.log(`UnifiedGameFeed: PBP event ${index}:`, {
        //   PlayID: play.PlayID,
        //   Description: play.Description,
        //   Team: play.Team,
        //   Updated: play.Updated,
        // });

        // Convert EST timestamp to UTC for proper sorting
        const utcTimestamp = estToUTC(play.Updated);

        // Use the actual PBP data fields
        const hitterName = play.HitterName || "Player";
        const pitcherName = play.PitcherName || "Pitcher";
        const playDescription = play.Description || "Play in progress...";

        // Determine which team the play belongs to based on HitterTeamID
        const hitterTeamId = play.HitterTeamID;
        const pitcherTeamId = play.PitcherTeamID;

        // Use hitter as the primary player for the play
        const primaryPlayer = hitterName;
        const primaryTeamId = hitterTeamId;

        events.push({
          id: `pbp-${play.PlayID}`,
          type: "pbp",
          timestamp: utcTimestamp,
          content: playDescription,
          author: primaryPlayer,
          team:
            primaryTeamId === gameData?.AwayTeamID
              ? "away"
              : primaryTeamId === gameData?.HomeTeamID
                ? "home"
                : "other",
        });
      });
    }
    // Sort by timestamp (most recent first)
    return events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [
    redditCommentsData,
    twitterData,
    playByPlayData,
    teamProfiles,
    awayTeam,
    homeTeam,
    awayTeamKey,
    homeTeamKey,
    league,
  ]);

  const allEvents = getAllEvents();

  // // Debug: Log PBP data
  // console.log("UnifiedGameFeed: PBP data:", playByPlayData);
  // console.log("UnifiedGameFeed: All events:", allEvents);
  // console.log(
  //   "UnifiedGameFeed: PBP events:",
  //   allEvents.filter((e) => e.type === "pbp"),
  // );

  // Get the latest PBP event for sticky display
  const latestPBPEvent = allEvents.find((event) => event.type === "pbp");

  // Render sticky latest PBP event in old card style
  const renderStickyPBPEvent = (event: FeedEvent) => {
    // Debug: Log the event being rendered
    // console.log("UnifiedGameFeed: Rendering sticky PBP event:", event);

    // Get team logo for the PBP event using the actual PBP data
    const getTeamLogoForEvent = () => {
      if (!teamProfiles?.data || !playByPlayData?.data) return null;

      // Find the original play data to get the team ID
      const originalPlay = playByPlayData.data.find(
        (play) => `pbp-${play.PlayID}` === event.id,
      );

      if (!originalPlay) return null;

      // Use HitterTeamID to find the team logo
      const teamProfile = teamProfiles.data.find(
        (team: any) => team.TeamID === originalPlay.HitterTeamID,
      );

      return teamProfile?.WikipediaLogoUrl || null;
    };

    const teamLogo = getTeamLogoForEvent();

    return (
      <Box
        position="sticky"
        top="0"
        zIndex="10"
        bg="primary.25"
        borderBottom="1px"
        borderColor="border.100"
        px="3"
        py="2"
        mb="1"
      >
        <Box
          bg="primary.100"
          borderRadius="6px"
          shadow="sm"
          border="1px"
          borderColor="text.400"
          borderLeft="3px"
          borderLeftColor="primary.500"
        >
          <Box p="2">
            <VStack gap="1.5" align="stretch">
              {/* Header with Latest Play and timestamp */}
              <HStack justify="space-between" align="center">
                <HStack gap="1.5">
                  <Box
                    w="5"
                    h="5"
                    borderRadius="full"
                    bg="primary.500"
                    color="white"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="2xs"
                    fontWeight="bold"
                  >
                    <Clock size={8} />
                  </Box>
                  <Text
                    fontSize="2xs"
                    fontWeight="semibold"
                    color="primary.500"
                  >
                    Latest Play
                  </Text>
                </HStack>
                <Text fontSize="2xs" color="text.400">
                  {event.timestamp
                    ? formatRelativeUTCTime(event.timestamp)
                    : "Just now"}
                </Text>
              </HStack>

              {/* Team info with logo and name */}
              <HStack gap="2" align="center">
                {teamLogo && (
                  <Image
                    src={teamLogo}
                    alt="Team logo"
                    boxSize="20px"
                    objectFit="contain"
                  />
                )}
                <VStack gap="0" align="start">
                  {/* <Text fontSize="xs" fontWeight="medium" color="text.400">
                    {event.author || "Player"}
                  </Text> */}
                  <Text fontSize="2xs" color="text.500">
                    {(() => {
                      // Get team name from team profiles using the original play data
                      if (!teamProfiles?.data || !playByPlayData?.data)
                        return "Team";

                      const originalPlay = playByPlayData.data.find(
                        (play) => `pbp-${play.PlayID}` === event.id,
                      );

                      if (!originalPlay) return "Team";

                      const teamProfile = teamProfiles.data.find(
                        (team: any) =>
                          team.TeamID === originalPlay.HitterTeamID,
                      );

                      return teamProfile?.Name || teamProfile?.Key || "Team";
                    })()}
                  </Text>
                </VStack>
              </HStack>

              {/* Play description */}
              <Text fontSize="xs" fontWeight="medium">
                {event.content || "Play in progress..."}
              </Text>

              {/* Game info: Inning badge and scores */}
              <HStack justify="space-between" align="center">
                {/* Inning badge */}
                {gameData?.Inning && (
                  <InningBadge
                    inningNumber={parseInt(gameData.Inning) || 1}
                    inningHalf={gameData.InningHalf}
                    league={league}
                    size="xs"
                  />
                )}

                {/* Scores */}
                {gameData?.AwayTeamRuns !== undefined &&
                  gameData?.HomeTeamRuns !== undefined && (
                    <HStack gap="1" align="center">
                      <Text fontSize="2xs" color="text.400">
                        {gameData.AwayTeamRuns} - {gameData.HomeTeamRuns}
                      </Text>
                    </HStack>
                  )}
              </HStack>

              {/* PBP Data: Balls, Strikes, Walks, Current Pitcher */}
              {(() => {
                const originalPlay = playByPlayData?.data?.find(
                  (play) => `pbp-${play.PlayID}` === event.id,
                );

                if (!originalPlay) return null;

                return (
                  <HStack
                    justify="space-between"
                    align="center"
                    mt="1.5"
                    pt="1.5"
                    borderTop="1px"
                    borderColor="text.200"
                  >
                    {/* Count Information */}
                    <HStack gap="2" align="center">
                      {originalPlay.Balls !== undefined && (
                        <HStack gap="1" align="center">
                          <Text
                            fontSize="2xs"
                            color="text.500"
                            fontWeight="medium"
                          >
                            B:
                          </Text>
                          <Text
                            fontSize="2xs"
                            color="text.400"
                            fontWeight="bold"
                          >
                            {originalPlay.Balls}
                          </Text>
                        </HStack>
                      )}
                      {originalPlay.Strikes !== undefined && (
                        <HStack gap="1" align="center">
                          <Text
                            fontSize="2xs"
                            color="text.500"
                            fontWeight="medium"
                          >
                            S:
                          </Text>
                          <Text
                            fontSize="2xs"
                            color="text.400"
                            fontWeight="bold"
                          >
                            {originalPlay.Strikes}
                          </Text>
                        </HStack>
                      )}
                      {originalPlay.Walks !== undefined && (
                        <HStack gap="1" align="center">
                          <Text
                            fontSize="2xs"
                            color="text.500"
                            fontWeight="medium"
                          >
                            W:
                          </Text>
                          <Text
                            fontSize="2xs"
                            color="text.400"
                            fontWeight="bold"
                          >
                            {originalPlay.Walks}
                          </Text>
                        </HStack>
                      )}
                    </HStack>

                    {/* Current Pitcher */}
                    {originalPlay.CurrentPitcher && (
                      <Text fontSize="2xs" color="text.500" fontWeight="medium">
                        P: {originalPlay.CurrentPitcher}
                      </Text>
                    )}
                  </HStack>
                );
              })()}
            </VStack>
          </Box>
        </Box>
      </Box>
    );
  };

  // Render individual event
  const renderEvent = (event: FeedEvent) => {
    const isPBP = event.type === "pbp";
    const isReddit = event.type === "reddit";

    return (
      <Box
        key={event.id}
        display="flex"
        justifyContent={isPBP ? "flex-end" : "flex-start"}
        mb="3"
      >
        <HStack
          gap="2"
          maxW="95%"
          flexDirection={isPBP ? "row-reverse" : "row"}
          align="flex-start"
        >
          {/* Avatar/Icon */}
          <Box
            w="8"
            h="8"
            minW="8"
            minH="8"
            flexShrink={0}
            borderRadius="full"
            bg={isPBP ? "blue.500" : isReddit ? "orange.500" : "blue.400"}
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xs"
            fontWeight="bold"
          >
            {isPBP ? (
              <Clock size={12} />
            ) : isReddit ? (
              <RedditIcon size={12} />
            ) : (
              <Twitter size={12} />
            )}
          </Box>

          {/* Event Bubble */}
          <VStack gap="1" align={isPBP ? "flex-end" : "flex-start"}>
            <Box
              bg={isPBP ? "gray.100" : isReddit ? "orange.100" : "blue.100"}
              borderRadius="lg"
              px="3"
              py="2"
              maxW="280px"
              wordBreak="break-word"
            >
              {isReddit && (
                <HStack gap="1" mb="0.5">
                  <Text fontSize="2xs" fontWeight="semibold" color="text.500">
                    u/{event.author}
                  </Text>
                  {event.subreddit && (
                    <Text fontSize="2xs" color="text.400">
                      • {event.subreddit}
                    </Text>
                  )}
                </HStack>
              )}
              <Text fontSize="xs" color="text.500">
                {event.content}
              </Text>
              <HStack gap="2" mt="1">
                {isReddit && event.score !== undefined && (
                  <>
                    <Text fontSize="2xs" color="text.500">
                      ↑ {event.score}
                    </Text>
                    <Text fontSize="2xs" color="text.500">
                      •
                    </Text>
                  </>
                )}
                <Text fontSize="2xs" color="text.500">
                  {formatRelativeUTCTime(event.timestamp)}
                </Text>
              </HStack>
            </Box>
          </VStack>
        </HStack>
      </Box>
    );
  };

  if ((redditCommentsLoading || pbpLoading) && allEvents.length === 0) {
    return (
      <VStack gap="4" py="8">
        <Text color="text.400" fontSize="lg">
          ⏳
        </Text>
        <Text color="text.400" fontSize="sm">
          Loading game feed...
        </Text>
      </VStack>
    );
  }

  if (redditCommentsError && allEvents.length === 0) {
    return (
      <VStack gap="4" py="8">
        <Text color="red.500" fontSize="sm" textAlign="center">
          {redditCommentsError}
        </Text>
        <Text color="text.400" fontSize="xs" textAlign="center">
          Unable to load game feed
        </Text>
      </VStack>
    );
  }

  // Filter out the latest PBP event from the regular feed since it's shown sticky
  const filteredEvents = latestPBPEvent
    ? allEvents.filter((event) => event.id !== latestPBPEvent.id)
    : allEvents;

  return (
    <VStack gap="0" align="stretch">
      {/* Sticky Latest PBP Event - Only show if we have actual PBP data */}
      {latestPBPEvent && renderStickyPBPEvent(latestPBPEvent)}

      {/* Events List */}
      <Box px="4" py="1">
        <VStack gap="3" align="stretch">
          {filteredEvents.length === 0 ? (
            <VStack gap="4" align="center" py="12">
              <MessageCircle size={32} color="var(--chakra-colors-text-300)" />
              <Text fontSize="lg" fontWeight="semibold" color="text.300">
                No activity yet
              </Text>
              <Text fontSize="xs" color="text.300" textAlign="center">
                Game feed will appear here once the game starts.
              </Text>
            </VStack>
          ) : (
            <AnimatePresence>
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderEvent(event)}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </VStack>
      </Box>
    </VStack>
  );
}
