import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setIsLoading(true);
    setError('');

    try {
      await login(formData.login, formData.password);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Row className="justify-content-center">
      <Col xs={12} sm={10} md={6} lg={4}>
        <Card className="card border-luxury-gold shadow-luxury bg-luxury-cream">
          <Card.Body className="p-4">
            <div className="text-center mb-4">
              <h2 className="text-luxury-charcoal mb-3">
                <i className="fas fa-crown text-luxury-gold me-2"></i>
                Entrar
              </h2>
              <p className="text-luxury-charcoal px-2 opacity-75">
                Acesse sua conta
              </p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-3 border-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="text-luxury-charcoal fw-medium">
                  <i className="fas fa-user text-luxury-gold me-2"></i>
                  Login
                </Form.Label>
                <Form.Control
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  placeholder="Digite seu login"
                  required
                  className="border-luxury-silver focus-luxury-gold"
                  style={{ 
                    backgroundColor: 'var(--luxury-white)',
                    color: 'var(--luxury-charcoal)'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="text-luxury-charcoal fw-medium">
                  <i className="fas fa-lock text-luxury-gold me-2"></i>
                  Senha
                </Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  required
                  className="border-luxury-silver focus-luxury-gold"
                  style={{ 
                    backgroundColor: 'var(--luxury-white)',
                    color: 'var(--luxury-charcoal)'
                  }}
                />
              </Form.Group>

              <Button
                type="button"
                variant="success"
                className="w-100 mb-3 gradient-luxury-gold text-luxury-black fw-bold border-0 shadow-gold"
                disabled={isLoading}
                onClick={handleSubmit}
                style={{ 
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Entrando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Entrar
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-luxury-charcoal mb-0">
                Não tem uma conta?{' '}
                <Button
                  variant="link"
                  className="p-0 text-luxury-gold fw-bold"
                  onClick={() => navigate('/register')}
                  style={{ textDecoration: 'none' }}
                >
                  <i className="fas fa-user-plus me-1"></i>
                  Cadastre-se
                </Button>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Login;
