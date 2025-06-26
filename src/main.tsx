import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicMenu from './components/Menu/PublicMenu';
import { AppProvider } from './contexts/AppContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
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
    </AuthProvider>
  </React.StrictMode>
);
