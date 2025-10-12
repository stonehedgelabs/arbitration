import { Badge } from "@chakra-ui/react";

import { League } from "../../config";

interface InningBadgeProps {
  inningNumber: number;
  inningHalf?: string; // "Top" or "Bottom" for baseball
  league: League;
  size?: "sm" | "md" | "lg";
  showChevron?: boolean;
}

export function InningBadge({
  inningNumber,
  inningHalf,
  league,
  size = "sm",
}: InningBadgeProps) {
  // Format the inning display text
  const getInningText = () => {
    if (league === League.MLB) {
      if (inningHalf) {
        return `${inningHalf === "Top" || inningHalf === "T" ? "▲ " : "▼ "}${inningNumber}`;
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
      fontSize={size}
      px="2"
      py="1"
      borderRadius="full"
    >
      {displayText}
    </Badge>
  );
}
