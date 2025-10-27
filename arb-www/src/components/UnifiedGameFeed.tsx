import { useCallback, useEffect } from "react";
import { Box, HStack, Image, Text, VStack } from "@chakra-ui/react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, MessageCircle, Twitter } from "lucide-react";
import { UnifiedGameFeedSkeleton } from "./UnifiedGameFeedSkeleton";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  clearRedditData,
  clearPbpData,
  clearTwitterData,
  fetchRedditGameThreadComments,
  fetchTwitterData,
  findRedditGameThread,
  setPlayByPlayLoading,
  setPlayByPlayData,
  setPlayByPlayError,
} from "../store/slices/sportsDataSlice";
import { getTeamSubredditByName } from "../teams";
import {
  buildApiUrl,
  GameStatus,
  League,
  PLAY_BY_PLAY_CONFIG,
  UNIFIED_FEED_CONFIG,
} from "../config";
import {
  delayedRedditTimestamp,
  estToUTC,
  formatRelativeUTCTime,
  getPlayLabelMLB,
  getPlayLabelNBA,
  getPlayLabelNFL,
} from "../utils";
import useArb from "../services/Arb";
import { InningBadge } from "./badge";
import { NFLPlay } from "../schema";
import { NBAPlay } from "../schema/sportradar/nba/playByPlay";
import { MLBPlay } from "../schema/sportradar/mlb/playByPlay";

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

