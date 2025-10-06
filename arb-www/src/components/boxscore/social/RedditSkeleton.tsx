import {
  Box,
  VStack,
  HStack,
  Skeleton,
  SkeletonCircle,
} from "@chakra-ui/react";

interface RedditSkeletonProps {
  commentCount?: number;
}

export function RedditSkeleton({ commentCount = 8 }: RedditSkeletonProps) {
  return (
    <VStack gap="3" align="stretch" p="4">
      {Array.from({ length: commentCount }, (_, index) => {
        const isAway = index % 2 === 0; // Alternate between away and home

        return (
          <Box
            key={index}
            display="flex"
            justifyContent={isAway ? "flex-start" : "flex-end"}
          >
            <HStack
              gap="2"
              maxW="90%"
              flexDirection={isAway ? "row" : "row-reverse"}
            >
              {/* Avatar Skeleton */}
              <SkeletonCircle size="8" />

              {/* Comment Bubble Skeleton */}
              <VStack
                gap="1"
                align={isAway ? "flex-start" : "flex-end"}
                maxW="100%"
              >
                {/* Author and Score */}
                <HStack gap="2" align="center">
                  <Skeleton height="12px" width="80px" />
                  <Skeleton height="10px" width="40px" />
                </HStack>

                {/* Comment Text */}
                <Box
                  bg={isAway ? "blue.50" : "green.50"}
                  borderRadius="lg"
                  p="3"
                  maxW="100%"
                  minW="120px"
                >
                  <VStack gap="2" align="stretch">
                    <Skeleton height="14px" width="100%" />
                    <Skeleton height="14px" width="85%" />
                    {index % 3 === 0 && <Skeleton height="14px" width="70%" />}
                  </VStack>
                </Box>

                {/* Timestamp */}
                <Skeleton height="10px" width="60px" />
              </VStack>
            </HStack>
          </Box>
        );
      })}
    </VStack>
  );
}
