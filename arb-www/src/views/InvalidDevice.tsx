import { motion } from "motion/react";
import { Smartphone } from "lucide-react";
import { Box, Text, VStack, HStack } from "@chakra-ui/react";

export function InvalidDevice() {
  return (
    <Box
      minH="100vh"
      minW={"100vw"}
      bg="primary.25"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p="4"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: "28rem" }}
      >
        <VStack gap="8" align="center" textAlign="center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            style={{
              width: "6rem",
              height: "6rem",
              backgroundColor: "var(--chakra-colors-primary-300)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box w="12" h="12" color="text.400">
              <Smartphone size={48} />
            </Box>
          </motion.div>

          {/* Content */}
          <VStack gap="4">
            <Text fontSize="3xl" fontWeight="bold" color="text.400">
              Mobile Only
            </Text>
            <Text fontSize="md" color="text.300" lineHeight="1.6">
              Arbitration is designed exclusively for mobile devices to provide
              the best experience.
            </Text>
            <Text fontSize="xs" color="text.300">
              Please access this app from your smartphone or tablet.
            </Text>
          </VStack>

          {/* Features */}
          <VStack gap="3" align="start" w="90%">
            <Text fontSize="md" fontWeight="semibold" color="text.300">
              Why mobile-only?
            </Text>
            <VStack gap="2" align="start" w="full">
              <HStack gap="3" align="center">
                <Box w="2" h="2" bg="primary.500" borderRadius="sm" />
                <Text fontSize="sm" color="text.300">
                  Optimized for touch interactions
                </Text>
              </HStack>
              <HStack gap="3" align="center">
                <Box w="2" h="2" bg="primary.500" borderRadius="sm" />
                <Text fontSize="sm" color="text.300">
                  Real-time sports updates on the go
                </Text>
              </HStack>
              <HStack gap="3" align="center">
                <Box w="2" h="2" bg="primary.500" borderRadius="sm" />
                <Text fontSize="sm" color="text.300">
                  Location-based features
                </Text>
              </HStack>
              <HStack gap="3" align="center">
                <Box w="2" h="2" bg="primary.500" borderRadius="sm" />
                <Text fontSize="sm" color="text.300">
                  Push notifications for live events
                </Text>
              </HStack>
            </VStack>
          </VStack>

          {/* Footer */}
          <Text fontSize="xs" color="text.50" textAlign="center">
            Need help? Contact our support team
          </Text>
        </VStack>
      </motion.div>
    </Box>
  );
}
