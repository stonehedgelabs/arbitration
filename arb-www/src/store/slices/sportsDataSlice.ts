import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { mockData, leagues, forYouFeed, boxScoreData, MockLeague } from '../../services/MockData.ts';
import { buildApiUrl } from '../../config';
import { TwitterSearchResponse } from '../../schema/twitterapi';
import { RedditGameThreadCommentsResponse } from '../../schema/redditGameThreadComments';
import { MLBOddsByDateResponse } from '../../schema/mlb/odds';
import { MLBScoresResponse, MLBTeamProfilesResponse, StadiumsResponse, MLBScheduleResponse } from '../../schema/mlb';
import { getCurrentLocalDate } from '../../utils.ts';

// Async thunk for fetching box score data
export const fetchBoxScore = createAsyncThunk(
  'sportsData/fetchBoxScore',
  async ({ league, gameId }: { league: string; gameId: string }) => {
    const apiUrl = buildApiUrl('/api/v1/box-score', { league, game_id: gameId });
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
  async ({ query, filter = 'latest' }: { query: string; filter?: 'top' | 'latest' }) => {
    console.log('🔍 fetchTwitterData thunk called with:', { query, filter });
    
    const params: { query: string; queryType?: string } = { query };
    if (filter === 'top') {
      params.queryType = 'Top';
    } else {
      params.queryType = 'Latest';
    }
    
    const apiUrl = buildApiUrl('/api/v1/twitter-search', params);
    console.log('🌐 Making request to:', apiUrl);
    
    const response = await fetch(apiUrl);
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      if (response.status === 429) {
        throw new Error('Twitter API rate limit exceeded. Please try again in a few minutes.');
      } else if (response.status === 401) {
        throw new Error('Twitter API authentication failed. Please check the API key configuration.');
      } else {
        throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
      }
    }
    
    const data = await response.json();
    console.log('✅ Twitter data received:', data);
    return data;
  }
);


