import { createSlice } from '@reduxjs/toolkit';

// Load user from local storage
// (a corrupted/blocked localStorage entry must not crash the whole app on startup)
const loadUser = () => {
  try {
    const raw = localStorage.getItem('userInfo');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
const userInfoFromStorage = loadUser();

const initialState = {
  userInfo: userInfoFromStorage,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // === 1. RENAMED 'userLogin' to 'setCredentials' ===
    // This matches what LoginPage.jsx is looking for
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },

    // === 2. RENAMED 'userLogout' to 'logout' ===
    // (Optional, but standardizes the name)
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
      // The cart/shipping address live in the persisted `cart` slice, which
      // clears itself when this action fires (see cartSlice extraReducers).
    }
  },
});

// === 3. EXPORT THE NEW NAMES ===
export const { setCredentials, logout } = userSlice.actions;

export default userSlice.reducer;