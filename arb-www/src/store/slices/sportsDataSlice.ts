import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { mockData, leagues, forYouFeed, boxScoreData, League } from '../../services/MockData.ts';
import { buildApiUrl } from '../../config';
import { TwitterSearchResponse } from '../../schema/twitterapi';

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
  async (query: string) => {
    const apiUrl = buildApiUrl('/api/v1/twitter-search', { query });
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
    console.log('Twitter data received:', data);
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
}

const initialState: SportsDataState = {
  leagues,
  selectedLeague: 'nfl',
  activeTab: 'for-you',
  selectedDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  leagueData: mockData,
  forYouFeed,
  boxScoreData,
  // Twitter state
  twitterData: null,
  twitterLoading: false,
  twitterError: null,
  twitterSearchQuery: '',
  twitterHasSearched: false,
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