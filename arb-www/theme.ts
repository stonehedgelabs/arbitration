import { createSystem, defaultConfig } from "@chakra-ui/react";

// Create a minimal system configuration for Chakra UI v3
const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors: {
        primary: {
          value: "#030213",
        },
        muted: {
          value: "#717182",
        }
      }
    }
  }
});

export default system;