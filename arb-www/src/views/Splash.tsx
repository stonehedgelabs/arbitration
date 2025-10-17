import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Box, VStack, Text } from "@chakra-ui/react";
import { AppLayout } from "../components/containers";
import { ChatBubbleIcon } from "../components/ChatBubbleIcon";

export function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AppLayout>
      <Box
        position="fixed"
        inset={0}
        bg="primary.25"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap="6" textAlign="center">
          {/* App Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Box
              w="96px"
              h="96px"
              bg="primary.200"
              borderRadius="24px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              shadow="2xl"
            >
              <Box
                w="64px"
                h="64px"
                bg="primary.25"
                borderRadius="16px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <ChatBubbleIcon size="lg" />
              </Box>
            </Box>
          </motion.div>

          {/* App Name */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Text fontSize="3xl" fontWeight="bold" color="text.400" mb={2}>
              Arbitration
            </Text>
          </motion.div>

          {/* Tagline */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Text color="text.400" fontSize="lg">
              Scores. Reactions. Real-time.
            </Text>
          </motion.div>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            <Box mt={12}>
              <Box
                w="32px"
                h="32px"
                border="2px solid"
                borderColor="text.100"
                borderTopColor="text.400"
                borderRadius="50%"
                animation="spin 0.65s linear infinite"
                mx="auto"
              />
            </Box>
          </motion.div>
        </VStack>
      </Box>
    </AppLayout>
  );
}
