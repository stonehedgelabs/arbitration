import React, { ReactNode } from "react";
import { Box } from "@chakra-ui/react";
import useDevice from "../services/Device.ts";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * AppLayout component that wraps all mobile views with device detection
 * Automatically redirects non-mobile users to InvalidDevice view
 */
export function AppLayout({ children, className }: AppLayoutProps) {
  const { isMobile, checkMobileDevice } = useDevice();

  // Check device on mount and redirect if not mobile
  React.useEffect(() => {
    checkMobileDevice();
  }, [checkMobileDevice]);

  // If not mobile, don't render children (redirect will happen)
  if (!isMobile) {
    return null;
  }

  return (
    <Box
      minH="100vh"
      w="100vw"
      display="flex"
      flexDirection="column"
      position="relative"
      overflow="hidden"
      className={className}
    >
      {children}
    </Box>
  );
}
