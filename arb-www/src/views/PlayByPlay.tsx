// Third-party library imports
import { Box } from "@chakra-ui/react";

// Internal imports - components
import {
  PlayByPlayMLB,
  PlayByPlayNBA,
  PlayByPlayNFL,
  PlayByPlayNHL,
  PlayByPlayGeneric,
} from "../components/play-by-play";

// Internal imports - config
import { League } from "../config";

interface PlayByPlayProps {
  gameId: string;
  league: League;
  onBack: () => void;
}

// League-specific PBP component selector
const PlayByPlayComponent = ({ gameId, league, onBack }: PlayByPlayProps) => {
  switch (league) {
    case League.MLB:
      return <PlayByPlayMLB gameId={gameId} onBack={onBack} />;
    case League.NBA:
      return <PlayByPlayNBA gameId={gameId} onBack={onBack} />;
    case League.NFL:
      return <PlayByPlayNFL gameId={gameId} onBack={onBack} />;
    case League.NHL:
      return <PlayByPlayNHL gameId={gameId} onBack={onBack} />;
    default:
      return (
        <PlayByPlayGeneric gameId={gameId} league={league} onBack={onBack} />
      );
  }
};

export function PlayByPlay({ gameId, league, onBack }: PlayByPlayProps) {
  return (
    <Box minH="100vh" bg="primary.25">
      <PlayByPlayComponent gameId={gameId} league={league} onBack={onBack} />
    </Box>
  );
}
