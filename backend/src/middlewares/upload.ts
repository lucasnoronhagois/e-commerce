import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';

// Configuração do multer para armazenamento em memória (para Cloudinary)
const storage = multer.memoryStorage();

// Filtro para tipos de arquivo permitidos
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens JPEG, PNG e WebP são permitidas!'));
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limite
  },
  fileFilter: fileFilter,
});

// Middleware para processar arquivos em memória (para Cloudinary)
export const processImage = async (req: any, res: any, next: any) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const processedFiles = [];
    
    for (const file of req.files) {
      // Gerar nome único para o arquivo
      const uniqueName = `${randomUUID()}-${Date.now()}${path.extname(file.originalname)}`;
      
      processedFiles.push({
        filename: uniqueName,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer // Buffer em memória para Cloudinary
      });
    }

    req.processedFiles = processedFiles;
    next();
  } catch (error) {
    next(error);
  }
};

export const uploadProductImages = upload.array('images', 5); // Máximo 5 imagens
