import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react'; // <--- 1. ADD IMPORT
import { store, persistor } from './redux/store'; // <--- 2. UPDATE IMPORT
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      {/* 3. WRAP APP IN PERSISTGATE */}
      <PersistGate loading={null} persistor={persistor}>
        <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        </HelmetProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
);