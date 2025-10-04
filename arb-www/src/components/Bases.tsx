// React imports

// Third-party library imports
import { Box } from "@chakra-ui/react";

interface BasesProps {
  runnerOnFirst?: boolean;
  runnerOnSecond?: boolean;
  runnerOnThird?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Bases({
  runnerOnFirst = false,
  runnerOnSecond = false,
  runnerOnThird = false,
  size = "md",
}: BasesProps) {
  // Size configurations
  const sizeConfig = {
    sm: { container: "8", base: "1.5" },
    md: { container: "12", base: "2.5" },
    lg: { container: "16", base: "3" },
  };

  const config = sizeConfig[size];

  return (
    <Box position="relative" w={config.container} h={config.container}>
      {/* Second Base (top center) */}
      <Box
        position="absolute"
        top="1"
        left="50%"
        transform="translateX(-50%)"
        w={config.base}
        h={config.base}
        bg={runnerOnSecond ? "green.500" : "gray.400"}
        borderRadius="full"
        border="1px"
        borderColor={runnerOnSecond ? "green.700" : "gray.500"}
      />

      {/* First Base (bottom right) */}
      <Box
        position="absolute"
        bottom="1"
        right="1"
        w={config.base}
        h={config.base}
        bg={runnerOnFirst ? "green.500" : "gray.400"}
        borderRadius="full"
        border="1px"
        borderColor={runnerOnFirst ? "green.700" : "gray.500"}
      />

      {/* Third Base (bottom left) */}
      <Box
        position="absolute"
        bottom="1"
        left="1"
        w={config.base}
        h={config.base}
        bg={runnerOnThird ? "green.500" : "gray.400"}
        borderRadius="full"
        border="1px"
        borderColor={runnerOnThird ? "green.700" : "gray.500"}
      />

      {/* Home Plate (center) */}
      {/* <Box
        position="absolute"
        top="1/2"
        left="1/2"
        transform="translate(-50%, -50%) rotate(45deg)"
        w={config.base}
        h={config.base}
        bg="gray.300"
        borderRadius="2px"
      /> */}
    </Box>
  );
}
