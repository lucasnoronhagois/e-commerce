import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Modal } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { Product } from '../types';
import { productApi, stockApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import ImageUpload from '../components/ImageUpload';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import ProductDetailModal from '../components/ProductDetailModal';
import ProductForm from '../components/ProductForm';
import SearchAndFilters from '../components/SearchAndFilters';
import { PRODUCT_CATEGORIES } from '../constants/categories';
import toast from 'react-hot-toast';
import { normalizeText } from '../utils/formatters';
import { useSearchAndFilter } from '../hooks/useSearchAndFilter';


const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [error, setError] = useState('');

  // Hook para busca, filtros e paginação
  const {
    filteredItems: filteredAndSortedProducts,
    currentItems: currentProducts,
    totalPages,
    state: { searchTerm, selectedCategory, sortBy, sortOrder, currentPage },
    actions: { setSearchTerm, setSelectedCategory, setSortBy, setSortOrder, setCurrentPage, handleSearch }
  } = useSearchAndFilter({
    items: products,
    searchFields: ['name', 'description'],
    categoryField: 'category',
    defaultSortBy: 'name',
    itemsPerPage: 8,
    searchFunction: (item: Product, searchTerm: string) => {
      const normalizedSearchTerm = normalizeText(searchTerm);
      return normalizeText(item.name).includes(normalizedSearchTerm) ||
             (item.description ? normalizeText(item.description).includes(normalizedSearchTerm) : false);
    },
    sortFunction: (a: Product, b: Product, sortBy: string, sortOrder: 'asc' | 'desc') => {
      let comparison = 0;
      
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name, 'pt-BR');
      } else if (sortBy === 'price') {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        comparison = priceA - priceB;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    }
  });

  const { isAdmin, isAuthenticated } = useAuth();
  const { addToCart, isInitialized } = useCart();
  const location = useLocation();
  
  // Detectar se estamos no modo admin baseado na URL
  const isAdminMode = location.pathname === '/products/manage';

  useEffect(() => {
    loadProducts();
  }, []);

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




  const handleSubmit = async (formData: any, selectedImages: FileList | null) => {
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
            if (stockError.response?.status === 403) {
              toast.error('Erro: Você precisa estar logado como administrador para criar estoque');
            } else {
              toast.error('Erro ao criar estoque: ' + (stockError.response?.data?.error || stockError.message));
            }
          }
        } else {
          toast.success('Produto criado com sucesso!');
        }

        // Upload de imagens se houver (apenas para novos produtos)
        if (!editingProduct && selectedImages && selectedImages.length > 0) {
          setIsUploadingImages(true);
          try {
            const formData = new FormData();
            Array.from(selectedImages).forEach(file => {
              formData.append('images', file);
            });
            
            await productApi.uploadImages(newProduct.id, formData);
            toast.success(`${selectedImages.length} imagem(ns) adicionada(s) com sucesso!`);
          } catch (imageError) {
            toast.error('Produto criado, mas houve erro ao adicionar imagens');
          } finally {
            setIsUploadingImages(false);
          }
        }
      }
      
      setShowModal(false);
      setEditingProduct(null);
      loadProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar produto');
      throw err; // Re-throw para o componente ProductForm
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
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
        products={products}
        showCategoryFilter={false}
        showSortControls={true}
        searchPlaceholder="Buscar na coleção..."
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
              <ProductCard
                product={product}
                isAdmin={isAdmin}
                isAdminMode={isAdminMode}
                isAuthenticated={isAuthenticated}
                isInitialized={isInitialized}
                onProductClick={openProductModal}
                onAddToCart={addToCart}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onManageImages={openImageModal}
                showAddToCart={true}
                showAdminActions={true}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* Controles de Paginação */}
      {!isLoading && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          showInfo={true}
          totalItems={filteredAndSortedProducts.length}
          itemsPerPage={8}
          currentItemsCount={currentProducts.length}
        />
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
      <ProductForm
        show={showModal}
        onHide={() => setShowModal(false)}
        editingProduct={editingProduct}
        onSubmit={handleSubmit}
        error={error}
        isUploadingImages={isUploadingImages}
      />

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
      <ProductDetailModal
        show={showProductModal}
        onHide={() => setShowProductModal(false)}
        product={selectedProduct}
        isAdmin={isAdmin}
        isAdminMode={isAdminMode}
        isAuthenticated={isAuthenticated}
        onAddToCart={addToCart}
        onManageImages={openImageModal}
      />
    </div>
  );
};

export default Products;
