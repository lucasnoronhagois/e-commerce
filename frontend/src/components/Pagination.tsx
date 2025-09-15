import React from 'react';
import { Row, Col } from 'react-bootstrap';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
  currentItemsCount?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  showInfo = false,
  totalItems = 0,
  itemsPerPage = 8,
  currentItemsCount = 0
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  return (
    <Row className={`mt-4 ${className}`}>
      <Col xs={12}>
        {showInfo && (
          <div className="text-center mb-3">
            <small className="text-muted">
              Página {currentPage} de {totalPages} • 
              Mostrando {currentItemsCount} item{currentItemsCount !== 1 ? 's' : ''}
              {totalItems > 0 && (
                <span> de {totalItems} total</span>
              )}
            </small>
          </div>
        )}
        
        <div className="d-flex justify-content-center">
          <nav aria-label="Navegação de páginas">
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className={`page-link border-luxury-silver fw-medium ${currentPage === 1 ? 'bg-luxury-silver text-luxury-charcoal' : 'bg-luxury-white text-luxury-charcoal hover:bg-luxury-gold hover:text-luxury-black'}`}
                  onClick={handlePrevious}
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
                    onClick={() => handlePageClick(page)}
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
                  onClick={handleNext}
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
  );
};

export default Pagination;
