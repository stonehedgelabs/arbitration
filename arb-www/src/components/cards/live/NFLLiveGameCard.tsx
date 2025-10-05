// Third-party library imports
import { Card, Text, VStack } from "@chakra-ui/react";

// Internal imports - config
import { GameStatus, League } from "../../../config";

interface Team {
  name: string;
  score: number;
  logo?: string;
}

interface LiveGame {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: GameStatus.LIVE;
  time: string;
  quarter?: string;
  inningHalf?: string;
  stadium?: string;
  city?: string;
  state?: string;
  isPostseason?: boolean;
  league: League;
}

interface NFLLiveGameCardProps {
  game: LiveGame;
  onGameClick?: (gameId: string) => void;
}

export function NFLLiveGameCard({ game, onGameClick }: NFLLiveGameCardProps) {
  return (
    <Card.Root
      key={game.id}
      bg="primary.25"
      borderRadius="12px"
      shadow="sm"
      border="1px"
      borderColor="text.400"
      _active={{ transform: "scale(0.98)" }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => onGameClick?.(game.id)}
    >
      <Card.Body p="4">
        <VStack align="stretch" gap="4">
          <Text fontSize="sm" color="text.400">
            NFL Live Game - {game.awayTeam.name} vs {game.homeTeam.name}
          </Text>
          <Text fontSize="xs" color="text.500">
            NFL-specific card coming soon
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
