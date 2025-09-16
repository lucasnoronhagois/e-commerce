import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../src/middlewares/auth';

// Mock do jwt
jest.mock('jsonwebtoken');
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', async () => {
      const token = 'valid.jwt.token';
      const decodedToken = { id: 1, role: 'customer' };

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      mockJwt.verify.mockImplementation((token: any, secret: any, callback: any) => {
        callback(null, decodedToken);
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET, expect.any(Function));
      expect((mockRequest as any).user).toEqual(decodedToken);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject request without authorization header', async () => {
      mockRequest.headers = {};

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token de acesso requerido' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid authorization format', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat'
      };

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token de acesso requerido' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', async () => {
      const token = 'invalid.jwt.token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      mockJwt.verify.mockImplementation((token: any, secret: any, callback: any) => {
        callback(new Error('Invalid token'), null);
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockJwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET, expect.any(Function));
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token inválido' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject request with expired token', async () => {
      const token = 'expired.jwt.token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      mockJwt.verify.mockImplementation((token: any, secret: any, callback: any) => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        callback(error, null);
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token inválido' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle malformed token', async () => {
      const token = 'malformed.token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      mockJwt.verify.mockImplementation((token: any, secret: any, callback: any) => {
        const error = new Error('Malformed token');
        error.name = 'JsonWebTokenError';
        callback(error, null);
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token inválido' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle unexpected errors', async () => {
      const token = 'valid.jwt.token';

      mockRequest.headers = {
        authorization: `Bearer ${token}`
      };

      mockJwt.verify.mockImplementation((token: any, secret: any, callback: any) => {
        callback(new Error('Unexpected error'), null);
      });

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token inválido' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle token without Bearer prefix', async () => {
      const token = 'valid.jwt.token';

      mockRequest.headers = {
        authorization: token
      };

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token de acesso requerido' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle empty token after Bearer', async () => {
      mockRequest.headers = {
        authorization: 'Bearer '
      };

      await authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token de acesso requerido' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
