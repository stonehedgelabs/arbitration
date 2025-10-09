import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.ts';
import sportsDataReducer from './slices/sportsDataSlice.ts';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sportsData: sportsDataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;