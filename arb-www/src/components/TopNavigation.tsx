import { Box, HStack, Text } from "@chakra-ui/react";
import { LeagueSelector } from "./LeagueSelector";
import { BackButton } from "./BackButton";

interface TopNavigationProps {
  showLeagueSelector?: boolean;
  onBack?: () => void;
}

export function TopNavigation({
  showLeagueSelector = true,
  onBack,
}: TopNavigationProps) {
  return (
    <Box
      bg="primary.25"
      borderBottom="1px"
      // borderColor="border.100"
      position="sticky"
      top="0"
      zIndex="40"
    >
      <Box px="4" py="3">
        <HStack justify="space-between" align="center">
          {onBack ? (
            <BackButton onClick={onBack} />
          ) : (
            <Box
              w="8"
              h="8"
              bg="primary.200"
              borderRadius="8px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              shadow="sm"
            >
              <Box
                w="6"
                h="6"
                bg="primary.25"
                borderRadius="4px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text color="text.400" fontSize="xs" fontWeight="bold">
                  A
                </Text>
              </Box>
            </Box>
          )}
          <Text
            fontSize={{ base: "lg" }}
            fontWeight="bold"
            textAlign="center"
            flex="1"
            color="text.400"
          >
            Arbitration
          </Text>
        </HStack>
      </Box>

      {/* League Selector */}
      {showLeagueSelector && (
        <Box px="4" pb="3">
          <LeagueSelector />
        </Box>
      )}
    </Box>
  );
}
