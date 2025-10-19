import {
  convertUtcToLocalDate,
  extractDataFromResponse,
} from "../utils.ts";
import {
  isPostseasonDate,
  League,
  GameStatus,
  mapApiStatusToGameStatus,
} from "../config";

const getStatus = (apiStatus: string): GameStatus => {
  return mapApiStatusToGameStatus(apiStatus);
};


// Game interfaces
export interface Team {
  name: string;
  score: number;
  logo?: string;
}

export interface Game {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  status: GameStatus;
  time: string;
  date: string;
  quarter?: string;
  inningHalf?: string;
  timeRemaining?: string;
  timeRemainingMinutes?: number;
  timeRemainingSeconds?: number;
  // Location/Venue information
  stadium?: string;
  city?: string;
  state?: string;
  country?: string;
  capacity?: number;
  surface?: string;
  weather?: string;
  temperature?: number;
  stadiumId?: number;
  division?: string;
  // Postseason flag
  isPostseason?: boolean;
  // League
  league: League;
  // Base runners
  runnerOnFirst?: boolean;
  runnerOnSecond?: boolean;
  runnerOnThird?: boolean;
  // NFL-specific: ScoreID for box score requests
  scoreId?: string;
  // Odds information
  odds?: {
    homeMoneyLine?: number;
    awayMoneyLine?: number;
    homePointSpread?: number;
    awayPointSpread?: number;
    overUnder?: number;
    sportsbook?: string;
    homeTeam?: {
      moneyLine?: number;
      pointSpread?: number;
    };
    awayTeam?: {
      moneyLine?: number;
      pointSpread?: number;
    };
    total?: number;
    totalOverOdds?: number;
    totalUnderOdds?: number;
  };
}

// Helper function to get game odds
const getGameOdds = (gameId: string, oddsData: any) => {
  if (!oddsData) return null;

  // Try to find odds for this specific game
  const gameOdds = oddsData.find((odds: any) => odds.GameID === parseInt(gameId));
  if (gameOdds) {
    return {
      homeMoneyLine: gameOdds.HomeTeamMoneyLine,
      awayMoneyLine: gameOdds.AwayTeamMoneyLine,
      homePointSpread: gameOdds.HomeTeamPointSpread,
      awayPointSpread: gameOdds.AwayTeamPointSpread,
      overUnder: gameOdds.OverUnder,
      sportsbook: gameOdds.Sportsbook,
      homeTeam: {
        moneyLine: gameOdds.HomeTeamMoneyLine,
        pointSpread: gameOdds.HomeTeamPointSpread,
      },
      awayTeam: {
        moneyLine: gameOdds.AwayTeamMoneyLine,
        pointSpread: gameOdds.AwayTeamPointSpread,
      },
      total: gameOdds.OverUnder,
      totalOverOdds: gameOdds.OverPayout,
      totalUnderOdds: gameOdds.UnderPayout,
    };
  }

  return null;
};

