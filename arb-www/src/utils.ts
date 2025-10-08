import { formatDistanceToNow } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { DEBUG } from "./config";

/**
 * Debug utility - wraps console methods to respect debug configuration
 */
// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  info: console.info,
  error: console.error,
  group: console.group,
  groupEnd: console.groupEnd,
  table: console.table,
  time: console.time,
  timeEnd: console.timeEnd,
};

// Override console methods
console.log = (...args: any[]) => {
  if (DEBUG.enabled) {
    originalConsole.log(...args);
  }
};

console.warn = (...args: any[]) => {
  if (DEBUG.enabled) {
    originalConsole.warn(...args);
  }
};

console.info = (...args: any[]) => {
  if (DEBUG.enabled) {
    originalConsole.info(...args);
  }
};

// Always show errors
console.error = (...args: any[]) => {
  originalConsole.error(...args);
};

console.group = (label?: string) => {
  if (DEBUG.enabled) {
    originalConsole.group(label);
  }
};

console.groupEnd = () => {
  if (DEBUG.enabled) {
    originalConsole.groupEnd();
  }
};

console.table = (data: any) => {
  if (DEBUG.enabled) {
    originalConsole.table(data);
  }
};

console.time = (label: string) => {
  if (DEBUG.enabled) {
    originalConsole.time(label);
  }
};

console.timeEnd = (label: string) => {
  if (DEBUG.enabled) {
    originalConsole.timeEnd(label);
  }
};

/**
 * Utility functions for device detection and common operations
 */

/**
 * Converts a UTC datetime string to local time and returns the date in YYYY-MM-DD format
 * @param utcDateTime - UTC datetime string (e.g., "2025-10-01T21:08:00")
 * @returns {string} Local date in YYYY-MM-DD format
 */
export const convertUtcToLocalDate = (utcDateTime: string): string => {
  const date = new Date(utcDateTime);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

/**
 * Extracts date from an EST datetime string and returns it in YYYY-MM-DD format
 * @param estDateTime - EST datetime string (e.g., "2025-10-01T21:08:00")
 * @returns {string} Date in YYYY-MM-DD format
 */
export const extractDateFromEst = (estDateTime: string): string => {
  // For EST times, we just extract the date part without timezone conversion
  return estDateTime.split("T")[0];
};

/**
 * Gets the current local date in YYYY-MM-DD format
 * @returns {string} Current local date in YYYY-MM-DD format
 */
export const getCurrentLocalDate = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

/**
 * Formats a date for display in the date slider
 * @param date - Date object or date string
 * @returns {string} Formatted date string (e.g., "Wed Oct 2")
 */
export const formatDateForSlider = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayName = days[dateObj.getDay()];
  const month = months[dateObj.getMonth()];
  const day = dateObj.getDate();

  return `${dayName} ${month} ${day}`;
};

/**
 * Checks if a date string represents today
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if the date is today
 */
export const isToday = (dateString: string): boolean => {
  return dateString === getCurrentLocalDate();
};

