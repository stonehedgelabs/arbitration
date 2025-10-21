// Third-party library imports
import { Badge } from "@chakra-ui/react";

// Internal imports - config
import { GameStatus } from "../../config";
import { Check, Calendar, Wifi } from "lucide-react";
import { getStatusDisplayText } from "../../utils.ts";

interface StatusBadgeProps {
  status: GameStatus;
  size: "2xs" | "xs" | "sm" | "md";
}

export function StatusBadge({ status, size }: StatusBadgeProps) {
  const statusText = getStatusDisplayText(status);

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
        return { bg: "blue.500", color: "text.100" }; // Blue for upcoming
      default:
        return { bg: "text.200", color: "text.600" }; // Default grey
    }
  };

  const colors = getBadgeColors();
  let icon;

  if (status === GameStatus.LIVE) {
    icon = <Wifi size={12} />;
  } else if (status === GameStatus.FINAL) {
    icon = <Check size={12} />;
  } else if (
    status === GameStatus.UPCOMING ||
    status === GameStatus.SCHEDULED
  ) {
    icon = <Calendar size={12} />;
  } else {
    icon = null;
  }

  return (
    <Badge
      variant="solid"
      bg={colors.bg}
      color={colors.color}
      fontSize={size}
      px="2"
      py="1"
      borderRadius="sm"
      display="inline-flex"
      alignItems="center"
      gap="1"
    >
      {statusText}
      {icon}
    </Badge>
  );
}