// Convert NFL game data to Game format
export const convertNFLGameToGame = (
  rawGame: any,
  teamProfiles: any,
  stadiums: any,
  _oddsData?: any,
  boxScoreData?: any,
): Game | null => {
  // Helper functions to get team profiles and stadiums
  const getTeamProfile = (teamId: number) => {
    if (!teamProfiles) return null;
    const teamProfilesArray = extractDataFromResponse(teamProfiles);
    return teamProfilesArray.find((team: any) => team.TeamID === teamId);
  };

  const getStadium = (stadiumId?: number) => {
    if (!stadiums || !stadiumId) return null;
    const stadiumsArray = extractDataFromResponse(stadiums);
    return stadiumsArray.find(
      (stadium: any) => stadium.StadiumID === stadiumId,
    );
  };

  // Get team profiles
  const homeTeamProfile = getTeamProfile(rawGame.HomeTeamID);
  const awayTeamProfile = getTeamProfile(rawGame.AwayTeamID);

  // Get stadium
  const stadium = getStadium(rawGame.StadiumID);

  // If team profiles are not available, we'll use the team abbreviations from the raw data
  // This allows games to be displayed even when team profiles haven't loaded yet

  const gameId = rawGame.GameKey.toString();

  // Check if we have more accurate box score data for this game
  // For NFL, the data structure is different - it has a 'score' field instead of 'Game'
  // Also handle case where data is returned directly without wrapper
  const boxScoreGame = boxScoreData?.[gameId]?.data?.score || 
                      boxScoreData?.[gameId]?.data?.Score || 
                      boxScoreData?.[gameId]?.data?.Game ||
                      boxScoreData?.[gameId]?.data;

  // Use box score data if available, otherwise use raw game data
  const gameData = boxScoreGame || rawGame;

  const convertedGame: Game = {
    id: gameId,
    homeTeam: {
      name: homeTeamProfile?.Name || rawGame.HomeTeam || "Home Team",
      score: gameData.HomeScore || 0,
      logo: homeTeamProfile?.WikipediaLogoUrl,
    },
    awayTeam: {
      name: awayTeamProfile?.Name || rawGame.AwayTeam || "Away Team",
      score: gameData.AwayScore || 0,
      logo: awayTeamProfile?.WikipediaLogoUrl,
    },
    status: getStatus(gameData.Status),
    time: gameData.DateTime || "",
    date: gameData.DateTime
      ? gameData.DateTime.split("T")[0]  // Extract date part directly for NFL
      : new Date().toISOString().split("T")[0],
    quarter: gameData.Quarter || undefined,
    inningHalf: undefined, // NFL doesn't have innings
    // Location/Venue information
    stadium: stadium?.Name,
    city: stadium?.City,
    timeRemaining: gameData.TimeRemaining,
    state: stadium?.State,
    country: stadium?.Country,
    capacity: stadium?.Capacity,
    surface: stadium?.Surface,
    weather: gameData.Weather,
    temperature: gameData.Temperature,
    stadiumId: gameData.StadiumID,
    division: homeTeamProfile?.Division,
    // Postseason flag - determine based on the game date using config
    isPostseason: isPostseasonDate(
      League.NFL,
      gameData.DateTime
        ? gameData.DateTime.split("T")[0]  // Extract date part directly for NFL
        : new Date().toISOString().split("T")[0],
    ),
    // Base runners (not applicable to NFL)
    runnerOnFirst: false,
    runnerOnSecond: false,
    runnerOnThird: false,
    // NFL-specific: ScoreID for box score requests
    scoreId: gameData.ScoreID?.toString(),
    // Odds information (extracted directly from NFL game data)
    odds: gameData ? {
      homeMoneyLine: gameData.HomeTeamMoneyLine,
      awayMoneyLine: gameData.AwayTeamMoneyLine,
      homePointSpread: gameData.PointSpread,
      awayPointSpread: gameData.PointSpread ? -gameData.PointSpread : undefined,
      overUnder: gameData.OverUnder,
      sportsbook: "SportsData.io",
      homeTeam: {
        moneyLine: gameData.HomeTeamMoneyLine,
        pointSpread: gameData.PointSpread,
      },
      awayTeam: {
        moneyLine: gameData.AwayTeamMoneyLine,
        pointSpread: gameData.PointSpread ? -gameData.PointSpread : undefined,
      },
      total: gameData.OverUnder,
      totalOverOdds: undefined,
      totalUnderOdds: undefined,
    } : undefined,
    // League
    league: League.NFL,
  };

  return convertedGame;
};

