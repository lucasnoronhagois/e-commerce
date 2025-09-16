// Mock do banco de dados para testes
jest.mock('../src/config/database', () => ({
  loadModels: jest.fn(() => ({})),
}));

// Mock do Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(() => Promise.resolve({
        public_id: 'test_id',
        secure_url: 'https://test.com/image.jpg',
        width: 800,
        height: 600
      })),
      destroy: jest.fn(() => Promise.resolve({ result: 'ok' }))
    }
  }
}));

// Mock do Sharp
jest.mock('sharp', () => {
  return jest.fn(() => ({
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    toBuffer: jest.fn(() => Promise.resolve(Buffer.from('test'))),
    metadata: jest.fn(() => Promise.resolve({
      width: 800,
      height: 600,
      format: 'jpeg'
    }))
  }));
});

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'test_user';
process.env.DB_PASSWORD = 'test_password';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});