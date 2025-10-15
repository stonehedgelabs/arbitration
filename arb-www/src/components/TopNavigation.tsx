import { Box, HStack } from "@chakra-ui/react";
import { LeagueSelector } from "./LeagueSelector";
import { BackButton } from "./BackButton";
import { ChatBubbleIcon } from "./ChatBubbleIcon";

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
          {onBack ? <BackButton onClick={onBack} /> : <Box w="8" />}
          <Box
            w="40px"
            h="40px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flex="1"
          >
            <ChatBubbleIcon size="md" />
          </Box>
          <Box w="8" />
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
