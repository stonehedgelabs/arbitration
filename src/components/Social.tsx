import { useState } from "react";
import { Heart, MessageCircle, Share, Search, X, Check } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Input,
} from "@chakra-ui/react";

interface SocialPost {
  id: string;
  author: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  platform: "twitter" | "instagram" | "official";
  media?: string;
  verified?: boolean;
}

interface SocialSectionProps {
  posts: SocialPost[];
  favoriteTeams: string[];
  onToggleFavorite: (teamName: string) => void;
}

export function Social({ posts }: SocialSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter posts based on search query
  const filteredPosts = posts.filter((post) => {
    if (!searchQuery.trim()) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(searchLower) ||
      post.author.toLowerCase().includes(searchLower)
    );
  });

  const clearSearch = () => {
    setSearchQuery("");
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "twitter":
        return (
          <Badge
            variant="solid"
            bg="blue.500"
            color="white"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            Twitter
          </Badge>
        );
      case "instagram":
        return (
          <Badge
            variant="solid"
            bg="pink.500"
            color="white"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            Instagram
          </Badge>
        );
      case "official":
        return (
          <Badge
            variant="solid"
            bg="green.500"
            color="white"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            Official
          </Badge>
        );
      default:
        return (
          <Badge
            variant="solid"
            bg="gray.500"
            color="white"
            fontSize="xs"
            px="2"
            py="1"
            borderRadius="full"
          >
            {platform}
          </Badge>
        );
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
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
              placeholder="Search posts, teams, players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="gray.100"
              border="none"
              borderRadius="8px"
              pl="10"
              pr={searchQuery ? "10" : "4"}
              _focus={{
                bg: "white",
                border: "1px solid #3182ce",
                boxShadow: "0 0 0 1px #3182ce",
              }}
            />
            <Box
              position="absolute"
              left="3"
              top="50%"
              transform="translateY(-50%)"
              pointerEvents="none"
            >
              <Box w="4" h="4" color="gray.400">
                <Search size={16} />
              </Box>
            </Box>
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                position="absolute"
                right="1"
                top="50%"
                transform="translateY(-50%)"
                h="8"
                w="8"
                p="0"
                zIndex="1"
              >
                <Box w="4" h="4">
                  <X size={16} />
                </Box>
              </Button>
            )}
          </Box>
        </VStack>

        {/* Posts */}
        <VStack gap="4" align="stretch">
          {posts.length === 0 ? (
            // No content at all
            <Card.Root
              bg="white"
              borderRadius="12px"
              shadow="sm"
              border="1px"
              borderColor="gray.200"
            >
              <Card.Body p="8" textAlign="center">
                <VStack gap="4">
                  <Box
                    w="12"
                    h="12"
                    bg="gray.200"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box w="6" h="6" color="gray.400">
                      <MessageCircle size={24} />
                    </Box>
                  </Box>
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                      No Social Content
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      There are no social posts available for this league yet.
                      Check back later for updates from teams and players.
                    </Text>
                  </VStack>
                </VStack>
              </Card.Body>
            </Card.Root>
          ) : filteredPosts.length === 0 && searchQuery ? (
            // Search returned no results
            <Card.Root
              bg="white"
              borderRadius="12px"
              shadow="sm"
              border="1px"
              borderColor="gray.200"
            >
              <Card.Body p="8" textAlign="center">
                <VStack gap="4">
                  <Box
                    w="12"
                    h="12"
                    bg="gray.200"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Box w="6" h="6" color="gray.400">
                      <Search size={24} />
                    </Box>
                  </Box>
                  <VStack gap="2">
                    <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                      No posts found
                    </Text>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Try searching for different keywords or check your
                      spelling.
                    </Text>
                  </VStack>
                  <Button variant="outline" onClick={clearSearch} size="sm">
                    Clear search
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>
          ) : (
            // Show posts
            filteredPosts.map((post) => (
              <Card.Root
                key={post.id}
                bg="white"
                borderRadius="12px"
                shadow="sm"
                border="1px"
                borderColor="gray.200"
                _active={{ transform: "scale(0.98)" }}
                transition="all 0.2s"
              >
                <Card.Body p="4">
                  <VStack align="stretch" gap="3">
                    {/* Header with profile and timestamp */}
                    <HStack gap="3" align="start">
                      <Box
                        w="10"
                        h="10"
                        borderRadius="full"
                        bg="gray.200"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        overflow="hidden"
                        flexShrink="0"
                      >
                        <Image
                          src={post.authorAvatar || "/api/placeholder/40/40"}
                          alt={post.author}
                          w="full"
                          h="full"
                          objectFit="cover"
                        />
                      </Box>
                      <VStack align="start" gap="1" flex="1">
                        <HStack gap="2">
                          <Text
                            fontSize="sm"
                            fontWeight="semibold"
                            color="gray.900"
                          >
                            {post.author}
                          </Text>
                          {post.verified && (
                            <Box w="4" h="4" color="blue.500">
                              <Check size={16} />
                            </Box>
                          )}
                        </HStack>
                        <HStack gap="2" flexWrap="wrap">
                          <Text fontSize="xs" color="gray.500">
                            {post.timestamp}
                          </Text>
                          {getPlatformBadge(post.platform)}
                        </HStack>
                      </VStack>
                    </HStack>

                    {/* Post content */}
                    <Text fontSize="sm" color="gray.900" lineHeight="1.5">
                      {post.content}
                    </Text>

                    {/* Media if present */}
                    {post.media && (
                      <Box
                        w="full"
                        h="48"
                        borderRadius="8px"
                        overflow="hidden"
                        bg="gray.200"
                      >
                        <Image
                          src={post.media}
                          alt="Post media"
                          w="full"
                          h="full"
                          objectFit="cover"
                        />
                      </Box>
                    )}

                    {/* Engagement metrics */}
                    <HStack gap="6" pt="2">
                      <HStack
                        gap="1"
                        cursor="pointer"
                        _hover={{ color: "red.500" }}
                      >
                        <Box w="4" h="4" color="gray.500">
                          <Heart size={16} />
                        </Box>
                        <Text fontSize="xs" color="gray.500">
                          {formatNumber(post.likes)}
                        </Text>
                      </HStack>
                      <HStack
                        gap="1"
                        cursor="pointer"
                        _hover={{ color: "blue.500" }}
                      >
                        <Box w="4" h="4" color="gray.500">
                          <MessageCircle size={16} />
                        </Box>
                        <Text fontSize="xs" color="gray.500">
                          {formatNumber(post.comments)}
                        </Text>
                      </HStack>
                      <HStack
                        gap="1"
                        cursor="pointer"
                        _hover={{ color: "green.500" }}
                      >
                        <Box w="4" h="4" color="gray.500">
                          <Share size={16} />
                        </Box>
                        <Text fontSize="xs" color="gray.500">
                          {formatNumber(post.shares)}
                        </Text>
                      </HStack>
                    </HStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))
          )}
        </VStack>
      </VStack>
    </Box>
  );
}
