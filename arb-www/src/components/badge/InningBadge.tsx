// Third-party library imports
import { Badge } from "@chakra-ui/react";

// Internal imports - config
import { League } from "../../config";

interface InningBadgeProps {
  inningNumber: number;
  inningHalf?: string; // "Top" or "Bottom" for baseball
  league: League;
  size?: "sm" | "md";
  showChevron?: boolean;
}

export function InningBadge({
  inningNumber,
  inningHalf,
  league,
  size = "sm",
  showChevron = true,
}: InningBadgeProps) {
  const fontSize = size === "sm" ? "xs" : "sm";

  // Format the inning display text
  const getInningText = () => {
    if (league === League.MLB) {
      if (inningHalf) {
        return `${inningHalf === "Top" ? "▲ " : "▼ "}${inningNumber}`;
      }
      return `${inningNumber}`;
    }
    // For other leagues, just show the quarter/period number
    return `${inningNumber}`;
  };

  const displayText = getInningText();

  return (
    <Badge
      variant="subtle"
      bg="transparent"
      color="label.100"
      fontSize={fontSize}
      px="2"
      py="1"
      borderRadius="full"
    >
      {displayText}
    </Badge>
  );
}
