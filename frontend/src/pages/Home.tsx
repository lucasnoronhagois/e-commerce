import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="fade-in">
      <Row className="text-center mb-4 mb-md-5">
        <Col>
          <h1 className="display-4 text-dark-green mb-3">
            Bem-vindo ao Commerce
          </h1>
          <p className="lead text-dark-yellow px-2">
            Sistema completo de e-commerce com gestão de produtos, estoque e clientes
          </p>
        </Col>
      </Row>

      <Row className="g-3 g-md-4">
        <Col xs={12} sm={6} lg={4}>
          <Card className="h-100 card">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="fas fa-box fa-3x text-primary-green"></i>
              </div>
              <Card.Title className="text-dark-green">Produtos</Card.Title>
              <Card.Text className="px-2">
                Gerencie seu catálogo de produtos de forma eficiente
              </Card.Text>
              <Button 
                variant="primary" 
                onClick={() => navigate('/products')}
                className="w-100"
              >
                Ver Produtos
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={4}>
          <Card className="h-100 card">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="fas fa-warehouse fa-3x text-primary-yellow"></i>
              </div>
              <Card.Title className="text-dark-green">Estoque</Card.Title>
              <Card.Text className="px-2">
                Controle o estoque de seus produtos em tempo real
              </Card.Text>
              <Button 
                variant="primary" 
                onClick={() => navigate('/stock')}
                className="w-100"
              >
                Ver Estoque
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={4}>
          <Card className="h-100 card">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="fas fa-users fa-3x text-primary-green"></i>
              </div>
              <Card.Title className="text-dark-green">Clientes</Card.Title>
              <Card.Text className="px-2">
                Gerencie informações dos seus clientes
              </Card.Text>
              <Button 
                variant="primary" 
                onClick={() => navigate('/customers')}
                className="w-100"
              >
                Ver Clientes
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {!isAuthenticated && (
        <Row className="mt-4 mt-md-5">
          <Col className="text-center">
            <Card className="card">
              <Card.Body>
                <h3 className="text-dark-green mb-3">Comece Agora</h3>
                <p className="text-muted mb-4 px-2">
                  Faça login ou cadastre-se para acessar todas as funcionalidades
                </p>
                <div className="d-flex gap-3 justify-content-center flex-column flex-md-row">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => navigate('/login')}
                    className="w-100 w-md-auto"
                  >
                    Fazer Login
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="lg"
                    onClick={() => navigate('/register')}
                    className="w-100 w-md-auto"
                  >
                    Cadastrar-se
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {isAdmin && (
        <Row className="mt-5">
          <Col className="text-center">
            <Card className="card bg-accent-yellow">
              <Card.Body>
                <h4 className="text-dark-green mb-3">Painel Administrativo</h4>
                <p className="text-muted mb-4">
                  Acesso completo às funcionalidades administrativas
                </p>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => navigate('/admin')}
                >
                  Acessar Painel Admin
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Home;