// Convert MLB game data to Game format
export const convertMLBGameToGame = (
  rawGame: any,
  teamProfiles: any,
  stadiums: any,
  oddsData?: any,
  boxScoreData?: any,
): Game | null => {
  // Map API status to our status format


  // Helper functions to get team profiles and stadiums
  const getTeamProfile = (teamId: number) => {
    if (!teamProfiles) return null;
    const teamProfilesArray = extractDataFromResponse(teamProfiles);
    return teamProfilesArray.find((team: any) => team.TeamID === teamId);
  };

  const getStadium = (stadiumId?: number) => {
    if (!stadiums || !stadiumId) return null;
    const stadiumsArray = extractDataFromResponse(stadiums);
    return stadiumsArray.find(
      (stadium: any) => stadium.StadiumID === stadiumId,
    );
  };

  // Get team profiles
  const homeTeamProfile = getTeamProfile(rawGame.HomeTeamID);
  const awayTeamProfile = getTeamProfile(rawGame.AwayTeamID);

  // Get stadium
  const stadium = getStadium(rawGame.StadiumID);

  if (!homeTeamProfile || !awayTeamProfile) {
    return null;
  }

  const gameId = rawGame.GameID.toString();

  // Check if we have more accurate box score data for this game
  const boxScoreGame = boxScoreData?.[gameId]?.data?.Game;

  // Use box score data if available, otherwise use raw game data
  const gameData = boxScoreGame || rawGame;

  const convertedGame: Game = {
    id: gameId,
    homeTeam: {
      name: homeTeamProfile.Name,
      score: gameData.HomeTeamRuns || 0,
      logo: homeTeamProfile.WikipediaLogoUrl,
    },
    awayTeam: {
      name: awayTeamProfile.Name,
      score: gameData.AwayTeamRuns || 0,
      logo: awayTeamProfile.WikipediaLogoUrl,
    },
    status: getStatus(gameData.Status),
    time: gameData.DateTime || "",
    date: gameData.DateTime
      ? convertUtcToLocalDate(gameData.DateTime)
      : new Date().toISOString().split("T")[0],
    quarter: gameData.Inning || undefined,
    inningHalf: gameData.InningHalf || undefined,
    // Location/Venue information
    stadium: stadium?.Name,
    city: stadium?.City,
    state: stadium?.State,
    country: stadium?.Country,
    capacity: stadium?.Capacity,
    surface: stadium?.Surface,
    weather: gameData.Weather,
    temperature: gameData.Temperature,
    stadiumId: gameData.StadiumID,
    division: homeTeamProfile?.Division,
    // Postseason flag - determine based on the game date using config
    isPostseason: isPostseasonDate(
      League.MLB,
      gameData.DateTime
        ? convertUtcToLocalDate(gameData.DateTime)
        : new Date().toISOString().split("T")[0],
    ),
    // Base runners
    runnerOnFirst: gameData.RunnerOnFirst || false,
    runnerOnSecond: gameData.RunnerOnSecond || false,
    runnerOnThird: gameData.RunnerOnThird || false,
    // Odds information - try direct game data first, then odds data
    odds: gameData.HomeTeamMoneyLine !== undefined ? {
      homeMoneyLine: gameData.HomeTeamMoneyLine,
      awayMoneyLine: gameData.AwayTeamMoneyLine,
      homePointSpread: gameData.PointSpread,
      awayPointSpread: gameData.PointSpread ? -gameData.PointSpread : undefined,
      overUnder: gameData.OverUnder,
      sportsbook: "SportsData.io",
      homeTeam: {
        moneyLine: gameData.HomeTeamMoneyLine,
        pointSpread: gameData.PointSpread,
      },
      awayTeam: {
        moneyLine: gameData.AwayTeamMoneyLine,
        pointSpread: gameData.PointSpread ? -gameData.PointSpread : undefined,
      },
      total: gameData.OverUnder,
      totalOverOdds: gameData.OverPayout,
      totalUnderOdds: gameData.UnderPayout,
    } : getGameOdds(gameId, oddsData) || undefined,
    // League
    league: League.MLB,
  };

  return convertedGame;
};

