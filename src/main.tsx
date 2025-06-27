import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicMenu from './components/Menu/PublicMenu';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import { CartProvider } from './contexts/CartContext';

const PublicMenuWithProviders = () => (
  <ErrorBoundary>
    <NotificationProvider>
      <LanguageProvider>
        <AppProvider>
          <CartProvider>
            <PublicMenu />
          </CartProvider>
        </AppProvider>
      </LanguageProvider>
    </NotificationProvider>
  </ErrorBoundary>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/menu/:restaurantId" element={<PublicMenuWithProviders />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
