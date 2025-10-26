import { useEffect, useMemo, useState } from "react";
import { Badge } from "@chakra-ui/react";
import { Clock } from "lucide-react";

import { toLocalDateTime } from "../../utils";

interface CountdownBadgeProps {
  targetTime?: string | Date;
  size?: "2xs" | "xs" | "sm" | "md";
  showIcon?: boolean;
}

export function CountdownBadge({
  targetTime,
  size = "2xs",
  showIcon = true,
}: CountdownBadgeProps) {
  const [remainingMs, setRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    const localTarget = toLocalDateTime(targetTime);

    if (!localTarget) {
      setRemainingMs(null);
      return () => undefined;
    }

    const targetEpoch = localTarget.getTime();

    const updateRemaining = () => {
      const diff = targetEpoch - Date.now();
      if (diff <= 0) {
        setRemainingMs(0);
        return false;
      }
      setRemainingMs(diff);
      return true;
    };

    updateRemaining();

    const intervalId = window.setInterval(() => {
      if (!updateRemaining()) {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [targetTime]);

  const formatted = useMemo(() => {
    if (remainingMs === null) {
      return null;
    }

    const totalSeconds = Math.max(Math.floor(remainingMs / 1000), 0);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  }, [remainingMs]);

  if (!formatted) {
    return null;
  }

  if (formatted === "00:00:00") {
    return null;
  }

  return (
    <Badge
      variant="solid"
      bg="purple.500"
      color="text.100"
      fontSize={size}
      px="2"
      py="1"
      borderRadius="sm"
      display="inline-flex"
      alignItems="center"
      gap="1"
    >
      {showIcon && <Clock size={12} />}
      {formatted}
    </Badge>
  );
}
