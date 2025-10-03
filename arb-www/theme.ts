import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    breakpoints: {
      xxs: "16em",
      xs: "20em",
      xl: "80em",
      "2xl": "96em",
      "3xl": "120em",
      "4xl": "160em",
      "5xl": "192em",
      "6xl": "224em",
      "7xl": "256em",
      "8xl": "288em",
      "9xl": "320em",
      "10xl": "352em",
      "11xl": "384em",
      "12xl": "416em",
    },
    tokens: {
      fonts: {
        heading: { value: "Arial" },
        body: { value: "'Inter', sans-serif" },
      },
      sizes: {
        80: { value: "20rem" },
        84: { value: "21rem" },
        88: { value: "22rem" },
        92: { value: "23rem" },
        96: { value: "24rem" },
        100: { value: "25rem" },
        104: { value: "26rem" },
        108: { value: "27rem" },
        112: { value: "28rem" },
        116: { value: "29rem" },
        120: { value: "30rem" },
        124: { value: "31rem" },
        128: { value: "32rem" },
        132: { value: "33rem" },
        136: { value: "34rem" },
        140: { value: "35rem" },
        144: { value: "36rem" },
        148: { value: "37rem" },
        152: { value: "38rem" },
        156: { value: "39rem" },
        160: { value: "40rem" },
        164: { value: "41rem" },
        168: { value: "42rem" },
        172: { value: "43rem" },
        176: { value: "44rem" },
        180: { value: "45rem" },
        184: { value: "46rem" },
        188: { value: "47rem" },
        192: { value: "48rem" },
        196: { value: "49rem" },
        200: { value: "50rem" },
        204: { value: "51rem" },
        208: { value: "52rem" },
        212: { value: "53rem" },
        216: { value: "54rem" },
        220: { value: "55rem" },
        224: { value: "56rem" },
        228: { value: "57rem" },
        232: { value: "58rem" },
        236: { value: "59rem" },
        240: { value: "60rem" },
        244: { value: "61rem" },
      },
      colors: {
        // Primary (dark tech blues — backgrounds/surfaces)
        primary: {
          25: { value: "#849DB8" }, // air-superiority-blue (lightest surface)
          50: { value: "#4F8BBB" }, // silver-lake-blue
          100: { value: "#3D6899" }, // lapis-lazuli
          200: { value: "#012555" }, // oxford-blue-3 (default section bg)
          300: { value: "#01153D" }, // oxford-blue
          350: { value: "#010728" },
          400: { value: "#010A35" }, // oxford-blue-2 (deep)
          500: { value: "#000323" }, // oxford-blue-4 (near-black)
        },

        // Accent (interactive: buttons/links/ctas)
        accent: {
          50: { value: "#4F8BBB" }, // silver-lake-blue (subtle hover)
          100: { value: "#107CB5" }, // honolulu-blue (primary action)
          200: { value: "#0D4880" }, // indigo-dye (hover)
          300: { value: "#3D6899" }, // lapis-lazuli (active)
          400: { value: "#012555" }, // oxford-blue-3 (pressed/outline)
        },

        // Text (optimized for dark backgrounds)
        text: {
          50: { value: "#F1F6F8" }, // light body/subtitles
          100: { value: "#849DB8" }, // secondary text (cool gray-blue)
          150: { value: "#4F8BBB" }, // muted info
          200: { value: "#0D4880" }, // captions/timestamps
          300: { value: "#F1F6F8" }, // default body
          400: { value: "#FFFFFF" }, // high-contrast headings
        },

        // Borders/lines
        border: {
          50: { value: "#0D3458" }, // prussian-blue (soft line)
          100: { value: "#012555" }, // stronger UI borders
          150: { value: "#849DB8" }, // accent/selected outlines
        },

        // Utility palettes
        highlight: {
          50: { value: "#FFB020" },
          100: { value: "#FF8C00" },
          200: { value: "#E65100" },
        },
        success: {
          50: { value: "#34D399" },
          100: { value: "#22C55E" },
        },
        danger: {
          50: { value: "#F87171" },
          100: { value: "#EF4444" },
        },
        divider: { value: "#0D3458" },
      },
    },
  },
});

const system = createSystem(defaultConfig, config);

export default system;