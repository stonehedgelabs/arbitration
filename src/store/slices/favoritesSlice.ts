import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FavoritesState {
  teams: string[];
}

const loadFavoritesFromStorage = (userType: string | null): string[] => {
  if (!userType) return [];
  const stored = localStorage.getItem(`sportshub-favorites-${userType}`);
  return stored ? JSON.parse(stored) : [];
};

const initialState: FavoritesState = {
  teams: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    loadFavorites: (state, action: PayloadAction<string>) => {
      state.teams = loadFavoritesFromStorage(action.payload);
    },
    addFavoriteTeam: (state, action: PayloadAction<{ team: string; userType: string }>) => {
      if (!state.teams.includes(action.payload.team)) {
        state.teams.push(action.payload.team);
        localStorage.setItem(
          `sportshub-favorites-${action.payload.userType}`,
          JSON.stringify(state.teams)
        );
      }
    },
    removeFavoriteTeam: (state, action: PayloadAction<{ team: string; userType: string }>) => {
      state.teams = state.teams.filter(team => team !== action.payload.team);
      localStorage.setItem(
        `sportshub-favorites-${action.payload.userType}`,
        JSON.stringify(state.teams)
      );
    },
    setFavoriteTeams: (state, action: PayloadAction<{ teams: string[]; userType: string }>) => {
      state.teams = action.payload.teams;
      localStorage.setItem(
        `sportshub-favorites-${action.payload.userType}`,
        JSON.stringify(action.payload.teams)
      );
    },
  },
});

export const { loadFavorites, addFavoriteTeam, removeFavoriteTeam, setFavoriteTeams } = favoritesSlice.actions;
export default favoritesSlice.reducer;