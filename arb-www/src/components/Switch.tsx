import { Box, HStack, Text } from "@chakra-ui/react";
import { Switch as ChakraSwitch } from "@chakra-ui/react";

interface CustomSwitchProps {
  leftLabel: string;
  rightLabel: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: "xs" | "sm" | "md" | "lg";
}

export function CustomSwitch({
  leftLabel,
  rightLabel,
  checked,
  onCheckedChange,
  size = "xs",
}: CustomSwitchProps) {
  return (
    <HStack gap="2" align="center">
      <Text fontSize={size} color="text.400">
        {leftLabel}
      </Text>
      <ChakraSwitch.Root
        size={size}
        checked={checked}
        onCheckedChange={(e) => onCheckedChange(e.checked)}
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
