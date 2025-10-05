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
import { 
  fetchOddsByDate, 
  fetchMLBScores as fetchMLBScoresThunk, 
  fetchMLBTeamProfiles as fetchMLBTeamProfilesThunk, 
  fetchMLBStadiums as fetchMLBStadiumsThunk, 
  fetchMLBSchedule as fetchMLBScheduleThunk,
  fetchCurrentGames as fetchCurrentGamesThunk
} from '../store/slices/sportsDataSlice';

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
  
  // Redux state for all MLB data
  const mlbScores = useAppSelector((state) => state.sportsData.mlbScores);
  const mlbScoresLoading = useAppSelector((state) => state.sportsData.mlbScoresLoading);
  const mlbScoresError = useAppSelector((state) => state.sportsData.mlbScoresError);
  
  const mlbTeamProfiles = useAppSelector((state) => state.sportsData.mlbTeamProfiles);
  const mlbTeamProfilesLoading = useAppSelector((state) => state.sportsData.mlbTeamProfilesLoading);
  const mlbTeamProfilesError = useAppSelector((state) => state.sportsData.mlbTeamProfilesError);
  
  const mlbStadiums = useAppSelector((state) => state.sportsData.mlbStadiums);
  const mlbStadiumsLoading = useAppSelector((state) => state.sportsData.mlbStadiumsLoading);
  const mlbStadiumsError = useAppSelector((state) => state.sportsData.mlbStadiumsError);
  
  const mlbSchedule = useAppSelector((state) => state.sportsData.mlbSchedule);
  const mlbScheduleLoading = useAppSelector((state) => state.sportsData.mlbScheduleLoading);
  const mlbScheduleError = useAppSelector((state) => state.sportsData.mlbScheduleError);
  
  const currentGames = useAppSelector((state) => state.sportsData.currentGames);
  const currentGamesLoading = useAppSelector((state) => state.sportsData.currentGamesLoading);
  const currentGamesError = useAppSelector((state) => state.sportsData.currentGamesError);
  
  const mlbOddsByDate = useAppSelector((state) => state.sportsData.oddsByDate);
  const oddsLoading = useAppSelector((state) => state.sportsData.oddsLoading);
  const oddsError = useAppSelector((state) => state.sportsData.oddsError);

  /**
   * Fetch MLB scores for a specific date
   */
  const fetchMLBScores = useCallback(async (date?: string): Promise<void> => {
    // Only fetch if MLB is selected
    if (selectedLeague !== League.MLB) {
      return;
    }

    // Don't fetch if already loading
    if (mlbScoresLoading) {
      return;
    }

    // For scores, we need to fetch for each date since it's date-specific data
    // The Redux thunk will handle caching at the API level if needed

    try {
      await dispatch(fetchMLBScoresThunk({ date })).unwrap();
    } catch (err) {
      // Error is handled by Redux state
      console.error('Failed to fetch MLB scores:', err);
    }
  }, [dispatch, selectedLeague, mlbScoresLoading]);

  /**
   * Fetch MLB team profiles
   */
  const fetchMLBTeamProfiles = useCallback(async (): Promise<void> => {
    // Only fetch if MLB is selected
    if (selectedLeague !== League.MLB) {
        return;
    }

    // Don't fetch if already loading or data exists
    if (mlbTeamProfilesLoading || mlbTeamProfiles) {
      return;
    }

    try {
      await dispatch(fetchMLBTeamProfilesThunk()).unwrap();
    } catch (err) {
      // Error is handled by Redux state
      console.error('Failed to fetch MLB team profiles:', err);
    }
  }, [dispatch, selectedLeague, mlbTeamProfilesLoading, mlbTeamProfiles]);

  /**
   * Fetch MLB box score for a specific game ID
   */
  const fetchMLBBoxScore = useCallback(async (gameId: string): Promise<void> => {
    // Only fetch if MLB is selected
    if (selectedLeague !== League.MLB) {
        return;
    }

    try {
      const url = buildApiUrl('/api/v1/box-score', { 
        league: League.MLB,
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
      console.error('Failed to fetch MLB box score:', err);
    }
  }, [selectedLeague]);

  /**
   * Fetch MLB stadiums/venues
   */
  const fetchMLBStadiums = useCallback(async (): Promise<void> => {
    // Only fetch if MLB is selected
    if (selectedLeague !== League.MLB) {
        return;
    }

    // Don't fetch if already loading or data exists
    if (mlbStadiumsLoading || mlbStadiums) {
      return;
    }

    try {
      await dispatch(fetchMLBStadiumsThunk()).unwrap();
    } catch (err) {
      // Error is handled by Redux state
      console.error('Failed to fetch MLB stadiums:', err);
    }
  }, [dispatch, selectedLeague, mlbStadiumsLoading, mlbStadiums]);

  /**
   * Fetch MLB schedule for specific dates (both regular season and postseason)
   */
  const fetchMLBSchedule = useCallback(async (date?: string): Promise<void> => {
    // Only fetch if MLB is selected
    if (selectedLeague !== League.MLB) {
        return;
    }

    // Don't fetch if already loading
    if (mlbScheduleLoading) {
      return;
    }

    // For schedule, we need to fetch for each date since it's date-specific data
    // The Redux thunk will handle caching at the API level if needed

    try {
      // Determine if this is a postseason date using config
      const isPostseason = date ? isPostseasonDate(League.MLB, date) : false;
      
      await dispatch(fetchMLBScheduleThunk({ date, isPostseason })).unwrap();
    } catch (err) {
      // Error is handled by Redux state
      console.error('Failed to fetch MLB schedule:', err);
    }
  }, [dispatch, selectedLeague, mlbScheduleLoading]);

  /**
   * Fetch MLB odds for a specific date
   */
  const fetchMLBOddsByDate = useCallback(async (date: string): Promise<void> => {
    // Only fetch if MLB is selected
    if (selectedLeague !== League.MLB) {
      return;
    }

    // Don't fetch if already loading
    if (oddsLoading) {
      return;
    }

    // For odds, we need to fetch for each date since it's date-specific data
    // The Redux thunk will handle caching at the API level if needed

    try {
      await dispatch(fetchOddsByDate({ league: 'mlb', date })).unwrap();
    } catch (err) {
      // Error is handled by Redux state
      console.error('Failed to fetch odds by date:', err);
    }
  }, [dispatch, selectedLeague, oddsLoading]);

  /**
   * Fetch current games for a date range
   */
  const fetchCurrentGames = useCallback(async (start: string, end: string): Promise<void> => {
    // Only fetch if MLB is selected
    if (selectedLeague !== League.MLB) {
      return;
    }

    try {
      await dispatch(fetchCurrentGamesThunk({ start, end })).unwrap();
    } catch (err) {
      // Error is handled by Redux state
      console.error('Failed to fetch current games:', err);
    }
  }, [dispatch]);

  return {
    // State
    mlbScores,
    mlbTeamProfiles,
    mlbBoxScore,
    mlbStadiums,
    mlbSchedule,
    currentGames,
    mlbOddsByDate,
    // Redux loading states
    mlbScoresLoading,
    mlbTeamProfilesLoading,
    mlbStadiumsLoading,
    mlbScheduleLoading,
    currentGamesLoading,
    oddsLoading,
    // Redux error states
    mlbScoresError,
    mlbTeamProfilesError,
    mlbStadiumsError,
    mlbScheduleError,
    currentGamesError,
    oddsError,
    // Actions
    fetchMLBScores,
    fetchMLBTeamProfiles,
    fetchMLBBoxScore,
    fetchMLBStadiums,
    fetchMLBSchedule,
    fetchCurrentGames,
    fetchMLBOddsByDate,
  };
};

export default useArb;
