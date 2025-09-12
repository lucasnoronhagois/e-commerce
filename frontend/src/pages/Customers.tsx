import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Modal, 
  Form, 
  Row, 
  Col, 
  Badge, 
  Alert,
  InputGroup,
  Table
} from 'react-bootstrap';
import { CustomerDetail, CreateUserRequest } from '../types';
import { customerApi } from '../services/api';
import { normalizeText } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import { formatPhone, formatCEP, formatDocument, removeFormatting } from '../utils/formatters';
import toast from 'react-hot-toast';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerDetail | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<CreateUserRequest & {
    address?: string;
    zip_code?: string;
    document?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    address_number?: string;
  }>({
    name: '',
    phone: '',
    mail: '',
    login: '',
    password: '',
    role: 'customer',
    address: '',
    zip_code: '',
    document: '',
    neighborhood: '',
    city: '',
    state: '',
    address_number: ''
  });

  const { isAdmin } = useAuth();

  // Verificar se é admin
  useEffect(() => {
    if (!isAdmin) {
      toast.error('Acesso negado. Apenas administradores podem acessar esta página.');
      return;
    }
  }, [isAdmin]);

  // Carregar clientes
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar formatação baseada no campo
    if (name === 'phone') {
      formattedValue = formatPhone(value);
    } else if (name === 'zip_code') {
      formattedValue = formatCEP(value);
    } else if (name === 'document') {
      formattedValue = formatDocument(value);
    }

    setFormData({
      ...formData,
      [name]: formattedValue
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      mail: '',
      login: '',
      password: '',
      role: 'customer',
      address: '',
      zip_code: '',
      document: '',
      neighborhood: '',
      city: '',
      state: '',
      address_number: ''
    });
    setEditingCustomer(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Preparar dados para envio (remover formatação)
      const submitData = {
        ...formData,
        phone: removeFormatting(formData.phone),
        zip_code: removeFormatting(formData.zip_code || ''),
        document: removeFormatting(formData.document || ''),
        address: formData.address || '',
        neighborhood: formData.neighborhood || '',
        city: formData.city || '',
        state: formData.state || '',
        address_number: formData.address_number || ''
      };


      if (editingCustomer) {
        // Atualizar cliente existente
        await customerApi.update(editingCustomer.id, submitData);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        // Criar novo cliente
        await customerApi.create(submitData);
        toast.success('Cliente criado com sucesso!');
      }

      setShowModal(false);
      resetForm();
      loadCustomers();
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar cliente');
    }
  };

  const handleEdit = (customer: CustomerDetail) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.user?.name || '',
      phone: customer.phone || customer.user?.phone || '',
      mail: customer.user?.mail || '',
      login: customer.user?.login || '',
      password: '', // Não preencher senha
      role: 'customer',
      address: customer.address || '',
      zip_code: customer.zip_code || '',
      document: customer.document || '',
      neighborhood: customer.neighborhood || '',
      city: customer.city || '',
      state: customer.state || '',
      address_number: customer.address_number || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await customerApi.delete(id);
        toast.success('Cliente excluído com sucesso!');
        loadCustomers();
      } catch (error: any) {
        console.error('Erro ao excluir cliente:', error);
        toast.error('Erro ao excluir cliente');
      }
    }
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Filtrar clientes
  const filteredCustomers = customers.filter(customer => {
    const normalizedSearchTerm = normalizeText(searchTerm);
    return normalizeText(customer.user?.name || '').includes(normalizedSearchTerm) ||
           normalizeText(customer.user?.mail || '').includes(normalizedSearchTerm) ||
           normalizeText(customer.user?.login || '').includes(normalizedSearchTerm) ||
           (customer.document && normalizeText(customer.document).includes(normalizedSearchTerm));
  });

  if (!isAdmin) {
    return (
      <div className="text-center py-5">
        <Alert variant="danger">
          <Alert.Heading>Acesso Negado</Alert.Heading>
          <p>Você não tem permissão para acessar esta página.</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-dark-green mb-0">Gerenciar Clientes</h1>
          <p className="text-muted">Gerencie todos os clientes cadastrados</p>
        </div>
        <Button 
          variant="primary-green" 
          onClick={openModal}
          className="d-flex align-items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          Novo Cliente
        </Button>
      </div>

      {/* Barra de Pesquisa */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="fas fa-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Pesquisar por nome, email, login ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={6} className="d-flex align-items-center justify-content-end">
          <Badge bg="secondary" className="fs-6">
            {filteredCustomers.length} de {customers.length} clientes
          </Badge>
        </Col>
      </Row>

      {/* Tabela de Clientes */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary-green" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : (
        <Card>
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Login</th>
                    <th>Documento</th>
                    <th>Cidade</th>
                    <th>Cadastrado em</th>
                    <th style={{ width: '120px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <Badge bg="light" text="dark">
                          #{customer.id}
                        </Badge>
                      </td>
                      <td>
                        <div className="fw-bold">{customer.user?.name}</div>
                        <small className="text-muted">{customer.neighborhood}</small>
                      </td>
                      <td>
                        <a href={`mailto:${customer.user?.mail}`} className="text-decoration-none">
                          {customer.user?.mail}
                        </a>
                      </td>
                      <td>
                        <a href={`tel:${customer.phone || customer.user?.phone}`} className="text-decoration-none">
                          {customer.phone || customer.user?.phone}
                        </a>
                      </td>
                      <td>
                        <code>{customer.user?.login}</code>
                      </td>
                      <td>
                        {customer.document ? (
                          <span className="text-muted">{customer.document}</span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <div>
                          <div>{customer.city}</div>
                          <small className="text-muted">{customer.state}</small>
                        </div>
                      </td>
                      <td>
                        <small className="text-muted">
                          {customer.user?.created_at ? new Date(customer.user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(customer)}
                            title="Editar cliente"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(customer.id)}
                            title="Excluir cliente"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}

      {filteredCustomers.length === 0 && !isLoading && (
        <div className="text-center py-5">
          <Card>
            <Card.Body>
              <i className="fas fa-users text-muted" style={{ fontSize: '3rem' }}></i>
              <h4 className="mt-3 text-muted">
                {customers.length === 0 
                  ? 'Nenhum cliente cadastrado' 
                  : 'Nenhum cliente encontrado'
                }
              </h4>
              <p className="text-muted">
                {customers.length === 0 
                  ? 'Comece cadastrando seu primeiro cliente.' 
                  : 'Tente ajustar os filtros de pesquisa.'
                }
              </p>
              {customers.length === 0 && (
                <Button variant="primary-green" onClick={openModal}>
                  Cadastrar Primeiro Cliente
                </Button>
              )}
            </Card.Body>
          </Card>
        </div>
      )}

      {/* Modal de Cliente */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nome Completo *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Digite o nome completo"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="mail"
                    value={formData.mail}
                    onChange={handleInputChange}
                    required
                    placeholder="exemplo@email.com"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Telefone *</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="(11) 99999-9999"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Login *</Form.Label>
                  <Form.Control
                    type="text"
                    name="login"
                    value={formData.login}
                    onChange={handleInputChange}
                    required
                    placeholder="nome_usuario"
                  />
                </Form.Group>
              </Col>
            </Row>

            {!editingCustomer && (
              <Form.Group className="mb-3">
                <Form.Label>Senha *</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite uma senha segura"
                />
              </Form.Group>
            )}

            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Endereço</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Rua, Avenida, etc."
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Número</Form.Label>
                  <Form.Control
                    type="text"
                    name="address_number"
                    value={formData.address_number}
                    onChange={handleInputChange}
                    placeholder="123"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bairro</Form.Label>
                  <Form.Control
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    placeholder="Nome do bairro"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>CEP</Form.Label>
                  <Form.Control
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    placeholder="00000-000"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Cidade</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Nome da cidade"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="SP"
                    maxLength={2}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>CPF</Form.Label>
              <Form.Control
                type="text"
                name="document"
                value={formData.document}
                onChange={handleInputChange}
                placeholder="000.000.000-00"
              />
              <Form.Text className="text-muted">
                Documento é opcional
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary-green" type="submit">
              {editingCustomer ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;
