import { useCallback, useState } from "react";

import { buildApiUrl } from '../config';
import { BoxScoreResponse } from '../schema';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { 
  setLeagueScores,
  setLeagueTeamProfiles, 
  setLeagueStadiums, 
  setLeagueSchedule,
  setLeagueOdds,
  setLeagueCurrentGames,
  setLeagueLoading,
  setLeagueError 
} from '../store/slices/sportsDataSlice';

/**
 * Generate user-friendly error messages
 */
const getUserFriendlyError = (dataType: string, league: string, error: any): string => {
  const leagueUpper = league.toUpperCase();
  
  // Check if it's a network error
  if (error?.message?.includes('fetch') || error?.message?.includes('NetworkError') || error?.message?.includes('Failed to fetch')) {
    return `Failed to fetch ${leagueUpper} ${dataType}. Network issue`;
  }
  
  // Check if it's a 404 or similar
  if (error?.message?.includes('404') || error?.message?.includes('Not Found')) {
    return `Failed to fetch ${leagueUpper} ${dataType}. Data not available`;
  }
  
  // Check if it's a server error
  if (error?.message?.includes('500') || error?.message?.includes('503') || error?.message?.includes('502')) {
    return `Failed to fetch ${leagueUpper} ${dataType}. Server issue`;
  }
  
  // Default user-friendly message
  return `Failed to fetch ${leagueUpper} ${dataType}. Please try again`;
};



/**
 * Hook for Arbitration API calls
 */
