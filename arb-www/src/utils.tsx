/**
 * Utility functions for device detection and common operations
 */

/**
 * Detects if the current device is a mobile device
 * @returns {boolean} True if the device is mobile, false otherwise
 */
export const isMobileDevice = (): boolean => {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    return false;
  }

  // Check user agent for mobile indicators
  const userAgent = window.navigator.userAgent.toLowerCase();

  // Common mobile device patterns
  const mobilePatterns = [
    /android/i,
    /webos/i,
    /iphone/i,
    /ipad/i,
    /ipod/i,
    /blackberry/i,
    /windows phone/i,
    /mobile/i,
    /tablet/i,
  ];

  // Check if any mobile pattern matches
  const isMobileUserAgent = mobilePatterns.some((pattern) =>
    pattern.test(userAgent),
  );

  // Check screen size (additional check for responsive design)
  const isMobileScreen = window.innerWidth <= 768;

  // Check for touch capability
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Return true if any mobile indicator is present
  return isMobileUserAgent || (isMobileScreen && isTouchDevice);
};

/**
 * Gets the device type as a string
 * @returns {string} 'mobile' | 'desktop' | 'tablet'
 */
export const getDeviceType = (): "mobile" | "desktop" | "tablet" => {
  if (typeof window === "undefined") {
    return "desktop";
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  const screenWidth = window.innerWidth;

  // Check for tablet specifically
  if (
    /ipad/i.test(userAgent) ||
    (screenWidth > 768 && screenWidth <= 1024 && "ontouchstart" in window)
  ) {
    return "tablet";
  }

  // Check for mobile
  if (isMobileDevice()) {
    return "mobile";
  }

  return "desktop";
};

/**
 * Checks if the device supports touch interactions
 * @returns {boolean} True if touch is supported
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

/**
 * Gets the current viewport dimensions
 * @returns {object} Object with width and height
 */
export const getViewportDimensions = (): { width: number; height: number } => {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};
