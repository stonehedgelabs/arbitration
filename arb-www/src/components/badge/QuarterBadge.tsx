// Third-party library imports
import { Badge, Box } from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";

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
  showChevron = true,
}: QuarterBadgeProps) {
  const fontSize = size === "sm" ? "xs" : "sm";
  const displayText = time ? `${quarter} ${time}` : quarter;

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
      {showChevron && (
        <Box ml="1" w="3" h="3">
          <ChevronRight size={12} />
        </Box>
      )}
    </Badge>
  );
}