const useArb = () => {
  const [mlbBoxScore, setMlbBoxScore] = useState<BoxScoreResponse | null>(null);
  
  const dispatch = useAppDispatch();
  const selectedLeague = useAppSelector((state) => state.sportsData.selectedLeague);
  
  const leagueData = useAppSelector((state) => state.sportsData.leagueData);
  const currentLeagueData = leagueData[selectedLeague];
  
  const scores = currentLeagueData?.scores || null;
  const scoresLoading = currentLeagueData?.scoresLoading || false;
  const scoresError = currentLeagueData?.scoresError || null;
  
  const teamProfiles = currentLeagueData?.teamProfiles || null;
  const teamProfilesLoading = currentLeagueData?.teamProfilesLoading || false;
  const teamProfilesError = currentLeagueData?.teamProfilesError || null;
  
  const stadiums = currentLeagueData?.stadiums || null;
  const stadiumsLoading = currentLeagueData?.stadiumsLoading || false;
  const stadiumsError = currentLeagueData?.stadiumsError || null;
  
  const schedule = currentLeagueData?.schedule || null;
  const scheduleLoading = currentLeagueData?.scheduleLoading || false;
  const scheduleError = currentLeagueData?.scheduleError || null;
  
  const odds = currentLeagueData?.odds || null;
  const oddsLoading = currentLeagueData?.oddsLoading || false;
  const oddsError = currentLeagueData?.oddsError || null;
  
  const currentGames = currentLeagueData?.currentGames || null;
  const currentGamesLoading = currentLeagueData?.currentGamesLoading || false;
  const currentGamesError = currentLeagueData?.currentGamesError || null;

  /**
   * Fetch scores for a specific league and date
   */
  const fetchScores = useCallback(async (league: string, date?: string): Promise<void> => {
    // Don't fetch if already loading
    if (scoresLoading) {
      return;
    }

    try {
      // Set loading state
      dispatch(setLeagueLoading({ league, dataType: 'scores', loading: true }));
      
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
      
      // Update Redux state
      dispatch(setLeagueScores({ league, data }));
      // Reset loading state
      dispatch(setLeagueLoading({ league, dataType: 'scores', loading: false }));
    } catch (err) {
      console.error('Failed to fetch scores:', err);
      // Set error state with user-friendly message
      dispatch(setLeagueError({ league, dataType: 'scores', error: getUserFriendlyError('scores', league, err) }));
      // Reset loading state
      dispatch(setLeagueLoading({ league, dataType: 'scores', loading: false }));
    }
  }, [dispatch]);

  /**
   * Fetch team profiles for a specific league
   */
  const fetchTeamProfiles = useCallback(async (league?: string): Promise<void> => {
    // Don't fetch if already loading or data exists
    if (teamProfilesLoading || teamProfiles || !league) {
      return;
    }

    try {
      // Set loading state
      dispatch(setLeagueLoading({ league, dataType: 'teamProfiles', loading: true }));
      
      const apiUrl = buildApiUrl('/api/team-profile', { league });
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch team profiles: ${response.status}`);
      }
      const data = await response.json();
      
      // Update Redux state
      dispatch(setLeagueTeamProfiles({ league, data }));
      // Reset loading state
      dispatch(setLeagueLoading({ league, dataType: 'teamProfiles', loading: false }));
    } catch (err) {
      console.error('Failed to fetch team profiles:', err);
      // Set error state with user-friendly message
      dispatch(setLeagueError({ league, dataType: 'teamProfiles', error: getUserFriendlyError('team profiles', league, err) }));
      // Reset loading state
      dispatch(setLeagueLoading({ league, dataType: 'teamProfiles', loading: false }));
    }
  }, [teamProfiles, dispatch]);

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
    if (stadiumsLoading || stadiums || !league || !selectedLeague) {
      return;
    }
    try {
      // Set loading state
      dispatch(setLeagueLoading({ league, dataType: 'stadiums', loading: true }));
      
      const apiUrl = buildApiUrl('/api/v1/stadiums', { league });
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch stadiums: ${response.status}`);
      }
      const data = await response.json();
      
      // Update Redux state
      dispatch(setLeagueStadiums({ league, data }));
      // Reset loading state
      dispatch(setLeagueLoading({ league, dataType: 'stadiums', loading: false }));
    } catch (err) {
      console.error('Failed to fetch stadiums:', err);
      // Set error state with user-friendly message
      dispatch(setLeagueError({ league, dataType: 'stadiums', error: getUserFriendlyError('stadiums', league, err) }));
      // Reset loading state
      dispatch(setLeagueLoading({ league, dataType: 'stadiums', loading: false }));
    }
  }, [dispatch]);

  /**
   * Fetch schedule for specific league and dates (both regular season and postseason)
   */
  const fetchSchedule = useCallback(async (league: string, date?: string): Promise<void> => {
    // Don't fetch if already loading or data exists
    if (scheduleLoading || schedule) {
      return;
    }

    try {
      // Set loading state
      dispatch(setLeagueLoading({ league, dataType: 'schedule', loading: true }));
      
      const params: Record<string, string> = { league };
      if (date) {
        params.date = date;
      }
      
      const apiUrl = buildApiUrl('/api/v1/schedule', params);
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`);
      }
      const data = await response.json();
      
      // Update Redux state
      dispatch(setLeagueSchedule({ league, data }));
      // Reset loading state
      dispatch(setLeagueLoading({ league, dataType: 'schedule', loading: false }));
    } catch (err) {
      console.error('Failed to fetch schedule:', err);
      // Set error state with user-friendly message
      dispatch(setLeagueError({ league, dataType: 'schedule', error: getUserFriendlyError('schedule', league, err) }));
      // Reset loading state
      dispatch(setLeagueLoading({ league, dataType: 'schedule', loading: false }));
    }
  }, [schedule, dispatch]);

  /**
   * Fetch odds for a specific league and date
   */
  const fetchOdds = useCallback(async (league: string, date: string): Promise<void> => {
    // Don't fetch if already loading or data exists
    if (oddsLoading || odds) {
      return;
    }

    try {
      // Set loading state
      dispatch(setLeagueLoading({ league, dataType: 'odds', loading: true }));
      
      const apiUrl = buildApiUrl('/api/v1/odds-by-date', { league, date });
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch odds: ${response.status}`);
      }
      const data = await response.json();
      
      // Update Redux state
      dispatch(setLeagueOdds({ league, data }));
      // Reset loading state
      dispatch(setLeagueLoading({ league, dataType: 'odds', loading: false }));
    } catch (err) {
      console.error('Failed to fetch odds by date:', err);
      // Set error state with user-friendly message
      dispatch(setLeagueError({ league, dataType: 'odds', error: getUserFriendlyError('odds', league, err) }));
      // Reset loading state
      dispatch(setLeagueLoading({ league, dataType: 'odds', loading: false }));
    }
  }, [odds, dispatch]);

  /**
   * Fetch current games for a date range
   */
  const fetchCurrentGames = useCallback(async (league: string, start: string, end: string): Promise<void> => {
    try {
      // Set loading state
      dispatch(setLeagueLoading({ league, dataType: 'currentGames', loading: true }));
      
      const apiUrl = buildApiUrl('/api/v1/current-games', { league, start, end });
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch current games: ${response.status}`);
      }
      const data = await response.json();
      
      // Update Redux state
      dispatch(setLeagueCurrentGames({ league, data }));
      // Reset loading state
      dispatch(setLeagueLoading({ league, dataType: 'currentGames', loading: false }));
    } catch (err) {
      console.error('Failed to fetch current games:', err);
      // Set error state with user-friendly message
      dispatch(setLeagueError({ league, dataType: 'currentGames', error: getUserFriendlyError('current games', league, err) }));
      // Reset loading state
      dispatch(setLeagueLoading({ league, dataType: 'currentGames', loading: false }));
    }
  }, [dispatch]);

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
