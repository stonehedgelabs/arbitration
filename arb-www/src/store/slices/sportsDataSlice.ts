import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { mockData, leagues, forYouFeed, boxScoreData, League } from '../../services/MockData.ts';
import { buildApiUrl } from '../../config';
import { TwitterSearchResponse } from '../../schema/twitterapi';
import { getCurrentLocalDate } from '../../utils';

// Async thunk for fetching box score data
export const fetchBoxScore = createAsyncThunk(
  'sportsData/fetchBoxScore',
  async ({ league, gameId }: { league: string; gameId: string }) => {
    const apiUrl = buildApiUrl('/api/v1/box-score', { league, game_id: gameId });
    console.log('Fetching box score from:', apiUrl);
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch box score');
    }
    const data = await response.json();
    console.log('Box score data received:', data);
    return { gameId, data };
  }
);

// Async thunk for fetching Twitter data
export const fetchTwitterData = createAsyncThunk(
  'sportsData/fetchTwitterData',
  async ({ query, filter = 'latest' }: { query: string; filter?: 'top' | 'latest' }) => {
    const params: { query: string; queryType?: string } = { query };
    if (filter === 'top') {
      params.queryType = 'Top';
    } else {
      params.queryType = 'Latest';
    }
    const apiUrl = buildApiUrl('/api/v1/twitter-search', params);
    console.log('Fetching Twitter data from:', apiUrl);
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
    console.log('Initial Twitter data received:', {
      tweetsCount: data.tweets?.length || 0,
      hasNextPage: data.has_next_page,
      nextCursor: data.next_cursor
    });
    return data;
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
    console.log('Loading more Twitter data from:', apiUrl);
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
    console.log('More Twitter data received:', {
      tweetsCount: data.tweets?.length || 0,
      hasNextPage: data.has_next_page,
      nextCursor: data.next_cursor,
      previousCursor: cursor
    });
    return data;
  }
);

interface SportsDataState {
  leagues: League[];
  selectedLeague: string;
  activeTab: string;
  selectedDate: string; // ISO date string (YYYY-MM-DD)
  leagueData: typeof mockData;
  forYouFeed: typeof forYouFeed;
  boxScoreData: typeof boxScoreData;
  // Twitter state
  twitterData: TwitterSearchResponse | null;
  twitterLoading: boolean;
  twitterError: string | null;
  twitterSearchQuery: string;
  twitterHasSearched: boolean;
  twitterLoadingMore: boolean;
}

const initialState: SportsDataState = {
  leagues,
  selectedLeague: 'nfl',
  activeTab: 'for-you',
  selectedDate: getCurrentLocalDate(), // Today's date in YYYY-MM-DD format using centralized function
  leagueData: mockData,
  forYouFeed,
  boxScoreData,
  // Twitter state
  twitterData: null,
  twitterLoading: false,
  twitterError: null,
  twitterSearchQuery: '',
  twitterHasSearched: false,
  twitterLoadingMore: false,
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
    // In the future, you can add actions to fetch real data
    // loadLeagueData: (state, action) => { ... }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoxScore.fulfilled, (state, action) => {
        // Store the box score data using the gameId as the key
        state.boxScoreData[action.payload.gameId as keyof typeof state.boxScoreData] = action.payload.data;
      })
      .addCase(fetchBoxScore.rejected, (_, action) => {
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
            console.log("No new tweets found, stopping pagination to prevent infinite loop");
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
      });
  },
});

export const { 
  setSelectedLeague, 
  setActiveTab, 
  setSelectedDate,
  setTwitterSearchQuery,
  setTwitterHasSearched,
  clearTwitterData
} = sportsDataSlice.actions;
export default sportsDataSlice.reducer;