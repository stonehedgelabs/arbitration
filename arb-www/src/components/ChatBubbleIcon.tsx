import { Box, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

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

  const fontSizeMap = {
    sm: "8px",
    md: "12px",
    lg: "16px",
  };

  const [currentDisplay, setCurrentDisplay] = useState<"chat" | "sport">(
    "chat",
  );
  const [currentSport, setCurrentSport] = useState(0);

  const sports = ["🏈", "🏀", "⚽", "🏒", "⛳"]; // football, basketball, soccer, hockey, golf

  useEffect(() => {
    const interval = setInterval(
      () => {
        if (currentDisplay === "chat") {
          // After 3 seconds of chat bubble, switch to sports
          setCurrentDisplay("sport");
          setCurrentSport(0);
        } else {
          // After 1 second of each sport, move to next sport or back to chat
          if (currentSport < sports.length - 1) {
            setCurrentSport(currentSport + 1);
          } else {
            // After all sports, go back to chat bubble
            setCurrentDisplay("chat");
          }
        }
      },
      currentDisplay === "chat" ? 3000 : 500,
    ); // 3 seconds for chat, 0.5 seconds for each sport

    return () => clearInterval(interval);
  }, [currentDisplay, currentSport, sports.length]);

  return (
    <Box className={className} position="relative">
      {currentDisplay === "chat" ? (
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
      ) : (
        <Text
          fontSize={sizeMap[size]}
          lineHeight="1"
          display="flex"
          alignItems="center"
          justifyContent="center"
          width={sizeMap[size]}
          height={sizeMap[size]}
        >
          {sports[currentSport]}
        </Text>
      )}
    </Box>
  );
}
