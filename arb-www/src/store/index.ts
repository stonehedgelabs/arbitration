import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.ts';
import sportsDataReducer from './slices/sportsDataSlice.ts';
import favoritesReducer from './slices/favoritesSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sportsData: sportsDataReducer,
    favorites: favoritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;