import { createSlice } from '@reduxjs/toolkit';
import { logout } from './userSlice';

// Cart persistence is handled entirely by redux-persist (see redux/store.js,
// which whitelists the 'cart' slice) and PersistGate in main.jsx. Manual
// localStorage calls here would be a second, redundant persistence
// mechanism writing to a different key - removed in favor of the one real
// mechanism.
const initialState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: 'Cash on Delivery',
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

    // Refresh cart lines with the server's current price/stock (checkout quote).
    // `items` = [{ id, price, countInStock, quantity }]; lines not listed are dropped.
    syncCartItems: (state, action) => {
      const fresh = new Map((action.payload || []).map((i) => [String(i.id), i]));
      state.cartItems = state.cartItems
        .filter((x) => fresh.has(String(x.id)))
        .map((x) => {
          const f = fresh.get(String(x.id));
          return { ...x, price: f.price, countInStock: f.countInStock, quantity: Math.min(x.quantity, f.quantity ?? x.quantity) };
        });
    },

    // === DEFINITION: Clearing the cart ===
    clearCartItems: (state) => {
      state.cartItems = [];
    },
  },
  // Signing out also empties the (persisted) cart and saved shipping address,
  // so the next person on a shared computer doesn't inherit them.
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.cartItems = [];
      state.shippingAddress = {};
    });
  },
});

// === EXPORT: Make sure 'clearCartItems' is in this list ===
export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  saveShippingAddress,
  savePaymentMethod,
  syncCartItems,
  clearCartItems // <--- CRITICAL: Must be exported here
} = cartSlice.actions;

export default cartSlice.reducer;