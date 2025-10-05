// Third-party library imports
import { Badge } from "@chakra-ui/react";

interface DivisionBadgeProps {
  division: string;
  size?: "xs" | "sm" | "md";
}

export function DivisionBadge({ division, size = "sm" }: DivisionBadgeProps) {
  const fontSize = size === "xs" ? "2xs" : size === "sm" ? "xs" : "sm";

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
      {division} Division
    </Badge>
  );
}
