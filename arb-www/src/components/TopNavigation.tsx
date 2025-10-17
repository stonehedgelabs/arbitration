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
      overflow="visible"
    >
      <Box px="4" py="3">
        <HStack justify="space-between" align="center">
          <Box w="24" display="flex" justifyContent="flex-start">
            {onBack ? <BackButton onClick={onBack} /> : null}
          </Box>
          <Box
            w="40px"
            h="40px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <ChatBubbleIcon size="md" />
          </Box>
          {showLeagueSelector ? (
            <Box
              w="24"
              position="relative"
              mr="2"
              display="flex"
              justifyContent="flex-end"
            >
              <LeagueSelector />
            </Box>
          ) : (
            <Box w="24" />
          )}
        </HStack>
      </Box>
    </Box>
  );
}
