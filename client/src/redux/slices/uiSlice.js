import { createSlice } from '@reduxjs/toolkit';

// Transient UI state. Deliberately NOT persisted (the store only persists the
// cart), so the cart drawer is never left open after a page reload.
const uiSlice = createSlice({
  name: 'ui',
  initialState: { cartDrawerOpen: false },
  reducers: {
    openCartDrawer: (state) => { state.cartDrawerOpen = true; },
    closeCartDrawer: (state) => { state.cartDrawerOpen = false; },
  },
});

export const { openCartDrawer, closeCartDrawer } = uiSlice.actions;
export default uiSlice.reducer;
