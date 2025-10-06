import { useState, useCallback } from 'react';
import { RedditGameThreadCommentsResponse } from '../schema/redditGameThreadComments';
import { buildApiUrl, REDDIT_CONFIG } from '../config';

/**
 * Custom hook for Reddit API operations
 */
const useReddit = () => {
  const [redditData, setRedditData] = useState<RedditGameThreadCommentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Find Reddit game thread for a subreddit
   */
  const findGameThread = useCallback(async (subreddit: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const url = buildApiUrl('/api/v1/reddit-thread', { 
        subreddit: subreddit
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No game thread found for this subreddit.');
        } else if (response.status === 429) {
          throw new Error('Reddit API rate limit exceeded. Please try again in a few minutes.');
        } else if (response.status === 401) {
          throw new Error('Reddit API authentication failed. Please check the API key configuration.');
        } else {
          throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
        }
      }

      // Game thread found and cached successfully
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error finding Reddit game thread:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get Reddit comments for a game thread
   */
  const getGameThreadComments = useCallback(async (subreddit: string, gameId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const url = buildApiUrl('/api/v1/reddit-thread-comments', { 
        subreddit: subreddit, 
        game_id: gameId,
        limit: REDDIT_CONFIG.defaultCommentLimit.toString()
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No game thread found for this subreddit. Please find the game thread first.');
        } else if (response.status === 429) {
          throw new Error('Reddit API rate limit exceeded. Please try again in a few minutes.');
        } else if (response.status === 401) {
          throw new Error('Reddit API authentication failed. Please check the API key configuration.');
        } else {
          throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      const redditResponse = RedditGameThreadCommentsResponse.fromJSON(data);
      setRedditData(redditResponse);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching Reddit comments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generate game thread query for specific teams
   */
  const generateGameThreadQuery = useCallback((awayTeam: string, homeTeam: string, gameId: string): string => {
    return `game thread ${awayTeam} vs ${homeTeam} ${gameId}`;
  }, []);

  /**
   * Clear Reddit data
   */
  const clearRedditData = useCallback(() => {
    setRedditData(null);
    setError(null);
  }, []);

  return {
    // State
    redditData,
    loading,
    error,
    
    // Actions
    findGameThread,
    getGameThreadComments,
    generateGameThreadQuery,
    clearRedditData,
  };
};

export default useReddit;
