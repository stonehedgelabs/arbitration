import { formatDistanceToNow } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { underscore } from "inflection";
import { DEBUG, REDDIT_CONFIG } from "./config";

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

interface PlayLabelResult {
  description: string;
  primaryPlayer: string;
}

/**
 * Generates a human-readable MLB play-by-play label
 * @param play - The MLB play data object
 * @returns {string} Formatted play description
 */
export const getPlayLabelMLB = (play: PlayData): PlayLabelResult => {
  const batter = play.HitterName;
  const pitcher = play.PitcherName;
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
 // contextParts.push(`${inning}, ${outs} out${outs !== 1 ? "s" : ""}`);

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
  let label = "";
  if (contextParts.length > 0) {
    label = `${batter} ${action}, ${contextParts.join(", ")}`;
  } else {
    label = `${batter} ${action}`;
  }

  return {
    description: label,
    primaryPlayer: batter,
  }
};

/**
 * Generates a human-readable NFL play-by-play label
 * @param play - The NFL play data object
 * @returns {string} Formatted play description
 */
export const getPlayLabelNFL = (play: any): PlayLabelResult => {
  /**
   {
     "Created": "2025-10-12T16:02:39",
     "Description": "Scrambled",
     "Distance": 2,
     "Down": 0,
     "IsScoringPlay": false,
     "Opponent": "DAL",
     "PlayID": 628882,
     "PlayStats": [
     {
       "AssistedTackles": 0,
       "BlockedKickReturnTouchdowns": 0,
       "BlockedKickReturnYards": 0,
       "BlockedKickReturns": 0,
       "BlockedKicks": 0,
       "Created": "2025-10-12T16:02:39",
       "Direction": "Scrambled",
       "ExtraPointsAttempted": 0,
       "ExtraPointsHadBlocked": 0,
       "ExtraPointsMade": 0,
       "FieldGoalReturnTouchdowns": 0,
       "FieldGoalReturnYards": 0,
       "FieldGoalReturns": 0,
       "FieldGoalsAttempted": 0,
       "FieldGoalsHadBlocked": 0,
       "FieldGoalsMade": 0,
       "FieldGoalsYards": 0,
       "FumbleReturnTouchdowns": 0,
       "FumbleReturnYards": 0,
       "Fumbles": 0,
       "FumblesForced": 0,
       "FumblesLost": 0,
       "FumblesRecovered": 0,
       "HomeOrAway": "HOME",
       "InterceptionReturnTouchdowns": 0,
       "InterceptionReturnYards": 0,
       "Interceptions": 0,
       "KickReturnTouchdowns": 0,
       "KickReturnYards": 0,
       "KickReturns": 0,
       "KickoffTouchbacks": 0,
       "KickoffYards": 0,
       "Kickoffs": 0,
       "Name": "Bryce Young",
       "Opponent": "DAL",
       "PassesDefended": 0,
       "PassingAttempts": 0,
       "PassingCompletions": 0,
       "PassingInterceptions": 0,
       "PassingSackYards": 0,
       "PassingSacks": 0,
       "PassingTouchdowns": 0,
       "PassingYards": 0,
       "Penalties": 0,
       "PenaltyYards": 0,
       "PlayID": 628882,
       "PlayStatID": 1354272,
       "PlayerID": 23132,
       "PuntReturnTouchdowns": 0,
       "PuntReturnYards": 0,
       "PuntReturns": 0,
       "PuntTouchbacks": 0,
       "PuntYards": 0,
       "Punts": 0,
       "PuntsHadBlocked": 0,
       "ReceivingTargets": 0,
       "ReceivingTouchdowns": 0,
       "ReceivingYards": 0,
       "Receptions": 0,
       "RushingAttempts": 0,
       "RushingTouchdowns": 0,
       "RushingYards": -1,
       "SackYards": 0.0,
       "Sacks": 0.0,
       "Safeties": 0,
       "Sequence": 0,
       "SoloTackles": 0,
       "TacklesForLoss": 0,
       "Team": "CAR",
       "TwoPointConversionAttempts": 0,
       "TwoPointConversionPasses": 0,
       "TwoPointConversionReceptions": 0,
       "TwoPointConversionReturns": 0,
       "TwoPointConversionRuns": 0,
       "Updated": "2025-10-12T16:02:39"
       }
     ],
     "PlayTime": "2025-10-12T16:02:06",
     "QuarterID": 13816,
     "QuarterName": "4",
     "ScoringPlay": null,
     "Sequence": 181,
     "Team": "CAR",
     "TimeRemainingMinutes": 0,
     "TimeRemainingSeconds": 31,
     "Type": "Rush",
     "Updated": "2025-10-12T16:02:39",
     "YardLine": 2,
     "YardLineTerritory": "Scrambled",
     "YardsGained": -1,
     "YardsToEndZone": 2
   }
   */
    const team = play.Team || "Team";
    const opponent = play.Opponent || "Opponent";
    const description = play.Description || "";
    const down = play.Down;
    const distance = play.Distance;
    const yardLine = play.YardLine;
    const yardLineTerritory = play.YardLineTerritory;
    const yardsGained = play.YardsGained;
    const type = underscore(play.Type).replace("_", " ") || "";

    // Extract primary player from PlayStats (similar to how MLB uses batter name)
    const primaryPlayer = play.PlayStats?.[0];
    const playerName = primaryPlayer?.Name || team;

    // Check if description is usable (not scrambled/empty)
    const hasRealDescription = description && description !== "Scrambled";

    // Determine action
    let action: string;
    if (hasRealDescription) {
        // Use the actual description as the action
        action = description;
    } else {
        // Fall back to play type and yards gained
        if (type) {
            // Use the play type as the base action
            const typeLower = type.toLowerCase();
            if (yardsGained !== undefined) {
                if (yardsGained > 0) {
                    action = `${typeLower} for ${yardsGained} yards`;
                } else if (yardsGained < 0) {
                    action = `${typeLower} for ${yardsGained} yards`;
                } else {
                    action = `${typeLower} for no gain`;
                }
            } else {
                action = typeLower;
            }
        } else if (yardsGained !== undefined) {
            if (yardsGained > 0) {
                action = `gained ${yardsGained} yards`;
            } else if (yardsGained < 0) {
                action = `lost ${Math.abs(yardsGained)} yards`;
            } else {
                action = "no gain";
            }
        } else {
            action = "play";
        }
    }

    // Build context
    const contextParts: string[] = [];

    // Add opponent (like MLB adds "vs pitcher")
    contextParts.push(`vs ${opponent}`);

    // Add down and distance (like MLB adds "inning, outs")
    if (down !== undefined && down > 0 && distance !== undefined) {
        const downText = down === 1 ? "1st" : down === 2 ? "2nd" : down === 3 ? "3rd" : down === 4 ? "4th" : `${down}th`;
        contextParts.push(`${downText} & ${distance}`);
    }

    // Add yard line (field position context)
    if (yardLine !== undefined && yardLineTerritory && yardLineTerritory !== "Scrambled") {
        contextParts.push(`${yardLineTerritory} ${yardLine}`);
    }

    // Add scoring play indicator (like MLB adds RBI)
    if (play.IsScoringPlay) {
        contextParts.push("SCORE");
    }

    // Combine and return
  let label = "";
    if (contextParts.length > 0) {
        label = `${playerName} ${action}, ${contextParts.join(", ")}`;
    } else {
        label = `${playerName} ${action}`;
    }

    return {
      description: label,
      primaryPlayer: playerName,
    };
};


