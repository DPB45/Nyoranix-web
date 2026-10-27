import { createSlice } from '@reduxjs/toolkit';
import { logout } from './userSlice';
import { cartSafeImage } from '../../utils/productsCache';

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
        // whole number, at least 1, never above the known stock (99 when stock is unknown).
        // The server re-checks everything at checkout, this just keeps the cart sane.
        const max = Number.isFinite(Number(item.countInStock)) && item.countInStock > 0 ? Math.floor(item.countInStock) : 99;
        const q = Math.floor(Number(quantity));
        item.quantity = Number.isFinite(q) ? Math.min(max, Math.max(1, q)) : item.quantity;
      }
    },
    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },
    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },

    // Carts saved by older versions still hold big base64 photos; drop them once.
    compactCart: (state) => {
      state.cartItems = state.cartItems.map((x) => (x.image && cartSafeImage(x.image) !== x.image ? { ...x, image: '' } : x));
    },

    // Refresh cart lines with the server's current price/stock (checkout quote).
    // `items` = [{ id, price, countInStock, quantity }]; lines not listed are dropped.
    syncCartItems: (state, action) => {
      const fresh = new Map((action.payload || []).map((i) => [String(i.id), i]));
      state.cartItems = state.cartItems
        .filter((x) => fresh.has(String(x.id)))
        .map((x) => {
          const f = fresh.get(String(x.id));
          return { ...x, image: cartSafeImage(x.image), price: f.price, countInStock: f.countInStock, quantity: Math.min(x.quantity, f.quantity ?? x.quantity) };
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
  compactCart,
  clearCartItems // <--- CRITICAL: Must be exported here
} = cartSlice.actions;

export default cartSlice.reducer;