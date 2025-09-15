import React, { useState } from 'react';

interface ProductImage {
  id: number;
  url: string;
  thumbnail_url?: string;
  alt_text?: string;
  is_primary?: boolean;
}

interface ProductImageCarouselProps {
  images: ProductImage[];
  productName: string;
  height?: string;
  showIndicators?: boolean;
  showNavigation?: boolean;
  className?: string;
}

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ 
  images, 
  productName, 
  height = '200px',
  showIndicators = true,
  showNavigation = true,
  className = ''
}) => {
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
      <div 
        className={`d-flex align-items-center justify-content-center bg-light ${className}`}
        style={{ height, position: 'relative', overflow: 'hidden' }}
      >
        <span className="text-muted">Sem imagens</span>
      </div>
    );
  }

  const currentImage = validImages[currentIndex];

  return (
    <div 
      className={className}
      style={{ height, position: 'relative', overflow: 'hidden' }}
    >
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
      {showIndicators && validImages.length > 1 && (
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
      )}
      
      {/* Botões de navegação */}
      {showNavigation && validImages.length > 1 && (
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
    </div>
  );
};

export default ProductImageCarousel;
