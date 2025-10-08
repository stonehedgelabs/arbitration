import { Box, Button, HStack, Text, Image } from "@chakra-ui/react";
import { Switch as ChakraSwitch } from "@chakra-ui/react";

// Base toggle item interface
interface ToggleItem {
  id: string;
  label: string;
  value: any;
  image?: string; // For team toggles with logos
  abbreviation?: string; // For league toggles
  disabled?: boolean; // For disabled items
}

// Toggle variant types
type ToggleVariant = "switch" | "buttons" | "team-buttons" | "league-buttons";

interface BaseToggleProps {
  items: ToggleItem[];
  selectedValue: any;
  onSelectionChange: (value: any) => void;
  variant?: ToggleVariant;
  size?: "xs" | "sm" | "md" | "lg";
  disabled?: boolean;
}

// Switch-specific props (for Top/Latest toggles)
interface SwitchToggleProps extends BaseToggleProps {
  variant: "switch";
  leftLabel: string;
  rightLabel: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

// Button-specific props (for Stats/Social toggles)
interface ButtonToggleProps extends BaseToggleProps {
  variant: "buttons";
  containerBg?: string;
  selectedBg?: string;
  selectedColor?: string;
  unselectedBg?: string;
  unselectedColor?: string;
}

// Team button-specific props (for Away/Home team toggles)
interface TeamButtonToggleProps extends BaseToggleProps {
  variant: "team-buttons";
  teamImages: { [key: string]: string }; // Map of team names to image URLs
}

// League button-specific props (for League selector)
interface LeagueButtonToggleProps extends BaseToggleProps {
  variant: "league-buttons";
  containerBg?: string;
  selectedBg?: string;
  selectedColor?: string;
  unselectedBg?: string;
  unselectedColor?: string;
  unselectedBorder?: string;
  connected?: boolean; // For connected toggle look
}

type ToggleProps =
  | SwitchToggleProps
  | ButtonToggleProps
  | TeamButtonToggleProps
  | LeagueButtonToggleProps;

export function Toggle(props: ToggleProps) {
  const { variant = "buttons", size = "sm", disabled = false } = props;

  // Switch variant (Top/Latest)
  if (variant === "switch") {
    const { leftLabel, rightLabel, checked, onCheckedChange } =
      props as SwitchToggleProps;

    return (
      <HStack gap="2" align="center">
        <Text fontSize={size} color="text.400">
          {leftLabel}
        </Text>
        <ChakraSwitch.Root
          size={size}
          checked={checked}
          onCheckedChange={(e) => onCheckedChange(e.checked)}
          disabled={disabled}
        >
          <ChakraSwitch.HiddenInput />
          <ChakraSwitch.Control
            bg={checked ? "accent.400" : "black"}
            _checked={{
              bg: "accent.400",
            }}
          />
        </ChakraSwitch.Root>
        <Text fontSize={size} color="text.400">
          {rightLabel}
        </Text>
      </HStack>
    );
  }

  // Button variants
  if (variant === "buttons") {
    const {
      items,
      selectedValue,
      onSelectionChange,
      containerBg = "text.100",
      selectedBg = "white",
      selectedColor = "text.600",
      unselectedBg = "transparent",
      unselectedColor = "text.400",
    } = props as ButtonToggleProps;

    return (
      <Box bg={containerBg} borderRadius="lg" p="1" display="flex" gap="0">
        {items.map((item, index) => {
          const isSelected = selectedValue === item.value;
          const isFirst = index === 0;
          const isLast = index === items.length - 1;

          return (
            <Button
              key={item.id}
              size={size}
              variant="ghost"
              onClick={() => onSelectionChange(item.value)}
              //     bg={isSelected ? selectedBg : unselectedBg}
              fontWeight={isSelected ? "boldest" : "normal"}
              color={isSelected ? "text.500" : "text.400"}
              borderRadius="md"
              borderTopLeftRadius={isFirst ? "md" : "none"}
              borderBottomLeftRadius={isFirst ? "md" : "none"}
              borderTopRightRadius={isLast ? "md" : "none"}
              borderBottomRightRadius={isLast ? "md" : "none"}
              px="2"
              fontSize={size}
              height={size === "xs" ? "6" : size === "sm" ? "8" : "10"}
              bg={
                isSelected
                  ? "linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.08) 100%)"
                  : "linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 40%, rgba(0,0,0,0.08) 100%)"
              }
              boxShadow={
                isSelected
                  ? "inset 0 2px 4px rgba(0,0,0,0.25), inset 0 -1px 0 rgba(255,255,255,0.2)"
                  : "0 1px 2px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25)"
              }
              transition="all 0.2s ease"
              disabled={disabled}
              borderWidth="1px"
              borderColor="text.200"
            >
              {item.label}
            </Button>
          );
        })}
      </Box>
    );
  }

  // Team button variant (Away/Home with team images)
  if (variant === "team-buttons") {
    const { items, selectedValue, onSelectionChange, teamImages } =
      props as TeamButtonToggleProps;

    return (
      <HStack gap="0" justify="center">
        {items.map((item, index) => {
          const isSelected = selectedValue === item.value;
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const teamImage = teamImages[item.label] || item.image;

          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onSelectionChange(item.value)}
              h="14"
              borderRadius="xl"
              borderTopRightRadius={isFirst ? "xl" : "none"}
              borderBottomRightRadius={isFirst ? "xl" : "none"}
              borderTopLeftRadius={isLast ? "xl" : "none"}
              borderBottomLeftRadius={isLast ? "xl" : "none"}
              bg={
                isSelected
                  ? "linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.08) 100%)"
                  : "linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 40%, rgba(0,0,0,0.08) 100%)"
              }
              boxShadow={
                isSelected
                  ? "inset 0 2px 4px rgba(0,0,0,0.25), inset 0 -1px 0 rgba(255,255,255,0.2)"
                  : "0 1px 2px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25)"
              }
              transition="all 0.2s ease"
              disabled={disabled}
            >
              <HStack gap="2">
                {teamImage && (
                  <Image
                    src={teamImage}
                    alt={item.label}
                    w="8"
                    h="8"
                    objectFit="contain"
                  />
                )}
                <Text>{item.label}</Text>
              </HStack>
            </Button>
          );
        })}
      </HStack>
    );
  }

  // League button variant (League selector)
  if (variant === "league-buttons") {
    const {
      items,
      selectedValue,
      onSelectionChange,
      containerBg = "primary.25",
      selectedBg = "buttons.primary.bg",
      selectedColor = "buttons.primary.color",
      unselectedBg = "transparent",
      unselectedColor = "text.400",
      unselectedBorder = "text.400",
      connected = false,
    } = props as LeagueButtonToggleProps;

    if (connected) {
      // Connected toggle look (like team toggle)
      return (
        <Box bg={containerBg} p="4">
          <HStack gap="0" justify="center">
            {items.map((item, index) => {
              const isSelected = selectedValue === item.value;
              const isFirst = index === 0;
              const isLast = index === items.length - 1;
              const isDisabled = item.disabled || disabled;

              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  onClick={() => !isDisabled && onSelectionChange(item.value)}
                  flex="1"
                  h="7"
                  borderRadius="md"
                  fontWeight={isSelected ? "boldest" : "normal"}
                  color={
                    isDisabled
                      ? "text.300"
                      : isSelected
                        ? "text.500"
                        : "text.400"
                  }
                  borderTopLeftRadius={isFirst ? "md" : "none"}
                  borderBottomLeftRadius={isFirst ? "md" : "none"}
                  borderTopRightRadius={isLast ? "md" : "none"}
                  borderBottomRightRadius={isLast ? "md" : "none"}
                  fontSize="xs"
                  whiteSpace="nowrap"
                  bg={
                    isDisabled
                      ? "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.05) 100%)"
                      : isSelected
                        ? "linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0.08) 100%)"
                        : "linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 40%, rgba(0,0,0,0.08) 100%)"
                  }
                  boxShadow={
                    isDisabled
                      ? "0 1px 2px rgba(0,0,0,0.1)"
                      : isSelected
                        ? "inset 0 2px 4px rgba(0,0,0,0.25), inset 0 -1px 0 rgba(255,255,255,0.2)"
                        : "0 1px 2px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.25)"
                  }
                  transition="all 0.2s ease"
                  disabled={isDisabled}
                  borderWidth={"1px"}
                  borderColor="text.200"
                  cursor={isDisabled ? "not-allowed" : "pointer"}
                >
                  {item.abbreviation || item.label}
                </Button>
              );
            })}
          </HStack>
        </Box>
      );
    } else {
      // Original separate buttons look
      return (
        <Box bg={containerBg} p="4">
          <HStack gap="2" justify="space-between">
            {items.map((item) => {
              const isSelected = selectedValue === item.value;
              const isDisabled = item.disabled || disabled;

              return (
                <Button
                  key={item.id}
                  variant="outline"
                  onClick={() => !isDisabled && onSelectionChange(item.value)}
                  flex="1"
                  h="10"
                  borderRadius="xl"
                  fontSize="sm"
                  fontWeight="medium"
                  whiteSpace="nowrap"
                  bg={
                    isDisabled
                      ? "text.100"
                      : isSelected
                        ? selectedBg
                        : unselectedBg
                  }
                  borderColor={
                    isDisabled
                      ? "text.200"
                      : isSelected
                        ? selectedBg
                        : unselectedBorder
                  }
                  color={
                    isDisabled
                      ? "text.300"
                      : isSelected
                        ? selectedColor
                        : unselectedColor
                  }
                  borderWidth="1px"
                  _active={
                    isDisabled
                      ? {}
                      : {
                          transform: "scale(0.98)",
                        }
                  }
                  transition="all 0.2s"
                  disabled={isDisabled}
                  cursor={isDisabled ? "not-allowed" : "pointer"}
                >
                  {item.abbreviation || item.label}
                </Button>
              );
            })}
          </HStack>
        </Box>
      );
    }
  }

  return null;
}
