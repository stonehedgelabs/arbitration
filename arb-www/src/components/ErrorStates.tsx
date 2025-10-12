import { Box, Button, Card, Text, VStack } from "@chakra-ui/react";
import {
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Construction,
  Wifi,
  Server,
  Database,
  Clock,
} from "lucide-react";

interface ErrorStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  onRetry?: () => void;
  onBack?: () => void;
  showRetry?: boolean;
  showBack?: boolean;
  variant?: "error" | "warning" | "info";
}

export function ErrorState({
  title,
  message,
  icon,
  onRetry,
  onBack,
  showRetry = true,
  showBack = false,
  variant = "error",
}: ErrorStateProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "error":
        return {
          iconColor: "text.400",
          titleColor: "text.400",
          bgColor: "danger.100",
          borderColor: "danger.100",
        };
      case "warning":
        return {
          iconColor: "text.400",
          titleColor: "text.400",
          bgColor: "orange.50",
          borderColor: "orange.200",
        };
      case "info":
        return {
          iconColor: "text.400",
          titleColor: "text.400",
          bgColor: "blue.50",
          borderColor: "blue.200",
        };
    }
  };

  const styles = getVariantStyles();
  const defaultIcon = <AlertCircle color={"lightgray"} size={48} />;

  return (
    <Box
      minH="400px"
      bg="primary.25"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p="4"
      w="100vw"
    >
      <Card.Root maxW="md" w="full" bg="primary.25" borderWidth={0}>
        <Card.Body p="8" textAlign="center">
          <VStack gap="6">
            {/* Icon */}
            <Box
              w="20"
              h="20"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color={styles.iconColor}
            >
              {icon || defaultIcon}
            </Box>

            {/* Content */}
            <VStack gap="3">
              <Text fontSize="md" fontWeight="bold" color={styles.titleColor}>
                {title}
              </Text>
              <Text fontSize="xs" color="text.400" lineHeight="1.6">
                {message}
              </Text>
            </VStack>

            {/* Actions */}
            <VStack gap="3" w="full">
              {showRetry && onRetry && (
                <Button
                  onClick={onRetry}
                  bg={"buttons.primary.bg"}
                  fontSize="xs"
                  color={"buttons.primary.color"}
                  variant="solid"
                  w="full"
                >
                  <RefreshCw style={{ marginRight: "8px", height: 16 }} />
                  Try Again
                </Button>
              )}
              {showBack && onBack && (
                <Button onClick={onBack} variant="outline" w="full">
                  <ArrowLeft size={16} style={{ marginRight: "8px" }} />
                  Go Back
                </Button>
              )}
            </VStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}

interface NotImplementedStateProps {
  feature: string;
  description?: string;
  onBack?: () => void;
  showBack?: boolean;
}

export function NotImplementedState({
  feature,
  description,
  onBack,
  showBack = true,
}: NotImplementedStateProps) {
  return (
    <Box
      minH="100vh"
      bg="primary.25"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p="4"
    >
      <Card.Root
        maxW="md"
        w="full"
        bg="primary.25"
        borderRadius="16px"
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
            >
              <Construction size={48} />
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

            {/* Actions */}
            {showBack && onBack && (
              <Button onClick={onBack} variant="outline" w="full">
                <ArrowLeft size={16} style={{ marginRight: "8px" }} />
                Go Back
              </Button>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}

interface NetworkErrorStateProps {
  onRetry?: () => void;
  onBack?: () => void;
}

export function NetworkErrorState({ onRetry, onBack }: NetworkErrorStateProps) {
  return (
    <ErrorState
      title="Connection Problem"
      message="We're having trouble connecting to our servers. Please check your internet connection and try again."
      icon={<Wifi size={48} />}
      onRetry={onRetry}
      onBack={onBack}
      showRetry={true}
      showBack={true}
      variant="warning"
    />
  );
}

interface ServerErrorStateProps {
  onRetry?: () => void;
  onBack?: () => void;
}

export function ServerErrorState({ onRetry, onBack }: ServerErrorStateProps) {
  return (
    <ErrorState
      title="Server Error"
      message="Something went wrong on our end. Our team has been notified and we're working to fix it."
      icon={<Server size={48} />}
      onRetry={onRetry}
      onBack={onBack}
      showRetry={true}
      showBack={true}
      variant="error"
    />
  );
}

interface DataErrorStateProps {
  onRetry?: () => void;
  onBack?: () => void;
}

export function DataErrorState({ onRetry, onBack }: DataErrorStateProps) {
  return (
    <ErrorState
      title="Data Unavailable"
      message="We're having trouble loading the data you requested. This might be temporary."
      icon={<Database size={48} />}
      onRetry={onRetry}
      onBack={onBack}
      showRetry={true}
      showBack={true}
      variant="warning"
    />
  );
}

interface LoadingTimeoutStateProps {
  onRetry?: () => void;
  onBack?: () => void;
}

export function LoadingTimeoutState({
  onRetry,
  onBack,
}: LoadingTimeoutStateProps) {
  return (
    <ErrorState
      title="Taking Too Long"
      message="This is taking longer than expected. The request might have timed out."
      icon={<Clock size={48} />}
      onRetry={onRetry}
      onBack={onBack}
      showRetry={true}
      showBack={true}
      variant="warning"
    />
  );
}

interface CompactErrorStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  variant?: "error" | "warning" | "info";
}

export function CompactErrorState({
  title,
  message,
  icon,
  variant = "error",
}: CompactErrorStateProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "error":
        return {
          iconColor: "red.500",
          titleColor: "text.400",
        };
      case "warning":
        return {
          iconColor: "orange.500",
          titleColor: "text.400",
        };
      case "info":
        return {
          iconColor: "blue.500",
          titleColor: "text.400",
        };
    }
  };

  const styles = getVariantStyles();
  const defaultIcon = <AlertCircle size={32} />;

  return (
    <VStack gap="3" align="center" justify="center" p="4" minH="200px">
      {/* Icon */}
      <Box
        w="12"
        h="12"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color={styles.iconColor}
      >
        {icon || defaultIcon}
      </Box>

      {/* Content */}
      <VStack gap="2">
        <Text fontSize="sm" fontWeight="semibold" color={styles.titleColor}>
          {title}
        </Text>
        <Text
          fontSize="xs"
          color="text.400"
          textAlign="center"
          lineHeight="1.4"
        >
          {message}
        </Text>
      </VStack>
    </VStack>
  );
}
