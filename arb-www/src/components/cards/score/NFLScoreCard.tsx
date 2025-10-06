// Third-party library imports
import { Card, Text, VStack } from "@chakra-ui/react";

// Internal imports - config
import { GameStatus } from "../../../config";

interface Team {
  name: string;
  score: number;
  logo?: string;
}

interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: GameStatus;
  time: string;
  date: string;
  quarter?: string;
  stadium?: string;
  city?: string;
  state?: string;
  division?: string;
  isPostseason?: boolean;
  odds?: any;
}

interface NFLScoreCardProps {
  game: Game;
  onGameClick: (gameId: string, gameDate: string) => void;
  oddsLoading?: boolean;
  oddsByDate?: any;
}

export function NFLScoreCard({
  game,
  onGameClick,
  oddsLoading: _oddsLoading,
  oddsByDate: _oddsByDate,
}: NFLScoreCardProps) {
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
      onClick={() => onGameClick(game.id, game.date)}
    >
      <Card.Body p="4">
        <VStack align="stretch" gap="4">
          <Text fontSize="sm" color="text.400">
            NFL Score Card - {game.awayTeam.name} vs {game.homeTeam.name}
          </Text>
          <Text fontSize="xs" color="text.500">
            NFL-specific score card coming soon
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
