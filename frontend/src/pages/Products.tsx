import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Modal, Alert } from 'react-bootstrap';
import { Product } from '../types';
import { productApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [error, setError] = useState('');

  const { isAdmin } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productApi.getAll();
      setProducts(data);
    } catch (error) {
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadProducts();
      return;
    }

    try {
      setIsLoading(true);
      const data = await productApi.search(searchTerm);
      setProducts(data);
    } catch (error) {
      toast.error('Erro ao buscar produtos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, formData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await productApi.create(formData);
        toast.success('Produto criado com sucesso!');
      }
      
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '' });
      loadProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar produto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({ name: product.name });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productApi.delete(id);
        toast.success('Produto excluído com sucesso!');
        loadProducts();
      } catch (error) {
        toast.error('Erro ao excluir produto');
      }
    }
  };

  const openModal = () => {
    setEditingProduct(null);
    setFormData({ name: '' });
    setError('');
    setShowModal(true);
  };

  return (
    <div className="fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <h2 className="text-dark-green mb-0">Produtos</h2>
        {isAdmin && (
          <Button variant="primary" onClick={openModal} className="w-100 w-md-auto">
            Adicionar Produto
          </Button>
        )}
      </div>

      <Row className="mb-4 g-2">
        <Col xs={12} md={8}>
          <Form.Control
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </Col>
        <Col xs={12} md={4}>
          <Button variant="outline-primary" onClick={handleSearch} className="w-100">
            Buscar
          </Button>
        </Col>
      </Row>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary-green" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : (
        <Row className="g-3 g-md-4">
          {products.map((product) => (
            <Col key={product.id} xs={12} sm={6} lg={4}>
              <Card className="h-100 card">
                <Card.Body>
                  <Card.Title className="text-dark-green">
                    {product.name}
                  </Card.Title>
                  <Card.Text className="text-muted">
                    ID: {product.id}
                  </Card.Text>
                  {product.stocks && product.stocks.length > 0 && (
                    <Card.Text>
                      <small className="text-success">
                        Estoque: {product.stocks.reduce((total, stock) => total + stock.quantity, 0)} unidades
                      </small>
                    </Card.Text>
                  )}
                  {isAdmin && (
                    <div className="d-flex gap-2 mt-3 flex-column flex-sm-row">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="w-100 w-sm-auto"
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="w-100 w-sm-auto"
                      >
                        Excluir
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {products.length === 0 && !isLoading && (
        <div className="text-center py-5">
          <p className="text-muted">Nenhum produto encontrado</p>
        </div>
      )}

      {/* Modal para criar/editar produto */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? 'Editar Produto' : 'Adicionar Produto'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            <Form.Group>
              <Form.Label>Nome do Produto</Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                placeholder="Digite o nome do produto"
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingProduct ? 'Atualizar' : 'Criar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Products;
