// Third-party library imports
import { Badge } from "@chakra-ui/react";

interface QuarterBadgeProps {
  quarter: string;
  time?: string;
  size?: "sm" | "md";
  showChevron?: boolean;
}

export function QuarterBadge({
  quarter,
  time,
  size = "sm",
}: QuarterBadgeProps) {
  const fontSize = size === "sm" ? "xs" : "sm";
  const label = quarter === "F" ? "Final" : quarter;
  const displayText = time ? `${quarter} ${time}` : label;

  return (
    <Badge
      variant="outline"
      color="text.400"
      fontSize={fontSize}
      px="2"
      py="1"
      borderRadius="full"
      borderColor="text.400"
    >
      {displayText}
    </Badge>
  );
}
