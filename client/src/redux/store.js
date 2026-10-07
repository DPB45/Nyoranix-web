import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';

// === FIX: Create custom storage to avoid Vite import issues ===
const storage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
};

import cartReducer from './slices/cartSlice';
import userReducer from './slices/userSlice';
import uiReducer from './slices/uiSlice';

// === 1. CREATE ROOT REDUCER ===
const rootReducer = combineReducers({
  cart: cartReducer,
  user: userReducer,
  ui: uiReducer,
});

// === 2. CONFIGURE PERSISTENCE ===
const persistConfig = {
  key: 'root',
  storage, // Uses our custom storage defined above
  whitelist: ['cart'], // Only persist the cart (user has its own localStorage key; ui is transient)
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// === 3. CREATE STORE ===
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Required for redux-persist
    }),
});

export const persistor = persistStore(store);

export default store;