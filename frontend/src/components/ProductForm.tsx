import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Row, Col, Badge } from 'react-bootstrap';
import { Product } from '../types';
import { PRODUCT_CATEGORIES } from '../constants/categories';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  stockQuantity: string;
}

interface ProductFormProps {
  show: boolean;
  onHide: () => void;
  editingProduct?: Product | null;
  onSubmit: (data: ProductFormData, selectedImages: FileList | null) => Promise<void>;
  error?: string;
  isUploadingImages?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  show,
  onHide,
  editingProduct,
  onSubmit,
  error,
  isUploadingImages = false
}) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: ''
  });
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Atualizar formData quando editingProduct mudar
  React.useEffect(() => {
    if (editingProduct) {
      const totalStock = editingProduct.stocks?.reduce((total, stock) => total + stock.quantity, 0) || 0;
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description || '',
        price: editingProduct.price?.toString() || '',
        category: editingProduct.category || '',
        stockQuantity: totalStock.toString()
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stockQuantity: ''
      });
    }
    setSelectedImages(null);
    setImagePreviews([]);
  }, [editingProduct, show]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validar arquivos
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        if (file.size <= 5 * 1024 * 1024) { // 5MB
          validFiles.push(file);
        } else {
          invalidFiles.push(`${file.name} (muito grande)`);
        }
      } else {
        invalidFiles.push(`${file.name} (tipo não suportado)`);
      }
    });

    if (invalidFiles.length > 0) {
      alert(`Arquivos inválidos: ${invalidFiles.join(', ')}`);
      return;
    }

    if (validFiles.length > 5) {
      alert('Máximo de 5 imagens por vez');
      return;
    }

    setSelectedImages(files);

    // Criar previews
    const newPreviews: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === files.length) {
          setImagePreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData, selectedImages);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
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

          {/* Seção de Upload de Imagens - apenas para novos produtos */}
          {!editingProduct && (
            <Form.Group className="mb-3">
              <Form.Label>Imagens do Produto (Opcional)</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                disabled={isUploadingImages}
              />
              <Form.Text className="text-muted">
                Selecione até 5 imagens. Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo: 5MB por imagem.
              </Form.Text>
              
              {/* Preview das imagens selecionadas */}
              {imagePreviews.length > 0 && (
                <div className="mt-3">
                  <h6>Imagens selecionadas:</h6>
                  <Row className="g-2">
                    {imagePreviews.map((preview, index) => (
                      <Col key={index} xs={6} md={3}>
                        <div className="position-relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="img-fluid rounded border"
                            style={{ height: '100px', objectFit: 'cover', width: '100%' }}
                          />
                          <Badge bg="primary" className="position-absolute top-0 end-0 m-1">
                            {index + 1}
                          </Badge>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </Form.Group>
          )}

          <div className="alert alert-info mb-3">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Dica:</strong> 
            {editingProduct 
              ? " Para adicionar imagens, use o botão 'Imagens' no card do produto."
              : " Você pode adicionar imagens agora ou depois de criar o produto."
            }
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={isUploadingImages}
          >
            {isUploadingImages ? 'Enviando imagens...' : (editingProduct ? 'Atualizar' : 'Criar')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProductForm;
