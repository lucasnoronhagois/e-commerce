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
      const result = await login(formData.login, formData.password);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (err: any) {
      console.error('Erro no login:', err);
      setError(err.response?.data?.error || 'Erro ao fazer login');
      toast.error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Row className="justify-content-center">
      <Col xs={12} sm={10} md={6} lg={4}>
        <Card className="card">
          <Card.Body>
            <div className="text-center mb-4">
              <h2 className="text-dark-green">Entrar</h2>
              <p className="text-muted px-2">Acesse sua conta (usuário ou cliente)</p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Login</Form.Label>
                <Form.Control
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  placeholder="Digite seu login"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Senha</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  required
                />
              </Form.Group>

              <Button
                type="button"
                variant="primary"
                className="w-100 mb-3"
                disabled={isLoading}
                onClick={handleSubmit}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-muted">
                Não tem uma conta?{' '}
                <Button
                  variant="link"
                  className="p-0 text-dark-green"
                  onClick={() => navigate('/register')}
                >
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
