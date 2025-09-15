import React from 'react';
import { Row, Col, Form, Button, Card } from 'react-bootstrap';
import { Product } from '../types';
import { PRODUCT_CATEGORIES } from '../constants/categories';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearch: () => void;
  sortBy: 'name' | 'price';
  onSortByChange: (sortBy: 'name' | 'price') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  products: Product[];
  showCategoryFilter?: boolean;
  showSortControls?: boolean;
  searchPlaceholder?: string;
  className?: string;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchTermChange,
  onSearch,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  selectedCategory,
  onCategoryChange,
  products,
  showCategoryFilter = true,
  showSortControls = true,
  searchPlaceholder = "Buscar na coleção...",
  className = ''
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className={className}>
      {/* Barra de Busca */}
      <Row className="mb-4 g-2">
        <Col xs={12} md={6}>
          <div className="position-relative">
            <Form.Control
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              onKeyPress={handleKeyPress}
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
            onClick={onSearch} 
            className="w-100 gradient-luxury-silver text-luxury-black fw-bold border-0 shadow-luxury"
            style={{ borderRadius: '8px', padding: '12px' }}
          >
            <i className="fas fa-search me-2"></i>
            BUSCAR
          </Button>
        </Col>
      </Row>

      {/* Controles de Ordenação */}
      {showSortControls && (
        <Row className="mb-3">
          <Col xs={12}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <span className="text-luxury-charcoal fw-medium small">ORDENAR POR:</span>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => onSortByChange(e.target.value as 'name' | 'price')}
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
                  onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
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
            </div>
          </Col>
        </Row>
      )}

      {/* Filtros por Categoria */}
      {showCategoryFilter && (
        <Row>
          <Col lg={2} md={3} className="mb-4">
            <Card className="h-100 border-luxury-silver shadow-luxury">
              <Card.Header className="bg-luxury-charcoal border-luxury-silver">
                <h5 className="text-luxury-gold mb-0 fw-bold">CATEGORIES</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="list-group list-group-flush">
                  <button
                    className={`list-group-item list-group-item-action d-flex align-items-center border-0 ${selectedCategory === 'all' ? 'bg-luxury-gold text-luxury-black' : 'bg-luxury-white text-luxury-charcoal'}`}
                    onClick={() => onCategoryChange('all')}
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
                        onClick={() => onCategoryChange(category.value)}
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
        </Row>
      )}
    </div>
  );
};

export default SearchAndFilters;