// Convert NBA game data to Game format
export const convertNBAGameToGame = (
  rawGame: any,
  teamProfiles: any,
  stadiums: any,
  oddsData?: any,
  boxScoreData?: any,
): Game | null => {

  // Helper functions to get team profiles and stadiums
  const getTeamProfile = (teamId: number) => {
    if (!teamProfiles) return null;
    const teamProfilesArray = extractDataFromResponse(teamProfiles);
    return teamProfilesArray.find((team: any) => team.TeamID === teamId);
  };

  const getStadium = (stadiumId?: number) => {
    if (!stadiums || !stadiumId) return null;
    const stadiumsArray = extractDataFromResponse(stadiums);
    return stadiumsArray.find(
      (stadium: any) => stadium.StadiumID === stadiumId,
    );
  };

  // Get team profiles
  const homeTeamProfile = getTeamProfile(rawGame.HomeTeamID);
  const awayTeamProfile = getTeamProfile(rawGame.AwayTeamID);

  // Get stadium
  const stadium = getStadium(rawGame.StadiumID);

  if (!homeTeamProfile || !awayTeamProfile) {
    return null;
  }

  const gameId = rawGame.GameID.toString();

  // Check if we have more accurate box score data for this game
  const boxScoreGame = boxScoreData?.[gameId]?.data?.Game;

  // Use box score data if available, otherwise use raw game data
  const gameData = boxScoreGame || rawGame;

  const convertedGame: Game = {
    id: gameId,
    homeTeam: {
      name: homeTeamProfile.Name,
      score: gameData.HomeTeamScore,
      logo: homeTeamProfile.WikipediaLogoUrl,
    },
    awayTeam: {
      name: awayTeamProfile.Name,
      score: gameData.AwayTeamScore,
      logo: awayTeamProfile.WikipediaLogoUrl,
    },
    status: getStatus(gameData.Status),
    time: gameData.DateTime || "",
    date: gameData.DateTime
      ? convertUtcToLocalDate(gameData.DateTime)
      : new Date().toISOString().split("T")[0],
    quarter: gameData.Quarter || undefined,
    inningHalf: undefined, // Not applicable to NBA
    timeRemaining: undefined, // NBA uses separate minutes/seconds
    timeRemainingMinutes: gameData.TimeRemainingMinutes,
    timeRemainingSeconds: gameData.TimeRemainingSeconds,
    // Location/Venue information
    stadium: stadium?.Name,
    city: stadium?.City,
    state: stadium?.State,
    country: stadium?.Country,
    capacity: stadium?.Capacity,
    surface: stadium?.Surface,
    weather: gameData.Weather,
    temperature: gameData.Temperature,
    stadiumId: gameData.StadiumID,
    division: homeTeamProfile?.Division,
    // Postseason flag - determine based on the game date using config
    isPostseason: isPostseasonDate(
      League.NBA,
      gameData.DateTime
        ? convertUtcToLocalDate(gameData.DateTime)
        : new Date().toISOString().split("T")[0],
    ),
    // Base runners (not applicable to NBA)
    runnerOnFirst: false,
    runnerOnSecond: false,
    runnerOnThird: false,
    // Odds information - try direct game data first, then odds data
    odds: gameData.HomeTeamMoneyLine !== undefined ? {
      homeMoneyLine: gameData.HomeTeamMoneyLine,
      awayMoneyLine: gameData.AwayTeamMoneyLine,
      homePointSpread: gameData.PointSpread,
      awayPointSpread: gameData.PointSpread ? -gameData.PointSpread : undefined,
      overUnder: gameData.OverUnder,
      sportsbook: "SportsData.io",
      homeTeam: {
        moneyLine: gameData.HomeTeamMoneyLine,
        pointSpread: gameData.PointSpread,
      },
      awayTeam: {
        moneyLine: gameData.AwayTeamMoneyLine,
        pointSpread: gameData.PointSpread ? -gameData.PointSpread : undefined,
      },
      total: gameData.OverUnder,
      totalOverOdds: gameData.OverPayout,
      totalUnderOdds: gameData.UnderPayout,
    } : getGameOdds(gameId, oddsData) || undefined,
    // League
    league: League.NBA,
  };

  return convertedGame;
};

// Generic game converter that routes to league-specific functions
export const convertGameToGame = (
  rawGame: any,
  teamProfiles: any,
  stadiums: any,
  league: League,
  oddsData?: any,
  boxScoreData?: any,
): Game | null => {
  switch (league) {
    case League.NFL:
      return convertNFLGameToGame(rawGame, teamProfiles, stadiums, oddsData, boxScoreData);
    case League.MLB:
      return convertMLBGameToGame(rawGame, teamProfiles, stadiums, oddsData, boxScoreData);
    case League.NBA:
      return convertNBAGameToGame(rawGame, teamProfiles, stadiums, oddsData, boxScoreData);
    default:
      return null;
  }
};

