import { useCallback, useState } from "react";
import { MLBScoresResponse, MLBTeamProfilesResponse, BoxScoreResponse, StadiumsResponse } from '../schema';
import { useAppSelector } from '../store/hooks';
import { buildApiUrl } from '../config';


/**
 * Hook for Arbitration API calls
 */
const useArb = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mlbScores, setMlbScores] = useState<MLBScoresResponse | null>(null);
  const [mlbTeamProfiles, setMlbTeamProfiles] = useState<MLBTeamProfilesResponse | null>(null);
  const [mlbBoxScore, setMlbBoxScore] = useState<BoxScoreResponse | null>(null);
  const [mlbStadiums, setMlbStadiums] = useState<StadiumsResponse | null>(null);
  
  // Read selected league from Redux state
  const selectedLeague = useAppSelector((state) => state.sportsData.selectedLeague);

  /**
   * Fetch MLB scores for a specific date
   */
  const fetchMLBScores = useCallback(async (date?: string): Promise<void> => {
    // Only fetch if MLB is selected
    if (selectedLeague !== 'mlb') {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = { league: 'mlb' };
      if (date) {
        params.date = date;
      }
      
      const url = buildApiUrl('/api/v1/scores', params);

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
      const scoresResponse = MLBScoresResponse.fromJSON(data);
      setMlbScores(scoresResponse);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
    }
  }, [selectedLeague]);

  /**
   * Fetch MLB team profiles
   */
  const fetchMLBTeamProfiles = useCallback(async (): Promise<void> => {
    // Only fetch if MLB is selected
    if (selectedLeague !== 'mlb') {
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = buildApiUrl('/api/team-profile', { league: 'mlb' });

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
      const teamProfilesResponse = MLBTeamProfilesResponse.fromJSON(data);
      setMlbTeamProfiles(teamProfilesResponse);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
    }
  }, [selectedLeague]);

  /**
   * Fetch MLB box score for a specific game ID
   */
  const fetchMLBBoxScore = useCallback(async (gameId: string): Promise<void> => {
    // Only fetch if MLB is selected
    if (selectedLeague !== 'mlb') {
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = buildApiUrl('/api/v1/box-score', { 
        league: 'mlb',
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
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
    }
  }, [selectedLeague]);

  /**
   * Fetch MLB stadiums/venues
   */
  const fetchMLBStadiums = useCallback(async (): Promise<void> => {
    // Only fetch if MLB is selected
    if (selectedLeague !== 'mlb') {
        return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = buildApiUrl('/api/v1/venues', { 
        league: 'mlb'
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
      const stadiumsResponse = StadiumsResponse.fromJSON(data);
      setMlbStadiums(stadiumsResponse);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
    }
  }, [selectedLeague]);

  return {
    // State
    mlbScores,
    mlbTeamProfiles,
    mlbBoxScore,
    mlbStadiums,
    loading,
    error,
    // Actions
    fetchMLBScores,
    fetchMLBTeamProfiles,
    fetchMLBBoxScore,
    fetchMLBStadiums,
  };
};

export default useArb;
