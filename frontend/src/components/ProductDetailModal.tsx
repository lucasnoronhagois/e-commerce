import React, { useState } from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { Product } from '../types';
import { getCategoryLabel } from '../constants/categories';
import toast from 'react-hot-toast';

interface ProductDetailModalProps {
  show: boolean;
  onHide: () => void;
  product: Product | null;
  isAdmin?: boolean;
  isAdminMode?: boolean;
  isAuthenticated?: boolean;
  onAddToCart?: (product: Product) => void;
  onManageImages?: (product: Product) => void;
  size?: 'sm' | 'lg' | 'xl';
  centered?: boolean;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  show,
  onHide,
  product,
  isAdmin = false,
  isAdminMode = false,
  isAuthenticated = false,
  onAddToCart,
  onManageImages,
  size = 'lg',
  centered = true
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(product);

  // Atualizar produto quando prop mudar
  React.useEffect(() => {
    setSelectedProduct(product);
  }, [product]);

  const handleAddToCart = () => {
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
    
    if (selectedProduct && onAddToCart) {
      onAddToCart(selectedProduct);
    }
  };

  const handleManageImages = () => {
    if (selectedProduct && onManageImages) {
      onHide();
      onManageImages(selectedProduct);
    }
  };

  const handleImageClick = (image: any) => {
    if (selectedProduct && selectedProduct.images) {
      const updatedImages = selectedProduct.images.map(img => ({
        ...img,
        is_primary: img.id === image.id
      }));
      setSelectedProduct({ ...selectedProduct, images: updatedImages });
    }
  };

  if (!selectedProduct) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} size={size} centered={centered}>
      <Modal.Header closeButton>
        <Modal.Title className="text-dark-green">
          {selectedProduct.name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          {/* Imagem Principal */}
          {selectedProduct.images && selectedProduct.images.length > 0 ? (
            <div className="mb-4 text-center">
              <img
                src={selectedProduct.images.find(img => img.is_primary)?.original_url || 
                     selectedProduct.images[0].original_url || 
                     selectedProduct.images.find(img => img.is_primary)?.url || 
                     selectedProduct.images[0].url}
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
                        onClick={() => handleImageClick(image)}
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
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="success"
          onClick={handleAddToCart}
          className="gradient-luxury-gold text-luxury-black fw-bold border-0 shadow-gold"
        >
          <i className="fas fa-shopping-cart me-2"></i>
          ADICIONAR AO CARRINHO
        </Button>
        {isAdmin && onManageImages && (
          <Button 
            variant="outline-primary" 
            onClick={handleManageImages}
          >
            Gerenciar Imagens
          </Button>
        )}
        <Button variant="secondary" onClick={onHide}>
          Fechar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ProductDetailModal;