// Convert NFL schedule game to Game format
export const convertNFLScheduleGameToGame = (
  scheduleGame: any,
  teamProfiles: any,
  stadiums: any,
  _oddsData?: any,
  boxScoreData?: any,
): Game | null => {
  // Helper functions to get team profiles and stadiums
  const getTeamProfile = (teamId: number) => {
    if (!teamProfiles) return null;
    const teamProfilesArray = extractDataFromResponse(teamProfiles);
    return teamProfilesArray.find((team: any) => team.TeamID === teamId);
  };

  const getStadium = (stadiumId?: number) => {
    if (!stadiums || !stadiumId) return null;
    const stadiumsArray = extractDataFromResponse(stadiums);
    return stadiumsArray.find(
      (stadium: any) => stadium.StadiumID === stadiumId,
    );
  };

  // Get team profiles
  // NFL schedule uses GlobalHomeTeamID and GlobalAwayTeamID instead of HomeTeamID/AwayTeamID
  const homeTeamProfile = getTeamProfile(scheduleGame.GlobalHomeTeamID);
  const awayTeamProfile = getTeamProfile(scheduleGame.GlobalAwayTeamID);

  // Get stadium
  const stadium = getStadium(scheduleGame.StadiumID);

  // If team profiles are not available, we'll use the team abbreviations from the raw data
  // This allows games to be displayed even when team profiles haven't loaded yet

  const gameId = scheduleGame.GameKey.toString();

  // Check if we have more accurate box score data for this game
  // For NFL, the data structure is different - it has a 'score' field instead of 'Game'
  // Also handle case where data is returned directly without wrapper
  const boxScoreGame = boxScoreData?.[gameId]?.data?.score || 
                      boxScoreData?.[gameId]?.data?.Score || 
                      boxScoreData?.[gameId]?.data?.Game ||
                      boxScoreData?.[gameId]?.data;

  // Use box score data if available, otherwise use schedule game data
  const gameData = boxScoreGame || scheduleGame;

  const convertedDate = gameData.DateTime
    ? gameData.DateTime.split("T")[0]  // Extract date part directly for NFL
    : new Date().toISOString().split("T")[0];

  const convertedGame: Game = {
    id: gameId,
    homeTeam: {
      name: homeTeamProfile?.Name || scheduleGame.HomeTeam || "Home Team",
      score: gameData.HomeScore || 0,
      logo: homeTeamProfile?.WikipediaLogoUrl,
    },
    awayTeam: {
      name: awayTeamProfile?.Name || scheduleGame.AwayTeam || "Away Team",
      score: gameData.AwayScore || 0,
      logo: awayTeamProfile?.WikipediaLogoUrl,
    },
    status: getStatus(gameData.Status),
    time: gameData.DateTime || "",
    date: convertedDate,
    quarter: gameData.Quarter?.toString() || undefined,
    inningHalf: undefined, // NFL doesn't have innings
    // Location/Venue information
    stadium: stadium?.Name,
    city: stadium?.City,
    state: stadium?.State,
    country: stadium?.Country,
    capacity: stadium?.Capacity,
    surface: stadium?.Surface,
    weather: undefined, // Weather not available in schedule data
    temperature: undefined, // Temperature not available in schedule data
    stadiumId: gameData.StadiumID,
    division: homeTeamProfile?.Division,
    // Postseason flag - determine based on the game date using config
    isPostseason: isPostseasonDate(League.NFL, convertedDate),
    // Base runners (not applicable to NFL)
    runnerOnFirst: false,
    runnerOnSecond: false,
    runnerOnThird: false,
    // NFL-specific: ScoreID for box score requests
    scoreId: gameData.ScoreID?.toString(),
    // Odds information (extracted directly from NFL game data)
    odds: gameData ? {
      homeMoneyLine: gameData.HomeTeamMoneyLine,
      awayMoneyLine: gameData.AwayTeamMoneyLine,
      homePointSpread: gameData.PointSpread,
      awayPointSpread: gameData.PointSpread ? -gameData.PointSpread : undefined,
      overUnder: gameData.OverUnder,
      sportsbook: "SportsData.io",
      homeTeam: {
        moneyLine: gameData.HomeTeamMoneyLine,
        pointSpread: gameData.PointSpread,
      },
      awayTeam: {
        moneyLine: gameData.AwayTeamMoneyLine,
        pointSpread: gameData.PointSpread ? -gameData.PointSpread : undefined,
      },
      total: gameData.OverUnder,
      totalOverOdds: undefined,
      totalUnderOdds: undefined,
    } : undefined,
    // League
    league: League.NFL,
  };

  return convertedGame;
};

