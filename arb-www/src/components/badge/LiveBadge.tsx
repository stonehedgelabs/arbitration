// Third-party library imports
import { Badge } from "@chakra-ui/react";
import { Wifi } from "lucide-react";

interface LiveBadgeProps {
  size?: "sm" | "md";
  showIcon?: boolean;
  text?: string;
}

export function LiveBadge({
  size = "sm",
  showIcon = true,
  text = "Live",
}: LiveBadgeProps) {
  const fontSize = size === "sm" ? "2xs" : "xs";

  return (
    <Badge
      variant="solid"
      bg="danger.100"
      color="text.100"
      fontSize={fontSize}
      px="2"
      py="1"
      borderRadius="full"
      display="flex"
      alignItems="center"
      gap="1"
    >
      {text}
      {showIcon && <Wifi size={12} />}
    </Badge>
  );
}
