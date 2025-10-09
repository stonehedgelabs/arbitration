import { Box, HStack, Text } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

export function BottomNavigation() {
  const location = useLocation();
  const isScoresActive = location.pathname.startsWith("/scores");

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      zIndex="50"
      bg="primary.200"
      borderTop="1px"
      borderColor="border.100"
      shadow="lg"
    >
      <HStack justify="center" align="center" py="3">
        <Box
          px="6"
          py="2"
          borderRadius="full"
          bg={isScoresActive ? "primary.100" : "transparent"}
          transition="all 0.2s"
        >
          <Text
            fontSize="sm"
            fontWeight={isScoresActive ? "semibold" : "medium"}
            color={isScoresActive ? "text.400" : "text.500"}
          >
            Scores
          </Text>
        </Box>
      </HStack>
    </Box>
  );
}
