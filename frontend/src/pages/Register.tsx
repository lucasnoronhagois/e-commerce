import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import { formatPhone, formatCEP, formatDocument, removeFormatting } from '../utils/formatters';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    mail: '',
    login: '',
    password: '',
    confirmPassword: '',
    address: '',
    zipCode: '',
    document: '',
    neighborhood: '',
    city: '',
    state: '',
    addressNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar formatação baseada no campo
    if (name === 'phone') {
      formattedValue = formatPhone(value);
    } else if (name === 'zipCode') {
      formattedValue = formatCEP(value);
    } else if (name === 'document') {
      formattedValue = formatDocument(value);
    }

    setFormData({
      ...formData,
      [name]: formattedValue
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    try {
      // Remover formatação antes de enviar
      const cleanPhone = removeFormatting(formData.phone);
      const cleanZipCode = removeFormatting(formData.zipCode);

      // Converter campos para o formato esperado pelo backend
      const customerData = {
        name: formData.name,
        phone: cleanPhone,
        mail: formData.mail,
        login: formData.login,
        password: formData.password,
        address: formData.address,
        zip_code: cleanZipCode,
        document: formData.document,
        neighborhood: formData.neighborhood,
        city: formData.city,
        state: formData.state,
        address_number: formData.addressNumber
      };

        await userApi.register(customerData);
      
      toast.success('Cadastro realizado com sucesso!');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao cadastrar');
      toast.error('Erro ao cadastrar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Row className="justify-content-center">
      <Col xs={12} sm={10} md={8} lg={6}>
        <Card className="card">
          <Card.Body>
            <div className="text-center mb-4">
              <h2 className="text-dark-green">Cadastrar-se</h2>
              <p className="text-muted px-2">Crie sua conta de cliente</p>
            </div>

            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nome Completo</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Digite seu nome completo"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Telefone</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="mail"
                      value={formData.mail}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
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
                </Col>
              </Row>

              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Senha</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Confirmar Senha</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirme sua senha"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Endereço</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Rua, avenida, etc."
                  required
                />
              </Form.Group>

              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Número</Form.Label>
                    <Form.Control
                      type="text"
                      name="addressNumber"
                      value={formData.addressNumber}
                      onChange={handleChange}
                      placeholder="123"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Bairro</Form.Label>
                    <Form.Control
                      type="text"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      placeholder="Centro, Vila Nova, etc."
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3">
                <Col xs={12} md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Cidade</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="São Paulo"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="SP"
                      maxLength={2}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3">
                <Col xs={12} md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>CPF/CNPJ</Form.Label>
                    <Form.Control
                      type="text"
                      name="document"
                      value={formData.document}
                      onChange={handleChange}
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      maxLength={18}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>CEP</Form.Label>
                    <Form.Control
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="00000-000"
                      maxLength={9}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button
                type="submit"
                variant="primary"
                className="w-100 mb-3"
                disabled={isLoading}
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar'}
              </Button>
            </Form>

            <div className="text-center">
              <p className="text-muted">
                Já tem uma conta?{' '}
                <Button
                  variant="link"
                  className="p-0 text-dark-green"
                  onClick={() => navigate('/login')}
                >
                  Faça login
                </Button>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Register;
