import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Customers from './pages/Customers';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import './styles/mobile.css';

const queryClient = new QueryClient();

// Componente para rotas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary-green" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/products" element={<Products />} />
      <Route path="/stock" element={
        <ProtectedRoute>
          <div className="text-center py-5">
            <h2 className="text-dark-green">Estoque</h2>
            <p className="text-muted">Página em desenvolvimento...</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/customers" element={
        <ProtectedRoute requireAdmin>
          <Customers />
        </ProtectedRoute>
      } />
      <Route path="/users" element={
        <ProtectedRoute requireAdmin>
          <div className="text-center py-5">
            <h2 className="text-dark-green">Usuários</h2>
            <p className="text-muted">Página em desenvolvimento...</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <div className="text-center py-5">
            <h2 className="text-dark-green">Painel Administrativo</h2>
            <p className="text-muted">Página em desenvolvimento...</p>
          </div>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Layout>
            <AppRoutes />
          </Layout>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--white)',
                color: 'var(--dark-gray)',
                border: '1px solid var(--accent-yellow)',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
