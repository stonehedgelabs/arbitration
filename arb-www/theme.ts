import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

/* Palette
Midnight green: #114b5f
Lapis Lazuli: #456990
Nyanza: #e4fde1
Bright pink (Crayola): #f45b69
Wine: #6b2737
*/

// Light theme (neutral backgrounds, subtle depth)
const lightColors = {
  // Background surfaces
  primary: {
    25:  { value: "#FFFFFF" }, // Base background (white)
    50:  { value: "#FAFAFA" }, // Slight warmth (app shell)
    100: { value: "#F5F5F5" }, // Panels/cards
    200: { value: "#EEEEEE" }, // Toolbars
    300: { value: "#E0E0E0" }, // Modals/dropdowns
    400: { value: "#CFCFCF" }, // Dividers
    500: { value: "#BDBDBD" }, // Disabled bg
  },

  // Accent colors for interactivity
  // accent: {
  //   50: { value: "#87A5C5" },
  //   100: { value: "#456990" },
  //   200: { value: "#385574" },
  //   300: { value: "#E4E4E4" },
  //   400: { value: "#0D3D4C" },
  // },
  accent: {
    50: { value: "#2A4057" },
    100: { value: "#456990" },
    200: { value: "#5F87B2" },
    300: { value: "#78CBE7" },
    400: { value: "#34B1DB" },
  },

  // Simplified neutral text hierarchy
  text: {
    100: { value: "#FFFFFF" }, // Almost white (use sparingly)
    200: { value: "#E6E6E6" }, // Slightly muted light gray
    300: { value: "#BDBDBD" }, // Very muted mid-gray
    350: { value: "#8E8E8E" }, // Mid-gray between 300 and 400
    400: { value: "#5C5C5C" }, // Dark gray (main body)
    500: { value: "#1A1A1A" }, // Almost black (max contrast)
  },

  // Borders
  border: {
    default: { value: "#E0E0E0" },
    accent: { value: "#456990" },
  },

  // Semantic colors
  success: {
    50: { value: "#E4FDE1" },
    100: { value: "#42F22E" },
    200: { value: "#1CB40C" },
  },
  warning: {
    50: { value: "#FFF3E0" },
    100: { value: "#FF9800" },
    200: { value: "#F57C00" },
  },
  danger: {
    50: { value: "#FDDFE1" },
    100: { value: "#F45B69" },
    200: { value: "#6B2737" },
  },
  info: {
    50: { value: "#D7E1EC" },
    100: { value: "#456990" },
    200: { value: "#2A4057" },
  },

  // Interactive states
  interactive: {
    hover: { value: "#D7E1EC" },
    active: { value: "#456990" },
    focus: { value: "#456990" },
    disabled: { value: "#BDBDBD" },
    disabledBg: { value: "#F5F5F5" },
  },

  // Utility
  divider: { value: "#E0E0E0" },
  overlay: { value: "rgba(0, 0, 0, 0.5)" },

  // Buttons
  buttons: {
    primary: {
      bg: { value: "#456990" },
      color: { value: "#FFFFFF" },
      hoverBg: { value: "#385574" },
      activeBg: { value: "#114B5F" },
      focusRing: { value: "#114B5F" },
    },
    secondary: {
      bg: { value: "#FFFFFF" },
      color: { value: "#456990" },
      border: { value: "#E0E0E0" },
      hoverBg: { value: "#F5F5F5" },
      activeBg: { value: "#EEEEEE" },
    },
    destructive: {
      bg: { value: "#F45B69" },
      color: { value: "#FFFFFF" },
      hoverBg: { value: "#D94C59" },
      activeBg: { value: "#6B2737" },
      focusRing: { value: "#6B2737" },
    },
    success: {
      bg: { value: "#42F22E" },
      color: { value: "#0D3D4C" },
      hoverBg: { value: "#1CB40C" },
    },
  },
};

