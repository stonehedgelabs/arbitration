import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Button, Card, Field, Input, Stack } from "@chakra-ui/react";
import { useAppDispatch, useAppSelector } from "../store/hooks.ts";
import { setUserType } from "../store/slices/authSlice.ts";

export function Google() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hasSeenWelcome = useAppSelector((state) => state.auth.hasSeenWelcome);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleBack = () => {
    navigate("/login");
  };

  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setShowPassword(true);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setUserType("google"));
    navigate(hasSeenWelcome ? "/onboarding" : "/welcome");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={showPassword ? () => setShowPassword(false) : handleBack}
          className="text-gray-600 hover:bg-gray-100 p-2 mr-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="text-sm text-gray-600">
          {showPassword ? "Welcome" : "Sign in"}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          {/* Google Logo */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto" viewBox="0 0 24 24">
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
            </div>
            {!showPassword ? (
              <>
                <h2 className="text-2xl font-normal text-gray-900 mb-2">
                  Sign in
                </h2>
                <p className="text-gray-600">to continue to Arbitration</p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-normal text-gray-900 mb-2">
                  Welcome
                </h2>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                    {email.charAt(0).toUpperCase()}
                  </div>
                  <span>{email}</span>
                </div>
              </>
            )}
          </div>

          {/* Sign In Form */}
          <Card.Root className="border border-gray-200 shadow-sm">
            <Card.Header>
              <Card.Title>{!showPassword ? "Sign in" : "Welcome"}</Card.Title>
              <Card.Description>
                {!showPassword
                  ? "to continue to Arbitration"
                  : "Enter your password to continue"}
              </Card.Description>
            </Card.Header>
            <Card.Body>
              {!showPassword ? (
                <form onSubmit={handleEmailNext}>
                  <Stack gap="4" w="full">
                    <Field.Root>
                      <Field.Label htmlFor="google-email">
                        Email or phone
                      </Field.Label>
                      <Input
                        id="google-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email or phone"
                        required
                      />
                    </Field.Root>

                    <div className="text-left">
                      <Button
                        variant="ghost"
                        className="text-blue-600 text-sm p-0 h-auto"
                      >
                        Forgot email?
                      </Button>
                    </div>

                    <div className="text-sm text-gray-600 leading-5">
                      Not your computer? Use Guest mode to sign in privately.{" "}
                      <Button
                        variant="ghost"
                        className="text-blue-600 p-0 h-auto text-sm"
                      >
                        Learn more
                      </Button>
                    </div>
                  </Stack>
                </form>
              ) : (
                <form onSubmit={handlePasswordSubmit}>
                  <Stack gap="4" w="full">
                    <Field.Root>
                      <Field.Label htmlFor="google-password">
                        Password
                      </Field.Label>
                      <Input
                        id="google-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                    </Field.Root>

                    <div className="text-left">
                      <Button
                        variant="ghost"
                        className="text-blue-600 text-sm p-0 h-auto"
                      >
                        Forgot password?
                      </Button>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="show-password"
                        className="mr-2"
                      />
                      <label
                        htmlFor="show-password"
                        className="text-sm text-gray-600"
                      >
                        Show password
                      </label>
                    </div>
                  </Stack>
                </form>
              )}
            </Card.Body>
            <Card.Footer justifyContent="space-between">
              <Button
                variant="ghost"
                className="text-blue-600 text-sm font-medium p-0 h-auto"
              >
                Create account
              </Button>
              <Button
                type="submit"
                variant="solid"
                onClick={!showPassword ? handleEmailNext : handlePasswordSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              >
                Next
              </Button>
            </Card.Footer>
          </Card.Root>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <select className="bg-transparent border-none text-gray-500">
            <option>English (United States)</option>
          </select>
          <div className="flex space-x-4">
            <Button
              variant="ghost"
              className="text-gray-500 text-xs p-0 h-auto"
            >
              Help
            </Button>
            <Button
              variant="ghost"
              className="text-gray-500 text-xs p-0 h-auto"
            >
              Privacy
            </Button>
            <Button
              variant="ghost"
              className="text-gray-500 text-xs p-0 h-auto"
            >
              Terms
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
