// React imports
import { memo } from "react";

// Third-party library imports
import { Box, Text, VStack } from "@chakra-ui/react";

// Internal imports - components
import { TwitterContent } from "../components/TwitterContent";

// Internal imports - config
import { TWITTER_CONFIG } from "../config";

interface SocialSectionProps {
  selectedLeague: string;
}

export const Social = memo(function Social({}: SocialSectionProps) {
  return (
    <Box minH="100vh" bg="primary.25">
      <VStack gap="4" align="stretch" p="4" pb="20">
        {/* Header */}
        <Text fontSize="2xl" fontWeight="bold" color="text.400">
          Social
        </Text>

        {/* Twitter Content */}
        <TwitterContent defaultTweetCount={TWITTER_CONFIG.defaultTweetLimit} />
      </VStack>
    </Box>
  );
});
