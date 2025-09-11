import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Modal, Alert, Badge } from 'react-bootstrap';
import { Product } from '../types';
import { productApi, stockApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';
import { PRODUCT_CATEGORIES, getCategoryLabel, getCategoryIcon } from '../constants/categories';
import toast from 'react-hot-toast';

// Componente de Carrossel para Imagens do Produto
interface ProductImageCarouselProps {
  images: any[];
  productName: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ images, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div style={{ height: '200px', position: 'relative', overflow: 'hidden' }}>
      <img
        src={images[currentIndex].url}
        alt={images[currentIndex].alt_text || productName}
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
      {images.length > 1 && (
        <>
          <div className="position-absolute bottom-0 start-0 end-0 d-flex justify-content-center mb-2">
            {images.map((_, index) => (
              <div
                key={index}
                className={`rounded-circle mx-1 ${index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'}`}
                style={{ width: '8px', height: '8px', cursor: 'pointer' }}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
          
          {/* Botões de navegação */}
          {images.length > 1 && (
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
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: '', stockQuantity: '' });
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
      const submitData = {
        name: formData.name,
        description: formData.description || undefined,
        price: formData.price ? parseFloat(formData.price) : undefined,
        category: formData.category,
      };

      if (editingProduct) {
        await productApi.update(editingProduct.id, submitData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Criar produto
        const newProduct = await productApi.create(submitData);
        
        // Criar estoque se quantidade foi informada
        if (formData.stockQuantity && parseInt(formData.stockQuantity) > 0) {
          try {
            const stockData = {
              productId: newProduct.id,
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
    setFormData({ 
      name: product.name, 
      description: product.description || '', 
      price: product.price?.toString() || '',
      category: product.category || '',
      stockQuantity: '' // Não mostra estoque na edição, apenas na criação
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
              <Card className="h-100 card" style={{ cursor: 'pointer' }} onClick={() => openProductModal(product)}>
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
                
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="text-dark-green mb-0">
                      {product.name}
                    </Card.Title>
                    <Badge bg="primary" className="ms-2">
                      {getCategoryIcon(product.category)} {getCategoryLabel(product.category)}
                    </Badge>
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
                  
                  <Card.Text className="text-muted small">
                    ID: {product.id}
                  </Card.Text>
                  
                  {product.stocks && product.stocks.length > 0 && (
                    <Card.Text className="text-muted small">
                      Estoque: {product.stocks.reduce((total, stock) => total + stock.quantity, 0)} unidades
                    </Card.Text>
                  )}
                  
                  {product.images && product.images.length > 1 && (
                    <Card.Text>
                      <Badge bg="info">
                        {product.images.length} imagens
                      </Badge>
                    </Card.Text>
                  )}
                  
                  {isAdmin && (
                    <div className="d-flex gap-2 mt-3 flex-column flex-sm-row">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(product);
                        }}
                        className="w-100 w-sm-auto"
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
                    {category.icon} {category.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Escolha a categoria que melhor descreve o produto
              </Form.Text>
            </Form.Group>

            {!editingProduct && (
              <Form.Group className="mb-3">
                <Form.Label>Quantidade em Estoque</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Digite a quantidade inicial em estoque"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                />
                <Form.Text className="text-muted">
                  Quantidade inicial que será adicionada ao estoque (opcional)
                </Form.Text>
              </Form.Group>
            )}

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
                    src={selectedProduct.images.find(img => img.is_primary)?.url || selectedProduct.images[0].url}
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
                    <Badge bg="primary" className="ms-2">
                      {getCategoryIcon(selectedProduct.category)} {getCategoryLabel(selectedProduct.category)}
                    </Badge>
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
                            src={image.url}
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
                            <span className="badge bg-primary position-absolute top-0 end-0 m-1">
                              Principal
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
