import { createSlice } from '@reduxjs/toolkit';

// Load user from local storage
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

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
      // Optional: Clean up other data on logout
      localStorage.removeItem('cartItems');
      localStorage.removeItem('shippingAddress');
    }
  },
});

// === 3. EXPORT THE NEW NAMES ===
export const { setCredentials, logout } = userSlice.actions;

export default userSlice.reducer;