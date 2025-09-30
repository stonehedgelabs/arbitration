import { motion } from "motion/react";
import { Smartphone } from "lucide-react";
import { Box, Text, VStack, HStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export function InvalidDevice() {
  const navigate = useNavigate();

  return (
    <Box
      minH="100vh"
      minW={"100vw"}
      bg="linear-gradient(to bottom right, blue.50, indigo.100)"
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
              backgroundColor: "#2563eb",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box w="12" h="12" color="white">
              <Smartphone size={48} />
            </Box>
          </motion.div>

          {/* Content */}
          <VStack gap="4">
            <Text fontSize="3xl" fontWeight="bold" color="gray.900">
              Mobile Only
            </Text>
            <Text fontSize="lg" color="gray.600" lineHeight="1.6">
              Arbitration is designed exclusively for mobile devices to provide
              the best experience.
            </Text>
            <Text fontSize="md" color="gray.500">
              Please access this app from your smartphone or tablet.
            </Text>
          </VStack>

          {/* Features */}
          <VStack gap="3" align="start" w="full">
            <Text fontSize="md" fontWeight="semibold" color="gray.700">
              Why mobile-only?
            </Text>
            <VStack gap="2" align="start" w="full">
              <HStack gap="3" align="center">
                <Box w="2" h="2" bg="blue.600" borderRadius="full" />
                <Text fontSize="sm" color="gray.600">
                  Optimized for touch interactions
                </Text>
              </HStack>
              <HStack gap="3" align="center">
                <Box w="2" h="2" bg="blue.600" borderRadius="full" />
                <Text fontSize="sm" color="gray.600">
                  Real-time sports updates on the go
                </Text>
              </HStack>
              <HStack gap="3" align="center">
                <Box w="2" h="2" bg="blue.600" borderRadius="full" />
                <Text fontSize="sm" color="gray.600">
                  Location-based features
                </Text>
              </HStack>
              <HStack gap="3" align="center">
                <Box w="2" h="2" bg="blue.600" borderRadius="full" />
                <Text fontSize="sm" color="gray.600">
                  Push notifications for live events
                </Text>
              </HStack>
            </VStack>
          </VStack>

          {/* Footer */}
          <Text fontSize="xs" color="gray.400" textAlign="center">
            Need help? Contact our support team
          </Text>
        </VStack>
      </motion.div>
    </Box>
  );
}