interface UnifiedGameFeedProps {
  gameId: string;
  awayTeam: string;
  homeTeam: string;
  awayTeamKey?: string;
  homeTeamKey?: string;
  league: League;
  gameData?: any;
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

type PlayEvent = NFLPlay | NBAPlay | MLBPlay;

const deriveTwitterTerms = (
  awayTeam: string,
  homeTeam: string,
  awayTeamKey: string,
  homeTeamKey: string,
) => {
  if (awayTeam && homeTeam) {
    const searchTerms = [
      awayTeam,
      homeTeam,
      `#${awayTeam}`,
      `#${homeTeam}`,
      `#${awayTeamKey}`,
      `#${homeTeamKey}`,
      "#MLB",
    ].filter(Boolean);
    return searchTerms.join(" OR ");
  }
  return "";
};

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
  const redditGameThreadsFoundBySubreddit = useAppSelector(
    (state) => state.sportsData.redditGameThreadsFoundBySubreddit,
  );
  const redditGameThreadLoading = useAppSelector(
    (state) => state.sportsData.redditGameThreadLoading,
  );
  const redditSortKind = useAppSelector(
    (state) => state.sportsData.redditSortKind,
  );
  const twitterData = useAppSelector((state) => state.sportsData.twitterData);
  const twitterLoading = useAppSelector(
    (state) => state.sportsData.twitterLoading,
  );
  const twitterError = useAppSelector((state) => state.sportsData.twitterError);
  const playByPlayData = useAppSelector(
    (state) => state.sportsData.playByPlayData,
  );
  const playByPlayLoading = useAppSelector(
    (state) => state.sportsData.playByPlayLoading,
  );
  const playByPlayError = useAppSelector(
    (state) => state.sportsData.playByPlayError,
  );

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
  }, [awayTeam, homeTeam, league, dispatch]);

  useEffect(() => {
    if (!awayTeamKey || !homeTeamKey || !awayTeam || !homeTeam) return;
    const twitterQuery = deriveTwitterTerms(
      awayTeam,
      homeTeam,
      awayTeamKey as string,
      homeTeamKey as string,
    );
    dispatch(
      fetchTwitterData({
        query: twitterQuery,
        queryType: "Latest",
      }),
    );
  }, [
    awayTeam,
    homeTeam,
    awayTeamKey,
    homeTeamKey,
    fetchTwitterData,
    dispatch,
  ]);

  useEffect(() => {
    if (redditGameThreadLoading) {
      return;
    }

    const awaySubreddit = getTeamSubredditByName(awayTeam, league);
    const homeSubreddit = getTeamSubredditByName(homeTeam, league);

    // Only fetch comments for teams whose game threads have been found
    if (awaySubreddit) {
      const awaySubredditKey = awaySubreddit.replace("r/", "");
      if (redditGameThreadsFoundBySubreddit[awaySubredditKey] === true) {
        dispatch(
          fetchRedditGameThreadComments({
            subreddit: awaySubredditKey,
            gameId,
            kind: redditSortKind,
            cache: true,
          }),
        );
      }
    }
    if (homeSubreddit) {
      const homeSubredditKey = homeSubreddit.replace("r/", "");
      if (redditGameThreadsFoundBySubreddit[homeSubredditKey] === true) {
        dispatch(
          fetchRedditGameThreadComments({
            subreddit: homeSubredditKey,
            gameId,
            kind: redditSortKind,
            cache: true,
          }),
        );
      }
    }
  }, [
    redditGameThreadsFoundBySubreddit,
    awayTeam,
    homeTeam,
    gameId,
    league,
    redditGameThreadLoading,
    redditSortKind,
    dispatch,
  ]);

  const fetchPlayByPlay = useCallback(async () => {
    if (!gameId || !league) return;

    // Extract game data based on league structure
    let game;
    if (gameData) {
      switch (league.toLowerCase()) {
        case League.MLB:
          game = gameData?.data?.Game;
          break;
        case League.NFL:
          game =
            gameData?.data?.Score ||
            gameData?.data?.score ||
            gameData?.data?.Game ||
            gameData?.data;
          break;
        case League.NBA:
          game = gameData?.data?.Game || gameData?.data;
          break;
        default:
          game = gameData?.data?.Game || gameData?.data;
      }
    }

    // Only fetch play-by-play if game is in progress or live
    if (
      !game ||
      (game.Status !== GameStatus.IN_PROGRESS &&
        game.Status !== GameStatus.LIVE)
    ) {
      return;
    }

    try {
      dispatch(setPlayByPlayLoading(true));

      const params: Record<string, string> = {
        league: league,
        game_id: gameId,
      };

      const url = buildApiUrl("/api/v1/play-by-play", params);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch play-by-play data: ${response.statusText}`,
        );
      }

      const data: ActualPlayByPlayResponse = await response.json();
      const limitedData = {
        ...data,
        data: data.data.slice(-PLAY_BY_PLAY_CONFIG.maxEventsInMemory),
      };

      dispatch(setPlayByPlayData(limitedData));
    } catch (err) {
      dispatch(
        setPlayByPlayError(
          err instanceof Error
            ? err.message
            : "Failed to fetch play-by-play data",
        ),
      );
    }
  }, [gameData, league, gameId, dispatch]);

  // Initial fetch of play-by-play data
  useEffect(() => {
    if (gameId && league && gameData) {
      fetchPlayByPlay();
    }
  }, [gameId, league, gameData]);

  useEffect(() => {
    if (!UNIFIED_FEED_CONFIG.enableAutoRefresh) return;

    const refreshData = () => {
      // Use requestIdleCallback or setTimeout with 0 to avoid blocking
      requestIdleCallback(() => {
        if (awayTeamKey && homeTeamKey && awayTeam && homeTeam) {
          const query = deriveTwitterTerms(
            awayTeam,
            homeTeam,
            awayTeamKey,
            homeTeamKey,
          );
          dispatch(fetchTwitterData({ query, queryType: "Latest" }));
        }

        if (gameId && league) {
          fetchPlayByPlay();
        }
      });
    };

    const interval = setInterval(
      refreshData,
      UNIFIED_FEED_CONFIG.autoRefreshInterval,
    );

    return () => clearInterval(interval);
  }, [
    homeTeam,
    awayTeam,
    homeTeamKey,
    fetchTwitterData,
    fetchPlayByPlay,
    awayTeamKey,
    gameId,
    league,
    dispatch,
  ]);

  useEffect(() => {
    if (!UNIFIED_FEED_CONFIG.enableAutoRefresh) return;

    const refreshRedditThread = () => {
      if (
        redditGameThreadFound &&
        redditCommentsData?.posts?.[0]?.comments?.[0]?.subreddit
      ) {
        const subreddit = redditCommentsData.posts[0].comments[0].subreddit;
        dispatch(
          fetchRedditGameThreadComments({
            subreddit: subreddit,
            gameId,
            cache: true,
          }),
        );
      }
    };

    const redditInterval = setInterval(
      refreshRedditThread,
      UNIFIED_FEED_CONFIG.redditThreadRefreshInterval,
    );

    return () => clearInterval(redditInterval);
  }, [
    gameId,
    redditGameThreadFound,
    redditCommentsData,
    fetchRedditGameThreadComments,
    dispatch,
  ]);

  useEffect(() => {
    fetchTeamProfiles(league);
    fetchPlayByPlay();
  }, [league]);

  useEffect(() => {
    dispatch(clearRedditData());
    dispatch(clearTwitterData());
    dispatch(clearPbpData());
  }, [dispatch]);

  const getAllEvents = useCallback((): FeedEvent[] => {
    const events: FeedEvent[] = [];

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

        events.push({
          id: `reddit-${comment.id}`,
          type: "reddit",
          timestamp: delayedRedditTimestamp(comment.timestamp),
          content: comment.content,
          author: comment.author,
          score: comment.score,
          subreddit: comment.subreddit,
          team,
        });
      });
    }

    if (twitterData?.tweets) {
      const tweets = twitterData.tweets;
      tweets.forEach((tweet: any) => {
        const author = tweet.url
          ? tweet.url.split("/")[3] || "Unknown"
          : "Unknown";

        events.push({
          id: `twitter-${tweet.id}`,
          type: "twitter",
          timestamp: tweet.createdAt,
          content: tweet.text,
          author: author,
          team: "other",
        });
      });
    }

    if (playByPlayData?.data) {
      playByPlayData.data.forEach((play: PlayEvent) => {
        const utcTimestamp = estToUTC(play.Updated);
        let primaryPlayer = "Player";
        let playDescription = play.Description || "Play in progress...";
        let team = "other";

        if (playDescription.toLowerCase() === "scrambled") {
          // const playData = play as any;

          if (league === League.MLB) {
            ({ description: playDescription, primaryPlayer } = getPlayLabelMLB(
              play as any,
            ));
            team =
              (play as MLBPlay).HitterTeamID === gameData?.HomeTeamID
                ? "home"
                : "away";
          } else if (league === League.NFL) {
            ({ description: playDescription, primaryPlayer } = getPlayLabelNFL(
              play as any,
            ));
            team =
              (play as NFLPlay).Team === gameData?.HomeTeam ? "home" : "away";
          } else if (league === League.NBA) {
            ({ description: playDescription, primaryPlayer } = getPlayLabelNBA(
              play as any,
            ));
            team =
              (play as NBAPlay).TeamID === gameData?.HomeTeamID
                ? "home"
                : "away";
          }
        }

        events.push({
          id: `pbp-${play.PlayID}`,
          type: "pbp",
          timestamp: utcTimestamp,
          content: playDescription,
          author: primaryPlayer,
          team: team as any,
        });
      });
    }

    return events.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [
    redditCommentsData,
    twitterData,
    playByPlayData,
    awayTeam,
    homeTeam,
    league,
    gameData,
  ]);

  const allEvents = getAllEvents();
  const latestPBPEvent = allEvents.find((event) => event.type === "pbp");
  const filteredEvents = latestPBPEvent
    ? allEvents.filter((event) => event.id !== latestPBPEvent.id)
    : allEvents;

  // Loading state conditions
  const hasData = filteredEvents.length > 0;
  // const isAnyLoading =
  //   redditCommentsLoading ||
  //   redditGameThreadLoading ||
  //   playByPlayLoading === true ||
  //   twitterLoading;
  const hasCompletedLoading =
    playByPlayLoading === false &&
    !redditCommentsLoading &&
    !redditGameThreadLoading &&
    !twitterLoading;
  const hasError =
    redditCommentsError &&
    twitterError &&
    playByPlayError &&
    allEvents.length === 0;

  const renderStickyPBPEvent = (event: FeedEvent) => {
    const getTeamLogoForEvent = () => {
      if (!teamProfiles?.data || !playByPlayData?.data) return null;

      const originalPlay = playByPlayData.data.find(
        (play: PlayEvent) => `pbp-${play.PlayID}` === event.id,
      );

      if (!originalPlay) return null;

      let teamId: number | undefined;
      if (league === League.MLB) {
        teamId = (originalPlay as MLBPlay).HitterTeamID;
      } else if (league === League.NFL) {
        const teamKey = (originalPlay as NFLPlay).Team;
        return teamProfiles.data.find((team: any) => team.Key === teamKey)
          ?.WikipediaLogoUrl;
      } else if (league === League.NBA) {
        teamId = (originalPlay as NBAPlay).TeamID;
      }

      if (!teamId) return null;

      const teamProfile = teamProfiles.data.find(
        (team: any) => team.TeamID === teamId,
      );

      return teamProfile?.WikipediaLogoUrl || null;
    };

    const teamLogo = getTeamLogoForEvent();

    return (
      <Box
        position="sticky"
        top="0"
        zIndex="10"
        bg="primary.50"
        borderBottom="1px"
        borderColor="border.100"
        px="2"
        py="1.5"
        mb="1"
        display="flex"
        justifyContent="center"
      >
        <Box
          bg="primary.100"
          borderRadius="sm"
          shadow="sm"
          border="1px"
          borderColor="text.400"
          borderLeft="3px"
          borderLeftColor="primary.500"
          w="90%"
        >
          <Box px={"4"} pb={"2"}>
            <VStack gap="1" align="stretch">
              <HStack justify="space-between" align="flex-start" p={2} w="100%">
                <VStack align="stretch" flex="1">
                  <HStack gap="1.5" align="center">
                    <Box
                      w="4"
                      borderRadius="4xl"
                      bg="primary.500"
                      color="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="2xs"
                      fontWeight="bold"
                    >
                      <Clock size={16} />
                    </Box>
                    <Text fontSize="xs" fontWeight="semibold" color="text.400">
                      Latest Play
                    </Text>
                  </HStack>

                  <HStack gap="2" align="center" justify="flex-start">
                    {teamLogo && (
                      <Image
                        src={teamLogo}
                        alt="Team logo"
                        boxSize="20px"
                        objectFit="contain"
                      />
                    )}
                    <VStack gap="0" align="start">
                      <Text fontSize="xs" fontWeight="medium" color="text.400">
                        {event.author || "Player"}
                      </Text>
                      <Text fontSize="xs" color="text.400">
                        {(() => {
                          if (!teamProfiles?.data || !playByPlayData?.data)
                            return "Team";

                          const originalPlay = playByPlayData.data.find(
                            (play: PlayEvent) =>
                              `pbp-${play.PlayID}` === event.id,
                          );
                          if (!originalPlay) return "Team";

                          let teamId: number | undefined;
                          if (league === League.MLB) {
                            teamId = (originalPlay as MLBPlay).HitterTeamID;
                          } else if (league === League.NFL) {
                            return (originalPlay as NFLPlay).Team;
                          } else if (league === League.NBA) {
                            teamId = (originalPlay as NBAPlay).TeamID;
                          }

                          if (teamId === undefined) return "Team";

                          const teamProfile = teamProfiles.data.find(
                            (team: any) => team.TeamID === teamId,
                          );

                          return (
                            teamProfile?.Name || teamProfile?.Key || "Team"
                          );
                        })()}
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>

                <VStack
                  gap="0"
                  align="end"
                  width="130px"
                  minWidth="130px"
                  maxWidth="130px"
                  flex="0 0 auto"
                  flexShrink={0}
                  alignSelf="flex-start"
                  boxSizing="border-box"
                >
                  <Text fontSize="xs" color="text.400">
                    {event.timestamp
                      ? formatRelativeUTCTime(event.timestamp)
                      : "Just now"}
                  </Text>

                  {gameData?.Inning && (
                    <InningBadge
                      inningNumber={parseInt(gameData.Inning) || 1}
                      inningHalf={gameData.InningHalf}
                      league={league}
                      size="sm"
                    />
                  )}
                </VStack>
              </HStack>

              <HStack gap="2" align="center">
                <Text fontSize="xs" fontWeight="medium" flex="1">
                  {event.content || "Play in progress..."}
                </Text>
                {event.content &&
                  event.content.toLowerCase().includes("error") && (
                    <Box
                      bg="red.500"
                      color="white"
                      px="2"
                      py="0.5"
                      borderRadius="4px"
                      fontSize="xs"
                      fontWeight="bold"
                      textTransform="uppercase"
                    >
                      Error
                    </Box>
                  )}
              </HStack>

              {(() => {
                const originalPlay = playByPlayData?.data?.find(
                  (play: PlayEvent) => `pbp-${play.PlayID}` === event.id,
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
                    <HStack gap="2" align="center">
                      {league === League.MLB && (
                        <>
                          {(originalPlay as MLBPlay).Balls !== undefined && (
                            <HStack gap="1" align="center">
                              <Text
                                fontSize="xs"
                                color="text.500"
                                fontWeight="medium"
                              >
                                Balls:
                              </Text>
                              <Text
                                fontSize="xs"
                                color="text.400"
                                fontWeight="bold"
                              >
                                {(originalPlay as MLBPlay).Balls}
                              </Text>
                            </HStack>
                          )}
                          {(originalPlay as MLBPlay).Strikes !== undefined && (
                            <HStack gap="1" align="center">
                              <Text
                                fontSize="xs"
                                color="text.500"
                                fontWeight="medium"
                              >
                                Strikes:
                              </Text>
                              <Text
                                fontSize="xs"
                                color="text.400"
                                fontWeight="bold"
                              >
                                {(originalPlay as MLBPlay).Strikes}
                              </Text>
                            </HStack>
                          )}
                          {(originalPlay as MLBPlay).Walk !== undefined && (
                            <HStack gap="1" align="center">
                              <Text
                                fontSize="2xs"
                                color="text.500"
                                fontWeight="medium"
                              >
                                Walk:
                              </Text>
                              <Text
                                fontSize="2xs"
                                color="text.400"
                                fontWeight="bold"
                              >
                                {(originalPlay as MLBPlay).Walk}
                              </Text>
                            </HStack>
                          )}
                        </>
                      )}

                      {league === League.NFL && (
                        <>
                          {(originalPlay as NFLPlay).Down !== undefined && (
                            <HStack gap="1" align="center">
                              <Text
                                fontSize="xs"
                                color="text.500"
                                fontWeight="medium"
                              >
                                Down:
                              </Text>
                              <Text
                                fontSize="xs"
                                color="text.400"
                                fontWeight="bold"
                              >
                                {(originalPlay as NFLPlay).Down}
                              </Text>
                            </HStack>
                          )}
                          {(originalPlay as NFLPlay).Distance !== undefined && (
                            <HStack gap="1" align="center">
                              <Text
                                fontSize="xs"
                                color="text.500"
                                fontWeight="medium"
                              >
                                To Go:
                              </Text>
                              <Text
                                fontSize="xs"
                                color="text.400"
                                fontWeight="bold"
                              >
                                {(originalPlay as NFLPlay).Distance}
                              </Text>
                            </HStack>
                          )}
                          {(originalPlay as NFLPlay).YardLine !== undefined && (
                            <HStack gap="1" align="center">
                              <Text
                                fontSize="2xs"
                                color="text.500"
                                fontWeight="medium"
                              >
                                {(originalPlay as NFLPlay).YardLineTerritory}{" "}
                                {(originalPlay as NFLPlay).YardLine}
                              </Text>
                            </HStack>
                          )}
                        </>
                      )}

                      {league === League.NBA && (
                        <>
                          {(originalPlay as NBAPlay).TimeRemainingMinutes !==
                            undefined &&
                            (originalPlay as NBAPlay).TimeRemainingSeconds !==
                              undefined && (
                              <HStack gap="1" align="center">
                                <Text
                                  fontSize="xs"
                                  color="text.500"
                                  fontWeight="medium"
                                >
                                  Time:
                                </Text>
                                <Text
                                  fontSize="xs"
                                  color="text.400"
                                  fontWeight="bold"
                                >
                                  {
                                    (originalPlay as NBAPlay)
                                      .TimeRemainingMinutes
                                  }
                                  :
                                  {(
                                    originalPlay as NBAPlay
                                  ).TimeRemainingSeconds.toString().padStart(
                                    2,
                                    "0",
                                  )}
                                </Text>
                              </HStack>
                            )}
                          {(originalPlay as NBAPlay).QuarterName && (
                            <HStack gap="1" align="center">
                              <Text
                                fontSize="2xs"
                                color="text.500"
                                fontWeight="medium"
                              >
                                {(originalPlay as NBAPlay).QuarterName}
                              </Text>
                            </HStack>
                          )}
                        </>
                      )}
                    </HStack>

                    {league === League.MLB &&
                      (originalPlay as MLBPlay).PitcherName && (
                        <Text
                          fontSize="2xs"
                          color="text.500"
                          fontWeight="medium"
                        >
                          P: {(originalPlay as MLBPlay).PitcherName}
                        </Text>
                      )}

                    {league === League.NFL &&
                      (originalPlay as NFLPlay).YardsGained !== undefined && (
                        <Text
                          fontSize="2xs"
                          color="text.500"
                          fontWeight="medium"
                        >
                          {(originalPlay as NFLPlay).YardsGained > 0 ? "+" : ""}
                          {(originalPlay as NFLPlay).YardsGained} yds
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
          <Box
            w="8"
            h="8"
            minW="8"
            minH="8"
            flexShrink={0}
            borderRadius="sm"
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

          <VStack gap="1" align={isPBP ? "flex-end" : "flex-start"}>
            <Box
              bg={
                isPBP
                  ? "primary.200"
                  : isReddit
                    ? event.team === "away"
                      ? "unifiedFeed.reddit.away"
                      : "unifiedFeed.reddit.home"
                    : "unifiedFeed.twitter"
              }
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
                    <Text
                      fontSize="2xs"
                      color={event.team === "away" ? "red" : "#44aae5"}
                    >
                      • {event.subreddit}
                    </Text>
                  )}
                </HStack>
              )}
              {event.type === "twitter" && (
                <HStack gap="1" mb="0.5">
                  <Text fontSize="2xs" fontWeight="semibold" color="text.500">
                    @{event.author}
                  </Text>
                </HStack>
              )}
              <Text fontSize="xs" color="text.400">
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

  return (
    <VStack gap="0" align="stretch">
      {latestPBPEvent && renderStickyPBPEvent(latestPBPEvent)}

      <Box px="7" py="1">
        <VStack gap="3" align="stretch">
          {hasError ? (
            <VStack gap="4" py="8">
              <Text color="red.500" fontSize="sm" textAlign="center">
                {redditCommentsError}
              </Text>
              <Text color="text.400" fontSize="xs" textAlign="center">
                Unable to load game feed
              </Text>
            </VStack>
          ) : !hasData && hasCompletedLoading ? (
            <VStack gap="4" align="center" py="12">
              <MessageCircle size={32} color="var(--chakra-colors-text-300)" />
              <Text fontSize="lg" fontWeight="semibold" color="text.300">
                No activity yet
              </Text>
              <Text fontSize="xs" color="text.300" textAlign="center">
                Game feed will appear here once the game starts.
              </Text>
            </VStack>
          ) : !hasData ? (
            <UnifiedGameFeedSkeleton />
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
