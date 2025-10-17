import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { useAppDispatch } from "../store/hooks.ts";
import { setUserType } from "../store/slices/authSlice.ts";
import { AppLayout } from "../components/containers";
import { SPORTS_CONFIG } from "../config";
import { ChatBubbleIcon } from "../components/ChatBubbleIcon";

// Simple SVG icons as components
const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

export function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogin = (method: "guest" | "apple" | "google") => {
    if (method === "guest") {
      dispatch(setUserType(method));
      navigate(`/scores/${SPORTS_CONFIG.initLeague}`); // Skip onboarding, go directly to Scores
    } else if (method === "apple") {
      navigate("/signin/apple");
    } else if (method === "google") {
      navigate("/signin/google");
    }
  };
  return (
    <AppLayout>
      <Box
        minH="100vh"
        bg="primary.25"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: "384px" }}
        >
          <VStack gap="8" align="center">
            {/* App Icon */}
            <VStack gap="4" textAlign="center">
              <Box
                w="80px"
                h="80px"
                bg="primary.25"
                borderRadius="24px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="lg"
                borderColor={"text.400"}
                // borderWidth={"1px"}
              >
                <ChatBubbleIcon size="lg" />
              </Box>
              <Box>
                <Text fontSize="2xl" fontWeight="bold" color="text.400" mb={2}>
                  Arbitration
                </Text>
                <Text fontSize={"sm"} color="text.300">
                  Scores. Reactions. Real-time.
                </Text>
              </Box>
            </VStack>

            {/* Login Options */}
            <Box
              bg="primary.25"
              w="full"
              p={6}
              border="1px"
              borderColor="gray.200"
              transform="translateY(-8px)"
            >
              <VStack gap="4">
                {/* Apple Login */}
                <Button
                  onClick={() => handleLogin("apple")}
                  disabled={true}
                  w="full"
                  h="56px"
                  borderRadius="xl"
                  fontSize="md"
                  fontWeight="medium"
                  color="text.400"
                  bg="primary.100"
                  backgroundImage="linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.05) 100%)"
                  boxShadow="inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.25)"
                  border="1px solid"
                  borderColor="rgba(255,255,255,0.2)"
                  _hover={{
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 40%, rgba(0,0,0,0.1) 100%)",
                    transform: "translateY(-1px)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 12px rgba(0,0,0,0.3)",
                  }}
                  _active={{
                    transform: "translateY(0)",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
                  }}
                  transition="all 0.2s ease"
                >
                  <AppleIcon />
                  Continue with Apple
                </Button>

                {/* Google Login */}
                <Button
                  onClick={() => handleLogin("google")}
                  w="full"
                  h="56px"
                  disabled={true}
                  borderRadius="xl"
                  fontSize="md"
                  fontWeight="medium"
                  color="text.400"
                  bg="primary.100"
                  backgroundImage="linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.05) 100%)"
                  boxShadow="inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.25)"
                  border="1px solid"
                  borderColor="rgba(255,255,255,0.2)"
                  _hover={{
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 40%, rgba(0,0,0,0.1) 100%)",
                    transform: "translateY(-1px)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 12px rgba(0,0,0,0.3)",
                  }}
                  _active={{
                    transform: "translateY(0)",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
                  }}
                  transition="all 0.2s ease"
                >
                  <GoogleIcon />
                  Continue with Google
                </Button>

                {/* Guest Login */}
                <Button
                  onClick={() => handleLogin("guest")}
                  w="full"
                  h="56px"
                  borderRadius="xl"
                  fontSize="md"
                  fontWeight="medium"
                  color="text.400"
                  bg="primary.100"
                  backgroundImage="linear-gradient(to bottom, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.05) 100%)"
                  boxShadow="inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.25)"
                  border="1px solid"
                  borderColor="rgba(255,255,255,0.2)"
                  _hover={{
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.1) 40%, rgba(0,0,0,0.1) 100%)",
                    transform: "translateY(-1px)",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 12px rgba(0,0,0,0.3)",
                  }}
                  _active={{
                    transform: "translateY(0)",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
                  }}
                  transition="all 0.2s ease"
                >
                  Continue as Guest
                </Button>
              </VStack>
            </Box>

            {/* Terms */}
            <Text
              fontSize="xs"
              color="text.400"
              textAlign="center"
              lineHeight="relaxed"
            >
              By continuing, you agree to our{" "}
              <Text as="span" color="text.400" textDecoration="underline">
                Terms of Service
              </Text>{" "}
              and{" "}
              <Text as="span" color="text.400" textDecoration="underline">
                Privacy Policy
              </Text>
            </Text>
          </VStack>
        </motion.div>
      </Box>
    </AppLayout>
  );
}
