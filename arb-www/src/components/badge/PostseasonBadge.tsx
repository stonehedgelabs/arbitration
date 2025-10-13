// Third-party library imports
import { Badge } from "@chakra-ui/react";

interface PostseasonBadgeProps {
  size: "2xs" | "xs" | "sm" | "md";
}

export function PostseasonBadge({ size }: PostseasonBadgeProps) {
  return (
    <Badge
      variant="solid"
      bg="gold"
      color="black"
      fontSize={size}
      px="2"
      py="1"
      borderRadius="sm"
    >
      Playoffs
    </Badge>
  );
}
