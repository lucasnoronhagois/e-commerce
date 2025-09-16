import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Card, Modal, Form, Alert, Badge, Table } from 'react-bootstrap';
import { Stock, Product } from '../types';
import { stockApi, productApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Pagination from '../components/Pagination';
import SearchAndFilters from '../components/SearchAndFilters';
import { PRODUCT_CATEGORIES, getCategoryLabel } from '../constants/categories';
import { useSearchAndFilter } from '../hooks/useSearchAndFilter';
import toast from 'react-hot-toast';

interface StockWithProduct extends Stock {
  product: Product;
}

const StockPage: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockWithProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState<StockWithProduct | null>(null);
  const [formData, setFormData] = useState({ product_id: '', quantity: '' });

  // Hook para busca, filtros e paginação
  const {
    filteredItems: filteredStock,
    currentItems: currentStock,
    totalPages,
    state: { searchTerm, selectedCategory, sortBy, sortOrder, currentPage },
    actions: { setSearchTerm, setSelectedCategory, setSortBy, setSortOrder, setCurrentPage, handleSearch }
  } = useSearchAndFilter({
    items: stockItems,
    searchFields: ['product'],
    categoryField: 'product',
    defaultSortBy: 'product',
    itemsPerPage: 10,
    searchFunction: (item: StockWithProduct, searchTerm: string) => {
      const term = searchTerm.toLowerCase();
      return item.product.name.toLowerCase().includes(term) ||
             (item.product.description ? item.product.description.toLowerCase().includes(term) : false);
    },
    sortFunction: (a: StockWithProduct, b: StockWithProduct, sortBy: string, sortOrder: 'asc' | 'desc') => {
      let aValue: any, bValue: any;

      if (sortBy === 'product') {
        aValue = a.product.name.toLowerCase();
        bValue = b.product.name.toLowerCase();
      } else if (sortBy === 'price') {
        aValue = a.product.price || 0;
        bValue = b.product.price || 0;
      } else {
        aValue = a.product.name.toLowerCase();
        bValue = b.product.name.toLowerCase();
      }

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue, 'pt-BR');
      } else {
        comparison = aValue - bValue;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    }
  });

  const { isAdmin } = useAuth();

  useEffect(() => {
    loadStock();
    loadProducts();
  }, []);


  const loadStock = async () => {
    try {
      setIsLoading(true);
      const stockData = await stockApi.getAll();
      
      // Buscar produtos para cada item de estoque
      const stockWithProducts = await Promise.all(
        stockData.map(async (stock) => {
          try {
            const products = await productApi.getById(stock.product_id);
            return { ...stock, product: products };
          } catch (error) {
            return { ...stock, product: null };
          }
        })
      );
      
      setStockItems(stockWithProducts.filter(item => item.product !== null));
    } catch (error: any) {
      setError('Erro ao carregar estoque: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await productApi.getAll();
      setProducts(productsData);
    } catch (error) {
    }
  };


  const openModal = () => {
    setEditingStock(null);
    setFormData({ product_id: '', quantity: '' });
    setError('');
    setShowModal(true);
  };

  const handleEdit = (stock: StockWithProduct) => {
    setEditingStock(stock);
    setFormData({ 
      product_id: stock.product_id.toString(), 
      quantity: stock.quantity.toString() 
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingStock) {
        // Atualizar estoque existente
        await stockApi.update(editingStock.id, {
          quantity: parseInt(formData.quantity)
        });
        toast.success('Estoque atualizado com sucesso!');
      } else {
        // Criar novo estoque
        await stockApi.create({
          product_id: parseInt(formData.product_id),
          quantity: parseInt(formData.quantity)
        });
        toast.success('Estoque criado com sucesso!');
      }

      setShowModal(false);
      loadStock();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao salvar estoque');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja remover este item do estoque?')) {
      try {
        await stockApi.delete(id);
        toast.success('Item removido do estoque!');
        loadStock();
      } catch (error: any) {
        toast.error('Erro ao remover item do estoque');
      }
    }
  };


  // Estatísticas
  const totalItems = stockItems.length;
  const lowStockItems = stockItems.filter(item => item.quantity < 10);
  const outOfStockItems = stockItems.filter(item => item.quantity === 0);
  const totalValue = stockItems.reduce((sum, item) => 
    sum + (item.quantity * (Number(item.product.price) || 0)), 0
  );

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary-green" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="text-luxury-charcoal mb-1">
                <i className="fas fa-warehouse me-2"></i>
                Gestão de Estoque
              </h1>
              <p className="text-muted mb-0">
                Controle e monitoramento do estoque de produtos
              </p>
            </div>
            {isAdmin && (
              <Button 
                variant="success" 
                onClick={openModal}
                className="gradient-luxury-gold text-luxury-black fw-bold border-0 shadow-gold"
              >
                <i className="fas fa-plus me-2"></i>
                ADICIONAR ESTOQUE
              </Button>
            )}
          </div>
        </Col>
      </Row>

      {/* Cards de Estatísticas */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="border-luxury-silver shadow-luxury h-100">
            <Card.Body className="text-center">
              <div className="text-luxury-gold mb-2">
                <i className="fas fa-boxes fa-2x"></i>
              </div>
              <h4 className="text-luxury-charcoal mb-1">{totalItems}</h4>
              <p className="text-muted mb-0 small">Total de Itens</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-luxury-silver shadow-luxury h-100">
            <Card.Body className="text-center">
              <div className="text-warning mb-2">
                <i className="fas fa-exclamation-triangle fa-2x"></i>
              </div>
              <h4 className="text-luxury-charcoal mb-1">{lowStockItems.length}</h4>
              <p className="text-muted mb-0 small">Estoque Baixo</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-luxury-silver shadow-luxury h-100">
            <Card.Body className="text-center">
              <div className="text-danger mb-2">
                <i className="fas fa-times-circle fa-2x"></i>
              </div>
              <h4 className="text-luxury-charcoal mb-1">{outOfStockItems.length}</h4>
              <p className="text-muted mb-0 small">Sem Estoque</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-luxury-silver shadow-luxury h-100">
            <Card.Body className="text-center">
              <div className="text-success mb-2">
                <i className="fas fa-dollar-sign fa-2x"></i>
              </div>
              <h4 className="text-luxury-charcoal mb-1">
                R$ {totalValue.toFixed(2).replace('.', ',')}
              </h4>
              <p className="text-muted mb-0 small">Valor Total</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Alertas de Estoque Baixo */}
      {lowStockItems.length > 0 && (
        <Alert variant="warning" className="mb-4">
          <Alert.Heading>
            <i className="fas fa-exclamation-triangle me-2"></i>
            Atenção: Estoque Baixo
          </Alert.Heading>
          <p className="mb-2">
            {lowStockItems.length} produto(s) com estoque abaixo de 10 unidades:
          </p>
          <ul className="mb-0">
            {lowStockItems.slice(0, 5).map(item => (
              <li key={item.id}>
                <strong>{item.product.name}</strong> - {item.quantity} unidades
              </li>
            ))}
            {lowStockItems.length > 5 && (
              <li><em>... e mais {lowStockItems.length - 5} produtos</em></li>
            )}
          </ul>
        </Alert>
      )}

      {/* Busca e Filtros */}
      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearch={handleSearch}
        sortBy={sortBy as 'name' | 'price'}
        onSortByChange={(sortBy: 'name' | 'price') => setSortBy(sortBy)}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        products={stockItems.map(item => item.product)}
        showCategoryFilter={false}
        showSortControls={true}
        searchPlaceholder="Buscar produtos no estoque..."
      />

      <Row>
        {/* Menu Lateral - Filtros por Categoria */}
        <Col lg={2} md={3} className="mb-4">
          <Card className="h-100 border-luxury-silver shadow-luxury">
            <Card.Header className="bg-luxury-charcoal border-luxury-silver">
              <h5 className="text-luxury-gold mb-0 fw-bold">CATEGORIES</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                <button
                  className={`list-group-item list-group-item-action d-flex align-items-center border-0 ${selectedCategory === 'all' ? 'bg-luxury-gold text-luxury-black' : 'bg-luxury-white text-luxury-charcoal'}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  <span className="me-2"></span>
                  <span className="fw-medium">ALL CATEGORIES</span>
                  <span className={`ms-auto badge rounded-pill ${selectedCategory === 'all' ? 'bg-luxury-black text-luxury-gold' : 'bg-luxury-silver text-luxury-black'}`}>
                    {stockItems.length}
                  </span>
                </button>
                {PRODUCT_CATEGORIES.map((category) => {
                  const categoryCount = stockItems.filter(item => item.product.category === category.value).length;
                  return (
                    <button
                      key={category.value}
                      className={`list-group-item list-group-item-action d-flex align-items-center border-0 ${selectedCategory === category.value ? 'bg-luxury-gold text-luxury-black' : 'bg-luxury-white text-luxury-charcoal'}`}
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      <span className="me-2"></span>
                      <span className="fw-medium">{category.label.toUpperCase()}</span>
                      <span className={`ms-auto badge rounded-pill ${selectedCategory === category.value ? 'bg-luxury-black text-luxury-gold' : 'bg-luxury-silver text-luxury-black'}`}>
                        {categoryCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Área Principal - Tabela de Estoque */}
        <Col lg={10} md={9}>
          {/* Tabela de Estoque */}
          <Card className="border-luxury-silver shadow-luxury">
        <Card.Header className="bg-luxury-charcoal border-luxury-silver">
          <h5 className="text-luxury-gold mb-0 fw-bold">
            <i className="fas fa-list me-2"></i>
            ITENS EM ESTOQUE
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {filteredStock.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">
                {stockItems.length === 0 
                  ? 'Nenhum item em estoque' 
                  : 'Nenhum item encontrado com os filtros aplicados'
                }
              </p>
            </div>
          ) : (
            <Table responsive className="mb-0">
              <thead className="bg-luxury-cream">
                <tr>
                  <th className="border-luxury-silver">PRODUTO</th>
                  <th className="border-luxury-silver">CATEGORIA</th>
                  <th className="border-luxury-silver text-center">QUANTIDADE</th>
                  <th className="border-luxury-silver text-center">PREÇO UNIT.</th>
                  <th className="border-luxury-silver text-center">VALOR TOTAL</th>
                  <th className="border-luxury-silver text-center">STATUS</th>
                  {isAdmin && (
                    <th className="border-luxury-silver text-center">AÇÕES</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentStock.map((item) => (
                  <tr key={item.id}>
                    <td className="border-luxury-silver">
                      <div>
                        <strong className="text-luxury-charcoal">{item.product.name}</strong>
                        {item.product.description && (
                          <div className="text-muted small">
                            {item.product.description.length > 50 
                              ? `${item.product.description.substring(0, 50)}...`
                              : item.product.description
                            }
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border-luxury-silver">
                      <Badge bg="luxury-gold" className="text-luxury-black fw-bold">
                        {getCategoryLabel(item.product.category).toUpperCase()}
                      </Badge>
                    </td>
                    <td className="border-luxury-silver text-center">
                      <span className={`fw-bold ${item.quantity === 0 ? 'text-danger' : item.quantity < 10 ? 'text-warning' : 'text-success'}`}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="border-luxury-silver text-center">
                      {item.product.price ? (
                        <span className="text-success fw-bold">
                          R$ {Number(item.product.price).toFixed(2).replace('.', ',')}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="border-luxury-silver text-center">
                      {item.product.price ? (
                        <span className="text-success fw-bold">
                          R$ {(item.quantity * Number(item.product.price)).toFixed(2).replace('.', ',')}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="border-luxury-silver text-center">
                      {item.quantity === 0 ? (
                        <Badge bg="danger">SEM ESTOQUE</Badge>
                      ) : item.quantity < 10 ? (
                        <Badge bg="warning" className="text-dark">ESTOQUE BAIXO</Badge>
                      ) : (
                        <Badge bg="success">OK</Badge>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="border-luxury-silver text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            style={{ fontSize: '11px', padding: '4px 8px' }}
                          >
                            Remover
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Paginação */}
      {!isLoading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showInfo={true}
          totalItems={filteredStock.length}
          currentItemsCount={currentStock.length}
        />
      )}
        </Col>
      </Row>

      {/* Modal para Criar/Editar Estoque */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingStock ? 'Editar Estoque' : 'Adicionar Estoque'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <Alert variant="danger" className="mb-3">
                {error}
              </Alert>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>
                Produto <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                required
                disabled={!!editingStock}
              >
                <option value="">Selecione um produto</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>
                Quantidade <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Digite a quantidade"
                required
              />
              <Form.Text className="text-muted">
                Quantidade atual em estoque
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingStock ? 'Atualizar' : 'Adicionar'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default StockPage;
