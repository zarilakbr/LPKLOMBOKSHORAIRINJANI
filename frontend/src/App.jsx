import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { LanguageProvider } from './context/LanguageContext';
import { RealtimeProvider } from './context/RealtimeContext';
import './styles/main.css';

export default function App() {
  return (
    <LanguageProvider>
      <RealtimeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </RealtimeProvider>
    </LanguageProvider>
  );
}
