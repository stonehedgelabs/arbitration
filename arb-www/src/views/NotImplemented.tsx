// Third-party library imports
import { Box, Button, Card, HStack, Text, VStack } from "@chakra-ui/react";
import { ArrowLeft, Construction, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface NotImplementedProps {
  feature: string;
  description?: string;
  showBackButton?: boolean;
  backPath?: string;
}

export function NotImplemented({
  feature,
  description,
  showBackButton = true,
  backPath = "/app",
}: NotImplementedProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(backPath);
  };

  return (
    <Box minH="100vh" bg="primary.25">
      {/* Header */}
      <Box
        bg="primary.25"
        borderBottom="1px"
        borderColor="border.100"
        position="sticky"
        top="0"
        zIndex="40"
      >
        <HStack gap="3" px="4" py="3">
          {showBackButton && (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <Box w="4" h="4">
                <ArrowLeft size={16} />
              </Box>
            </Button>
          )}
          <Box flex="1">
            <Text fontSize="lg" fontWeight="bold" textAlign="center">
              {feature}
            </Text>
          </Box>
          {showBackButton && <Box w="8" />}
        </HStack>
      </Box>

      {/* Content */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minH="calc(100vh - 80px)"
        p="4"
      >
        <Card.Root
          maxW="md"
          w="full"
          bg="primary.25"
          borderRadius="16px"
          shadow="lg"
          border="1px"
          borderColor="text.200"
        >
          <Card.Body p="8" textAlign="center">
            <VStack gap="6">
              {/* Icon */}
              <Box
                w="20"
                h="20"
                bg="accent.100"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="text.400"
                position="relative"
              >
                <Construction size={48} />
                <Box
                  position="absolute"
                  top="-2"
                  right="-2"
                  w="6"
                  h="6"
                  bg="primary.500"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Sparkles size={12} color="white" />
                </Box>
              </Box>

              {/* Content */}
              <VStack gap="3">
                <Text fontSize="xl" fontWeight="bold" color="text.400">
                  Coming Soon
                </Text>
                <Text fontSize="lg" fontWeight="medium" color="text.300">
                  {feature}
                </Text>
                <Text fontSize="md" color="text.500" lineHeight="1.6">
                  {description ||
                    "This feature is currently under development. We're working hard to bring you the best experience possible."}
                </Text>
              </VStack>

              {/* Progress indicator */}
              <VStack gap="2" w="full">
                <HStack gap="2" w="full">
                  <Box
                    flex="1"
                    h="2"
                    bg="text.200"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      w="60%"
                      h="full"
                      bg="primary.500"
                      borderRadius="full"
                    />
                  </Box>
                  <Text fontSize="xs" color="text.500" fontWeight="medium">
                    60%
                  </Text>
                </HStack>
                <Text fontSize="xs" color="text.500">
                  Development in progress
                </Text>
              </VStack>

              {/* Actions */}
              {showBackButton && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  w="full"
                  leftIcon={<ArrowLeft size={16} />}
                >
                  Go Back
                </Button>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      </Box>
    </Box>
  );
}
