import { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { ArrowLeft } from "lucide-react";

interface BoxScoreDetailNBAProps {
  gameId: string;
  onBack: () => void;
}

export function BoxScoreDetailNBA({ gameId, onBack }: BoxScoreDetailNBAProps) {
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement NBA box score fetching
    setLoading(false);
  }, [gameId]);

  if (loading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Spinner size="lg" />
          <Text>Loading NBA box score...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="4">
          <Text color="red.500">Error loading game data: {error}</Text>
          <Button onClick={onBack}>Go Back</Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="white">
      {/* Header with Back Button */}
      <Box bg="white" px="4" py="3" borderBottom="1px" borderColor="gray.200">
        <HStack justify="space-between" align="center">
          <IconButton
            aria-label="Go back"
            variant="ghost"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Text fontSize="sm" color="gray.600">
            NBA Box Score
          </Text>
        </HStack>
      </Box>

      {/* Main Content */}
      <Box px="4" py="6">
        <VStack gap="6" align="stretch">
          {/* Game Info */}
          <Box bg="gray.50" p="4" borderRadius="lg">
            <Text fontSize="lg" fontWeight="bold" mb="3" color="gray.600">
              Game Information
            </Text>
            <VStack gap="2" align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  Game ID:
                </Text>
                <Text fontSize="sm" fontWeight="medium" color="gray.600">
                  {gameId}
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.500" textAlign="center">
                NBA box score details coming soon...
              </Text>
            </VStack>
          </Box>

          {/* Team Stats Placeholder */}
          <Box bg="gray.50" p="4" borderRadius="lg">
            <Text fontSize="md" fontWeight="bold" mb="3" color="gray.600">
              Team Statistics
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Detailed NBA statistics will be displayed here
            </Text>
          </Box>

          {/* Player Stats Placeholder */}
          <Box bg="gray.50" p="4" borderRadius="lg">
            <Text fontSize="md" fontWeight="bold" mb="3" color="gray.600">
              Player Statistics
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              Individual player stats will be shown here
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
