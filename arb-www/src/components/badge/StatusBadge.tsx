// Third-party library imports
import { Badge } from "@chakra-ui/react";

// Internal imports - config
import { GameStatus } from "../../config";

interface StatusBadgeProps {
  status: GameStatus;
  quarter?: string;
  size?: "sm" | "md";
}

export function StatusBadge({
  status,
  quarter,
  size = "sm",
}: StatusBadgeProps) {
  const fontSize = size === "sm" ? "2xs" : "xs";

  const getStatusText = () => {
    switch (status) {
      case GameStatus.LIVE:
        return quarter ? quarter : "Live";
      case GameStatus.FINAL:
        return "Final";
      case GameStatus.UPCOMING:
        return quarter ? quarter : "Upcoming";
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
        return { bg: "danger.100", color: "text.100" }; // Red for live
      case GameStatus.FINAL:
        return { bg: "text.200", color: "text.600" }; // Grey for final
      case GameStatus.UPCOMING:
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
      fontSize={fontSize}
      px="2"
      py="1"
      borderRadius="full"
    >
      {statusText}
    </Badge>
  );
}
