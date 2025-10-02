import { useState, useCallback } from 'react';
import { TwitterSearchResponse } from '../schema/twitterapi';
import { buildApiUrl } from '../config';

/**
 * Custom hook for Twitter API operations
 */
const useTwitter = () => {
  const [twitterData, setTwitterData] = useState<TwitterSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Search tweets using our backend API
   */
  const searchTweets = useCallback(async (query: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const url = buildApiUrl('/api/v1/twitter-search', { query });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Twitter API rate limit exceeded. Please try again in a few minutes.');
        } else if (response.status === 401) {
          throw new Error('Twitter API authentication failed. Please check the API key configuration.');
        } else {
          throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      const twitterResponse = TwitterSearchResponse.fromJSON(data);
      setTwitterData(twitterResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching tweets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate a sports query based on today's games
   */
  const generateSportsQuery = useCallback((teamNames: string[]): string => {
    if (teamNames.length === 0) {
      return 'sports OR baseball OR basketball OR football OR hockey';
    }
    
    // Create a query with team names and common sports terms
    const teamQuery = teamNames.join(' OR ');
    return `(${teamQuery}) AND (game OR score OR win OR loss OR play OR season)`;
  }, []);

  /**
   * Clear Twitter data
   */
  const clearTwitterData = useCallback(() => {
    setTwitterData(null);
    setError(null);
  }, []);

  return {
    // State
    twitterData,
    loading,
    error,
    
    // Actions
    searchTweets,
    generateSportsQuery,
    clearTwitterData,
  };
};

export default useTwitter;
