import { Box, VStack, HStack, Text } from "@chakra-ui/react";
import { MessageCircle } from "lucide-react";
import { RedditGameThreadCommentsResponse } from "../../../schema/redditGameThreadComments";
import { formatRelativeUTCTime } from "../../../utils";

interface RedditContentProps {
  gameId: string;
  awayTeam: string;
  homeTeam: string;
  awayTeamSubreddit?: string;
  homeTeamSubreddit?: string;
  redditData?: RedditGameThreadCommentsResponse;
}

export function RedditContent({
  awayTeam,
  homeTeam,
  awayTeamSubreddit = "r/baseball",
  homeTeamSubreddit = "r/baseball",
  redditData,
}: RedditContentProps) {
  // Use consistent colors with the rest of the app
  const awayBubbleBg = "primary.200";
  const homeBubbleBg = "green.100";
  const awayAvatarBg = "blue.400";
  const homeAvatarBg = "green.400";

  // Use real Reddit data if available, otherwise show no comments message
  const comments = redditData?.posts?.[0]?.comments || [];

  if (!redditData) {
    return (
      <VStack gap="4" align="center" py="12">
        <MessageCircle size={32} color="var(--chakra-colors-text-400)" />
        <Text fontSize="lg" fontWeight="semibold" color="text.400">
          No Reddit data available
        </Text>
        <Text fontSize="sm" color="text.500" textAlign="center">
          Reddit game thread comments will appear here once loaded.
        </Text>
      </VStack>
    );
  }

  if (comments.length === 0) {
    return (
      <VStack gap="4" align="center" py="12">
        <MessageCircle size={32} color="var(--chakra-colors-text-400)" />
        <Text fontSize="lg" fontWeight="semibold" color="text.400">
          No comments found
        </Text>
        <Text fontSize="sm" color="text.500" textAlign="center">
          Game thread comments will appear here once the game starts.
        </Text>
      </VStack>
    );
  }

  return (
    <Box px="2" py="2">
      <VStack gap="4" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center" py="3">
          <Text fontSize="lg" fontWeight="semibold" color="text.400">
            Game Thread Comments
          </Text>
        </HStack>
        <VStack gap="2" align="center">
          <HStack gap="4">
            <HStack gap="2">
              <Box w="3" h="3" bg="blue.400" borderRadius="full" />
              <Text fontSize="xs" color="text.400">
                {awayTeam} ({awayTeamSubreddit})
              </Text>
            </HStack>
            <HStack gap="2">
              <Box w="3" h="3" bg="green.400" borderRadius="full" />
              <Text fontSize="xs" color="text.400">
                {homeTeam} ({homeTeamSubreddit})
              </Text>
            </HStack>
          </HStack>
        </VStack>

        {/* iMessage-style Comments */}
        <VStack gap="3" align="stretch">
          {comments
            .map((comment) => {
              // Determine team based on subreddit (case-insensitive)
              const awaySubreddit = awayTeamSubreddit
                ?.replace("r/", "")
                .toLowerCase();
              const homeSubreddit = homeTeamSubreddit
                ?.replace("r/", "")
                .toLowerCase();

              let team: "away" | "home" | "other";
              if (comment.subreddit.toLowerCase() === awaySubreddit) {
                team = "away";
              } else if (comment.subreddit.toLowerCase() === homeSubreddit) {
                team = "home";
              } else {
                team = "other";
              }

              // Skip comments from other subreddits for now, or handle them differently
              if (team === "other") {
                return null;
              }

              return (
                <Box
                  key={comment.id}
                  display="flex"
                  justifyContent={team === "away" ? "flex-start" : "flex-end"}
                >
                  <HStack
                    gap="2"
                    maxW="95%"
                    flexDirection={team === "away" ? "row" : "row-reverse"}
                    align="flex-start"
                  >
                    {/* Avatar */}
                    <Box
                      w="8"
                      h="8"
                      minW="8"
                      minH="8"
                      flexShrink={0}
                      borderRadius="full"
                      bg={team === "away" ? awayAvatarBg : homeAvatarBg}
                      color="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      {comment.author.charAt(0).toUpperCase()}
                    </Box>

                    {/* Comment Bubble */}
                    <VStack
                      gap="1"
                      align={team === "away" ? "flex-start" : "flex-end"}
                    >
                      <Box
                        bg={team === "away" ? awayBubbleBg : homeBubbleBg}
                        borderRadius="lg"
                        px="3"
                        py="2"
                        maxW="280px"
                        wordBreak="break-word"
                      >
                        <Text
                          fontSize="2xs"
                          fontWeight="semibold"
                          color="text.500"
                          mb="0.5"
                        >
                          u/{comment.author}
                        </Text>
                        <Text fontSize="xs" color="text.500">
                          {comment.content}
                        </Text>
                        <HStack gap="2" mt="1">
                          <Text fontSize="2xs" color="text.500">
                            ↑ {comment.score}
                          </Text>
                          <Text fontSize="2xs" color="text.500">
                            •
                          </Text>
                          <Text fontSize="2xs" color="text.500">
                            {formatRelativeUTCTime(comment.timestamp)}
                          </Text>
                        </HStack>
                      </Box>
                    </VStack>
                  </HStack>
                </Box>
              );
            })
            .filter(Boolean)}
        </VStack>
      </VStack>
    </Box>
  );
}
