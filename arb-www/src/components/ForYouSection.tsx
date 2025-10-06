// Third-party library imports
import {
  Badge,
  Box,
  Card,
  HStack,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  Check,
  Eye,
  Heart,
  MessageCircle,
  Play,
  Share,
  Star,
  Trophy,
} from "lucide-react";

// Internal imports - config
import { GameStatus } from "../config";

interface ForYouItem {
  id: string;
  type: "game" | "video" | "social" | "news";
  league: string;
  leagueColor: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
  data: any;
}

interface ForYouSectionProps {
  items: ForYouItem[];
  favoriteTeams: string[];
  onToggleFavorite: (teamName: string) => void;
}

export function ForYouSection({ items }: ForYouSectionProps) {
  // Show not implemented state if no items
  if (!items || items.length === 0) {
    return (
      <Box
        minH="100vh"
        bg="primary.25"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p="4"
      >
        <Card.Root
          maxW="md"
          w="full"
          bg="primary.25"
          borderRadius="16px"
          shadow="lg"
          border="1px"
          borderColor="text.200"
        >
          <Card.Body p="8" textAlign="center">
            <VStack gap="6">
              {/* Icon */}
              <Box
                w="20"
                h="20"
                bg="accent.100"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="text.400"
              >
                <Star size={48} />
              </Box>

              {/* Content */}
              <VStack gap="3">
                <Text fontSize="xl" fontWeight="bold" color="text.400">
                  For You Feed
                </Text>
                <Text fontSize="md" color="text.500" lineHeight="1.6">
                  Personalized content recommendations are coming soon. We're
                  working on bringing you the most relevant sports content based
                  on your preferences.
                </Text>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Box>
    );
  }
  const renderSocialCard = (item: ForYouItem) => {
    const post = item.data;
    return (
      <Card.Root
        key={item.id}
        bg="primary.200"
        borderRadius="12px"
        shadow="sm"
        border="1px"
        borderColor="gray.200"
        mb="4"
        _active={{ transform: "scale(0.98)" }}
        transition="all 0.2s"
      >
        <Card.Body p="4">
          <VStack align="stretch" gap="3">
            {/* Header with profile and timestamp */}
            <HStack justify="space-between" align="center">
              <HStack gap="3">
                <Box
                  w="10"
                  h="10"
                  borderRadius="full"
                  bg="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  overflow="hidden"
                >
                  <Image
                    src={post.profileImage || "/api/placeholder/40/40"}
                    alt={post.author}
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                </Box>
                <VStack align="start" gap="0">
                  <HStack gap="2">
                    <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                      {post.author}
                    </Text>
                    <Box w="4" h="4" color="blue.500">
                      <Check size={16} />
                    </Box>
                  </HStack>
                  <HStack gap="2">
                    <Badge
                      variant="solid"
                      bg="danger.100"
                      color="text.400"
                      fontSize="xs"
                      px="2"
                      py="1"
                      borderRadius="full"
                    >
                      {item.league}
                    </Badge>
                    <Text fontSize="xs" color="gray.500">
                      {item.timestamp}
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
            </HStack>

            {/* Post content */}
            <Text fontSize="sm" color="gray.900" lineHeight="1.5">
              {post.content}
            </Text>

            {/* Engagement metrics */}
            <HStack gap="6" pt="2">
              <HStack gap="1">
                <Box w="4" h="4" color="gray.500">
                  <Heart size={16} />
                </Box>
                <Text fontSize="xs" color="gray.500">
                  {post.likes}
                </Text>
              </HStack>
              <HStack gap="1">
                <Box w="4" h="4" color="gray.500">
                  <MessageCircle size={16} />
                </Box>
                <Text fontSize="xs" color="gray.500">
                  {post.comments}
                </Text>
              </HStack>
              <HStack gap="1">
                <Box w="4" h="4" color="gray.500">
                  <Share size={16} />
                </Box>
                <Text fontSize="xs" color="gray.500">
                  {post.shares}
                </Text>
              </HStack>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  };

  const renderNewsCard = (item: ForYouItem) => {
    const article = item.data;
    return (
      <Card.Root
        key={item.id}
        bg="primary.200"
        borderRadius="12px"
        shadow="sm"
        border="1px"
        borderColor="gray.200"
        mb="4"
        _active={{ transform: "scale(0.98)" }}
        transition="all 0.2s"
      >
        <Card.Body p="4">
          <HStack gap="4" align="start">
            <Box
              w="20"
              h="20"
              borderRadius="8px"
              bg="gray.200"
              overflow="hidden"
              flexShrink="0"
            >
              <Image
                src={article.thumbnail || "/api/placeholder/80/80"}
                alt={article.title}
                w="full"
                h="full"
                objectFit="cover"
              />
            </Box>
            <VStack align="start" gap="2" flex="1">
              <HStack gap="2">
                <Badge
                  variant="solid"
                  bg="blue.500"
                  color="text.400"
                  fontSize="xs"
                  px="2"
                  py="1"
                  borderRadius="full"
                >
                  {item.league}
                </Badge>
                <Text fontSize="xs" color="gray.500">
                  {item.timestamp}
                </Text>
              </HStack>
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                lineHeight="1.4"
              >
                {article.title}
              </Text>
              <Text
                fontSize="xs"
                color="gray.600"
                lineHeight="1.4"
                overflow="hidden"
                textOverflow="ellipsis"
                display="-webkit-box"
                style={{ WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
              >
                {article.excerpt}
              </Text>
            </VStack>
          </HStack>
        </Card.Body>
      </Card.Root>
    );
  };

  const renderVideoCard = (item: ForYouItem) => {
    const video = item.data;
    return (
      <Card.Root
        key={item.id}
        bg="primary.200"
        borderRadius="12px"
        shadow="sm"
        border="1px"
        borderColor="gray.200"
        mb="4"
        _active={{ transform: "scale(0.98)" }}
        transition="all 0.2s"
        overflow="hidden"
      >
        <Box position="relative">
          <Box
            w="full"
            h="200px"
            bg="gray.200"
            position="relative"
            overflow="hidden"
          >
            <Image
              src={video.thumbnail || "/api/placeholder/400/200"}
              alt={video.title}
              w="full"
              h="full"
              objectFit="cover"
            />
            <Badge
              position="absolute"
              top="3"
              left="3"
              variant="solid"
              bg="primary.25"
              color="text.400"
              fontSize="xs"
              px="2"
              py="1"
              borderRadius="full"
            >
              {item.league}
            </Badge>
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              w="16"
              h="16"
              bg="blackAlpha.600"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box w="8" h="8" color="text.400" ml="1">
                <Play size={32} />
              </Box>
            </Box>
            <Text
              position="absolute"
              bottom="3"
              right="3"
              fontSize="xs"
              color="text.400"
              bg="blackAlpha.600"
              px="2"
              py="1"
              borderRadius="4px"
            >
              {video.duration}
            </Text>
          </Box>
          <Card.Body p="4">
            <VStack align="start" gap="2">
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="gray.900"
                lineHeight="1.4"
              >
                {video.title}
              </Text>
              <HStack gap="4">
                <HStack gap="1">
                  <Box w="4" h="4" color="gray.500">
                    <Eye size={16} />
                  </Box>
                  <Text fontSize="xs" color="gray.500">
                    {video.views}
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.500">
                  {item.timestamp}
                </Text>
              </HStack>
            </VStack>
          </Card.Body>
        </Box>
      </Card.Root>
    );
  };

  const renderGameCard = (item: ForYouItem) => {
    const game = item.data;
    return (
      <Card.Root
        key={item.id}
        bg="primary.200"
        borderRadius="12px"
        shadow="sm"
        border="1px"
        borderColor="gray.200"
        mb="4"
        _active={{ transform: "scale(0.98)" }}
        transition="all 0.2s"
      >
        <Card.Body p="4">
          <VStack align="stretch" gap="3">
            {/* Header with league and timestamp */}
            <HStack justify="space-between" align="center">
              <HStack gap="2">
                <Badge
                  variant="solid"
                  bg="danger.100"
                  color="text.400"
                  fontSize="xs"
                  px="2"
                  py="1"
                  borderRadius="full"
                >
                  {item.league}
                </Badge>
                {item.priority === "high" && (
                  <Box w="4" h="4" color="yellow.400">
                    <Star size={16} fill="currentColor" />
                  </Box>
                )}
              </HStack>
              <Text fontSize="xs" color="gray.500">
                {item.timestamp}
              </Text>
            </HStack>

            {/* Game content */}
            <VStack gap="3">
              <HStack justify="space-between" align="center" w="full">
                <HStack gap="3">
                  <Box
                    w="6"
                    h="6"
                    borderRadius="full"
                    bg="gray.300"
                    flexShrink="0"
                  />
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">
                    {game.awayTeam.name}
                  </Text>
                </HStack>
                <Text fontSize="sm" fontWeight="bold" color="gray.900">
                  {game.awayTeam.score}
                </Text>
              </HStack>
              <HStack justify="space-between" align="center" w="full">
                <HStack gap="3">
                  <Box
                    w="6"
                    h="6"
                    borderRadius="full"
                    bg="gray.300"
                    flexShrink="0"
                  />
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">
                    {game.homeTeam.name}
                  </Text>
                </HStack>
                <Text fontSize="sm" fontWeight="bold" color="gray.900">
                  {game.homeTeam.score}
                </Text>
              </HStack>
              {game.status === GameStatus.LIVE && (
                <HStack gap="2" pt="2">
                  <Box
                    w="2"
                    h="2"
                    bg="danger.100"
                    borderRadius="full"
                    animation="pulse 2s infinite"
                  />
                  <Text fontSize="xs" color="red.600" fontWeight="medium">
                    LIVE - {game.quarter}
                  </Text>
                </HStack>
              )}
            </VStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  };

  const renderContent = () => {
    if (items.length === 0) {
      return (
        <VStack gap="6" py="12" textAlign="center">
          <Box w="12" h="12" color="gray.400">
            <Trophy size={48} />
          </Box>
          <VStack gap="2">
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              No content yet
            </Text>
            <Text fontSize="sm" color="gray.600">
              Follow your favorite teams to see personalized content here.
            </Text>
          </VStack>
        </VStack>
      );
    }

    return (
      <VStack gap="4" align="stretch">
        {items.map((item) => {
          switch (item.type) {
            case "game":
              return renderGameCard(item);
            case "video":
              return renderVideoCard(item);
            case "news":
              return renderNewsCard(item);
            case "social":
              return renderSocialCard(item);
            default:
              return null;
          }
        })}
      </VStack>
    );
  };

  return (
    <Box minH="100vh" bg="primary.25">
      <Box p="4">
        <VStack gap="6" align="stretch">
          <VStack gap="2" align="start">
            <Text fontSize="xl" fontWeight="bold" color="gray.900">
              For You
            </Text>
            <Text fontSize="sm" color="gray.600">
              Personalized content based on your favorite teams
            </Text>
          </VStack>
          {renderContent()}
        </VStack>
      </Box>
    </Box>
  );
}
