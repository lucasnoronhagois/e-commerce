import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { getTotalItems, isInitialized } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <BootstrapNavbar expand="lg" className="navbar">
      <Container>
        <BootstrapNavbar.Brand 
          href="/" 
          className="navbar-brand"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          <i className="fas fa-crown text-luxury-gold me-2"></i>LUXURY COMMERCE
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAdmin && (
              <>
                <Nav.Link href="/admin" onClick={(e) => { e.preventDefault(); navigate('/admin'); }}>
                  <i className="fas fa-crown me-1"></i>
                  Admin
                </Nav.Link>
                <Nav.Link href="/products/manage" onClick={(e) => { e.preventDefault(); navigate('/products/manage'); }}>
                  <i className="fas fa-box me-1"></i>
                  Produtos
                </Nav.Link>
                <Nav.Link href="/stock" onClick={(e) => { e.preventDefault(); navigate('/stock'); }}>
                  <i className="fas fa-warehouse me-1"></i>
                  Estoque
                </Nav.Link>
                <Nav.Link href="/customers" onClick={(e) => { e.preventDefault(); navigate('/customers'); }}>
                  <i className="fas fa-users me-1"></i>
                  Clientes
                </Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
            {/* Carrinho sempre visível na direita */}
            <Nav.Link href="/cart" onClick={(e) => { e.preventDefault(); navigate('/cart'); }} className="position-relative me-3">
              <i className="fas fa-shopping-cart me-1"></i>
              Carrinho
              {isInitialized && getTotalItems() > 0 && (
                <Badge 
                  bg="luxury-gold" 
                  className="position-absolute top-0 start-100 translate-middle text-luxury-black fw-bold"
                  style={{ fontSize: '10px', minWidth: '18px', height: '18px' }}
                >
                  {getTotalItems()}
                </Badge>
              )}
            </Nav.Link>
            {isAuthenticated ? (
              <>
                <Nav.Link className="text-dark-green">
                  Olá, {user?.name}!
                </Nav.Link>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={handleLogout}
                  className="ms-2"
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => navigate('/login')}
                  className="me-2 border-luxury-gold text-luxury-charcoal"
                >
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Entrar
                </Button>
                <Button 
                  variant="success" 
                  size="sm" 
                  onClick={() => navigate('/register')}
                  className="gradient-luxury-gold text-luxury-black fw-bold border-0 shadow-gold"
                >
                  <i className="fas fa-user-plus me-1"></i>
                  Cadastrar
                </Button>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
