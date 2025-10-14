// Third-party library imports
import { Badge } from "@chakra-ui/react";

// Internal imports - config
import { GameStatus } from "../../config";
import { Wifi } from "lucide-react";

interface StatusBadgeProps {
  status: GameStatus;
  size: "2xs" | "xs" | "sm" | "md";
}

export function StatusBadge({ status, size }: StatusBadgeProps) {
  const getStatusText = () => {
    switch (status) {
      case GameStatus.LIVE:
      case GameStatus.IN_PROGRESS:
        return "Live";
      case GameStatus.FINAL:
        return "Final";
      case GameStatus.UPCOMING:
      case GameStatus.SCHEDULED:
        return "Upcoming";
      default:
        return "";
    }
  };

  const statusText = getStatusText();

  if (!statusText) return null;

  // Get badge colors based on status
  const getBadgeColors = () => {
    switch (status) {
      case GameStatus.LIVE:
        return { bg: "red.500", color: "text.100" }; // Red for live
      case GameStatus.FINAL:
        return { bg: "green.500", color: "white" }; // Green background, white text for final
      case GameStatus.UPCOMING:
      case GameStatus.SCHEDULED:
        return { bg: "text.350", color: "text.600" }; // Grey for upcoming
      default:
        return { bg: "text.200", color: "text.600" }; // Default grey
    }
  };

  const colors = getBadgeColors();

  return (
    <Badge
      variant="solid"
      bg={colors.bg}
      color={colors.color}
      fontSize={size}
      px="2"
      py="1"
      borderRadius="sm"
    >
      {statusText}
      {status === GameStatus.LIVE && <Wifi size={12} />}
    </Badge>
  );
}
