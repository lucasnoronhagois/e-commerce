import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

// Configuração do multer para armazenamento em disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${randomUUID()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

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

// Middleware para processar e otimizar imagens
export const processImage = async (req: any, res: any, next: any) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const processedFiles = [];
    
    for (const file of req.files) {
      const inputPath = file.path;
      const outputPath = inputPath.replace(/\.(jpg|jpeg|png|webp)$/i, '.webp');
      
      // Processar imagem com Sharp
      await sharp(inputPath)
        .resize(800, 600, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .webp({ quality: 80 })
        .toFile(outputPath);

      // Atualizar informações do arquivo
      file.filename = path.basename(outputPath);
      file.path = outputPath;
      file.mimetype = 'image/webp';
      
      processedFiles.push({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: `/uploads/products/${file.filename}`
      });
    }

    req.processedFiles = processedFiles;
    next();
  } catch (error) {
    next(error);
  }
};

export const uploadProductImages = upload.array('images', 5); // Máximo 5 imagens
