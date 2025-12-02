import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NailifyProvider } from './context/NailifyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Services } from './pages/Services';
import { Hours } from './pages/Hours';
import { Appointments } from './pages/Appointments';
import { Inventory } from './pages/Inventory';
import { Financial } from './pages/Financial';
import { Settings } from './pages/Settings';
import { BookingSettings } from './pages/BookingSettings'; // Importado
import { BookingLink } from './pages/BookingLink';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Componente para proteger rotas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <NailifyProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Rotas Públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/book/u/:userId" element={<BookingLink />} />

              {/* Rotas Protegidas (Dashboard) */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/services" element={
                <ProtectedRoute>
                  <Services />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/hours" element={
                <ProtectedRoute>
                  <Hours />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/appointments" element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/inventory" element={
                <ProtectedRoute>
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/financial" element={
                <ProtectedRoute>
                  <Financial />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/booking-link" element={ // Nova Rota
                <ProtectedRoute>
                  <BookingSettings />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </BrowserRouter>
      </NailifyProvider>
    </AuthProvider>
  );
}

export default App;