// Dark theme (deep neutral surfaces, bright accents)
const darkColors = {
  // Backgrounds
  primary: {
    25:  { value: "#000000" },
    50:  { value: "#0A0A0A" },
    100: { value: "#121212" },
    200: { value: "#1E1E1E" },
    300: { value: "#2A2A2A" },
    400: { value: "#3C3C3C" },
    500: { value: "#505050" },
  },

  // Accents
  accent: {
    50: { value: "#2A4057" },
    100: { value: "#456990" },
    200: { value: "#5F87B2" },
    300: { value: "#78CBE7" },
    400: { value: "#34B1DB" },
  },

  text: {
    100: { value: "#FFFFFF" }, // Brightest (use sparingly, highlights or on darkest backgrounds)
    200: { value: "#FAFAFA" }, // Headings – high contrast but softer than pure white
    300: { value: "#E0E0E0" }, // Body text – comfortable contrast, readable on dark bg
    350: { value: "#CFCFCF" }, // Mid-gray between 300 and 400
    400: { value: "#BDBDBD" }, // Secondary – captions, hints, disabled labels
    500: { value: "#999999" }, // Muted – lowest contrast, placeholders or subtle UI text
  },

  // Borders
  border: {
    default: { value: "#2A2A2A" },
    accent: { value: "#78CBE7" },
  },

  // Semantics
  success: {
    50: { value: "#0D3D4C" },
    100: { value: "#E4FDE1" },
    200: { value: "#93F788" },
  },
  warning: {
    50: { value: "#0D3D4C" },
    100: { value: "#FFB74D" },
    200: { value: "#FFA726" },
  },
  danger: {
    50: { value: "#411821" },
    100: { value: "#F45B69" },
    200: { value: "#F67D87" },
  },
  info: {
    50: { value: "#0D3D4C" },
    100: { value: "#78CBE7" },
    200: { value: "#BBE5F3" },
  },

  // Interactions
  interactive: {
    hover: { value: "#114B5F" },
    active: { value: "#1D81A3" },
    focus: { value: "#78CBE7" },
    disabled: { value: "#6B8695" },
    disabledBg: { value: "#1E1E1E" },
  },

  // Utility
  divider: { value: "#2A2A2A" },
  overlay: { value: "rgba(0, 0, 0, 0.7)" },

  // Buttons
  buttons: {
    primary: {
      bg: { value: "#78CBE7" },
      color: { value: "#0A0A0A" },
      hoverBg: { value: "#5F87B2" },
      activeBg: { value: "#456990" },
      focusRing: { value: "#34B1DB" },
    },
    secondary: {
      bg: { value: "#1E1E1E" },
      color: { value: "#EAEAEA" },
      border: { value: "#2A2A2A" },
      hoverBg: { value: "#2A2A2A" },
      activeBg: { value: "#3C3C3C" },
    },
    destructive: {
      bg: { value: "#F45B69" },
      color: { value: "#FFFFFF" },
      hoverBg: { value: "#F67D87" },
      activeBg: { value: "#6B2737" },
      focusRing: { value: "#F67D87" },
    },
    success: {
      bg: { value: "#93F788" },
      color: { value: "#0D3D4C" },
      hoverBg: { value: "#78CBE7" },
    },
  },
};

// Factory function to create theme config
const createThemeConfig = (colors: typeof lightColors) =>
  defineConfig({
    theme: {
      breakpoints: {
        xs: "20em",
        sm: "30em",
        md: "48em",
        lg: "62em",
        xl: "80em",
      },
      tokens: {
        fonts: {
          heading: { value: "Arial" },
          body: { value: "'Inter', sans-serif" },
        },
        colors,
      },
    },
  });

const lightConfig = createThemeConfig(lightColors);
const darkConfig = createThemeConfig(darkColors);

export const lightSystem = createSystem(defaultConfig, lightConfig);
export const darkSystem = createSystem(defaultConfig, darkConfig);

export const themeSystems = {
  light: lightSystem,
  dark: darkSystem,
};

export const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export default darkSystem;
