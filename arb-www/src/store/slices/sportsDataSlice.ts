import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

import { leagues, boxScoreData, MockLeague, forYouFeed } from '../../services/MockData.ts';
import { buildApiUrl, Tab } from '../../config';
import { TwitterSearchResponse } from '../../schema/twitterapi';
import { RedditGameThreadCommentsResponse } from '../../schema/redditGameThreadComments';
import { getCurrentLocalDate } from '../../utils.ts';

// Async thunk for fetching box score data
export const fetchBoxScore = createAsyncThunk(
  'sportsData/fetchBoxScore',
  async ({ league, gameId, scoreId }: { league: string; gameId: string; scoreId?: string }) => {
    // For NFL, use score_id parameter; for other leagues, use game_id
    const params: Record<string, string> = league.toLowerCase() === 'nfl' && scoreId 
      ? { league, score_id: scoreId }
      : { league, game_id: gameId };
    
    const apiUrl = buildApiUrl('/api/v1/box-score', params);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch box score');
    }
    const data = await response.json();
    return { gameId, data };
  }
);

// Async thunk for fetching Twitter data
export const fetchTwitterData = createAsyncThunk(
  'sportsData/fetchTwitterData',
  async ({ query, queryType = 'Latest' }: { query: string; queryType?: 'Top' | 'Latest' }) => {
    
    const params: { query: string; queryType?: string } = { query, queryType };
    
    const apiUrl = buildApiUrl('/api/v1/twitter-search', params);
    
    const response = await fetch(apiUrl);
    
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
    return data;
  }
);


// Async thunk for finding Reddit game thread
export const findRedditGameThread = createAsyncThunk(
  'sportsData/findRedditGameThread',
  async ({ subreddit, league }: { subreddit: string; league: string }, { rejectWithValue }) => {
    try {
      const url = buildApiUrl('/api/v1/reddit-thread', { subreddit, league });
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No game thread found for this subreddit');
        }
        throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
      }
      
      return { success: true, subreddit };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Async thunk for fetching Reddit game thread comments
export const fetchRedditGameThreadComments = createAsyncThunk(
  'sportsData/fetchRedditGameThreadComments',
  async ({ subreddit, gameId, kind, bypassCache }: { subreddit: string; gameId: string; kind?: string; bypassCache?: boolean }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { sportsData: SportsDataState };
      const sortKind = kind || state.sportsData.redditSortKind;
      
      const url = buildApiUrl('/api/v1/reddit-thread-comments', { 
        subreddit, 
        game_id: gameId,
        kind: sortKind,
        cache: bypassCache ? 'false' : 'true'
      });
      
      
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No game thread found for this subreddit. Please find the game thread first.');
        }
        throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      const redditResponse = RedditGameThreadCommentsResponse.fromJSON(data);
      
      
      return redditResponse;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

// Async thunk for loading more Twitter data (pagination)
export const loadMoreTwitterData = createAsyncThunk(
  'sportsData/loadMoreTwitterData',
  async ({ query, filter = 'latest', cursor }: { query: string; filter?: 'top' | 'latest'; cursor: string }) => {
    const params: { query: string; queryType?: string; cursor: string } = { query, cursor };
    if (filter === 'top') {
      params.queryType = 'Top';
    } else {
      params.queryType = 'Latest';
    }
    const apiUrl = buildApiUrl('/api/v1/twitter-search', params);
    const response = await fetch(apiUrl);
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
    return data;
  }
);

// Async thunk for fetching odds by date
export const fetchOddsByDate = createAsyncThunk(
  'sportsData/fetchOddsByDate',
  async ({ league, date }: { league: string; date: string }) => {
    const apiUrl = buildApiUrl('/api/v1/odds-by-date', { league, date });
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch odds by date');
    }
    const data = await response.json();
    return data;
  }
);

// Generic async thunk for fetching scores
export const fetchScores = createAsyncThunk(
  'sportsData/fetchScores',
  async ({ league, date }: { league: string; date?: string }) => {
    const params: Record<string, string> = { league };
    if (date) {
      params.date = date;

    }
    const apiUrl = buildApiUrl('/api/v1/scores', params);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${league} scores`);
    }
    const data = await response.json();
    return { league, data };
  }
);

// Generic async thunk for fetching team profiles
export const fetchTeamProfiles = createAsyncThunk(
  'sportsData/fetchTeamProfiles',
  async ({ league }: { league: string }) => {
    const apiUrl = buildApiUrl('/api/team-profile', { league });
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${league} team profiles`);
    }
    const data = await response.json();
    return { league, data };
  }
);

