// Third-party library imports
import { Badge } from "@chakra-ui/react";

interface StadiumBadgeProps {
  stadium: string;
  size?: "xs" | "sm" | "md";
}

export function StadiumBadge({ stadium, size = "sm" }: StadiumBadgeProps) {
  const fontSize = size === "xs" ? "2xs" : size === "sm" ? "xs" : "sm";

  return (
    <Badge
      variant="outline"
      color="text.400"
      fontSize={fontSize}
      px="2"
      py="1"
      borderRadius="sm"
      borderColor="text.400"
    >
      {stadium}
    </Badge>
  );
}
