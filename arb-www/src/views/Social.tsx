import { memo } from "react";
import { Box, Text, VStack } from "@chakra-ui/react";

import { TwitterContent } from "../components/TwitterContent";
import { NotImplemented } from "./NotImplemented";

import { TWITTER_CONFIG, League } from "../config";

interface SocialSectionProps {
  selectedLeague: string;
}

export const Social = memo(function Social({
  selectedLeague,
}: SocialSectionProps) {
  // Only show Twitter content for MLB, show not implemented for other leagues
  if (selectedLeague !== League.MLB) {
    return (
      <NotImplemented
        feature={`${selectedLeague.toUpperCase()} Social`}
        description={`Social features for ${selectedLeague.toUpperCase()} are coming soon. We're working on bringing you the latest social content and discussions.`}
        showBackButton={false}
      />
    );
  }

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