export const getPlayLabelNBA = (play: any): PlayLabelResult => {
  /**
   {
     "PlayID": 7480479,
     "QuarterID": 174486,
     "QuarterName": "1",
     "Sequence": 2,
     "TimeRemainingMinutes": 12,
     "TimeRemainingSeconds": 0,
     "AwayTeamScore": 0,
     "HomeTeamScore": 0,
     "PotentialPoints": 0,
     "Points": 0,
     "ShotMade": false,
     "Category": "Scrambled",
     "Type": "Scrambled",
     "TeamID": 26,
     "Team": "GS",
     "OpponentID": 27,
     "Opponent": "LAL",
     "ReceivingTeamID": 26,
     "ReceivingTeam": "GS",
     "Description": "Scrambled",
     "PlayerID": null,
     "AssistedByPlayerID": null,
     "BlockedByPlayerID": null,
     "FastBreak": null,
     "SideOfBasket": "Scrambled",
     "Updated": "2025-10-12T21:41:29",
     "Created": "2025-10-12T21:41:29",
     "SubstituteInPlayerID": null,
     "SubstituteOutPlayerID": null,
     "AwayPlayerID": 20003253,
     "HomePlayerID": 20001990,
     "ReceivingPlayerID": 20000482,
     "BaselineOffsetPercentage": null,
     "SidelineOffsetPercentage": null,
     "Coordinates": "Scrambled",
     "StolenByPlayerID": null
   },
   */
   const team = play.Team || "Team";
   const opponent = play.Opponent || "Opponent";
   const description = play.Description || "";
   const category = play.Category || "";
   const type = play.Type || "";
   const quarterName = play.QuarterName || "";
   const timeRemainingMinutes = play.TimeRemainingMinutes;
   const timeRemainingSeconds = play.TimeRemainingSeconds;
   const awayScore = play.AwayTeamScore;
   const homeScore = play.HomeTeamScore;
   const points = play.Points;
   const shotMade = play.ShotMade;
 
   // Determine primary player - NBA has multiple player fields
   let playerName = team;
   
   // Priority: PlayerID > AwayPlayerID/HomePlayerID > ReceivingPlayerID
   if (play.PlayerID) {
     // Would need a lookup here in real implementation
     playerName = `Player ${play.PlayerID}`;
   } else if (play.AwayPlayerID || play.HomePlayerID) {
     const playerId = play.AwayPlayerID || play.HomePlayerID;
     playerName = `Player ${playerId}`;
   } else if (play.ReceivingPlayerID) {
     playerName = `Player ${play.ReceivingPlayerID}`;
   }
 
   // Check if description is usable (not scrambled/empty)
   const hasRealDescription = description && description !== "Scrambled";
   const hasRealCategory = category && category !== "Scrambled";
   const hasRealType = type && type !== "Scrambled";
 
   // Determine action
   let action: string;
   if (hasRealDescription) {
     action = description;
   } else if (hasRealCategory) {
     // Use category as base action
     action = category.toLowerCase();
     
     // Add shot result if applicable
     if (shotMade !== null) {
       action = shotMade ? `made ${action}` : `missed ${action}`;
     }
     
     // Add points if scored
     if (points > 0) {
       action = `${action} (${points} pts)`;
     }
   } else if (hasRealType) {
     action = type.toLowerCase();
   } else if (points > 0) {
     action = `scored ${points} ${points === 1 ? 'point' : 'points'}`;
   } else {
     action = "play";
   }
 
   // Build context
   const contextParts: string[] = [];
 
   // Add opponent
   contextParts.push(`vs ${opponent}`);
 
   // Add quarter and time
   if (quarterName) {
     const timeStr = `${timeRemainingMinutes}:${String(timeRemainingSeconds).padStart(2, '0')}`;
     contextParts.push(`Q${quarterName} ${timeStr}`);
   }
 
   // Add score
   if (awayScore !== undefined && homeScore !== undefined) {
     contextParts.push(`${awayScore}-${homeScore}`);
   }
 
   // Add fast break indicator
   if (play.FastBreak) {
     contextParts.push("FAST BREAK");
   }
 
   // Combine and return
   let label = "";
   if (contextParts.length > 0) {
     label = `${playerName} ${action}, ${contextParts.join(", ")}`;
   } else {
     label = `${playerName} ${action}`;
   }
 
   return {
     description: label,
     primaryPlayer: playerName,
   };
}

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
 * Applies the configured Reddit delay to a timestamp
 * @param timestamp - The original timestamp string
 * @returns {string} The timestamp with Reddit delay applied
 */
export const delayedRedditTimestamp = (timestamp: string): string => {
  return new Date(new Date(timestamp).getTime() + REDDIT_CONFIG.eventDelay).toISOString();
};

/**
 * Extracts the actual data array from the new backend response structure
 * Handles multiple possible response formats:
 * - Direct array: response.data is already an array
 * - Single wrapped: response.data.data contains the array
 * - Double wrapped: response.data.data.data contains the array
 * - Games field: response.data.games contains the array
 *
 * @param response - The backend response object
 * @returns {any[]} The extracted data array
 */
export const extractDataFromResponse = (response: any): any[] => {
  if (!response || !response.data) {
    return [];
  }

  // Direct array
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // Check for nested data structures
  if (response.data && typeof response.data === 'object') {
    // Double wrapped: response.data.data.data
    if (response.data.data && typeof response.data.data === 'object' && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    }

    // Single wrapped: response.data.data
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }

    // Games field: response.data.games
    if (Array.isArray(response.data.games)) {
      return response.data.games;
    }
  }

  // If we can't find an array, return empty array
  return [];
};

