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

interface NBAScoreCardV2Props {
  game: Game;
  onGameClick: (gameId: string, gameDate: string) => void;
  oddsLoading?: boolean;
  oddsByDate?: any;
}

export function NBAScoreCardV2({
  game,
  onGameClick,
  oddsLoading: _oddsLoading,
  oddsByDate: _oddsByDate,
}: NBAScoreCardV2Props) {
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
        <VStack align="stretch" gap="3">
          <Text fontSize="sm" color="text.400" textAlign="center">
            {game.awayTeam.name} vs {game.homeTeam.name}
          </Text>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="text.400"
            textAlign="center"
          >
            {game.awayTeam.score} - {game.homeTeam.score}
          </Text>
          <Text fontSize="xs" color="text.500" textAlign="center">
            {game.status} {game.quarter && `- ${game.quarter}`}
          </Text>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
