import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.tsx';
import { CartProvider } from './contexts/CartContext.tsx';

// Layouts
import ClientLayout from './pages/Layouts/ClientLayout.tsx';
import AdminLayout from './pages/Layouts/AdminLayout.tsx';

// Public Pages
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';

// Cliente Pages
import ServicesPage from './pages/Cliente/ServicesPage.tsx';
import AppointmentsPageClient from './pages/Cliente/AppointmentsPage.tsx';
import ShopPage from './pages/Cliente/ShopPage.tsx';
import OrdersPage from './pages/Cliente/OrdersPage.tsx';

// Admin Pages
import AdminDashboardPage from './pages/Admin/DashboardPage.tsx';
import OdontogramPage from './pages/Admin/OdontogramPage.tsx';
import AppointmentsPageAdmin from './pages/Admin/AppointmentsPage.tsx';
import PatientsPage from './pages/Admin/PatientsPage.tsx';
import UsersPage from './pages/Admin/UsersPage.tsx';
import PurchasesPage from './pages/Admin/PurchasesPage.tsx';

// Components
import ProtectedRoute from './components/ProtectedRoute.tsx';
import ToothLoader from './components/ui/ToothLoader.tsx';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F0F7FF] text-[#1A2E3D] flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#7CC4EB]/15 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#F7B8D1]/20 rounded-full blur-[120px]" />
      <ToothLoader />
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, isAdmin, isCollaborator, loading } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (loading || !minTimeElapsed) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={<LandingPage onLogin={() => window.location.href = '/login'} />} />
      <Route path="/login" element={
        isAuthenticated ? (
          isAdmin || isCollaborator ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/dashboard" replace />
        ) : (
          <LoginPage onBack={() => window.location.href = '/'} />
        )
      } />

      <Route element={
        <ProtectedRoute allowedRoles={['cliente']}>
          <ClientLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<ServicesPage />} />
        <Route path="/servicios" element={<ServicesPage />} />
        <Route path="/citas" element={<AppointmentsPageClient />} />
        <Route path="/tienda" element={<ShopPage />} />
        <Route path="/pedidos" element={<OrdersPage />} />
      </Route>

      <Route element={
        <ProtectedRoute allowedRoles={['admin', 'colaborador']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/odontograma" element={<OdontogramPage />} />
        <Route path="/admin/citas" element={<AppointmentsPageAdmin />} />
        <Route path="/admin/pacientes" element={<PatientsPage />} />
        <Route path="/admin/usuarios" element={<UsersPage />} />
        <Route path="/admin/compras" element={<PurchasesPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
