import React, { useState, useRef } from 'react';
import { Button, Form, Alert, Card, Row, Col, Modal } from 'react-bootstrap';
import { productApi } from '../services/api';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  productId: number;
  onImagesUploaded?: (images: any[]) => void;
  existingImages?: any[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  productId, 
  onImagesUploaded, 
  existingImages = [] 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [croppedImages, setCroppedImages] = useState<string[]>([]);
  const [cropData, setCropData] = useState<any[]>([]);
  const [showCropModal, setShowCropModal] = useState(false);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setError(`Arquivos inválidos: ${invalidFiles.join(', ')}`);
      return;
    }

    if (validFiles.length > 5) {
      setError('Máximo de 5 imagens por vez');
      return;
    }

    setSelectedFiles(files);
    setError('');

    // Criar previews e abrir modal de crop
    const newPreviews: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === files.length) {
          setPreviews(newPreviews);
          setShowCropModal(true);
          setCurrentCropIndex(0);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const cropImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      
      if (!canvas || !img) {
        resolve(imageSrc);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(imageSrc);
        return;
      }

      // Calcular a escala da imagem exibida vs imagem real
      const scaleX = img.naturalWidth / img.clientWidth;
      const scaleY = img.naturalHeight / img.clientHeight;
      
      // Converter coordenadas da área de crop para coordenadas da imagem real
      const cropX = cropArea.x * scaleX;
      const cropY = cropArea.y * scaleY;
      const cropWidth = cropArea.width * scaleX;
      const cropHeight = cropArea.height * scaleY;
      
      // Definir dimensões finais do crop (proporção do card: 4:3)
      const finalWidth = 400;
      const finalHeight = 300;
      
      // Configurar canvas
      canvas.width = finalWidth;
      canvas.height = finalHeight;
      
      // Desenhar a parte cropada da imagem
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, finalWidth, finalHeight
      );
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    });
  };

  const handleCropCurrent = async () => {
    if (currentCropIndex < previews.length) {
      const cropped = await cropImage(previews[currentCropIndex]);
      const newCroppedImages = [...croppedImages];
      newCroppedImages[currentCropIndex] = cropped;
      setCroppedImages(newCroppedImages);
      
      // Calcular coordenadas escaladas para a imagem original
      const img = imageRef.current;
      if (img) {
        const scaleX = img.naturalWidth / img.clientWidth;
        const scaleY = img.naturalHeight / img.clientHeight;
        
        const scaledCropData = {
          x: Math.round(cropArea.x * scaleX),
          y: Math.round(cropArea.y * scaleY),
          width: Math.round(cropArea.width * scaleX),
          height: Math.round(cropArea.height * scaleY)
        };
        
        // Crop calculado com sucesso
        
        
        // Salvar dados do crop escalados
        const newCropData = [...cropData];
        newCropData[currentCropIndex] = scaledCropData;
        setCropData(newCropData);
      }
      
      // Ir para próxima imagem ou fechar modal
      if (currentCropIndex < previews.length - 1) {
        setCurrentCropIndex(currentCropIndex + 1);
      } else {
        setShowCropModal(false);
      }
    }
  };

  const handleSkipCrop = () => {
    // Usar imagem original sem crop
    const newCroppedImages = [...croppedImages];
    newCroppedImages[currentCropIndex] = previews[currentCropIndex];
    setCroppedImages(newCroppedImages);
    
    // Salvar dados do crop como null (sem crop)
    const newCropData = [...cropData];
    newCropData[currentCropIndex] = null;
    setCropData(newCropData);
    
    // Ir para próxima imagem ou fechar modal
    if (currentCropIndex < previews.length - 1) {
      setCurrentCropIndex(currentCropIndex + 1);
    } else {
      setShowCropModal(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    // Obter coordenadas relativas à imagem
    const img = imageRef.current;
    if (!img) return;
    
    const rect = img.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    
    // Calcular o offset do clique dentro da área de seleção
    const offsetX = relativeX - cropArea.x;
    const offsetY = relativeY - cropArea.y;
    
    setDragStart({ 
      x: offsetX, 
      y: offsetY 
    });
  };

  // Adicionar eventos globais para melhor fluidez
  React.useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const img = imageRef.current;
      if (!img) return;

      // Obter coordenadas relativas à imagem
      const rect = img.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      
      // Calcular nova posição considerando o offset do clique
      const newX = relativeX - dragStart.x;
      const newY = relativeY - dragStart.y;
      
      // Limitar a área de crop dentro da imagem
      const maxX = img.clientWidth - cropArea.width;
      const maxY = img.clientHeight - cropArea.height;
      
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      }));
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragStart, cropArea.width, cropArea.height]);

  const resetCropArea = () => {
    const img = imageRef.current;
    if (img) {
      const centerX = (img.clientWidth - cropArea.width) / 2;
      const centerY = (img.clientHeight - cropArea.height) / 2;
      setCropArea(prev => ({
        ...prev,
        x: Math.max(0, centerX),
        y: Math.max(0, centerY)
      }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      
      // Enviar imagens originais completas
      Array.from(selectedFiles).forEach((file, index) => {
        formData.append('images', file);
        
        // Se houver crop, enviar também o thumbnail cropado
        if (croppedImages[index] && croppedImages[index] !== previews[index]) {
          // Converter o thumbnail cropado para blob e enviar
          fetch(croppedImages[index])
            .then(res => res.blob())
            .then(blob => {
              const thumbnailFile = new File([blob], `thumbnail_${index}.jpg`, { type: 'image/jpeg' });
              formData.append(`thumbnails`, thumbnailFile);
            });
        }
      });

      const uploadedImages = await productApi.uploadImages(productId, formData);
      toast.success(`${uploadedImages.length} imagem(ns) enviada(s) com sucesso!`);
      
      setSelectedFiles(null);
      setPreviews([]);
      setCroppedImages([]);
      setCropData([]);
      setShowCropModal(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      if (onImagesUploaded) {
        onImagesUploaded(uploadedImages);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || error.message || 'Erro ao fazer upload das imagens');
      toast.error('Erro ao fazer upload das imagens');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta imagem?')) return;

    try {
      await productApi.deleteImage(imageId);
      toast.success('Imagem excluída com sucesso!');
      
      if (onImagesUploaded) {
        // Atualizar lista local removendo a imagem excluída
        const updatedImages = existingImages.filter(img => img.id !== imageId);
        onImagesUploaded(updatedImages);
      }
    } catch (error) {
      toast.error('Erro ao excluir imagem');
    }
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await productApi.setPrimaryImage(imageId);
      toast.success('Imagem principal atualizada!');
      
      if (onImagesUploaded) {
        // Atualizar imagens localmente
        const updatedImages = existingImages.map(img => ({
          ...img,
          is_primary: img.id === imageId
        }));
        onImagesUploaded(updatedImages);
      }
    } catch (error) {
      toast.error('Erro ao definir imagem principal');
    }
  };

  return (
    <div>
      <h5 className="mb-3">Gerenciar Imagens</h5>
      
      {/* Upload de novas imagens */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">Adicionar Imagens</h6>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          <Form.Group className="mb-3">
            <Form.Label>Selecionar Imagens (máximo 5)</Form.Label>
            <Form.Control
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
            <Form.Text className="text-muted">
              Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo: 5MB por imagem.
            </Form.Text>
          </Form.Group>

          {/* Previews das imagens cropadas */}
          {croppedImages.length > 0 && (
            <div className="mb-3">
              <h6>Imagens processadas:</h6>
              <Row className="g-2">
                {croppedImages.map((image, index) => (
                  <Col key={index} xs={6} md={3}>
                    <div className="position-relative">
                      <img
                        src={image}
                        alt={`Processada ${index + 1}`}
                        className="img-fluid rounded border"
                        style={{ height: '100px', objectFit: 'cover', width: '100%' }}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFiles || selectedFiles.length === 0 || croppedImages.length === 0 || isUploading}
          >
            {isUploading ? 'Enviando...' : 'Fazer Upload'}
          </Button>
        </Card.Body>
      </Card>

      {/* Imagens existentes */}
      {existingImages && existingImages.length > 0 && (
        <Card>
          <Card.Header>
            <h6 className="mb-0">Imagens do Produto</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              {existingImages.map((image) => (
                <Col key={image.id} xs={12} sm={6} md={4}>
                  <div className="position-relative">
                    <img
                      src={image.url}
                      alt={image.alt_text || image.original_name}
                      className="img-fluid rounded border"
                      style={{ height: '200px', objectFit: 'cover', width: '100%' }}
                    />
                    {image.is_primary && (
                      <span className="badge bg-success position-absolute top-0 start-0 m-2">
                        Principal
                      </span>
                    )}
                    <div className="position-absolute bottom-0 end-0 m-2">
                      <div className="btn-group-vertical" role="group">
                        {!image.is_primary && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleSetPrimary(image.id)}
                            title="Definir como principal"
                          >
                            ★
                          </Button>
                        )}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteImage(image.id)}
                          title="Excluir imagem"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Modal de Crop */}
      <Modal show={showCropModal} onHide={() => setShowCropModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Ajustar Imagem {currentCropIndex + 1} de {previews.length}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mb-3 position-relative" style={{ display: 'inline-block' }}>
              <img
                ref={imageRef}
                src={previews[currentCropIndex]}
                alt="Imagem para crop"
                className="border rounded"
                style={{ maxHeight: '400px', maxWidth: '100%', userSelect: 'none' }}
                onLoad={resetCropArea}
                draggable={false}
              />
              {/* Área de seleção do crop */}
              <div
                style={{
                  position: 'absolute',
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                  border: `3px solid ${isDragging ? '#0056b3' : '#007bff'}`,
                  backgroundColor: isDragging ? 'rgba(0, 86, 179, 0.3)' : 'rgba(0, 123, 255, 0.2)',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                  transition: isDragging ? 'none' : 'all 0.1s ease',
                  boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseDown={handleMouseDown}
              >
                {/* Cantos para redimensionar */}
                <div
                  style={{
                    position: 'absolute',
                    top: -6,
                    left: -6,
                    width: 12,
                    height: 12,
                    backgroundColor: '#007bff',
                    border: '2px solid white',
                    borderRadius: '50%',
                    cursor: 'nw-resize'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 12,
                    height: 12,
                    backgroundColor: '#007bff',
                    border: '2px solid white',
                    borderRadius: '50%',
                    cursor: 'ne-resize'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: -6,
                    left: -6,
                    width: 12,
                    height: 12,
                    backgroundColor: '#007bff',
                    border: '2px solid white',
                    borderRadius: '50%',
                    cursor: 'sw-resize'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: -6,
                    right: -6,
                    width: 12,
                    height: 12,
                    backgroundColor: '#007bff',
                    border: '2px solid white',
                    borderRadius: '50%',
                    cursor: 'se-resize'
                  }}
                />
              </div>
            </div>
            
            <div className="mb-3">
              <Button variant="outline-secondary" size="sm" onClick={resetCropArea}>
                Centralizar Seleção
              </Button>
            </div>
            
            <Alert variant="info" className="text-start">
              <small>
                <strong>Instruções:</strong><br/>
                • Arraste a área azul para mover a seleção<br/>
                • Use os cantos para redimensionar<br/>
                • A área selecionada será como a imagem aparecerá no card
              </small>
            </Alert>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleSkipCrop}>
            Usar Original
          </Button>
          <Button variant="primary" onClick={handleCropCurrent}>
            {currentCropIndex < previews.length - 1 ? 'Aplicar e Próxima' : 'Aplicar e Finalizar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Canvas oculto para processamento */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageUpload;
