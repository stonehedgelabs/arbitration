// Third-party library imports
import { Badge } from "@chakra-ui/react";

interface PostseasonBadgeProps {
  size?: "sm" | "md";
}

export function PostseasonBadge({ size = "sm" }: PostseasonBadgeProps) {
  const fontSize = size === "sm" ? "2xs" : "xs";

  return (
    <Badge
      variant="solid"
      bg="gold"
      color="black"
      fontSize={fontSize}
      px="2"
      py="1"
      borderRadius="sm"
    >
      Playoffs
    </Badge>
  );
}
