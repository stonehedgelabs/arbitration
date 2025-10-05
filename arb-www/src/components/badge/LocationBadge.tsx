// Third-party library imports
import { Badge } from "@chakra-ui/react";

interface LocationBadgeProps {
  city: string;
  state?: string;
  country?: string;
  size?: "sm" | "md";
}

export function LocationBadge({
  city,
  state,
  country,
  size = "sm",
}: LocationBadgeProps) {
  const fontSize = size === "sm" ? "xs" : "sm";

  const locationText = [city, state, country].filter(Boolean).join(", ");

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
      {locationText}
    </Badge>
  );
}
