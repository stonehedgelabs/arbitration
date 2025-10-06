// React imports
import { useCallback, useState } from "react";

// Internal imports - config
import { buildApiUrl, isPostseasonDate as configIsPostseasonDate, League } from '../config';

// Internal imports - schema
import { 
  BoxScoreResponse
} from '../schema';

// Internal imports - store
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setLeagueTeamProfiles, setLeagueStadiums, setLeagueError } from '../store/slices/sportsDataSlice';

/**
 * Determines if a given date is in the postseason for a given league
 */
const isPostseasonDate = (league: League, dateString: string): boolean => {
  return configIsPostseasonDate(league, dateString);
};


/**
 * Hook for Arbitration API calls
 */
const useArb = () => {
  const [mlbBoxScore, setMlbBoxScore] = useState<BoxScoreResponse | null>(null);
  
  // Redux state and dispatch
  const dispatch = useAppDispatch();
  const selectedLeague = useAppSelector((state) => state.sportsData.selectedLeague);
  
  // Redux state for current league data (generic)
  const leagueData = useAppSelector((state) => state.sportsData.leagueData);
  const currentLeagueData = leagueData[selectedLeague];
  
  // Generic state accessors
  const scores = currentLeagueData?.scores || null;
  const scoresLoading = currentLeagueData?.loading || false;
  const scoresError = currentLeagueData?.error || null;
  
  const teamProfiles = currentLeagueData?.teamProfiles || null;
  const teamProfilesLoading = currentLeagueData?.loading || false;
  const teamProfilesError = currentLeagueData?.error || null;
  
  const stadiums = currentLeagueData?.stadiums || null;
  const stadiumsLoading = currentLeagueData?.loading || false;
  const stadiumsError = currentLeagueData?.error || null;
  
  const schedule = currentLeagueData?.schedule || null;
  const scheduleLoading = currentLeagueData?.loading || false;
  const scheduleError = currentLeagueData?.error || null;
  
  const odds = currentLeagueData?.odds || null;
  const oddsLoading = currentLeagueData?.loading || false;
  const oddsError = currentLeagueData?.error || null;
  
  // Current games (this might need to be updated based on your current implementation)
  const currentGames = null; // TODO: Update this based on your current games implementation
  const currentGamesLoading = false;
  const currentGamesError = null;

  /**
   * Fetch scores for a specific league and date
   */
  const fetchScores = useCallback(async (league: string, date?: string): Promise<void> => {
    // Don't fetch if already loading
    if (scoresLoading) {
      return;
    }

    try {
      const params: Record<string, string> = { league };
      if (date) {
        params.date = date;
      }
      const apiUrl = buildApiUrl('/api/v1/scores', params);
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch scores: ${response.status}`);
      }
      const data = await response.json();
      console.log(`✅ Scores received for ${league}:`, data);
    } catch (err) {
      console.error('Failed to fetch scores:', err);
      // Set error state
      dispatch(setLeagueError({ league, error: err instanceof Error ? err.message : 'Failed to fetch scores' }));
    }
  }, [scoresLoading]);

  /**
   * Fetch team profiles for a specific league
   */
  const fetchTeamProfiles = useCallback(async (league: string): Promise<void> => {
    // Don't fetch if already loading or data exists
    if (teamProfilesLoading || teamProfiles) {
      return;
    }

    try {
      const apiUrl = buildApiUrl('/api/team-profile', { league });
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch team profiles: ${response.status}`);
      }
      const data = await response.json();
      console.log(`✅ Team profiles received for ${league}:`, data);
      
      // Update Redux state
      dispatch(setLeagueTeamProfiles({ league, data }));
    } catch (err) {
      console.error('Failed to fetch team profiles:', err);
      // Set error state
      dispatch(setLeagueError({ league, error: err instanceof Error ? err.message : 'Failed to fetch team profiles' }));
    }
  }, [teamProfilesLoading, teamProfiles, dispatch]);

  /**
   * Fetch box score for a specific game ID and league
   */
  const fetchBoxScore = useCallback(async (league: string, gameId: string): Promise<void> => {
    try {
      const url = buildApiUrl('/api/v1/box-score', { 
        league,
        game_id: gameId
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Deserialize the response and update state
      const boxScoreResponse = BoxScoreResponse.fromJSON(data);
      setMlbBoxScore(boxScoreResponse);
    } catch (err) {
      console.error('Failed to fetch box score:', err);
    }
  }, []);

  /**
   * Fetch stadiums/venues for a specific league
   */
  const fetchStadiums = useCallback(async (league: string): Promise<void> => {
    // Don't fetch if already loading or data exists
    if (stadiumsLoading || stadiums) {
      return;
    }

    try {
      const apiUrl = buildApiUrl('/api/v1/venues', { league });
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch stadiums: ${response.status}`);
      }
      const data = await response.json();
      console.log(`✅ Stadiums received for ${league}:`, data);
      
      // Update Redux state
      dispatch(setLeagueStadiums({ league, data }));
    } catch (err) {
      console.error('Failed to fetch stadiums:', err);
      // Set error state
      dispatch(setLeagueError({ league, error: err instanceof Error ? err.message : 'Failed to fetch stadiums' }));
    }
  }, [stadiumsLoading, stadiums, dispatch]);

  /**
   * Fetch schedule for specific league and dates (both regular season and postseason)
   */
  const fetchSchedule = useCallback(async (league: string, date?: string): Promise<void> => {
    // Don't fetch if already loading
    if (scheduleLoading) {
      return;
    }

    try {
      const params: Record<string, string> = { league };
      if (date) {
        params.date = date;
      }
      // Determine if this is a postseason date using config
      const isPostseason = date ? isPostseasonDate(league as League, date) : false;
      if (isPostseason) {
        params.post = 'true';
      }
      
      const apiUrl = buildApiUrl('/api/v1/schedule', params);
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`);
      }
      const data = await response.json();
      console.log(`✅ Schedule received for ${league}:`, data);
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
    }
  }, [scheduleLoading]);

  /**
   * Fetch odds for a specific league and date
   */
  const fetchOdds = useCallback(async (league: string, date: string): Promise<void> => {
    // Don't fetch if already loading
    if (oddsLoading) {
      return;
    }

    try {
      const apiUrl = buildApiUrl('/api/v1/odds-by-date', { league, date });
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch odds: ${response.status}`);
      }
      const data = await response.json();
      console.log(`✅ Odds received for ${league}:`, data);
    } catch (err) {
      console.error('Failed to fetch odds by date:', err);
    }
  }, [oddsLoading]);

  /**
   * Fetch current games for a date range
   */
  const fetchCurrentGames = useCallback(async (league: string, start: string, end: string): Promise<void> => {
    try {
      const apiUrl = buildApiUrl('/api/v1/current-games', { league, start, end });
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch current games: ${response.status}`);
      }
      const data = await response.json();
      console.log(`✅ Current games received for ${league}:`, data);
    } catch (err) {
      console.error('Failed to fetch current games:', err);
    }
  }, []);

  return {
    // State
    scores,
    teamProfiles,
    stadiums,
    schedule,
    odds,
    currentGames,
    mlbBoxScore, // Keep this for now as it's used in box score components
    // Loading states
    scoresLoading,
    teamProfilesLoading,
    stadiumsLoading,
    scheduleLoading,
    oddsLoading,
    currentGamesLoading,
    // Error states
    scoresError,
    teamProfilesError,
    stadiumsError,
    scheduleError,
    oddsError,
    currentGamesError,
    // Actions
    fetchScores,
    fetchTeamProfiles,
    fetchBoxScore,
    fetchStadiums,
    fetchSchedule,
    fetchCurrentGames,
    fetchOddsByDate: fetchOdds,
  };
};

export default useArb;
