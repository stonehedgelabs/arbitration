import { BoxScoreDetailMLB } from "./BoxScoreDetailMLB";
import { BoxScoreDetailNFL } from "./BoxScoreDetailNFL";
import { BoxScoreDetailNBA } from "./BoxScoreDetailNBA";
import { BoxScoreDetailNHL } from "./BoxScoreDetailNHL";
import { Box, VStack, Text, Button } from "@chakra-ui/react";

interface BoxScoreDetailProps {
  gameId: string;
  sport?: string;
  onBack: () => void;
}

export function BoxScoreDetail({
  gameId,
  sport = "mlb",
  onBack,
}: BoxScoreDetailProps) {
  // Route to sport-specific components
  if (sport === "mlb") {
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
