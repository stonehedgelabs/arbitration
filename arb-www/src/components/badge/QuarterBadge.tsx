// Third-party library imports
import { Badge } from "@chakra-ui/react";

interface QuarterBadgeProps {
  quarter?: string;
  timeRemaining?: string;
  timeRemainingMinutes?: number | null;
  timeRemainingSeconds?: number | null;
  size: "2xs" | "xs" | "sm" | "md";
  showChevron?: boolean;
}

export function QuarterBadge({
  quarter,
  timeRemaining,
  timeRemainingMinutes,
  timeRemainingSeconds,
  size,
}: QuarterBadgeProps) {
  // Format the display text based on whether we have time and quarter
  const getDisplayText = () => {
    if (quarter === "F") {
      return "Final";
    }

    if (
      !timeRemainingMinutes &&
      !timeRemainingSeconds &&
      timeRemaining &&
      quarter
    ) {
      const quarterSuffix = getQuarterSuffix(quarter);
      return `${timeRemaining} - ${quarter}${quarterSuffix}`;
    }

    // Use raw time data if available, otherwise fall back to formatted time
    const timeString =
      timeRemainingMinutes !== undefined &&
      timeRemainingMinutes !== null &&
      timeRemainingSeconds !== undefined &&
      timeRemainingSeconds !== null
        ? `${timeRemainingMinutes}:${timeRemainingSeconds.toString().padStart(2, "0")}`
        : timeRemaining;

    if (timeString && quarter) {
      // NBA format: "0:17 - 1st"
      const quarterSuffix = getQuarterSuffix(quarter);
      return `${timeString} - ${quarter}${quarterSuffix}`;
    }

    if (timeString) {
      return timeString;
    }

    return quarter;
  };

  // Helper function to add suffix to quarter number
  const getQuarterSuffix = (q: string) => {
    const num = parseInt(q);
    if (isNaN(num)) return "";

    if (num === 1) return "st";
    if (num === 2) return "nd";
    if (num === 3) return "rd";
    if (num >= 4) return "th";
    return "";
  };

  return (
    <Badge
      color="text.100"
      bg="red.500"
      fontSize={size}
      px="2"
      py="1"
      borderRadius="sm"
    >
      {getDisplayText()}
    </Badge>
  );
}