export const formatRelativeESTTime = (timestamp: string): string => {
  try {
    // Convert EST/EDT timestamp to UTC
    const utcDate = fromZonedTime(timestamp, "America/New_York");

    // Get relative time
    return formatDistanceToNow(utcDate, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting relative time:", timestamp, error);
    return "Just now";
  }
};

export const formatRelativeUTCTime = (timestamp: string): string => {
  try {
    // Parse the timestamp directly (it's already in UTC format)
    const date = new Date(timestamp);

    // Get relative time
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting relative UTC time:", timestamp, error);
    return "Just now";
  }
};

/**
 * Converts an EST/EDT timestamp to UTC
 * @param estTimestamp - EST/EDT timestamp string (e.g., "2025-01-15T21:08:00")
 * @returns {string} UTC timestamp string in ISO format
 */
export const estToUTC = (estTimestamp: string): string => {
  try {
    // Convert EST/EDT timestamp to UTC using date-fns-tz
    const utcDate = fromZonedTime(estTimestamp, "America/New_York");
    return utcDate.toISOString();
  } catch (error) {
    console.error("Error converting EST to UTC:", estTimestamp, error);
    return estTimestamp; // Return original if conversion fails
  }
};

/**
 * Converts a datetime string from EST/EDT to local time and formats it for display
 * @param estDateTime - EST/EDT datetime string (e.g., "2025-10-01T21:08:00")
 * @returns {string} Formatted local time string (e.g., "Wed. Oct 1st at 6:08 PM")
 */
export const toLocalTime = (estDateTime: string): string => {
  try {
    // Convert EST/EDT timestamp to UTC first
    const utcDate = fromZonedTime(estDateTime, "America/New_York");
    
    // Then convert to local time
    const localDate = toZonedTime(utcDate, Intl.DateTimeFormat().resolvedOptions().timeZone);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const dayName = days[localDate.getDay()];
    const monthName = months[localDate.getMonth()];
    const day = localDate.getDate();

    // Add ordinal suffix to day
    const getOrdinalSuffix = (day: number) => {
      if (day >= 11 && day <= 13) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    // Format time in user's local timezone
    const time = localDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${dayName}. ${monthName} ${day}${getOrdinalSuffix(day)} at ${time}`;
  } catch (error) {
    console.error("Error converting to local time:", estDateTime, error);
    return "TBD";
  }
};

/**
 * Safely parses a YYYY-MM-DD date string to a Date object in local time
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns {Date} Date object in local time
 */
export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
};

/**
 * Check if a date string is in the future
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns {boolean} True if the date is in the future
 */
export const isFutureDate = (dateString: string): boolean => {
  try {
    const today = new Date();
    const targetDate = parseLocalDate(dateString);

    // Reset time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    return targetDate > today;
  } catch (error) {
    return false;
  }
};

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

/**
 * Replaces "Scrambled" values with "--" for display
 * @param value - The value to check
 * @returns {string} The original value or "--" if scrambled/empty
 */
export const orEmpty = (value: string | undefined | null): string => {
  if (!value || value === "Scrambled") {
    return "--";
  }
  return value;
};

/**
 * Play-by-play data interface
 */
interface PlayData {
  HitterName: string;
  PitcherName: string;
  InningHalf: string;
  InningNumber: number;
  Outs: number;
  Description?: string;
  Strikeout?: boolean;
  Walk?: boolean;
  Hit?: boolean;
  Sacrifice?: boolean;
  Out?: boolean;
  Runner1ID?: number | null;
  Runner2ID?: number | null;
  Runner3ID?: number | null;
  RunsBattedIn?: number;
}

/**
 * Generates a human-readable play-by-play label
 * @param play - The play data object
 * @returns {string} Formatted play description
 */
export const getPlayLabel = (play: PlayData): string => {
  const batter = play.HitterName;
  const pitcher = play.PitcherName;
  const inning = formatInningWithIcon(play.InningNumber, play.InningHalf);
  const outs = play.Outs;
  const description = play.Description || "";

  // Check if description is usable (not scrambled/empty)
  const hasRealDescription = description && description !== "Scrambled";

  // Determine action
  let action: string;
  if (hasRealDescription) {
    // Use the actual description as the action
    action = description;
  } else {
    // Fall back to flags
    if (play.Strikeout) {
      action = "struck out";
    } else if (play.Walk) {
      action = "walked";
    } else if (play.Hit) {
      action = "singled";
    } else if (play.Sacrifice) {
      action = "sacrifice";
    } else if (play.Out) {
      action = "grounded out";
    } else {
      action = "in play";
    }
  }

  // Build context
  const contextParts: string[] = [];

  // Add pitcher (skip if already in description)
  if (
    !hasRealDescription ||
    !pitcher.split(" ").pop()?.toLowerCase().includes(action.toLowerCase())
  ) {
    contextParts.push(`vs ${pitcher}`);
  }

  // Add inning and outs
  contextParts.push(`${inning}, ${outs} out${outs !== 1 ? "s" : ""}`);

  // Count runners on base
  const runners: string[] = [];
  if (play.Runner1ID) runners.push("1st");
  if (play.Runner2ID) runners.push("2nd");
  if (play.Runner3ID) runners.push("3rd");

  if (runners.length > 0) {
    contextParts.push(`runners on ${runners.join(", ")}`);
  }

  // Add RBI if applicable
  if (play.RunsBattedIn && play.RunsBattedIn > 0) {
    contextParts.push(`${play.RunsBattedIn} RBI`);
  }

  // Combine and return
  if (contextParts.length > 0) {
    return `${batter} ${action}, ${contextParts.join(", ")}`;
  } else {
    return `${batter} ${action}`;
  }
};

/**
 * Formats inning display with chevron icons
 * @param inningNumber - The inning number
 * @param inningHalf - The inning half ("T" for top, "B" for bottom)
 * @returns {string} Formatted inning with chevron icon
 */
export const formatInningWithIcon = (inningNumber: number, inningHalf: string): string => {
  const icon = inningHalf === "T" ? "▲" : "▼";
  return `${icon} ${inningNumber}`;
};

/**
 * Generates a short title from a play description
 * @param play - The play data object
 * @returns {string} Short title for the play
 */
export const getPlayTitle = (play: PlayData): string => {
  const batter = play.HitterName;
  const description = play.Description || "";

  // Check if description is usable (not scrambled/empty)
  const hasRealDescription = description && description !== "Scrambled";

  // Determine action
  let action: string;
  if (hasRealDescription) {
    // Extract the main action from the description
    const desc = description.toLowerCase();
    if (desc.includes("strike") || desc.includes("strikeout")) {
      action = "struck out";
    } else if (desc.includes("walk") || desc.includes("base on balls")) {
      action = "walked";
    } else if (desc.includes("single")) {
      action = "singled";
    } else if (desc.includes("double")) {
      action = "doubled";
    } else if (desc.includes("triple")) {
      action = "tripled";
    } else if (desc.includes("home run")) {
      action = "homered";
    } else if (desc.includes("ground out")) {
      action = "grounded out";
    } else if (desc.includes("fly out")) {
      action = "flied out";
    } else if (desc.includes("pop out")) {
      action = "popped out";
    } else if (desc.includes("line out")) {
      action = "lined out";
    } else if (desc.includes("sacrifice")) {
      action = "sacrificed";
    } else if (desc.includes("error")) {
      action = "reached on error";
    } else {
      // Fallback: use first few words of description
      const words = description.split(" ");
      action = words.slice(0, 3).join(" ").toLowerCase();
    }
  } else {
    // Fall back to flags
    if (play.Strikeout) {
      action = "struck out";
    } else if (play.Walk) {
      action = "walked";
    } else if (play.Hit) {
      action = "singled";
    } else if (play.Sacrifice) {
      action = "sacrificed";
    } else if (play.Out) {
      action = "grounded out";
    } else {
      action = "in play";
    }
  }

  return `${batter} ${action}`;
};

/**
 * Gets the appropriate icon name for a play action
 * @param play - The play data object
 * @returns {string} Icon name for the action
 */
export const getPlayIcon = (play: PlayData): string => {
  const description = play.Description || "";
  const hasRealDescription = description && description !== "Scrambled";

  // Determine action type for icon selection
  if (hasRealDescription) {
    const desc = description.toLowerCase();
    if (desc.includes("strike") || desc.includes("strikeout"))
      return "strikeout";
    if (desc.includes("walk") || desc.includes("base on balls")) return "walk";
    if (
      desc.includes("hit") ||
      desc.includes("single") ||
      desc.includes("double") ||
      desc.includes("triple") ||
      desc.includes("home run")
    )
      return "hit";
    if (
      desc.includes("out") ||
      desc.includes("ground out") ||
      desc.includes("fly out")
    )
      return "out";
    if (desc.includes("sacrifice") || desc.includes("sac fly"))
      return "sacrifice";
    if (desc.includes("error")) return "error";
    return "play";
  } else {
    // Use flags to determine icon
    if (play.Strikeout) return "strikeout";
    if (play.Walk) return "walk";
    if (play.Hit) return "hit";
    if (play.Sacrifice) return "sacrifice";
    if (play.Out) return "out";
    return "play";
  }
};
