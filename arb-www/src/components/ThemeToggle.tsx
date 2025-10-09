import React from "react";
import { Button, HStack, Text } from "@chakra-ui/react";
import { useTheme } from "../contexts/ThemeContext";

interface ThemeToggleProps {
  showLabels?: boolean;
  size?: "sm" | "md" | "lg";
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showLabels = true,
  size = "md",
}) => {
  const { themeMode, setThemeMode } = useTheme();

  const buttonSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "md";
  const iconSize = size === "sm" ? "16px" : size === "lg" ? "24px" : "20px";

  return (
    <HStack gap={1}>
      <Button
        size={buttonSize}
        variant={themeMode === "light" ? "solid" : "ghost"}
        colorScheme={themeMode === "light" ? "accent" : "gray"}
        onClick={() => setThemeMode("light")}
        minW="auto"
        px={2}
      >
        <HStack gap={1}>
          <Text fontSize={iconSize}>☀️</Text>
          {showLabels && <Text fontSize="sm">Light</Text>}
        </HStack>
      </Button>

      <Button
        size={buttonSize}
        variant={themeMode === "dark" ? "solid" : "ghost"}
        colorScheme={themeMode === "dark" ? "accent" : "gray"}
        onClick={() => setThemeMode("dark")}
        minW="auto"
        px={2}
      >
        <HStack gap={1}>
          <Text fontSize={iconSize}>🌙</Text>
          {showLabels && <Text fontSize="sm">Dark</Text>}
        </HStack>
      </Button>

      <Button
        size={buttonSize}
        variant={themeMode === "system" ? "solid" : "ghost"}
        colorScheme={themeMode === "system" ? "accent" : "gray"}
        onClick={() => setThemeMode("system")}
        minW="auto"
        px={2}
      >
        <HStack gap={1}>
          <Text fontSize={iconSize}>💻</Text>
          {showLabels && <Text fontSize="sm">System</Text>}
        </HStack>
      </Button>
    </HStack>
  );
};

// Simple toggle button for compact spaces
export const ThemeToggleSimple: React.FC<{ size?: "sm" | "md" | "lg" }> = ({
  size = "md",
}) => {
  const { themeMode, toggleTheme } = useTheme();

  const getCurrentIcon = () => {
    switch (themeMode) {
      case "light":
        return "☀️";
      case "dark":
        return "🌙";
      case "system":
        return "💻";
      default:
        return "💻";
    }
  };

  const buttonSize = size === "sm" ? "sm" : size === "lg" ? "lg" : "md";
  const iconSize = size === "sm" ? "16px" : size === "lg" ? "24px" : "20px";

  return (
    <Button
      size={buttonSize}
      variant="ghost"
      onClick={toggleTheme}
      minW="auto"
      px={2}
      title={`Current: ${themeMode === "system" ? "System" : themeMode === "light" ? "Light" : "Dark"}`}
    >
      <Text fontSize={iconSize}>{getCurrentIcon()}</Text>
    </Button>
  );
};

export default ThemeToggle;
