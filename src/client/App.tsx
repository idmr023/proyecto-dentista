import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import LandingPage from './pages/LandingPage';
import ToothLoader from './components/ui/ToothLoader';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F0F7FF] text-[#1A2E3D] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#7CC4EB]/15 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#F7B8D1]/20 rounded-full blur-[120px]" />
      <ToothLoader />
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isAdmin, isClient, isCollaborator, loading } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), 2800);
    return () => clearTimeout(t);
  }, []);

  if (loading || !minTimeElapsed) return <LoadingScreen />;

  if (isAuthenticated) {
    if (isAdmin || isCollaborator) return <AdminDashboard />;
    if (isClient) return <ClientDashboard />;
  }

  if (showLogin) return <LoginPage onBack={() => setShowLogin(false)} />;
  return <LandingPage onLogin={() => setShowLogin(true)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