// Async thunk for finding Reddit game thread
export const findRedditGameThread = createAsyncThunk(
  'sportsData/findRedditGameThread',
  async (subreddit: string, { rejectWithValue }) => {
    try {
      const url = buildApiUrl('/api/v1/reddit-thread', { subreddit });
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
  async ({ subreddit, gameId, kind }: { subreddit: string; gameId: string; kind?: string }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { sportsData: SportsDataState };
      const sortKind = kind || state.sportsData.redditSortKind;
      
      const url = buildApiUrl('/api/v1/reddit-thread-comments', { 
        subreddit, 
        game_id: gameId,
        kind: sortKind
      });
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No game thread found for this subreddit. Please find the game thread first.');
        }
        throw new Error(`Reddit API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return RedditGameThreadCommentsResponse.fromJSON(data);
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

// Async thunk for fetching MLB scores
export const fetchMLBScores = createAsyncThunk(
  'sportsData/fetchMLBScores',
  async ({ date }: { date?: string } = {}) => {
    const params: Record<string, string> = { league: 'mlb' };
    if (date) {
      params.date = date;
    }
    const apiUrl = buildApiUrl('/api/v1/scores', params);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch MLB scores');
    }
    const data = await response.json();
    return data;
  }
);

// Async thunk for fetching MLB team profiles
export const fetchMLBTeamProfiles = createAsyncThunk(
  'sportsData/fetchMLBTeamProfiles',
  async () => {
    const apiUrl = buildApiUrl('/api/team-profile', { league: 'mlb' });
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch MLB team profiles');
    }
    const data = await response.json();
    return data;
  }
);

// Async thunk for fetching MLB stadiums
export const fetchMLBStadiums = createAsyncThunk(
  'sportsData/fetchMLBStadiums',
  async () => {
    const apiUrl = buildApiUrl('/api/v1/venues', { league: 'mlb' });
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch MLB stadiums');
    }
    const data = await response.json();
    return data;
  }
);

// Async thunk for fetching MLB schedule
export const fetchMLBSchedule = createAsyncThunk(
  'sportsData/fetchMLBSchedule',
  async ({ date, isPostseason = false }: { date?: string; isPostseason?: boolean } = {}) => {
    const params: Record<string, string> = { league: 'mlb' };
    if (isPostseason) {
      params.post = 'true';
    }
    // Add date as a filter parameter if provided
    if (date) {
      params.date = date;
    }
    const apiUrl = buildApiUrl('/api/v1/schedule', params);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch MLB schedule');
    }
    const data = await response.json();
    return data;
  }
);

// Async thunk for fetching current games
export const fetchCurrentGames = createAsyncThunk(
  'sportsData/fetchCurrentGames',
  async ({ start, end }: { start: string; end: string }) => {
    const params: Record<string, string> = { 
      league: 'mlb',
      start,
      end
    };
    const apiUrl = buildApiUrl('/api/v1/current-games', params);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch current games');
    }
    const data = await response.json();
    return data;
  }
);

interface SportsDataState {
  leagues: MockLeague[];
  selectedLeague: string;
  activeTab: string;
  selectedDate: string; // ISO date string (YYYY-MM-DD)
  leagueData: typeof mockData;
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
  // Odds state
  oddsByDate: MLBOddsByDateResponse | null;
  oddsLoading: boolean;
  oddsError: string | null;
  // MLB data state
  mlbScores: MLBScoresResponse | null;
  mlbScoresLoading: boolean;
  mlbScoresError: string | null;
  mlbTeamProfiles: MLBTeamProfilesResponse | null;
  mlbTeamProfilesLoading: boolean;
  mlbTeamProfilesError: string | null;
  mlbStadiums: StadiumsResponse | null;
  mlbStadiumsLoading: boolean;
  mlbStadiumsError: string | null;
  mlbSchedule: MLBScheduleResponse | null;
  mlbScheduleLoading: boolean;
  mlbScheduleError: string | null;
  currentGames: MLBScheduleResponse | null;
  currentGamesLoading: boolean;
  currentGamesError: string | null;
}

const initialState: SportsDataState = {
  leagues,
  selectedLeague: 'mlb',
  activeTab: 'for-you',
  selectedDate: getCurrentLocalDate(), // Today's date in YYYY-MM-DD format using centralized function
  leagueData: mockData,
  forYouFeed,
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
  // Boxscore view state
  boxscoreView: 'stats',
  socialPlatform: 'reddit',
  // Odds state
  oddsByDate: null,
  oddsLoading: false,
  oddsError: null,
  // MLB data state
  mlbScores: null,
  mlbScoresLoading: false,
  mlbScoresError: null,
  mlbTeamProfiles: null,
  mlbTeamProfilesLoading: false,
  mlbTeamProfilesError: null,
  mlbStadiums: null,
  mlbStadiumsLoading: false,
  mlbStadiumsError: null,
  mlbSchedule: null,
  mlbScheduleLoading: false,
  mlbScheduleError: null,
  currentGames: null,
  currentGamesLoading: false,
  currentGamesError: null,
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
    clearOddsData: (state) => {
      state.oddsByDate = null;
      state.oddsError = null;
    },
    clearMLBData: (state) => {
      state.mlbScores = null;
      state.mlbScoresError = null;
      state.mlbTeamProfiles = null;
      state.mlbTeamProfilesError = null;
      state.mlbStadiums = null;
      state.mlbStadiumsError = null;
      state.mlbSchedule = null;
      state.mlbScheduleError = null;
    },
    // In the future, you can add actions to fetch real data
    // loadLeagueData: (state, action) => { ... }
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
        console.error('Failed to fetch box score:', action.error);
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
        
        // Combine comments from both teams and sort by timestamp
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
      .addCase(fetchMLBScores.pending, (state) => {
        state.mlbScoresLoading = true;
        state.mlbScoresError = null;
      })
      .addCase(fetchMLBScores.fulfilled, (state, action) => {
        state.mlbScoresLoading = false;
        state.mlbScores = action.payload;
        state.mlbScoresError = null;
      })
      .addCase(fetchMLBScores.rejected, (state, action) => {
        state.mlbScoresLoading = false;
        state.mlbScoresError = action.error.message || 'Failed to fetch MLB scores';
      })
      .addCase(fetchMLBTeamProfiles.pending, (state) => {
        state.mlbTeamProfilesLoading = true;
        state.mlbTeamProfilesError = null;
      })
      .addCase(fetchMLBTeamProfiles.fulfilled, (state, action) => {
        state.mlbTeamProfilesLoading = false;
        state.mlbTeamProfiles = action.payload;
        state.mlbTeamProfilesError = null;
      })
      .addCase(fetchMLBTeamProfiles.rejected, (state, action) => {
        state.mlbTeamProfilesLoading = false;
        state.mlbTeamProfilesError = action.error.message || 'Failed to fetch MLB team profiles';
      })
      .addCase(fetchMLBStadiums.pending, (state) => {
        state.mlbStadiumsLoading = true;
        state.mlbStadiumsError = null;
      })
      .addCase(fetchMLBStadiums.fulfilled, (state, action) => {
        state.mlbStadiumsLoading = false;
        state.mlbStadiums = action.payload;
        state.mlbStadiumsError = null;
      })
      .addCase(fetchMLBStadiums.rejected, (state, action) => {
        state.mlbStadiumsLoading = false;
        state.mlbStadiumsError = action.error.message || 'Failed to fetch MLB stadiums';
      })
      .addCase(fetchMLBSchedule.pending, (state) => {
        state.mlbScheduleLoading = true;
        state.mlbScheduleError = null;
      })
      .addCase(fetchMLBSchedule.fulfilled, (state, action) => {
        state.mlbScheduleLoading = false;
        state.mlbSchedule = action.payload;
        state.mlbScheduleError = null;
      })
      .addCase(fetchMLBSchedule.rejected, (state, action) => {
        state.mlbScheduleLoading = false;
        state.mlbScheduleError = action.error.message || 'Failed to fetch MLB schedule';
      })
      .addCase(fetchCurrentGames.pending, (state) => {
        state.currentGamesLoading = true;
        state.currentGamesError = null;
      })
      .addCase(fetchCurrentGames.fulfilled, (state, action) => {
        state.currentGamesLoading = false;
        state.currentGames = action.payload;
        state.currentGamesError = null;
      })
      .addCase(fetchCurrentGames.rejected, (state, action) => {
        state.currentGamesLoading = false;
        state.currentGamesError = action.error.message || 'Failed to fetch current games';
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
  clearOddsData,
  clearMLBData
} = sportsDataSlice.actions;
export default sportsDataSlice.reducer;