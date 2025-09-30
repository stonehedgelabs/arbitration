import { useEffect } from "react";
import useDevice from "../services/Device.ts";

interface MobileOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Higher-order component that ensures the wrapped component only renders on mobile devices
 * Automatically redirects to InvalidDevice view if not on mobile
 */
export function MobileOnly({ children, fallback = null }: MobileOnlyProps) {
  const { checkMobileDevice, isMobile } = useDevice();

  useEffect(() => {
    // Check on mount and redirect if not mobile
    checkMobileDevice();
  }, [checkMobileDevice]);

  // If not mobile, don't render children (redirect will happen)
  if (!isMobile) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook that can be used in components to check mobile device
 * Returns true if mobile, false otherwise (and triggers redirect)
 */
export function useMobileCheck() {
  const { useMobileCheck: checkMobile } = useDevice();
  return checkMobile();
}
