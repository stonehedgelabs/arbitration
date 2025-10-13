import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import {
  Button,
  Card,
  Field,
  Input,
  Stack,
  Box,
  VStack,
  HStack,
  Text,
  Checkbox,
} from "@chakra-ui/react";
import { useAppDispatch } from "../store/hooks.ts";
import { setUserType } from "../store/slices/authSlice.ts";
import { AppLayout } from "../components/containers";

export default function AppleLogin() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setUserType("apple"));
    navigate("/scores/mlb"); // Skip onboarding, go directly to Scores
  };

  const handleBack = () => {
    navigate("/login");
  };

  return (
    <AppLayout>
      <Box minH="100vh" bg="white" display="flex" flexDirection="column">
        {/* Header */}
        <HStack
          justify="space-between"
          align="center"
          p="4"
          borderBottom="1px"
          borderColor="gray.200"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            color="blue.600"
            _hover={{ bg: "gray.100" }}
            p="2"
          >
            <ArrowLeft size={20} />
          </Button>
          <Box textAlign="center">
            <Text fontSize="lg" fontWeight="medium">
              Sign In
            </Text>
          </Box>
          <Box w="9" />
        </HStack>

        {/* Content */}
        <Box
          flex="1"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: "100%", maxWidth: "384px" }}
          >
            {/* Apple ID Logo */}
            <VStack textAlign="center" mb="8" gap="4">
              <Box
                w="16"
                h="16"
                bg="black"
                borderRadius="sm"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mx="auto"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </Box>
              <VStack gap="2">
                <Text fontSize="2xl" fontWeight="semibold" color="gray.900">
                  Sign in with your Apple ID
                </Text>
                <Text color="gray.600">Enter your Apple ID and password</Text>
              </VStack>
            </VStack>

            {/* Sign In Form */}
            <Card.Root border="1px" borderColor="gray.200" shadow="sm">
              <Card.Header>
                <Card.Title>Sign in with your Apple ID</Card.Title>
                <Card.Description>
                  Enter your Apple ID and password
                </Card.Description>
              </Card.Header>
              <Card.Body>
                <form onSubmit={handleSubmit}>
                  <Stack gap="4" w="full">
                    <Field.Root>
                      <Field.Label htmlFor="apple-email">Apple ID</Field.Label>
                      <Input
                        id="apple-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        required
                      />
                    </Field.Root>

                    <Field.Root>
                      <Field.Label htmlFor="apple-password">
                        Password
                      </Field.Label>
                      <Input
                        id="apple-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                      />
                    </Field.Root>

                    <HStack justify="space-between" align="center">
                      <Checkbox.Root size="sm" colorScheme="blue">
                        <Checkbox.Indicator />
                        <Checkbox.Label fontSize="sm" color="gray.600">
                          Keep me signed in
                        </Checkbox.Label>
                      </Checkbox.Root>
                      <Button
                        variant="ghost"
                        fontSize="sm"
                        color="blue.600"
                        p="0"
                        h="auto"
                      >
                        Forgot Apple ID or password?
                      </Button>
                    </HStack>
                  </Stack>
                </form>
              </Card.Body>
              <Card.Footer justifyContent="flex-end">
                <Button
                  type="submit"
                  variant="solid"
                  onClick={handleSubmit}
                  w="full"
                >
                  Sign In
                </Button>
              </Card.Footer>
            </Card.Root>

            {/* Footer Links */}
            <VStack textAlign="center" mt="6" gap="3">
              <Button
                variant="ghost"
                color="blue.600"
                fontSize="sm"
                p="0"
                h="auto"
              >
                Don't have an Apple ID? Create yours now.
              </Button>
            </VStack>
          </motion.div>
        </Box>

        {/* Apple Footer */}
        <Box p="4" borderTop="1px" borderColor="gray.200" textAlign="center">
          <Text fontSize="xs" color="gray.500">
            Your Apple ID is the account you use for all Apple services.
          </Text>
        </Box>
      </Box>
    </AppLayout>
  );
}
