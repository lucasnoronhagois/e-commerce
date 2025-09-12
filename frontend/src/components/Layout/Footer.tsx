import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer: React.FC = () => {
  return (
    <footer className="bg-luxury-charcoal text-luxury-white py-5 mt-5 border-top border-luxury-gold" style={{ borderWidth: '3px' }}>
      <Container>
        <Row>
          <Col md={6}>
            <h5 className="text-luxury-gold fw-bold">
              <i className="fas fa-crown me-2"></i>LUXURY COMMERCE
            </h5>
            <p className="mb-0 text-luxury-silver">
              Sistema de e-commerce de luxo com gestão premium de produtos, estoque e clientes.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="mb-0 text-luxury-white fw-medium">
              © 2024 Luxury Commerce. Todos os direitos reservados.
            </p>
            <small className="text-luxury-silver">
              Desenvolvido com React + TypeScript + Express
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
