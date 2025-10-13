import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Box,
  VStack,
  Text,
  Button,
  HStack,
  IconButton,
} from "@chakra-ui/react";

interface WelcomeOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

// Simple SVG icon components
const TrophyIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
    <path d="M7 4V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2h2.5A1.5 1.5 0 0 1 21 5.5v3A4.5 4.5 0 0 1 16.5 13c-.6 0-1.2-.1-1.7-.3l-.8 3.3h2.5a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5H10l-.8-3.3c-.5.2-1.1.3-1.7.3A4.5 4.5 0 0 1 3 8.5v-3A1.5 1.5 0 0 1 4.5 4H7zM5 6v2.5A2.5 2.5 0 0 0 7.5 11c.3 0 .6 0 .9-.1L9 6H5zm10 0l.6 4.9c.3.1.6.1.9.1A2.5 2.5 0 0 0 19 8.5V6h-4zM9 6h6V4H9v2z" />
  </svg>
);

const ZapIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="m14 7 3-3h4v4" />
  </svg>
);

const onboardingScreens = [
  {
    id: 1,
    icon: TrophyIcon,
    title: "Your Sports Hub",
    subtitle: "All your favorite sports in one place",
    description:
      "Get live scores, breaking news, and highlights from NFL, NBA, MLB, NHL, and MLS. Never miss a moment of the action.",
    colorGradient: "linear-gradient(to bottom right, #3b82f6, #9333ea)",
  },
  {
    id: 2,
    icon: ZapIcon,
    title: "Real-Time Updates",
    subtitle: "Stay ahead of the game",
    description:
      "Live play-by-play coverage, instant score updates, and breaking news delivered the moment it happens. Be the first to know.",
    colorGradient: "linear-gradient(to bottom right, #10b981, #3b82f6)",
  },
  {
    id: 3,
    icon: TrendingUpIcon,
    title: "Personalized For You",
    subtitle: "Content that matters to you",
    description:
      "Follow your favorite teams and leagues to get a customized feed of highlights, social content, and insider coverage.",
    colorGradient: "linear-gradient(to bottom right, #a855f7, #ec4899)",
  },
];

export function Welcome({ onComplete, onSkip }: WelcomeOnboardingProps) {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentScreen < onboardingScreens.length - 1) {
      setDirection(1);
      setCurrentScreen(currentScreen + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentScreen > 0) {
      setDirection(-1);
      setCurrentScreen(currentScreen - 1);
    }
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentScreen ? 1 : -1);
    setCurrentScreen(index);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const currentScreenData = onboardingScreens[currentScreen];
  const IconComponent = currentScreenData.icon;

  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      position="relative"
      overflow="hidden"
      className="ios-safe-top ios-safe-bottom"
    >
      {/* Top Navigation */}
      <Box
        position="absolute"
        top={4}
        left={4}
        right={4}
        zIndex={10}
        className="ios-safe-top"
      >
        <HStack justify="space-between">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentScreen === 0}
            visibility={currentScreen === 0 ? "hidden" : "visible"}
            color="#717182"
            _dark={{ color: "oklch(0.708 0 0)" }}
            className="ios-button-press"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </Button>

          {/* Skip Button */}
          <Button
            variant="ghost"
            onClick={onSkip}
            color="#717182"
            _dark={{ color: "oklch(0.708 0 0)" }}
            className="ios-button-press"
          >
            Skip
          </Button>
        </HStack>
      </Box>

      {/* Main Content */}
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={6}
        position="relative"
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentScreen}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                handleNext();
              } else if (swipe > swipeConfidenceThreshold) {
                handlePrevious();
              }
            }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <VStack gap={8} maxW="sm">
              {/* Icon */}
              <Box
                w="128px"
                h="128px"
                borderRadius="24px"
                bg={currentScreenData.colorGradient}
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="2xl"
              >
                <IconComponent />
              </Box>

              {/* Content */}
              <VStack gap={6} maxW="sm">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Text fontSize="2xl" fontWeight="bold" mb={4}>
                    {currentScreenData.title}
                  </Text>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Text
                    fontSize="xl"
                    color="#717182"
                    _dark={{ color: "oklch(0.708 0 0)" }}
                    mb={6}
                  >
                    {currentScreenData.subtitle}
                  </Text>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Text
                    color="#717182"
                    _dark={{ color: "oklch(0.708 0 0)" }}
                    lineHeight="relaxed"
                  >
                    {currentScreenData.description}
                  </Text>
                </motion.div>
              </VStack>
            </VStack>
          </motion.div>
        </AnimatePresence>
      </Box>

      {/* Next/Let's Go Button */}
      <Box display="flex" justifyContent="center" mb={8}>
        <Button
          onClick={handleNext}
          className="ios-button ios-button-press"
          px={8}
          borderRadius="sm"
          bg={
            currentScreen === onboardingScreens.length - 1
              ? "linear-gradient(to right, #a855f7, #ec4899)"
              : undefined
          }
        >
          {currentScreen === onboardingScreens.length - 1 ? "Let's Go" : "Next"}
          {currentScreen === onboardingScreens.length - 1 ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </Button>
      </Box>

      {/* Progress Dots */}
      <HStack justify="center" gap={2} mb={8}>
        {onboardingScreens.map((_, index) => (
          <IconButton
            key={index}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to screen ${index + 1}`}
            size="xs"
            variant="ghost"
            className="ios-button-press"
            w="8px"
            h="8px"
            minW="8px"
            borderRadius="sm"
          >
            <motion.div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                backgroundColor:
                  index === currentScreen ? "#030213" : "#ececf0",
              }}
              animate={{
                scale: index === currentScreen ? 1.3 : 1,
                opacity: index === currentScreen ? 1 : 0.6,
              }}
              transition={{ duration: 0.2 }}
            />
          </IconButton>
        ))}
      </HStack>

      {/* Swipe Hint */}
      {currentScreen === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 2, duration: 0.5 }}
          style={{
            position: "absolute",
            bottom: "96px",
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          <Text
            fontSize="xs"
            color="#717182"
            _dark={{ color: "oklch(0.708 0 0)" }}
          >
            Swipe left or tap Next to continue
          </Text>
        </motion.div>
      )}
    </Box>
  );
}
