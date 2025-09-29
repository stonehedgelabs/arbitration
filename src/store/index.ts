import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sportsDataReducer from './slices/sportsDataSlice';
import favoritesReducer from './slices/favoritesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sportsData: sportsDataReducer,
    favorites: favoritesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;