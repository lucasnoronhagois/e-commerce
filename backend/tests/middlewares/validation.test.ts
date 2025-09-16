import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';
import { validate, validateParams } from '../../src/middlewares/validation';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('validate', () => {
    const testSchema = yup.object({
      name: yup.string().required('Nome é obrigatório'),
      email: yup.string().email('Email inválido').required('Email é obrigatório'),
      age: yup.number().positive('Idade deve ser positiva').required('Idade é obrigatória')
    });

    it('should pass validation with valid data', async () => {
      mockRequest.body = {
        name: 'João Silva',
        email: 'joao@test.com',
        age: 25
      };

      const middleware = validate(testSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return validation errors for invalid data', async () => {
      mockRequest.body = {
        name: '',
        email: 'invalid-email',
        age: -5
      };

      const middleware = validate(testSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: [
          { message: 'Nome é obrigatório' },
          { message: 'Email inválido' },
          { message: 'Idade deve ser positiva' }
        ]
      });
    });

    it('should return validation errors for missing required fields', async () => {
      mockRequest.body = {
        name: 'João Silva'
        // email and age missing
      };

      const middleware = validate(testSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: [
          { message: 'Email é obrigatório' },
          { message: 'Idade é obrigatória' }
        ]
      });
    });

    it('should handle unexpected validation errors', async () => {
      // Mock yup to throw a non-ValidationError
      const mockSchema = {
        validate: jest.fn().mockRejectedValue(new Error('Unexpected error'))
      } as any;

      mockRequest.body = { name: 'João' };

      const middleware = validate(mockSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor'
      });
    });
  });

  describe('validateParams', () => {
    const testSchema = yup.object({
      id: yup.number().positive('ID deve ser positivo').required('ID é obrigatório')
    });

    it('should pass validation with valid params', async () => {
      mockRequest.params = {
        id: '123'
      };

      const middleware = validateParams(testSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return validation errors for invalid params', async () => {
      mockRequest.params = {
        id: '-1'
      };

      const middleware = validateParams(testSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: [
          { message: 'ID deve ser positivo' }
        ]
      });
    });

    it('should return validation errors for missing params', async () => {
      mockRequest.params = {};

      const middleware = validateParams(testSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: [
          { message: 'ID é obrigatório' }
        ]
      });
    });

    it('should handle unexpected validation errors in params', async () => {
      const mockSchema = {
        validate: jest.fn().mockRejectedValue(new Error('Unexpected error'))
      } as any;

      mockRequest.params = { id: '123' };

      const middleware = validateParams(mockSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Erro interno do servidor'
      });
    });
  });
});