// Convert MLB schedule game to Game format
export const convertMLBScheduleGameToGame = (
  scheduleGame: any,
  teamProfiles: any,
  stadiums: any,
  oddsData?: any,
  boxScoreData?: any,
): Game | null => {
  // Map API status to our status format
  const getStatus = (apiStatus: string): GameStatus => {
    return mapApiStatusToGameStatus(apiStatus);
  };

  // Helper functions to get team profiles and stadiums
  const getTeamProfile = (teamId: number) => {
    if (!teamProfiles) return null;
    const teamProfilesArray = extractDataFromResponse(teamProfiles);
    return teamProfilesArray.find((team: any) => team.TeamID === teamId);
  };

  const getStadium = (stadiumId?: number) => {
    if (!stadiums || !stadiumId) return null;
    const stadiumsArray = extractDataFromResponse(stadiums);
    return stadiumsArray.find(
      (stadium: any) => stadium.StadiumID === stadiumId,
    );
  };

  // Get team profiles
  const homeTeamProfile = getTeamProfile(scheduleGame.HomeTeamID);
  const awayTeamProfile = getTeamProfile(scheduleGame.AwayTeamID);

  // Get stadium
  const stadium = getStadium(scheduleGame.StadiumID);

  if (!homeTeamProfile || !awayTeamProfile) {
    return null;
  }

  const gameId = scheduleGame.GameID.toString();

  // Check if we have more accurate box score data for this game
  const boxScoreGame = boxScoreData?.[gameId]?.data?.Game;

  // Use box score data if available, otherwise use schedule game data
  const gameData = boxScoreGame || scheduleGame;

  const convertedDate = gameData.DateTime
    ? convertUtcToLocalDate(gameData.DateTime)
    : new Date().toISOString().split("T")[0];

  const convertedGame: Game = {
    id: gameId,
    homeTeam: {
      name: homeTeamProfile.Name,
      score: gameData.HomeTeamRuns || 0,
      logo: homeTeamProfile.WikipediaLogoUrl,
    },
    awayTeam: {
      name: awayTeamProfile.Name,
      score: gameData.AwayTeamRuns || 0,
      logo: awayTeamProfile.WikipediaLogoUrl,
    },
    status: getStatus(gameData.Status),
    time: gameData.DateTime || "",
    date: convertedDate,
    quarter: gameData.Inning?.toString() || undefined,
    inningHalf: gameData.InningHalf || undefined,
    // Location/Venue information
    stadium: stadium?.Name,
    city: stadium?.City,
    state: stadium?.State,
    country: stadium?.Country,
    capacity: stadium?.Capacity,
    surface: stadium?.Surface,
    weather: undefined, // Weather not available in schedule data
    temperature: undefined, // Temperature not available in schedule data
    stadiumId: gameData.StadiumID,
    division: homeTeamProfile?.Division,
    // Postseason flag - determine based on the game date using config
    isPostseason: isPostseasonDate(League.MLB, convertedDate),
    // Base runners
    runnerOnFirst: gameData.RunnerOnFirst || false,
    runnerOnSecond: gameData.RunnerOnSecond || false,
    runnerOnThird: gameData.RunnerOnThird || false,
    // Odds information - try direct game data first, then odds data
    odds: gameData.HomeTeamMoneyLine !== undefined ? {
      homeMoneyLine: gameData.HomeTeamMoneyLine,
      awayMoneyLine: gameData.AwayTeamMoneyLine,
      homePointSpread: gameData.PointSpread,
      awayPointSpread: gameData.PointSpread ? -gameData.PointSpread : undefined,
      overUnder: gameData.OverUnder,
      sportsbook: "SportsData.io",
      homeTeam: {
        moneyLine: gameData.HomeTeamMoneyLine,
        pointSpread: gameData.PointSpread,
      },
      awayTeam: {
        moneyLine: gameData.AwayTeamMoneyLine,
        pointSpread: gameData.PointSpread ? -gameData.PointSpread : undefined,
      },
      total: gameData.OverUnder,
      totalOverOdds: gameData.OverPayout,
      totalUnderOdds: gameData.UnderPayout,
    } : getGameOdds(gameId, oddsData) || undefined,
    league: League.MLB,
  };

  return convertedGame;
};

