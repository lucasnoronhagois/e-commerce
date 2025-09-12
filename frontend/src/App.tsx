import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
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
      {/* Página inicial = Produtos (público) */}
      <Route path="/" element={<Products />} />
      
      {/* Autenticação */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Carrinho (público, mas login necessário para adicionar itens) */}
      <Route path="/cart" element={<Cart />} />
      
      {/* Painel administrativo (protegido) */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <AdminPanel />
        </ProtectedRoute>
      } />
      
      {/* Gestão de produtos (protegido para admins) */}
      <Route path="/products/manage" element={
        <ProtectedRoute requireAdmin>
          <Products />
        </ProtectedRoute>
      } />
      
      {/* Estoque (protegido) */}
      <Route path="/stock" element={
        <ProtectedRoute>
          <div className="text-center py-5">
            <h2 className="text-luxury-charcoal">Estoque</h2>
            <p className="text-luxury-charcoal">Página em desenvolvimento...</p>
          </div>
        </ProtectedRoute>
      } />
      
      {/* Clientes (protegido para admins) */}
      <Route path="/customers" element={
        <ProtectedRoute requireAdmin>
          <Customers />
        </ProtectedRoute>
      } />
      
      {/* Usuários (protegido para admins) */}
      <Route path="/users" element={
        <ProtectedRoute requireAdmin>
          <div className="text-center py-5">
            <h2 className="text-luxury-charcoal">Usuários</h2>
            <p className="text-luxury-charcoal">Página em desenvolvimento...</p>
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
        <CartProvider>
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
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
