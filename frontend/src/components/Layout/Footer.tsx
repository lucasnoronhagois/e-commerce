import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary-green text-dark-green py-4 mt-5">
      <Container>
        <Row>
          <Col md={6}>
            <h5 className="text-dark-green">🛒 Commerce</h5>
            <p className="mb-0">
              Sistema de e-commerce completo com gestão de produtos, estoque e clientes.
            </p>
          </Col>
          <Col md={6} className="text-md-end">
            <p className="mb-0">
              © 2024 Commerce. Todos os direitos reservados.
            </p>
            <small className="text-muted">
              Desenvolvido com React + TypeScript + Express
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
