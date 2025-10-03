// Third-party library imports
import { Box, Button, Text, VStack } from "@chakra-ui/react";

// Internal imports - config
import { League } from "../config";

// Internal imports - components
import { BoxScoreDetailMLB } from "./BoxScoreDetailMLB";
import { BoxScoreDetailNBA } from "./BoxScoreDetailNBA";
import { BoxScoreDetailNFL } from "./BoxScoreDetailNFL";
import { BoxScoreDetailNHL } from "./BoxScoreDetailNHL";

interface BoxScoreDetailProps {
  gameId: string;
  sport?: string;
  onBack: () => void;
}

export function BoxScoreDetail({
  gameId,
  sport = League.MLB,
  onBack,
}: BoxScoreDetailProps) {
  // Route to sport-specific components
  if (sport === League.MLB) {
    return <BoxScoreDetailMLB gameId={gameId} onBack={onBack} />;
  }

  if (sport === "nfl") {
    return <BoxScoreDetailNFL gameId={gameId} onBack={onBack} />;
  }

  if (sport === "nba") {
    return <BoxScoreDetailNBA gameId={gameId} onBack={onBack} />;
  }

  if (sport === "nhl") {
    return <BoxScoreDetailNHL gameId={gameId} onBack={onBack} />;
  }

  // Show unsupported sport message for other sports
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack gap="4">
        <Text color="red.500" fontSize="lg" fontWeight="semibold">
          Unsupported Sport
        </Text>
        <Text color="gray.600" textAlign="center">
          Box score details for {sport?.toUpperCase()} are not yet supported.
        </Text>
        <Button onClick={onBack}>Go Back</Button>
      </VStack>
    </Box>
  );
}
