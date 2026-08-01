import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { NotificationProvider } from './utils/NotificationCard';
import { AuthRedirect } from './routes/AuthRedirect';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <AuthRedirect />
        <App />
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>
);