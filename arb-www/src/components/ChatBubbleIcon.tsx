import { Box } from "@chakra-ui/react";

interface ChatBubbleIconProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ChatBubbleIcon({
  size = "md",
  className,
}: ChatBubbleIconProps) {
  const sizeMap = {
    sm: "16px",
    md: "24px",
    lg: "32px",
  };

  return (
    <Box className={className}>
      <svg
        width={sizeMap[size]}
        height={sizeMap[size]}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    </Box>
  );
}
