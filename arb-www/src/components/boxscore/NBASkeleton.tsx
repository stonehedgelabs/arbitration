import { Box, VStack, HStack, Skeleton, Flex } from "@chakra-ui/react";
import { HideVerticalScroll } from "../containers";

export function NBASkeleton() {
  return (
    <HideVerticalScroll bg="primary.25">
      <Box px="6" py="2">
        {/* Game Title Skeleton */}
        <VStack gap="1" mb="4">
          <Skeleton height="16px" width="200px" bg="primary.300" />
          <Skeleton height="12px" width="100px" bg="primary.300" />
        </VStack>

        {/* Scoreboard Skeleton */}
        <VStack gap="2" mb="0">
          {/* Top row - Team info and scores */}
          <Flex justify="space-between" align="center" w="full">
            {/* Away Team */}
            <VStack gap="2" align="center" flex="1">
              <Skeleton w="12" h="12" borderRadius="full" bg="primary.300" />
              <VStack gap="0" align="center">
                <Skeleton height="14px" width="80px" bg="primary.300" />
                <Skeleton height="12px" width="60px" bg="primary.300" />
              </VStack>
              <Skeleton height="32px" width="40px" bg="primary.300" />
            </VStack>

            {/* Center - Game State */}
            <VStack gap="4" align="center" flex="1">
              <Skeleton height="20px" width="60px" bg="primary.300" />
              <Skeleton w="12" h="12" borderRadius="md" bg="primary.300" />
            </VStack>

            {/* Home Team */}
            <VStack gap="2" align="center" flex="1">
              <Skeleton w="12" h="12" borderRadius="full" bg="primary.300" />
              <VStack gap="0" align="center">
                <Skeleton height="14px" width="80px" bg="primary.300" />
                <Skeleton height="12px" width="60px" bg="primary.300" />
              </VStack>
              <Skeleton height="32px" width="40px" bg="primary.300" />
            </VStack>
          </Flex>

          {/* Quarter Scores Skeleton */}
          <VStack gap="2" w="full" mt="4">
            <Skeleton height="14px" width="100px" bg="primary.300" />
            <HStack gap="4" justify="center" wrap="wrap">
              {Array.from({ length: 4 }, (_, index) => (
                <VStack key={index} gap="1" align="center">
                  <Skeleton height="12px" width="20px" bg="primary.300" />
                  <HStack gap="2">
                    <Skeleton height="14px" width="16px" bg="primary.300" />
                    <Skeleton height="12px" width="8px" bg="primary.300" />
                    <Skeleton height="14px" width="16px" bg="primary.300" />
                  </HStack>
                </VStack>
              ))}
            </HStack>
          </VStack>

          {/* Bottom row - Game info */}
          <HStack gap="2" w="full" justify={"center"}>
            <Skeleton height="12px" width="120px" bg="primary.300" />
            <Skeleton height="12px" width="80px" bg="primary.300" />
          </HStack>
        </VStack>
      </Box>
    </HideVerticalScroll>
  );
}
