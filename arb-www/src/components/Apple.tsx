import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Button, Card, Field, Input, Stack } from "@chakra-ui/react";
import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import { setUserType } from "../store/slices/authSlice.ts";

export function Apple() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hasSeenWelcome = useAppSelector((state) => state.auth.hasSeenWelcome);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setUserType("apple"));
    navigate(hasSeenWelcome ? "/onboarding" : "/welcome");
  };

  const handleBack = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="text-blue-600 hover:bg-gray-100 p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-lg font-medium">Sign In</h1>
        </div>
        <div className="w-9" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          {/* Apple ID Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Sign in with your Apple ID
            </h2>
            <p className="text-gray-600">Enter your Apple ID and password</p>
          </div>

          {/* Sign In Form */}
          <Card.Root className="border border-gray-200 shadow-sm">
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
                    <Field.Label htmlFor="apple-password">Password</Field.Label>
                    <Input
                      id="apple-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                    />
                  </Field.Root>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-600">
                        Keep me signed in
                      </span>
                    </label>
                    <Button
                      variant="ghost"
                      className="text-sm text-blue-600 p-0 h-auto"
                    >
                      Forgot Apple ID or password?
                    </Button>
                  </div>
                </Stack>
              </form>
            </Card.Body>
            <Card.Footer justifyContent="flex-end">
              <Button
                type="submit"
                variant="solid"
                onClick={handleSubmit}
                className="w-full"
              >
                Sign In
              </Button>
            </Card.Footer>
          </Card.Root>

          {/* Footer Links */}
          <div className="text-center mt-6 space-y-3">
            <Button
              variant="ghost"
              className="text-blue-600 text-sm p-0 h-auto"
            >
              Don't have an Apple ID? Create yours now.
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Apple Footer */}
      <div className="p-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          Your Apple ID is the account you use for all Apple services.
        </p>
      </div>
    </div>
  );
}
