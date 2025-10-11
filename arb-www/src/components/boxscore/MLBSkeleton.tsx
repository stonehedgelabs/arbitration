import { Box, VStack, HStack, Flex } from "@chakra-ui/react";
import { SkeletonCircle, SkeletonText } from "../Skeleton";

export function MLBSkeleton() {
  return (
    <Box p="4" bg="primary.25" borderRadius="12px">
      <VStack gap="4" align="stretch" w="full">
        {/* Game Meta Info */}
        <VStack gap="2" align="center">
          <SkeletonText width="180px" height="14px" bg={"primary.300"} />{" "}
          {/* "Game 3 of 5..." */}
        </VStack>

        {/* Main Scoreboard Section */}
        <Flex justify="space-between" align="center" w="full" px="2" gap="6">
          {/* Away Team */}
          <VStack gap="2" align="center" flex="1">
            <SkeletonCircle size="48px" />
            <VStack gap="1" align="center">
              <SkeletonText width="80px" height="14px" bg={"primary.300"} />{" "}
              {/* Team name */}
              <SkeletonText
                width="70px"
                height="12px"
                bg={"primary.300"}
              />{" "}
              {/* City */}
            </VStack>
            <SkeletonText width="24px" height="32px" bg={"primary.300"} />{" "}
            {/* Score */}
          </VStack>

          {/* Inning + Bases/Outs Section */}
          <VStack gap="3" align="center" flex="1">
            <SkeletonText width="40px" height="14px" bg={"primary.300"} />{" "}
            {/* "▼ 5" */}
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
              <SkeletonCircle size="40px" bg={"primary.300"} />
            </Box>
            {/* Outs / Strikes / Balls */}
            <HStack gap="6" align="center">
              {/* Outs */}
              <VStack gap="1" align="center">
                <HStack gap="1">
                  <SkeletonCircle size="8px" bg={"primary.300"} />
                  <SkeletonCircle size="8px" bg={"primary.300"} />
                </HStack>
                <SkeletonText width="28px" height="10px" bg={"primary.300"} />
              </VStack>

              {/* Strikes */}
              <VStack gap="1" align="center">
                <HStack gap="1">
                  <SkeletonCircle size="8px" bg={"primary.300"} />
                  <SkeletonCircle size="8px" bg={"primary.300"} />
                </HStack>
                <SkeletonText width="36px" height="10px" bg={"primary.300"} />
              </VStack>

              {/* Balls */}
              <VStack gap="1" align="center">
                <HStack gap="1">
                  <SkeletonCircle size="8px" bg={"primary.300"} />
                  <SkeletonCircle size="8px" bg={"primary.300"} />
                  <SkeletonCircle size="8px" bg={"primary.300"} />
                </HStack>
                <SkeletonText width="30px" height="10px" bg={"primary.300"} />
              </VStack>
            </HStack>
          </VStack>

          {/* Home Team */}
          <VStack gap="2" align="center" flex="1">
            <SkeletonCircle size="48px" bg={"primary.300"} />
            <VStack gap="1" align="center">
              <SkeletonText width="80px" height="14px" bg={"primary.300"} />
              <SkeletonText width="70px" height="12px" bg={"primary.300"} />
            </VStack>
            <SkeletonText width="24px" height="32px" bg={"primary.300"} />
          </VStack>
        </Flex>

        {/* Bottom Info */}
        <VStack gap="2" align="center" w="full">
          <SkeletonText width="100px" height="12px" bg={"primary.300"} />{" "}
          {/* "Dodger Stadium" */}
          <SkeletonText width="160px" height="12px" bg={"primary.300"} />{" "}
          {/* TV + odds */}
        </VStack>
      </VStack>
    </Box>
  );
}