// Convert NBA schedule game to Game format
export const convertNBAScheduleGameToGame = (
  scheduleGame: any,
  teamProfiles: any,
  stadiums: any,
  oddsData?: any,
  boxScoreData?: any,
): Game | null => {
  // Map API status to our status format
  const getStatus = (apiStatus: string): GameStatus => {
    return mapApiStatusToGameStatus(apiStatus);
  };

  // Helper functions to get team profiles and stadiums
  const getTeamProfile = (teamId: number) => {
    if (!teamProfiles) return null;
    const teamProfilesArray = extractDataFromResponse(teamProfiles);
    return teamProfilesArray.find((team: any) => team.TeamID === teamId);
  };

  const getStadium = (stadiumId?: number) => {
    if (!stadiums || !stadiumId) return null;
    const stadiumsArray = extractDataFromResponse(stadiums);
    return stadiumsArray.find(
      (stadium: any) => stadium.StadiumID === stadiumId,
    );
  };

  // Get team profiles
  const homeTeamProfile = getTeamProfile(scheduleGame.HomeTeamID);
  const awayTeamProfile = getTeamProfile(scheduleGame.AwayTeamID);

  // Get stadium
  const stadium = getStadium(scheduleGame.StadiumID);

  if (!homeTeamProfile || !awayTeamProfile) {
    return null;
  }

  const gameId = scheduleGame.GameID.toString();

  // Check if we have more accurate box score data for this game
  const boxScoreGame = boxScoreData?.[gameId]?.data?.Game;

  // Use box score data if available, otherwise use schedule game data
  const gameData = boxScoreGame || scheduleGame;

  const convertedDate = gameData.DateTime
    ? convertUtcToLocalDate(gameData.DateTime)
    : new Date().toISOString().split("T")[0];

  const convertedGame: Game = {
    id: gameId,
    homeTeam: {
      name: homeTeamProfile.Name,
      score: gameData.HomeTeamRuns || 0,
      logo: homeTeamProfile.WikipediaLogoUrl,
    },
    awayTeam: {
      name: awayTeamProfile.Name,
      score: gameData.AwayTeamRuns || 0,
      logo: awayTeamProfile.WikipediaLogoUrl,
    },
    status: getStatus(gameData.Status),
    time: gameData.DateTime || "",
    date: convertedDate,
    quarter: gameData.Inning?.toString() || undefined,
    inningHalf: gameData.InningHalf || undefined,
    // Location/Venue information
    stadium: stadium?.Name,
    city: stadium?.City,
    state: stadium?.State,
    country: stadium?.Country,
    capacity: stadium?.Capacity,
    surface: stadium?.Surface,
    weather: undefined, // Weather not available in schedule data
    temperature: undefined, // Temperature not available in schedule data
    stadiumId: gameData.StadiumID,
    division: homeTeamProfile?.Division,
    // Postseason flag - determine based on the game date using config
    isPostseason: isPostseasonDate(League.NBA, convertedDate),
    // Base runners (not applicable to NBA)
    runnerOnFirst: false,
    runnerOnSecond: false,
    runnerOnThird: false,
    // Odds information - try direct game data first, then odds data
    odds: gameData.HomeTeamMoneyLine !== undefined ? {
      homeMoneyLine: gameData.HomeTeamMoneyLine,
      awayMoneyLine: gameData.AwayTeamMoneyLine,
      homePointSpread: gameData.PointSpread,
      awayPointSpread: gameData.PointSpread ? -gameData.PointSpread : undefined,
      overUnder: gameData.OverUnder,
      sportsbook: "SportsData.io",
      homeTeam: {
        moneyLine: gameData.HomeTeamMoneyLine,
        pointSpread: gameData.PointSpread,
      },
      awayTeam: {
        moneyLine: gameData.AwayTeamMoneyLine,
        pointSpread: gameData.PointSpread ? -gameData.PointSpread : undefined,
      },
      total: gameData.OverUnder,
      totalOverOdds: gameData.OverPayout,
      totalUnderOdds: gameData.UnderPayout,
    } : getGameOdds(gameId, oddsData) || undefined,
    // League
    league: League.NBA,
  };

  return convertedGame;
};

// Generic schedule game converter that routes to league-specific functions
export const convertScheduleGameToGame = (
  scheduleGame: any,
  teamProfiles: any,
  stadiums: any,
  league: League,
  oddsData?: any,
  boxScoreData?: any,
): Game | null => {
  switch (league) {
    case League.NFL:
      return convertNFLScheduleGameToGame(scheduleGame, teamProfiles, stadiums, oddsData, boxScoreData);
    case League.MLB:
      return convertMLBScheduleGameToGame(scheduleGame, teamProfiles, stadiums, oddsData, boxScoreData);
    case League.NBA:
      return convertNBAScheduleGameToGame(scheduleGame, teamProfiles, stadiums, oddsData, boxScoreData);
    default:
      return null;
  }
};
