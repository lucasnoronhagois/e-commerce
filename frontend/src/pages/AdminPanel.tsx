import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
const AdminPanel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="fade-in">
      <Row className="text-center mb-4 mb-md-5">
        <Col>
          <h1 className="display-4 text-luxury-charcoal mb-3">
            <i className="fas fa-crown text-luxury-gold me-3"></i>
            Painel Administrativo
          </h1>
          <p className="lead text-luxury-charcoal px-2">
            Sistema completo de gestão para LUXURY COMMERCE
          </p>
        </Col>
      </Row>

      <Row className="g-3 g-md-4">
        <Col xs={12} sm={6} lg={4}>
          <Card className="h-100 card border-luxury-gold">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="fas fa-box fa-3x text-luxury-gold"></i>
              </div>
              <Card.Title className="text-luxury-charcoal">Produtos</Card.Title>
              <Card.Text className="px-2 text-luxury-charcoal">
                Gerencie seu catálogo de produtos de luxo
              </Card.Text>
              <Button 
                variant="success" 
                onClick={() => navigate('/products')}
                className="w-100 gradient-luxury-gold text-luxury-black fw-bold border-0 shadow-gold"
              >
                <i className="fas fa-box me-2"></i>
                Gerenciar Produtos
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={4}>
          <Card className="h-100 card border-luxury-gold">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="fas fa-warehouse fa-3x text-luxury-gold"></i>
              </div>
              <Card.Title className="text-luxury-charcoal">Estoque</Card.Title>
              <Card.Text className="px-2 text-luxury-charcoal">
                Controle o estoque em tempo real
              </Card.Text>
              <Button 
                variant="success" 
                onClick={() => navigate('/stock')}
                className="w-100 gradient-luxury-gold text-luxury-black fw-bold border-0 shadow-gold"
              >
                <i className="fas fa-warehouse me-2"></i>
                Gerenciar Estoque
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={4}>
          <Card className="h-100 card border-luxury-gold">
            <Card.Body className="text-center">
              <div className="mb-3">
                <i className="fas fa-users fa-3x text-luxury-gold"></i>
              </div>
              <Card.Title className="text-luxury-charcoal">Clientes</Card.Title>
              <Card.Text className="px-2 text-luxury-charcoal">
                Gerencie informações dos clientes
              </Card.Text>
              <Button 
                variant="success" 
                onClick={() => navigate('/customers')}
                className="w-100 gradient-luxury-gold text-luxury-black fw-bold border-0 shadow-gold"
              >
                <i className="fas fa-users me-2"></i>
                Gerenciar Clientes
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4 mt-md-5">
        <Col className="text-center">
          <Card className="card border-luxury-gold bg-luxury-cream">
            <Card.Body>
              <h3 className="text-luxury-charcoal mb-3">
                <i className="fas fa-store text-luxury-gold me-2"></i>
                Voltar à Loja
              </h3>
              <p className="text-luxury-charcoal mb-4 px-2">
                Acesse a loja para visualizar produtos como cliente
              </p>
              <Button 
                variant="outline-primary" 
                size="lg"
                onClick={() => navigate('/')}
                className="w-100 w-md-auto border-luxury-gold text-luxury-charcoal"
              >
                <i className="fas fa-shopping-bag me-2"></i>
                Ir para a Loja
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminPanel;
