import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './components/auth/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import ComingSoonPage from './pages/ComingSoonPage';

const routes: { [key: string]: React.FC } = {
  '': DashboardPage,
  '#dashboard': DashboardPage,
  '#editor': EditorPage,
  '#analytics': AnalyticsPage,
  '#settings': ComingSoonPage,
  '#templates': ComingSoonPage,
  '#social': ComingSoonPage,
  '#help': ComingSoonPage,
};

const App: React.FC = () => {
  const { session } = useContext(AuthContext);
  const [route, setRoute] = useState(window.location.hash || '#dashboard');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#dashboard');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!session) {
    return <LoginPage />;
  }

  const PageComponent = routes[route] || DashboardPage;

  return (
    <DashboardLayout>
      <PageComponent />
    </DashboardLayout>
  );
};

export default App;