import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { mockData, leagues, forYouFeed, boxScoreData, League } from '../../services/mockDataService';

interface SportsDataState {
  leagues: League[];
  selectedLeague: string;
  leagueData: typeof mockData;
  forYouFeed: typeof forYouFeed;
  boxScoreData: typeof boxScoreData;
}

const initialState: SportsDataState = {
  leagues,
  selectedLeague: 'nfl',
  leagueData: mockData,
  forYouFeed,
  boxScoreData,
};

const sportsDataSlice = createSlice({
  name: 'sportsData',
  initialState,
  reducers: {
    setSelectedLeague: (state, action: PayloadAction<string>) => {
      state.selectedLeague = action.payload;
    },
    // In the future, you can add actions to fetch real data
    // loadLeagueData: (state, action) => { ... }
  },
});

export const { setSelectedLeague } = sportsDataSlice.actions;
export default sportsDataSlice.reducer;