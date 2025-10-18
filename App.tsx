import React, { useState, useEffect } from 'react';
import QRScanner from './components/QRScanner';
import ARViewer from './components/ARViewer';
import LoginPage from './components/LoginPage';
import AdminDashboard from './components/AdminDashboard';
import { api } from './api';

const App: React.FC = () => {
  // Use URL hash for routing, default to '/'
  const [route, setRoute] = useState(window.location.hash || '#/');
  const [isLoggedIn, setIsLoggedIn] = useState(api.isLoggedIn());

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    window.location.hash = '#/admin/dashboard';
  };

  const handleLogout = () => {
    api.logout();
    setIsLoggedIn(false);
    window.location.hash = '#/admin';
  };

  const renderContent = () => {
    // AR Viewer Route
    if (route.startsWith('#/view/')) {
      const id = route.substring('#/view/'.length);
      return <ARViewer itemId={id} />;
    }

    // Admin Routes
    if (route.startsWith('#/admin')) {
      if (!isLoggedIn) {
        // If not logged in, always show login page for any admin route
        return <LoginPage onLoginSuccess={handleLogin} />;
      }
      // If logged in, show the dashboard
      return <AdminDashboard onLogout={handleLogout} />;
    }
    
    // Default route is the scanner
    return <QRScanner />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      {renderContent()}
    </div>
  );
};

export default App;