// Generic async thunk for fetching stadiums
export const fetchStadiums = createAsyncThunk(
  'sportsData/fetchStadiums',
  async ({ league }: { league: string }) => {
    const apiUrl = buildApiUrl('/api/v1/stadiums', { league });
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${league} stadiums`);
    }
    const data = await response.json();
    return { league, data };
  }
);

// Generic async thunk for fetching schedule
export const fetchSchedule = createAsyncThunk(
  'sportsData/fetchSchedule',
  async ({ league, date }: { league: string; date?: string }) => {
    const params: Record<string, string> = { league };
    if (date) {
      params.date = date;
    }
    const apiUrl = buildApiUrl('/api/v1/schedule', params);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${league} schedule`);
    }
    const data = await response.json();
    return { league, data };
  }
);

// Generic async thunk for fetching current games
export const fetchCurrentGames = createAsyncThunk(
  'sportsData/fetchCurrentGames',
  async ({ league, start, end }: { league: string; start: string; end: string }) => {
    const params: Record<string, string> = { 
      league,
      start,
      end
    };
    const apiUrl = buildApiUrl('/api/v1/current-games', params);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${league} current games`);
    }
    const data = await response.json();
    return { league, data };
  }
);

// Generic league data structure
interface LeagueData {
  scores: any | null;
  scoresLoading: boolean;
  scoresError: string | null;
  teamProfiles: any | null;
  teamProfilesLoading: boolean;
  teamProfilesError: string | null;
  stadiums: any | null;
  stadiumsLoading: boolean;
  stadiumsError: string | null;
  schedule: any | null;
  scheduleLoading: boolean;
  scheduleError: string | null;
  odds: any | null;
  oddsLoading: boolean;
  oddsError: string | null;
  currentGames: any | null;
  currentGamesLoading: boolean;
  currentGamesError: string | null;
  error: string | null;
}

interface SportsDataState {
  leagues: MockLeague[];
  selectedLeague: string;
  activeTab: string;
  selectedDate: string; // ISO date string (YYYY-MM-DD)
  leagueData: Record<string, LeagueData>; // Generic league data structure
  forYouFeed: typeof forYouFeed;
  boxScoreData: typeof boxScoreData;
  boxScoreLoading: boolean;
  boxScoreError: string | null;
  boxScoreRequests: string[]; // Track which game IDs are currently being fetched
  // Twitter state
  twitterData: TwitterSearchResponse | null;
  twitterLoading: boolean;
  twitterError: string | null;
  twitterSearchQuery: string;
  twitterHasSearched: boolean;
  twitterLoadingMore: boolean;
  twitterSortKind: 'top' | 'latest';
  // Reddit state
  redditCommentsData: RedditGameThreadCommentsResponse | null;
  redditCommentsLoading: boolean;
  redditCommentsError: string | null;
  redditGameThreadLoading: boolean;
  redditGameThreadError: string | null;
  redditGameThreadFound: boolean;
  redditHasSearched: boolean;
  redditSortKind: 'top' | 'new';
  // Boxscore view state
  boxscoreView: 'stats' | 'social';
  socialPlatform: 'reddit' | 'twitter';
  // Global odds state (for backward compatibility)
  oddsByDate: any | null;
  oddsLoading: boolean;
  oddsError: string | null;
}

const initialState: SportsDataState = {
  leagues,
  selectedLeague: '',
  activeTab: Tab.SCORES,
  selectedDate: getCurrentLocalDate(), // Today's date in YYYY-MM-DD format using centralized function
  leagueData: {}, // Will be populated dynamically as leagues are accessed
  forYouFeed: [],
  boxScoreData,
  boxScoreLoading: false,
  boxScoreError: null,
  boxScoreRequests: [],
  // Twitter state
  twitterData: null,
  twitterLoading: false,
  twitterError: null,
  twitterSearchQuery: '',
  twitterHasSearched: false,
  twitterLoadingMore: false,
  // Reddit state
  redditCommentsData: null,
  redditCommentsLoading: false,
  redditCommentsError: null,
  redditGameThreadLoading: false,
  redditGameThreadError: null,
  redditGameThreadFound: false,
  redditHasSearched: false,
  redditSortKind: 'new' as const,
  twitterSortKind: 'latest' as const,
  // Boxscore view state
  boxscoreView: 'stats',
  socialPlatform: 'reddit',
  // Global odds state (for backward compatibility)
  oddsByDate: null,
  oddsLoading: false,
  oddsError: null,
};

const sportsDataSlice = createSlice({
  name: 'sportsData',
  initialState,
  reducers: {
    setSelectedLeague: (state, action: PayloadAction<string>) => {
      state.selectedLeague = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTab = action.payload;
    },
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
    },
    // Twitter actions
    setTwitterSearchQuery: (state, action: PayloadAction<string>) => {
      state.twitterSearchQuery = action.payload;
    },
    setTwitterHasSearched: (state, action: PayloadAction<boolean>) => {
      state.twitterHasSearched = action.payload;
    },
    clearTwitterData: (state) => {
      state.twitterData = null;
      state.twitterError = null;
    },
    // Reddit actions
    setRedditHasSearched: (state, action: PayloadAction<boolean>) => {
      state.redditHasSearched = action.payload;
    },
    clearRedditData: (state) => {
      state.redditCommentsData = null;
      state.redditCommentsError = null;
      state.redditGameThreadFound = false;
      state.redditGameThreadError = null;
    },
    // Boxscore view actions
    setBoxscoreView: (state, action: PayloadAction<'stats' | 'social'>) => {
      state.boxscoreView = action.payload;
    },
    setSocialPlatform: (state, action: PayloadAction<'reddit' | 'twitter'>) => {
      state.socialPlatform = action.payload;
    },
    setRedditSortKind: (state, action: PayloadAction<'top' | 'new'>) => {
      state.redditSortKind = action.payload;
    },
    setTwitterSortKind: (state, action: PayloadAction<'top' | 'latest'>) => {
      state.twitterSortKind = action.payload;
    },
    // Generic league data actions
    setLeagueScores: (state, action: PayloadAction<{league: string, data: any}>) => {
      const { league, data } = action.payload;
      if (!state.leagueData[league]) {
        state.leagueData[league] = {
          scores: null,
          scoresLoading: false,
          scoresError: null,
          teamProfiles: null,
          teamProfilesLoading: false,
          teamProfilesError: null,
          stadiums: null,
          stadiumsLoading: false,
          stadiumsError: null,
          schedule: null,
          scheduleLoading: false,
          scheduleError: null,
          odds: null,
          oddsLoading: false,
          oddsError: null,
          currentGames: null,
          currentGamesLoading: false,
          currentGamesError: null,
          error: null,
        };
      }
      state.leagueData[league].scores = data;
      state.leagueData[league].scoresError = null;
    },
    setLeagueTeamProfiles: (state, action: PayloadAction<{league: string, data: any}>) => {
      const { league, data } = action.payload;
      if (!state.leagueData[league]) {
        state.leagueData[league] = {
          scores: null,
          scoresLoading: false,
          scoresError: null,
          teamProfiles: null,
          teamProfilesLoading: false,
          teamProfilesError: null,
          stadiums: null,
          stadiumsLoading: false,
          stadiumsError: null,
          schedule: null,
          scheduleLoading: false,
          scheduleError: null,
          odds: null,
          oddsLoading: false,
          oddsError: null,
          currentGames: null,
          currentGamesLoading: false,
          currentGamesError: null,
          error: null,
        };
      }
      state.leagueData[league].teamProfiles = data;
      state.leagueData[league].teamProfilesError = null;
    },
    setLeagueStadiums: (state, action: PayloadAction<{league: string, data: any}>) => {
      const { league, data } = action.payload;
      if (!state.leagueData[league]) {
        state.leagueData[league] = {
          scores: null,
          scoresLoading: false,
          scoresError: null,
          teamProfiles: null,
          teamProfilesLoading: false,
          teamProfilesError: null,
          stadiums: null,
          stadiumsLoading: false,
          stadiumsError: null,
          schedule: null,
          scheduleLoading: false,
          scheduleError: null,
          odds: null,
          oddsLoading: false,
          oddsError: null,
          currentGames: null,
          currentGamesLoading: false,
          currentGamesError: null,
          error: null,
        };
      }
      state.leagueData[league].stadiums = data;
      state.leagueData[league].stadiumsError = null;
    },
    setLeagueSchedule: (state, action: PayloadAction<{league: string, data: any}>) => {
      const { league, data } = action.payload;
      if (!state.leagueData[league]) {
        state.leagueData[league] = {
          scores: null,
          scoresLoading: false,
          scoresError: null,
          teamProfiles: null,
          teamProfilesLoading: false,
          teamProfilesError: null,
          stadiums: null,
          stadiumsLoading: false,
          stadiumsError: null,
          schedule: null,
          scheduleLoading: false,
          scheduleError: null,
          odds: null,
          oddsLoading: false,
          oddsError: null,
          currentGames: null,
          currentGamesLoading: false,
          currentGamesError: null,
          error: null,
        };
      }
      state.leagueData[league].schedule = data;
      state.leagueData[league].scheduleError = null;
    },
    setLeagueOdds: (state, action: PayloadAction<{league: string, data: any}>) => {
      const { league, data } = action.payload;
      if (!state.leagueData[league]) {
        state.leagueData[league] = {
          scores: null,
          scoresLoading: false,
          scoresError: null,
          teamProfiles: null,
          teamProfilesLoading: false,
          teamProfilesError: null,
          stadiums: null,
          stadiumsLoading: false,
          stadiumsError: null,
          schedule: null,
          scheduleLoading: false,
          scheduleError: null,
          odds: null,
          oddsLoading: false,
          oddsError: null,
          currentGames: null,
          currentGamesLoading: false,
          currentGamesError: null,
          error: null,
        };
      }
      state.leagueData[league].odds = data;
      state.leagueData[league].oddsError = null;
    },
    setLeagueCurrentGames: (state, action: PayloadAction<{league: string, data: any}>) => {
      const { league, data } = action.payload;
      if (!state.leagueData[league]) {
        state.leagueData[league] = {
          scores: null,
          scoresLoading: false,
          scoresError: null,
          teamProfiles: null,
          teamProfilesLoading: false,
          teamProfilesError: null,
          stadiums: null,
          stadiumsLoading: false,
          stadiumsError: null,
          schedule: null,
          scheduleLoading: false,
          scheduleError: null,
          odds: null,
          oddsLoading: false,
          oddsError: null,
          currentGames: null,
          currentGamesLoading: false,
          currentGamesError: null,
          error: null,
        };
      }
      state.leagueData[league].currentGames = data;
      state.leagueData[league].currentGamesError = null;
    },
    setLeagueLoading: (state, action: PayloadAction<{league: string, dataType: keyof LeagueData, loading: boolean}>) => {
      const { league, dataType, loading } = action.payload;
      if (!state.leagueData[league]) {
        state.leagueData[league] = {
          scores: null,
          scoresLoading: false,
          scoresError: null,
          teamProfiles: null,
          teamProfilesLoading: false,
          teamProfilesError: null,
          stadiums: null,
          stadiumsLoading: false,
          stadiumsError: null,
          schedule: null,
          scheduleLoading: false,
          scheduleError: null,
          odds: null,
          oddsLoading: false,
          oddsError: null,
          currentGames: null,
          currentGamesLoading: false,
          currentGamesError: null,
          error: null,
        };
      }
      state.leagueData[league][`${dataType}Loading` as keyof LeagueData] = loading as any;
    },
    setLeagueError: (state, action: PayloadAction<{league: string, dataType: keyof LeagueData, error: string}>) => {
      const { league, dataType, error } = action.payload;
      if (!state.leagueData[league]) {
        state.leagueData[league] = {
          scores: null,
          scoresLoading: false,
          scoresError: null,
          teamProfiles: null,
          teamProfilesLoading: false,
          teamProfilesError: null,
          stadiums: null,
          stadiumsLoading: false,
          stadiumsError: null,
          schedule: null,
          scheduleLoading: false,
          scheduleError: null,
          odds: null,
          oddsLoading: false,
          oddsError: null,
          currentGames: null,
          currentGamesLoading: false,
          currentGamesError: null,
          error: null,
        };
      }
      state.leagueData[league][`${dataType}Error` as keyof LeagueData] = error as any;
    },
    clearLeagueData: (state, action: PayloadAction<string>) => {
      const league = action.payload;
      if (state.leagueData[league]) {
        state.leagueData[league] = {
          scores: null,
          scoresLoading: false,
          scoresError: null,
          teamProfiles: null,
          teamProfilesLoading: false,
          teamProfilesError: null,
          stadiums: null,
          stadiumsLoading: false,
          stadiumsError: null,
          schedule: null,
          scheduleLoading: false,
          scheduleError: null,
          odds: null,
          oddsLoading: false,
          oddsError: null,
          currentGames: null,
          currentGamesLoading: false,
          currentGamesError: null,
          error: null,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoxScore.pending, (state, action) => {
        state.boxScoreLoading = true;
        state.boxScoreError = null;
        // Add the gameId to the requests array
        if (!state.boxScoreRequests.includes(action.meta.arg.gameId)) {
          state.boxScoreRequests.push(action.meta.arg.gameId);
        }
      })
      .addCase(fetchBoxScore.fulfilled, (state, action) => {
        state.boxScoreLoading = false;
        state.boxScoreError = null;
        // Remove the gameId from the requests array
        state.boxScoreRequests = state.boxScoreRequests.filter(id => id !== action.payload.gameId);
        // Store the box score data using the gameId as the key
        state.boxScoreData[action.payload.gameId as keyof typeof state.boxScoreData] = action.payload.data;
      })
      .addCase(fetchBoxScore.rejected, (state, action) => {
        state.boxScoreLoading = false;
        state.boxScoreError = action.error.message || 'Failed to fetch box score';
        // Remove the gameId from the requests array
        state.boxScoreRequests = state.boxScoreRequests.filter(id => id !== action.meta.arg.gameId);
      })
      .addCase(fetchTwitterData.pending, (state) => {
        state.twitterLoading = true;
        state.twitterError = null;
      })
      .addCase(fetchTwitterData.fulfilled, (state, action) => {
        state.twitterLoading = false;
        state.twitterData = action.payload;
        state.twitterError = null;
      })
      .addCase(fetchTwitterData.rejected, (state, action) => {
        state.twitterLoading = false;
        state.twitterError = action.error.message || 'Failed to fetch Twitter data';
      })
      .addCase(loadMoreTwitterData.pending, (state) => {
        state.twitterLoadingMore = true;
        state.twitterError = null;
      })
      .addCase(loadMoreTwitterData.fulfilled, (state, action) => {
        state.twitterLoadingMore = false;
        if (state.twitterData && action.payload) {
          // Create a map of existing tweet IDs to avoid duplicates
          const existingTweetIds = new Set(state.twitterData.tweets.map(tweet => tweet.id));
          
          // Filter out duplicate tweets from new data
          const newTweets = action.payload.tweets.filter((tweet: any) => !existingTweetIds.has(tweet.id));
          
          // If no new tweets were added, we might be stuck in a loop
          if (newTweets.length === 0) {
            state.twitterData.has_next_page = false;
          } else {
            // Append only new tweets to existing ones
            state.twitterData.tweets = [...state.twitterData.tweets, ...newTweets];
          }
          
          // Update pagination info
          state.twitterData.has_next_page = action.payload.has_next_page;
          state.twitterData.next_cursor = action.payload.next_cursor;
        }
        state.twitterError = null;
      })
      .addCase(loadMoreTwitterData.rejected, (state, action) => {
        state.twitterLoadingMore = false;
        state.twitterError = action.error.message || 'Failed to load more Twitter data';
      })
      // Reddit game thread reducers
      .addCase(findRedditGameThread.pending, (state) => {
        state.redditGameThreadLoading = true;
        state.redditGameThreadError = null;
        state.redditGameThreadFound = false;
      })
      .addCase(findRedditGameThread.fulfilled, (state) => {
        state.redditGameThreadLoading = false;
        state.redditGameThreadFound = true;
        state.redditGameThreadError = null;
      })
      .addCase(findRedditGameThread.rejected, (state, action) => {
        state.redditGameThreadLoading = false;
        state.redditGameThreadFound = false;
        state.redditGameThreadError = action.error.message || 'Failed to find Reddit game thread';
      })
      // Reddit comments reducers
      .addCase(fetchRedditGameThreadComments.pending, (state) => {
        state.redditCommentsLoading = true;
        state.redditCommentsError = null;
      })
      .addCase(fetchRedditGameThreadComments.fulfilled, (state, action) => {
        state.redditCommentsLoading = false;
        
        // Get the gameId from the action meta to check if we're switching games
        const newGameId = action.meta.arg.gameId;
        const currentGameId = state.redditCommentsData?.game_id;
        
        // If we're switching to a different game, clear existing comments
        if (currentGameId && currentGameId !== newGameId) {
          state.redditCommentsData = action.payload;
        } else {
          // Combine comments from both teams and sort by timestamp (same game)
          if (state.redditCommentsData) {
            // Merge with existing comments
            const existingComments = state.redditCommentsData.posts?.[0]?.comments || [];
            const newComments = action.payload.posts?.[0]?.comments || [];
            
            // Create a map to deduplicate by comment ID
            const commentMap = new Map();
            
            // Add existing comments to map
            existingComments.forEach(comment => {
              commentMap.set(comment.id, comment);
            });
            
            // Add new comments to map (this will overwrite duplicates)
            newComments.forEach(comment => {
              commentMap.set(comment.id, comment);
            });
            
            // Convert back to array and sort by timestamp (newest first)
            const combinedComments = Array.from(commentMap.values())
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            
            // Update the data with combined comments
            state.redditCommentsData = {
              ...action.payload,
              posts: [{
                ...action.payload.posts[0],
                comments: combinedComments
              }]
            };
          } else {
            // First set of comments
            state.redditCommentsData = action.payload;
          }
        }
        
        state.redditCommentsError = null;
        state.redditHasSearched = true;
      })
      .addCase(fetchRedditGameThreadComments.rejected, (state, action) => {
        state.redditCommentsLoading = false;
        state.redditCommentsError = action.error.message || 'Failed to fetch Reddit comments';
      })
      .addCase(fetchOddsByDate.pending, (state) => {
        state.oddsLoading = true;
        state.oddsError = null;
      })
      .addCase(fetchOddsByDate.fulfilled, (state, action) => {
        state.oddsLoading = false;
        state.oddsByDate = action.payload;
        state.oddsError = null;
      })
      .addCase(fetchOddsByDate.rejected, (state, action) => {
        state.oddsLoading = false;
        state.oddsError = action.error.message || 'Failed to fetch odds data';
      })
      // Generic scores reducers
      .addCase(fetchScores.pending, (state, action) => {
        const { league } = action.meta.arg;
        if (!state.leagueData[league]) {
          state.leagueData[league] = {
            scores: null,
            scoresLoading: false,
            scoresError: null,
            teamProfiles: null,
            teamProfilesLoading: false,
            teamProfilesError: null,
            stadiums: null,
            stadiumsLoading: false,
            stadiumsError: null,
            schedule: null,
            scheduleLoading: false,
            scheduleError: null,
            odds: null,
            oddsLoading: false,
            oddsError: null,
            currentGames: null,
            currentGamesLoading: false,
            currentGamesError: null,
            error: null,
          };
        }
        state.leagueData[league].scoresLoading = true;
        state.leagueData[league].scoresError = null;
      })
      .addCase(fetchScores.fulfilled, (state, action) => {
        const { league, data } = action.payload;
        state.leagueData[league].scoresLoading = false;
        state.leagueData[league].scores = data;
        state.leagueData[league].scoresError = null;
      })
      .addCase(fetchScores.rejected, (state, action) => {
        const { league } = action.meta.arg;
        state.leagueData[league].scoresLoading = false;
        state.leagueData[league].scoresError = action.error.message || 'Failed to fetch scores';
      })
      // Generic team profiles reducers
      .addCase(fetchTeamProfiles.pending, (state, action) => {
        const { league } = action.meta.arg;
        if (!state.leagueData[league]) {
          state.leagueData[league] = {
            scores: null,
            scoresLoading: false,
            scoresError: null,
            teamProfiles: null,
            teamProfilesLoading: false,
            teamProfilesError: null,
            stadiums: null,
            stadiumsLoading: false,
            stadiumsError: null,
            schedule: null,
            scheduleLoading: false,
            scheduleError: null,
            odds: null,
            oddsLoading: false,
            oddsError: null,
            currentGames: null,
            currentGamesLoading: false,
            currentGamesError: null,
            error: null,
          };
        }
        state.leagueData[league].teamProfilesLoading = true;
        state.leagueData[league].teamProfilesError = null;
      })
      .addCase(fetchTeamProfiles.fulfilled, (state, action) => {
        const { league, data } = action.payload;
        state.leagueData[league].teamProfilesLoading = false;
        state.leagueData[league].teamProfiles = data;
        state.leagueData[league].teamProfilesError = null;
      })
      .addCase(fetchTeamProfiles.rejected, (state, action) => {
        const { league } = action.meta.arg;
        state.leagueData[league].teamProfilesLoading = false;
        state.leagueData[league].teamProfilesError = action.error.message || 'Failed to fetch team profiles';
      })
      // Generic stadiums reducers
      .addCase(fetchStadiums.pending, (state, action) => {
        const { league } = action.meta.arg;
        if (!state.leagueData[league]) {
          state.leagueData[league] = {
            scores: null,
            scoresLoading: false,
            scoresError: null,
            teamProfiles: null,
            teamProfilesLoading: false,
            teamProfilesError: null,
            stadiums: null,
            stadiumsLoading: false,
            stadiumsError: null,
            schedule: null,
            scheduleLoading: false,
            scheduleError: null,
            odds: null,
            oddsLoading: false,
            oddsError: null,
            currentGames: null,
            currentGamesLoading: false,
            currentGamesError: null,
            error: null,
          };
        }
        state.leagueData[league].stadiumsLoading = true;
        state.leagueData[league].stadiumsError = null;
      })
      .addCase(fetchStadiums.fulfilled, (state, action) => {
        const { league, data } = action.payload;
        state.leagueData[league].stadiumsLoading = false;
        state.leagueData[league].stadiums = data;
        state.leagueData[league].stadiumsError = null;
      })
      .addCase(fetchStadiums.rejected, (state, action) => {
        const { league } = action.meta.arg;
        state.leagueData[league].stadiumsLoading = false;
        state.leagueData[league].stadiumsError = action.error.message || 'Failed to fetch stadiums';
      })
      // Generic schedule reducers
      .addCase(fetchSchedule.pending, (state, action) => {
        const { league } = action.meta.arg;
        if (!state.leagueData[league]) {
          state.leagueData[league] = {
            scores: null,
            scoresLoading: false,
            scoresError: null,
            teamProfiles: null,
            teamProfilesLoading: false,
            teamProfilesError: null,
            stadiums: null,
            stadiumsLoading: false,
            stadiumsError: null,
            schedule: null,
            scheduleLoading: false,
            scheduleError: null,
            odds: null,
            oddsLoading: false,
            oddsError: null,
            currentGames: null,
            currentGamesLoading: false,
            currentGamesError: null,
            error: null,
          };
        }
        state.leagueData[league].scheduleLoading = true;
        state.leagueData[league].scheduleError = null;
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        const { league, data } = action.payload;
        state.leagueData[league].scheduleLoading = false;
        state.leagueData[league].schedule = data;
        state.leagueData[league].scheduleError = null;
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        const { league } = action.meta.arg;
        state.leagueData[league].scheduleLoading = false;
        state.leagueData[league].scheduleError = action.error.message || 'Failed to fetch schedule';
      })
      // Generic current games reducers
      .addCase(fetchCurrentGames.pending, (state, action) => {
        const { league } = action.meta.arg;
        if (!state.leagueData[league]) {
          state.leagueData[league] = {
            scores: null,
            scoresLoading: false,
            scoresError: null,
            teamProfiles: null,
            teamProfilesLoading: false,
            teamProfilesError: null,
            stadiums: null,
            stadiumsLoading: false,
            stadiumsError: null,
            schedule: null,
            scheduleLoading: false,
            scheduleError: null,
            odds: null,
            oddsLoading: false,
            oddsError: null,
            currentGames: null,
            currentGamesLoading: false,
            currentGamesError: null,
            error: null,
          };
        }
        state.leagueData[league].currentGamesLoading = true;
        state.leagueData[league].currentGamesError = null;
      })
      .addCase(fetchCurrentGames.fulfilled, (state, action) => {
        const { league, data } = action.payload;
        state.leagueData[league].currentGamesLoading = false;
        state.leagueData[league].currentGames = data;
        state.leagueData[league].currentGamesError = null;
      })
      .addCase(fetchCurrentGames.rejected, (state, action) => {
        const { league } = action.meta.arg;
        state.leagueData[league].currentGamesLoading = false;
        state.leagueData[league].currentGamesError = action.error.message || 'Failed to fetch current games';
      });
  },
});

export const { 
  setSelectedLeague, 
  setActiveTab, 
  setSelectedDate,
  setTwitterSearchQuery,
  setTwitterHasSearched,
  clearTwitterData,
  setRedditHasSearched,
  clearRedditData,
  setBoxscoreView,
  setSocialPlatform,
  setRedditSortKind,
  setTwitterSortKind,
  // Generic league data actions
  setLeagueScores,
  setLeagueTeamProfiles,
  setLeagueStadiums,
  setLeagueSchedule,
  setLeagueOdds,
  setLeagueCurrentGames,
  setLeagueLoading,
  setLeagueError,
  clearLeagueData
} = sportsDataSlice.actions;
export default sportsDataSlice.reducer;