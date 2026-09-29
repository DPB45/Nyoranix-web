import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: 'PayPal',
  isDrawerOpen: false,
  cartAnimationKey: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.id === item.id);
      if (existItem) {
        const cap = item.countInStock || existItem.countInStock;
        const quantity = cap
          ? Math.min(existItem.quantity + (item.quantity || 1), cap)
          : existItem.quantity + (item.quantity || 1);
        existItem.quantity = quantity;
        Object.assign(existItem, item, { quantity });
      } else {
        const cap = item.countInStock;
        const quantity = cap ? Math.min(item.quantity || 1, cap) : (item.quantity || 1);
        state.cartItems.push({ ...item, quantity });
      }
      state.isDrawerOpen = true;
      state.cartAnimationKey += 1;
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((x) => x.id === id);
      if (item) item.quantity = Math.max(1, Math.min(Number(quantity), item.countInStock || Number(quantity)));
    },
    openCartDrawer: (state) => { state.isDrawerOpen = true; },
    closeCartDrawer: (state) => { state.isDrawerOpen = false; },
    saveShippingAddress: (state, action) => { state.shippingAddress = action.payload; },
    savePaymentMethod: (state, action) => { state.paymentMethod = action.payload; },
    clearCartItems: (state) => { state.cartItems = []; },
  },
});

export const {
  addToCart, removeFromCart, updateQuantity, openCartDrawer, closeCartDrawer,
  saveShippingAddress, savePaymentMethod, clearCartItems
} = cartSlice.actions;

export default cartSlice.reducer;
