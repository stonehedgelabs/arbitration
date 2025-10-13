import { Badge } from "@chakra-ui/react";
import { Wifi } from "lucide-react";

interface LiveBadgeProps {
  size: "2xs" | "xs" | "sm" | "md";
  showIcon?: boolean;
  text?: string;
}

export function LiveBadge({
  size,
  showIcon = true,
  text = "Live",
}: LiveBadgeProps) {
  return (
    <Badge
      variant="solid"
      bg="red.500"
      color="text.100"
      fontSize={size}
      px="2"
      py="1"
      borderRadius="sm"
      display="flex"
      alignItems="center"
      gap="1"
    >
      {text}
      {showIcon && <Wifi size={12} />}
    </Badge>
  );
}
