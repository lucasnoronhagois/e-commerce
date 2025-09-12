import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Modal, Alert, Badge } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { Product } from '../types';
import { productApi, stockApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import ImageUpload from '../components/ImageUpload';
import { PRODUCT_CATEGORIES, getCategoryLabel } from '../constants/categories';
import toast from 'react-hot-toast';
import { normalizeText } from '../utils/formatters';

// Componente de Carrossel para Imagens do Produto
interface ProductImageCarouselProps {
  images: any[];
  productName: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ images, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Verificar se há imagens válidas
  const validImages = images?.filter(img => img && img.id) || [];
  
  // Ajustar índice se necessário
  React.useEffect(() => {
    if (currentIndex >= validImages.length && validImages.length > 0) {
      setCurrentIndex(0);
    }
  }, [validImages.length, currentIndex]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  // Se não há imagens válidas, retornar placeholder
  if (validImages.length === 0) {
    return (
      <div style={{ height: '200px', position: 'relative', overflow: 'hidden', backgroundColor: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="text-muted">Sem imagens</span>
      </div>
    );
  }

  const currentImage = validImages[currentIndex];

  return (
    <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
      <img
        src={currentImage.thumbnail_url || currentImage.url}
        alt={currentImage.alt_text || productName}
        className="card-img-top"
        style={{ 
          height: '100%', 
          width: '100%', 
          objectFit: 'cover',
          objectPosition: 'center center'
        }}
        onLoad={() => {
          // Imagem carregada com sucesso
        }}
      />
      
      {/* Indicadores de posição */}
      {validImages.length > 1 && (
        <>
          <div className="position-absolute bottom-0 start-0 end-0 d-flex justify-content-center mb-2">
            {validImages.map((_, index) => (
              <div
                key={index}
                className={`rounded-circle mx-1 ${index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                style={{ width: '8px', height: '8px', cursor: 'pointer' }}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
          
          {/* Botões de navegação */}
          {validImages.length > 1 && (
            <>
              <button
                className="btn btn-sm btn-light position-absolute top-50 start-0 translate-middle-y ms-2 border-0"
                onClick={prevImage}
                style={{ zIndex: 10, opacity: 0.8 }}
              >
                ‹
              </button>
              <button
                className="btn btn-sm btn-light position-absolute top-50 end-0 translate-middle-y me-2 border-0"
                onClick={nextImage}
                style={{ zIndex: 10, opacity: 0.8 }}
              >
                ›
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '', stockQuantity: '' });
  const [error, setError] = useState('');

  const { isAdmin, isAuthenticated } = useAuth();
  const { addToCart, isInitialized } = useCart();
  const location = useLocation();
  
  // Detectar se estamos no modo admin baseado na URL
  const isAdminMode = location.pathname === '/products/manage';

  useEffect(() => {
    loadProducts();
  }, []);

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, sortBy, sortOrder]);

  // Scroll para o topo quando a página mudar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

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

  // Filtrar e ordenar produtos
  const filteredAndSortedProducts = products
    .filter(product => {
      const normalizedSearchTerm = normalizeText(searchTerm);
      const matchesSearch = normalizeText(product.name).includes(normalizedSearchTerm) ||
                           (product.description && normalizeText(product.description).includes(normalizedSearchTerm));
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name, 'pt-BR');
      } else if (sortBy === 'price') {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        comparison = priceA - priceB;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Calcular paginação
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(startIndex, endIndex);

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
      const submitData = {
        name: formData.name,
        description: formData.description || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        category: formData.category,
      };

      if (editingProduct) {
        // Atualizar produto
        await productApi.update(editingProduct.id, submitData);
        
        // Atualizar estoque se quantidade foi informada (incluindo 0)
        if (formData.stockQuantity !== '' && parseInt(formData.stockQuantity) >= 0) {
          try {
            // Buscar estoque existente
            const existingStocks = await stockApi.getByProductId(editingProduct.id);
            
            if (existingStocks && existingStocks.length > 0) {
              // Atualizar estoque existente
              const stock = existingStocks[0]; // Assumindo que há apenas um estoque por produto
              await stockApi.update(stock.id, { quantity: parseInt(formData.stockQuantity) });
            } else {
              // Criar novo estoque se não existir
              const stockData = {
                product_id: editingProduct.id,
                quantity: parseInt(formData.stockQuantity)
              };
              await stockApi.create(stockData);
            }
            
            toast.success('Produto e estoque atualizados com sucesso!');
          } catch (stockError: any) {
            console.error('Erro ao atualizar estoque:', stockError);
            toast.error('Produto atualizado, mas houve erro ao atualizar estoque');
          }
        } else {
          toast.success('Produto atualizado com sucesso!');
        }
      } else {
        // Criar produto
        const newProduct = await productApi.create(submitData);
        
        // Criar estoque se quantidade foi informada
        if (formData.stockQuantity && parseInt(formData.stockQuantity) > 0) {
          try {
            const stockData = {
              product_id: newProduct.id,
              quantity: parseInt(formData.stockQuantity)
            };
            
            await stockApi.create(stockData);
            toast.success('Produto e estoque criados com sucesso!');
          } catch (stockError: any) {
            console.error('Erro ao criar estoque:', stockError);
            if (stockError.response?.status === 403) {
              toast.error('Erro: Você precisa estar logado como administrador para criar estoque');
            } else {
              toast.error('Erro ao criar estoque: ' + (stockError.response?.data?.error || stockError.message));
            }
          }
        } else {
          toast.success('Produto criado com sucesso!');
        }
      }
      
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category: '', stockQuantity: '' });
      loadProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar produto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    
    // Calcular quantidade total de estoque
    const totalStock = product.stocks?.reduce((total, stock) => total + stock.quantity, 0) || 0;
    
    setFormData({ 
      name: product.name, 
      description: product.description || '', 
      price: product.price?.toString() || '',
      category: product.category || '',
      stockQuantity: totalStock.toString()
    });
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
    setFormData({ name: '', description: '', price: '', category: '', stockQuantity: '' });
    setError('');
    setShowModal(true);
  };

  const openImageModal = (product: Product) => {
    setEditingProduct(product);
    setShowImageModal(true);
  };

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleImagesUploaded = (updatedImages: any[]) => {
    if (editingProduct) {
      // Atualizar com a nova lista de imagens (pode ser adição ou remoção)
      const updatedProduct = { ...editingProduct, images: updatedImages };
      setEditingProduct(updatedProduct);
      
      // Atualizar na lista de produtos
      setProducts(products.map(p => p.id === editingProduct.id ? updatedProduct : p));
    }
  };

  return (
    <div className="fade-in">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 gap-3 p-4 bg-luxury-cream border border-luxury-gold rounded-lg shadow-luxury">
        <div>
          <h2 className="text-luxury-charcoal mb-1 fw-bold fs-1 tracking-wide">COLEÇÃO</h2>
          <p className="text-luxury-charcoal mb-0 small opacity-75">Produtos de luxo selecionados para o cliente exigente</p>
        </div>
        {isAdmin && (
          <Button 
            onClick={openModal} 
            className="w-100 w-md-auto gradient-luxury-gold text-luxury-black fw-bold border-0 shadow-gold"
          >
            <i className="fas fa-plus me-2"></i>
            ADICIONAR PRODUTO
          </Button>
        )}
      </div>

      <Row className="mb-4 g-2">
        <Col xs={12} md={6}>
          <div className="position-relative">
            <Form.Control
              type="text"
                  placeholder="Buscar na coleção..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="border-luxury-silver bg-luxury-cream text-luxury-charcoal fw-medium"
              style={{ 
                borderWidth: '2px',
                borderRadius: '8px',
                padding: '12px 16px 12px 45px',
                fontSize: '14px'
              }}
            />
            <i className="fas fa-search position-absolute top-50 start-0 translate-middle-y text-luxury-silver ms-3"></i>
          </div>
        </Col>
        <Col xs={12} md={3}>
              <Button 
                onClick={handleSearch} 
                className="w-100 gradient-luxury-silver text-luxury-black fw-bold border-0 shadow-luxury"
                style={{ borderRadius: '8px', padding: '12px' }}
              >
                <i className="fas fa-search me-2"></i>
                BUSCAR
              </Button>
        </Col>
      </Row>

      {/* Controles de Ordenação */}
      <Row className="mb-3">
        <Col xs={12}>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <span className="text-luxury-charcoal fw-medium small">ORDENAR POR:</span>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}
                className="border-luxury-silver bg-luxury-white text-luxury-charcoal fw-medium"
                style={{ 
                  width: '120px',
                  borderWidth: '2px',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="name">NOME</option>
                <option value="price">PREÇO</option>
              </Form.Select>
              <span className="text-luxury-charcoal fw-medium small">ORDEM:</span>
              <Form.Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="border-luxury-silver bg-luxury-white text-luxury-charcoal fw-medium"
                style={{ 
                  width: '150px',
                  borderWidth: '2px',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="asc">CRESCENTE</option>
                <option value="desc">DECRESCENTE</option>
              </Form.Select>
            </div>
            
            <div className="text-luxury-charcoal">
              <small className="fw-medium">
                PÁGINA {currentPage} DE {totalPages || 1} • 
                MOSTRANDO {currentProducts.length} ITEM{currentProducts.length !== 1 ? 'S' : ''}
                {selectedCategory !== 'all' && (
                  <span> DE {products.filter(p => p.category === selectedCategory).length}</span>
                )}
                {selectedCategory === 'all' && products.length > 0 && (
                  <span> DE {products.length} TOTAL</span>
                )}
              </small>
            </div>
          </div>
        </Col>
      </Row>

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
                    {products.length}
                  </span>
                </button>
                {PRODUCT_CATEGORIES.map((category) => {
                  const categoryCount = products.filter(p => p.category === category.value).length;
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

        {/* Área Principal - Lista de Produtos */}
        <Col lg={10} md={9}>

      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary-green" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      ) : (
        <Row className="g-3 g-md-4">
          {currentProducts.map((product) => (
            <Col key={product.id} xs={12} sm={6} md={4} lg={3}>
              <Card className="h-100 card d-flex flex-column" style={{ cursor: 'pointer' }} onClick={() => openProductModal(product)}>
                {/* Carrossel de imagens do produto */}
                {product.images && product.images.length > 0 ? (
                  <ProductImageCarousel images={product.images} productName={product.name} />
                ) : (
                  <div 
                    style={{ height: '200px' }}
                    className="d-flex align-items-center justify-content-center bg-light"
                  >
                    <span className="text-muted">Sem imagem</span>
                  </div>
                )}
                
                <Card.Body className="d-flex flex-column flex-grow-1">
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="text-dark-green mb-0">
                      {product.name}
                    </Card.Title>
                    <span className="badge bg-luxury-gold text-luxury-black fw-bold ms-2 px-3 py-2" style={{ fontSize: '11px', borderRadius: '12px' }}>
                      {getCategoryLabel(product.category).toUpperCase()}
                    </span>
                  </div>
                  
                  {product.description && (
                    <Card.Text className="text-muted small mb-2">
                      {product.description.length > 120 
                        ? `${product.description.substring(0, 120)}...` 
                        : product.description
                      }
                    </Card.Text>
                  )}
                  
                  {product.price ? (
                    <Card.Text className="h5 text-success mb-2 fw-bold">
                      R$ {parseFloat(product.price.toString()).toFixed(2).replace('.', ',')}
                    </Card.Text>
                  ) : (
                    <Card.Text className="text-muted mb-2">
                      <em>Preço sob consulta</em>
                    </Card.Text>
                  )}
                  
                  {isAdmin && isAdminMode && (
                    <Card.Text className="text-muted small">
                      ID: {product.id}
                    </Card.Text>
                  )}
                  
                  {product.stocks && product.stocks.length > 0 && (() => {
                    const totalStock = product.stocks.reduce((total, stock) => total + stock.quantity, 0);
                    return (
                      <Card.Text className="text-muted small">
                        {isAdmin && isAdminMode && (
                          <span>Estoque: {totalStock} unidades</span>
                        )}
                        {totalStock < 10 && totalStock > 0 && (
                          <span className={`fw-bold ${isAdmin ? 'ms-2' : ''}`} style={{ 
                            animation: 'pulse 1.5s infinite',
                            fontSize: '0.75rem',
                            color: '#dc3545' // Vermelho Bootstrap
                          }}>
                            🔥 Restam apenas {totalStock} unidades
                          </span>
                        )}
                      </Card.Text>
                    );
                  })()}
                  
                  {product.images && product.images.length > 1 && (
                    <Card.Text>
                      <Badge bg="info">
                        {product.images.length} imagens
                      </Badge>
                    </Card.Text>
                  )}
                  </div>

                  {/* Botão Adicionar ao Carrinho - Fixo na parte inferior */}
                  <div className="mt-auto pt-3">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isAdminMode) {
                          // Modo público - verificar se está logado
                          if (!isAuthenticated) {
                            toast.error('Faça login para adicionar itens ao carrinho!', {
                              icon: '🔒',
                              style: {
                                background: 'var(--luxury-charcoal)',
                                color: 'var(--luxury-white)',
                                fontWeight: 'bold'
                              }
                            });
                            return;
                          }
                        }
                        
                        if (isInitialized) {
                          addToCart(product);
                        } else {
                          console.warn('Carrinho ainda não foi inicializado');
                        }
                      }}
                      className="w-100 gradient-luxury-gold text-luxury-black fw-bold border-0 shadow-gold"
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                      disabled={!isInitialized}
                    >
                      <i className="fas fa-shopping-cart me-1"></i>
                      {isInitialized ? 'ADICIONAR' : 'CARREGANDO...'}
                    </Button>
                  </div>

                  {isAdmin && isAdminMode && (
                    <div className="d-flex gap-1 mt-2 flex-column flex-sm-row">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(product);
                        }}
                        className="w-100 w-sm-auto"
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openImageModal(product);
                        }}
                        className="w-100 w-sm-auto"
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        Imagens
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product.id);
                        }}
                        className="w-100 w-sm-auto"
                        style={{ fontSize: '11px', padding: '4px 8px' }}
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

      {/* Controles de Paginação */}
      {totalPages > 1 && !isLoading && (
        <Row className="mt-4">
          <Col xs={12}>
            <div className="d-flex justify-content-center">
              <nav aria-label="Navegação de páginas">
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                      className={`page-link border-luxury-silver fw-medium ${currentPage === 1 ? 'bg-luxury-silver text-luxury-charcoal' : 'bg-luxury-white text-luxury-charcoal hover:bg-luxury-gold hover:text-luxury-black'}`}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{ 
                        borderWidth: '2px',
                        borderRadius: '6px',
                        margin: '0 2px',
                        minWidth: '80px'
                      }}
                    >
                      <i className="fas fa-chevron-left me-1"></i>
                      ANTERIOR
                    </button>
                  </li>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button
                        className={`page-link border-luxury-silver fw-bold ${currentPage === page ? 'bg-luxury-gold text-luxury-black' : 'bg-luxury-white text-luxury-charcoal hover:bg-luxury-silver hover:text-luxury-black'}`}
                        onClick={() => setCurrentPage(page)}
                        style={{ 
                          borderWidth: '2px',
                          borderRadius: '6px',
                          margin: '0 2px',
                          minWidth: '40px'
                        }}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                      className={`page-link border-luxury-silver fw-medium ${currentPage === totalPages ? 'bg-luxury-silver text-luxury-charcoal' : 'bg-luxury-white text-luxury-charcoal hover:bg-luxury-gold hover:text-luxury-black'}`}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{ 
                        borderWidth: '2px',
                        borderRadius: '6px',
                        margin: '0 2px',
                        minWidth: '80px'
                      }}
                    >
                      PRÓXIMO
                      <i className="fas fa-chevron-right ms-1"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </Col>
        </Row>
      )}

      {filteredAndSortedProducts.length === 0 && !isLoading && (
        <div className="text-center py-5">
          <p className="text-muted">
            {products.length === 0 
              ? 'Nenhum produto cadastrado' 
              : 'Nenhum produto encontrado com os filtros aplicados'
            }
          </p>
        </div>
      )}
        </Col>
      </Row>

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
            <Form.Group className="mb-3">
              <Form.Label>
                Nome do Produto <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Smartphone Samsung Galaxy"
                required
              />
              <Form.Text className="text-muted">
                Nome que será exibido no catálogo
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>
                Categoria <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Selecione uma categoria</option>
                {PRODUCT_CATEGORIES.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Escolha a categoria que melhor descreve o produto
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantidade em Estoque</Form.Label>
              <Form.Control
                type="number"
                min="0"
                placeholder="Digite a quantidade em estoque"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              />
              <Form.Text className="text-muted">
                {editingProduct 
                  ? "Quantidade atual em estoque (pode ser editada)"
                  : "Quantidade inicial que será adicionada ao estoque (opcional)"
                }
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descrição do Produto</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva as características, especificações e benefícios do produto..."
                maxLength={1000}
              />
              <Form.Text className="text-muted">
                {formData.description.length}/1000 caracteres
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Preço de Venda (R$)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0,00"
              />
              <Form.Text className="text-muted">
                Deixe em branco se o produto não tiver preço definido
              </Form.Text>
            </Form.Group>

            <div className="alert alert-info mb-3">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Dica:</strong> Após criar o produto, você poderá adicionar imagens clicando no botão "Imagens" no card do produto.
            </div>
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

      {/* Modal para gerenciar imagens */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Gerenciar Imagens - {editingProduct?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingProduct && (
            <ImageUpload
              productId={editingProduct.id}
              onImagesUploaded={handleImagesUploaded}
              existingImages={editingProduct.images || []}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de Visualização do Produto */}
      <Modal show={showProductModal} onHide={() => setShowProductModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-dark-green">
            {selectedProduct?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <div>
              {/* Imagem Principal */}
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <div className="mb-4 text-center">
                  <img
                    src={selectedProduct.images.find(img => img.is_primary)?.original_url || selectedProduct.images[0].original_url || selectedProduct.images.find(img => img.is_primary)?.url || selectedProduct.images[0].url}
                    alt={selectedProduct.images.find(img => img.is_primary)?.alt_text || selectedProduct.name}
                    className="img-fluid rounded border"
                    style={{ maxHeight: '400px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
              ) : (
                <div className="mb-4 text-center">
                  <div 
                    className="bg-light border rounded d-flex align-items-center justify-content-center"
                    style={{ height: '300px' }}
                  >
                    <span className="text-muted">Sem imagem</span>
                  </div>
                </div>
              )}

              {/* Informações do Produto */}
              <div className="row">
                <div className="col-md-8">
                  <h5 className="text-dark-green mb-3">Informações do Produto</h5>
                  
                  {/* Categoria */}
                  <div className="mb-3">
                    <strong>Categoria:</strong>
                    <span className="badge bg-luxury-gold text-luxury-black fw-bold ms-2 px-3 py-2" style={{ fontSize: '12px', borderRadius: '12px' }}>
                      {getCategoryLabel(selectedProduct.category).toUpperCase()}
                    </span>
                  </div>

                  {/* Descrição */}
                  {selectedProduct.description && (
                    <div className="mb-3">
                      <strong>Descrição:</strong>
                      <p className="mt-2 text-muted">{selectedProduct.description}</p>
                    </div>
                  )}

                  {/* Preço */}
                  <div className="mb-3">
                    <strong>Preço:</strong>
                    <span className="ms-2 text-success fw-bold fs-5">
                      {selectedProduct.price ? `R$ ${Number(selectedProduct.price).toFixed(2).replace('.', ',')}` : 'Preço sob consulta'}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="col-md-4">
                    <h5 className="text-dark-green mb-3">Estoque</h5>
                    {selectedProduct.stocks && selectedProduct.stocks.length > 0 ? (
                      <div>
                        {selectedProduct.stocks.map((stock) => (
                          <div key={stock.id} className="mb-2">
                            <small className="text-muted">
                              Tamanho padrão: <span className="fw-bold">{stock.quantity} unidades</span>
                            </small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">Sem informações de estoque</p>
                    )}
                  </div>
                )}
              </div>

              {/* Galeria de Imagens */}
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div className="mt-4">
                  <h5 className="text-dark-green mb-3">Galeria de Imagens</h5>
                  <Row className="g-2">
                    {selectedProduct.images.map((image, index) => (
                      <Col key={index} xs={6} sm={4} md={3}>
                        <div className="position-relative">
                          <img
                            src={image.original_url || image.url}
                            alt={image.alt_text || selectedProduct.name}
                            className="img-fluid rounded border"
                            style={{ height: '100px', objectFit: 'cover', width: '100%', cursor: 'pointer' }}
                            onClick={() => {
                              // Trocar imagem principal
                              if (selectedProduct.images) {
                                const updatedImages = selectedProduct.images.map(img => ({
                                  ...img,
                                  is_primary: img.id === image.id
                                }));
                                setSelectedProduct({ ...selectedProduct, images: updatedImages });
                              }
                            }}
                          />
                          {image.is_primary && (
                            <span className="badge bg-luxury-charcoal text-luxury-gold fw-bold position-absolute top-0 end-0 m-1 px-2 py-1" style={{ fontSize: '10px', borderRadius: '8px' }}>
                              PRINCIPAL
                            </span>
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => {
              if (!isAdminMode) {
                // Modo público - verificar se está logado
                if (!isAuthenticated) {
                  toast.error('Faça login para adicionar itens ao carrinho!', {
                    icon: '🔒',
                    style: {
                      background: 'var(--luxury-charcoal)',
                      color: 'var(--luxury-white)',
                      fontWeight: 'bold'
                    }
                  });
                  return;
                }
              }
              
              if (selectedProduct) {
                addToCart(selectedProduct);
              }
            }}
            className="gradient-luxury-gold text-luxury-black fw-bold border-0 shadow-gold"
          >
            <i className="fas fa-shopping-cart me-2"></i>
            ADICIONAR AO CARRINHO
          </Button>
          {isAdmin && (
            <Button 
              variant="outline-primary" 
              onClick={() => {
                setShowProductModal(false);
                openImageModal(selectedProduct!);
              }}
            >
              Gerenciar Imagens
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowProductModal(false)}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Products;
