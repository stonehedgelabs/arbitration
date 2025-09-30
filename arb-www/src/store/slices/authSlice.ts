import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UserType = 'guest' | 'apple' | 'google' | null;

interface AuthState {
  userType: UserType;
  hasSeenWelcome: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  userType: null,
  hasSeenWelcome: !!localStorage.getItem('arb-rs-welcome-seen'),
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserType: (state, action: PayloadAction<UserType>) => {
      state.userType = action.payload;
      state.isAuthenticated = action.payload !== null;
    },
    setHasSeenWelcome: (state, action: PayloadAction<boolean>) => {
      state.hasSeenWelcome = action.payload;
      if (action.payload) {
        localStorage.setItem('arb-rs-welcome-seen', 'true');
      }
    },
    logout: (state) => {
      state.userType = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUserType, setHasSeenWelcome, logout } = authSlice.actions;
export default authSlice.reducer;