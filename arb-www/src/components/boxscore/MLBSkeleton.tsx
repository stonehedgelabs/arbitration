import { Box, VStack, HStack, Flex } from "@chakra-ui/react";
import { Skeleton, SkeletonCircle, SkeletonText } from "../Skeleton";

export function MLBSkeleton() {
  return (
    <Box p="4" bg="primary.25" borderRadius="12px">
      <VStack gap="4" align="stretch" w="full">
        {/* Game Meta Info */}
        <VStack spacing="2" align="center">
          <SkeletonText width="180px" height="14px" /> {/* "Game 3 of 5..." */}
        </VStack>

        {/* Main Scoreboard Section */}
        <Flex justify="space-between" align="center" w="full" px="2" gap="6">
          {/* Away Team */}
          <VStack spacing="2" align="center" flex="1">
            <SkeletonCircle size="48px" />
            <VStack spacing="1" align="center">
              <SkeletonText width="80px" height="14px" /> {/* Team name */}
              <SkeletonText width="70px" height="12px" /> {/* City */}
            </VStack>
            <SkeletonText width="24px" height="32px" /> {/* Score */}
          </VStack>

          {/* Inning + Bases/Outs Section */}
          <VStack spacing="3" align="center" flex="1">
            <SkeletonText width="40px" height="14px" /> {/* "▼ 5" */}
            {/* Bases indicator */}
            <Box
              w="48px"
              h="48px"
              borderRadius="md"
              bg="text.200"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <SkeletonCircle size="40px" />
            </Box>
            {/* Outs / Strikes / Balls */}
            <HStack spacing="6" align="center">
              {/* Outs */}
              <VStack spacing="1" align="center">
                <HStack spacing="1">
                  <SkeletonCircle size="8px" />
                  <SkeletonCircle size="8px" />
                </HStack>
                <SkeletonText width="28px" height="10px" />
              </VStack>

              {/* Strikes */}
              <VStack spacing="1" align="center">
                <HStack spacing="1">
                  <SkeletonCircle size="8px" />
                  <SkeletonCircle size="8px" />
                </HStack>
                <SkeletonText width="36px" height="10px" />
              </VStack>

              {/* Balls */}
              <VStack spacing="1" align="center">
                <HStack spacing="1">
                  <SkeletonCircle size="8px" />
                  <SkeletonCircle size="8px" />
                  <SkeletonCircle size="8px" />
                </HStack>
                <SkeletonText width="30px" height="10px" />
              </VStack>
            </HStack>
          </VStack>

          {/* Home Team */}
          <VStack spacing="2" align="center" flex="1">
            <SkeletonCircle size="48px" />
            <VStack spacing="1" align="center">
              <SkeletonText width="80px" height="14px" />
              <SkeletonText width="70px" height="12px" />
            </VStack>
            <SkeletonText width="24px" height="32px" />
          </VStack>
        </Flex>

        {/* Bottom Info */}
        <VStack spacing="2" align="center" w="full">
          <SkeletonText width="100px" height="12px" /> {/* "Dodger Stadium" */}
          <SkeletonText width="160px" height="12px" /> {/* TV + odds */}
        </VStack>
      </VStack>
    </Box>
  );
}
