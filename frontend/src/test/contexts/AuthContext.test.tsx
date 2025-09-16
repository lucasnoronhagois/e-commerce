import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { TestWrapper } from '../setup';

// Mock do axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: {
      headers: {
        common: {}
      }
    }
  }
}));

// Componente de teste para usar o contexto
const TestComponent = () => {
  const { user, isAuthenticated, isAdmin, isLoading, login, logout, register } = useAuth();

  return (
    <div>
      <div data-testid="user">{user ? user.name : 'No user'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <div data-testid="isAdmin">{isAdmin ? 'true' : 'false'}</div>
      <div data-testid="isLoading">{isLoading ? 'true' : 'false'}</div>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => register({
        name: 'Test User',
        mail: 'test@test.com',
        login: 'testuser',
        password: 'password123',
        phone: '11999999999',
        address: 'Test Address',
        zip_code: '01234-567',
        document: '12345678901',
        neighborhood: 'Test Neighborhood',
        city: 'Test City',
        state: 'SP'
      })}>Register</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should provide initial state', () => {
    render(
      <TestWrapper>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </TestWrapper>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
    expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
  });

  it('should login successfully', async () => {
    const user = userEvent.setup();
    const mockAxios = await import('axios');
    
    const mockResponse = {
      data: {
        user: {
          id: 1,
          name: 'Test User',
          mail: 'test@test.com',
          login: 'testuser',
          role: 'customer'
        },
        token: 'mock-jwt-token'
      }
    };

    mockAxios.default.post.mockResolvedValue(mockResponse);

    render(
      <TestWrapper>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </TestWrapper>
    );

    await act(async () => {
      await user.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
    });

    expect(localStorage.getItem('token')).toBe('mock-jwt-token');
  });

  it('should login as admin', async () => {
    const user = userEvent.setup();
    const mockAxios = await import('axios');
    
    const mockResponse = {
      data: {
        user: {
          id: 1,
          name: 'Admin User',
          mail: 'admin@test.com',
          login: 'admin',
          role: 'admin'
        },
        token: 'mock-jwt-token'
      }
    };

    mockAxios.default.post.mockResolvedValue(mockResponse);

    render(
      <TestWrapper>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </TestWrapper>
    );

    await act(async () => {
      await user.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Admin User');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('isAdmin')).toHaveTextContent('true');
    });
  });

  it('should handle login error', async () => {
    const user = userEvent.setup();
    const mockAxios = await import('axios');
    
    mockAxios.default.post.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <TestWrapper>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </TestWrapper>
    );

    await act(async () => {
      await user.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });
  });

  it('should logout successfully', async () => {
    const user = userEvent.setup();
    
    // Primeiro fazer login
    const mockAxios = await import('axios');
    const mockResponse = {
      data: {
        user: {
          id: 1,
          name: 'Test User',
          mail: 'test@test.com',
          login: 'testuser',
          role: 'customer'
        },
        token: 'mock-jwt-token'
      }
    };

    mockAxios.default.post.mockResolvedValue(mockResponse);

    render(
      <TestWrapper>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </TestWrapper>
    );

    // Login
    await act(async () => {
      await user.click(screen.getByText('Login'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });

    // Logout
    await act(async () => {
      await user.click(screen.getByText('Logout'));
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');
    });

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should register successfully', async () => {
    const user = userEvent.setup();
    const mockAxios = await import('axios');
    
    const mockResponse = {
      data: {
        id: 1,
        name: 'Test User',
        mail: 'test@test.com',
        login: 'testuser',
        role: 'customer'
      }
    };

    mockAxios.default.post.mockResolvedValue(mockResponse);

    render(
      <TestWrapper>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </TestWrapper>
    );

    await act(async () => {
      await user.click(screen.getByText('Register'));
    });

    await waitFor(() => {
      expect(mockAxios.default.post).toHaveBeenCalledWith('/api/auth/register', {
        name: 'Test User',
        mail: 'test@test.com',
        login: 'testuser',
        password: 'password123',
        phone: '11999999999',
        address: 'Test Address',
        zip_code: '01234-567',
        document: '12345678901',
        neighborhood: 'Test Neighborhood',
        city: 'Test City',
        state: 'SP'
      });
    });
  });

  it('should restore user from localStorage on mount', async () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      mail: 'test@test.com',
      login: 'testuser',
      role: 'customer'
    };

    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(
      <TestWrapper>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Test User');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    });
  });

  it('should handle invalid token on mount', async () => {
    localStorage.setItem('token', 'invalid-token');
    localStorage.setItem('user', JSON.stringify({}));

    render(
      <TestWrapper>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
