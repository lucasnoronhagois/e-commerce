import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
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
          🛒 Commerce
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/products" onClick={(e) => { e.preventDefault(); navigate('/products'); }}>
              Produtos
            </Nav.Link>
            <Nav.Link href="/stock" onClick={(e) => { e.preventDefault(); navigate('/stock'); }}>
              Estoque
            </Nav.Link>
            {isAdmin && (
              <>
                <Nav.Link href="/users" onClick={(e) => { e.preventDefault(); navigate('/users'); }}>
                  Usuários
                </Nav.Link>
                <Nav.Link href="/customers" onClick={(e) => { e.preventDefault(); navigate('/customers'); }}>
                  Clientes
                </Nav.Link>
              </>
            )}
          </Nav>
          
          <Nav>
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
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => navigate('/login')}
                  className="me-2"
                >
                  Entrar
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => navigate('/register')}
                >
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
