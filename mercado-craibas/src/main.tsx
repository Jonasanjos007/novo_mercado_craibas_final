import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { NotificationProvider } from './utils/NotificationCard';
import { AuthProvider } from './context/AuthContext';
import { AuthRedirect } from './routes/AuthRedirect';
import { UserProvider } from './context/UserContext';
import './index.css'; //
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <UserProvider>
            <AuthRedirect />
            <App />
          </UserProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>
);