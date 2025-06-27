import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicMenu from './components/Menu/PublicMenu';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppProvider } from './contexts/AppContext';
import { NotificationProvider } from './contexts/NotificationContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NotificationProvider>
      <LanguageProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/menu/:restaurantId" element={<PublicMenu />} />
              <Route path="/*" element={<App />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </LanguageProvider>
    </NotificationProvider>
  </React.StrictMode>
);
