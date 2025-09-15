import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Product } from '../types';
import { getCategoryLabel } from '../constants/categories';
import ProductImageCarousel from './ProductImageCarousel';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  isAdminMode?: boolean;
  isAuthenticated?: boolean;
  isInitialized?: boolean;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: number) => void;
  onManageImages?: (product: Product) => void;
  className?: string;
  showAddToCart?: boolean;
  showAdminActions?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isAdmin = false,
  isAdminMode = false,
  isAuthenticated = false,
  isInitialized = true,
  onProductClick,
  onAddToCart,
  onEdit,
  onDelete,
  onManageImages,
  className = '',
  showAddToCart = true,
  showAdminActions = false
}) => {
  const handleAddToCart = (e: React.MouseEvent) => {
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
    
    if (isInitialized && onAddToCart) {
      onAddToCart(product);
    } else {
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(product.id);
    }
  };

  const handleManageImages = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onManageImages) {
      onManageImages(product);
    }
  };

  const handleCardClick = () => {
    if (onProductClick) {
      onProductClick(product);
    }
  };

  return (
    <Card 
      className={`h-100 card d-flex flex-column ${className}`} 
      style={{ cursor: onProductClick ? 'pointer' : 'default' }} 
      onClick={handleCardClick}
    >
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
        {showAddToCart && (
          <div className="mt-auto pt-3">
            <Button
              variant="success"
              size="sm"
              onClick={handleAddToCart}
              className="w-100 gradient-luxury-gold text-luxury-black fw-bold border-0 shadow-gold"
              style={{ fontSize: '12px', padding: '6px 12px' }}
              disabled={!isInitialized}
            >
              <i className="fas fa-shopping-cart me-1"></i>
              {isInitialized ? 'ADICIONAR' : 'CARREGANDO...'}
            </Button>
          </div>
        )}

        {/* Botões de administração */}
        {showAdminActions && isAdmin && isAdminMode && (
          <div className="d-flex gap-1 mt-2 flex-column flex-sm-row">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleEdit}
              className="w-100 w-sm-auto"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              Editar
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleManageImages}
              className="w-100 w-sm-auto"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              Imagens
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleDelete}
              className="w-100 w-sm-auto"
              style={{ fontSize: '11px', padding: '4px 8px' }}
            >
              Excluir
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
