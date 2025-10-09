import { Box, VStack, HStack } from "@chakra-ui/react";
import { SkeletonCircle, SkeletonText } from "./Skeleton";

export function UnifiedGameFeedSkeleton() {
  return (
    <VStack gap="0" align="stretch">
      {/* Sticky PBP Event Skeleton */}
      <Box
        position="sticky"
        top="0"
        zIndex="10"
        bg="primary.25"
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
          borderRadius="6px"
          shadow="sm"
          border="1px"
          borderColor="text.400"
          borderLeft="3px"
          borderLeftColor="primary.500"
          w="320px"
        >
          <Box px="4" pb="4">
            <VStack gap="1" align="stretch">
              {/* Header with Latest Play and timestamp */}
              <HStack justify="space-between" align="center">
                <HStack gap="1.5">
                  <SkeletonCircle size="16px" />
                  <SkeletonText width="60px" height="10px" />
                </HStack>
                <VStack gap="0" align="end" mt="4">
                  <SkeletonText width="50px" height="10px" />
                  <SkeletonText width="30px" height="12px" />
                </VStack>
              </HStack>

              {/* Team info with logo and name */}
              <HStack gap="2" align="center">
                <SkeletonCircle size="20px" />
                <VStack gap="0" align="start">
                  <SkeletonText width="80px" height="10px" />
                </VStack>
              </HStack>

              {/* Play description */}
              <HStack gap="2" align="center">
                <SkeletonText width="100%" height="12px" flex="1" />
                <SkeletonText width="40px" height="16px" />
              </HStack>

              {/* Game info: Scores */}
              <HStack justify="flex-end" align="center">
                <SkeletonText width="30px" height="10px" />
              </HStack>

              <HStack
                justify="space-between"
                align="center"
                mt="1.5"
                pt="1.5"
                borderTop="1px"
                borderColor="text.200"
              >
                <HStack gap="2" align="center">
                  <HStack gap="1" align="center">
                    <SkeletonText width="20px" height="10px" />
                    <SkeletonText width="8px" height="10px" />
                  </HStack>
                  <HStack gap="1" align="center">
                    <SkeletonText width="20px" height="10px" />
                    <SkeletonText width="8px" height="10px" />
                  </HStack>
                  <HStack gap="1" align="center">
                    <SkeletonText width="20px" height="10px" />
                    <SkeletonText width="8px" height="10px" />
                  </HStack>
                </HStack>

                <SkeletonText width="60px" height="10px" />
              </HStack>
            </VStack>
          </Box>
        </Box>
      </Box>

      {/* Events List Skeleton */}
      <Box px="4" py="1">
        <VStack gap="3" align="stretch">
          {/* Multiple event skeletons */}
          {Array.from({ length: 5 }, (_, index) => (
            <Box key={index} display="flex" justifyContent="center" mb="3">
              <HStack gap="2" maxW="95%" flexDirection="row" align="flex-start">
                {/* Avatar/Icon */}
                <SkeletonCircle size="32px" />

                {/* Event Bubble */}
                <VStack gap="1" align="flex-start">
                  <Box
                    bg="gray.100"
                    borderRadius="lg"
                    px="3"
                    py="2"
                    maxW="280px"
                    wordBreak="break-word"
                  >
                    <HStack gap="1" mb="0.5">
                      <SkeletonText width="60px" height="10px" />
                      <SkeletonText width="40px" height="10px" />
                    </HStack>
                    <SkeletonText width="200px" height="12px" />
                    <HStack gap="2" mt="1">
                      <SkeletonText width="20px" height="10px" />
                      <SkeletonText width="4px" height="10px" />
                      <SkeletonText width="30px" height="10px" />
                    </HStack>
                  </Box>
                </VStack>
              </HStack>
            </Box>
          ))}
        </VStack>
      </Box>
    </VStack>
  );
}
