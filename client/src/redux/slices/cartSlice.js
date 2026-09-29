import { createSlice } from '@reduxjs/toolkit';

// Cart persistence is handled entirely by redux-persist (see redux/store.js,
// which whitelists the 'cart' slice) and PersistGate in main.jsx. Manual
// localStorage calls here would be a second, redundant persistence
// mechanism writing to a different key - removed in favor of the one real
// mechanism.
const initialState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: 'PayPal',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x.id === item.id);

      if (existItem) {
        // Adding a product that's already in the cart should INCREASE the
        // quantity, not replace the whole line - otherwise re-adding a
        // product you already have 3 of (with the page's quantity selector
        // reset to 1) would silently drop your cart back down to 1.
        const mergedQuantity = existItem.quantity + item.quantity;
        const cap = item.countInStock || existItem.countInStock;
        const finalQuantity = cap ? Math.min(mergedQuantity, cap) : mergedQuantity;
        state.cartItems = state.cartItems.map((x) =>
          x.id === existItem.id ? { ...item, quantity: finalQuantity } : x
        );
      } else {
        // Also cap a brand-new line item against its known stock - without
        // this, a stale quantity carried over from the product page (see
        // ProductDetailsPage's id-change reset fix) could add more units
        // than are actually in stock straight into the cart.
        const cap = item.countInStock;
        const initialQuantity = cap ? Math.min(item.quantity, cap) : item.quantity;
        state.cartItems = [...state.cartItems, { ...item, quantity: initialQuantity }];
      }
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((x) => x.id === id);
      if (item) {
        item.quantity = quantity;
      }
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },

    // === DEFINITION: Clearing the cart ===
    clearCartItems: (state) => {
      state.cartItems = [];
    },
  },
});

// === EXPORT: Make sure 'clearCartItems' is in this list ===
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems // <--- CRITICAL: Must be exported here
} = cartSlice.actions;

export default cartSlice.reducer;