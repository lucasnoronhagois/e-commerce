import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductCard from '../../components/ProductCard';
import { TestWrapper } from '../setup';

// Mock do useCart
const mockAddToCart = vi.fn();
const mockCartItems = [
  {
    product: { id: 1, name: 'Test Product', price: 100 },
    quantity: 1
  }
];

vi.mock('../../contexts/CartContext', () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    cartItems: mockCartItems,
    isInitialized: true
  })
}));

// Mock do useAuth
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    user: { id: 1, name: 'Test User', role: 'customer' }
  })
}));

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'This is a test product',
    price: 99.99,
    category: 'electronics',
    images: [
      {
        id: 1,
        url: 'https://example.com/image1.jpg',
        thumbnail_url: 'https://example.com/thumb1.jpg',
        is_primary: true
      },
      {
        id: 2,
        url: 'https://example.com/image2.jpg',
        thumbnail_url: 'https://example.com/thumb2.jpg',
        is_primary: false
      }
    ],
    stocks: [
      {
        id: 1,
        size: 'M',
        color: 'Blue',
        quantity: 10
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render product information correctly', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('This is a test product')).toBeInTheDocument();
    expect(screen.getByText('R$ 99,99')).toBeInTheDocument();
    expect(screen.getByText('electronics')).toBeInTheDocument();
  });

  it('should display primary image', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'https://example.com/thumb1.jpg');
    expect(image).toHaveAttribute('alt', 'Test Product');
  });

  it('should show stock information', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('M - Blue')).toBeInTheDocument();
    expect(screen.getByText('10 unidades')).toBeInTheDocument();
  });

  it('should show "Adicionar ao Carrinho" button for authenticated users', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Adicionar ao Carrinho')).toBeInTheDocument();
  });

  it('should show "Login para Comprar" button for unauthenticated users', () => {
    // Mock unauthenticated user
    vi.mocked(require('../../contexts/AuthContext').useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null
    });

    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Login para Comprar')).toBeInTheDocument();
  });

  it('should call addToCart when "Adicionar ao Carrinho" is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    const addButton = screen.getByText('Adicionar ao Carrinho');
    await user.click(addButton);

    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });

  it('should show "Ver Detalhes" button', () => {
    render(
      <TestWrapper>
        <ProductCard product={mockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Ver Detalhes')).toBeInTheDocument();
  });

  it('should handle product without images', () => {
    const productWithoutImages = {
      ...mockProduct,
      images: []
    };

    render(
      <TestWrapper>
        <ProductCard product={productWithoutImages} />
      </TestWrapper>
    );

    // Should show placeholder or default image
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
  });

  it('should handle product without stock', () => {
    const productWithoutStock = {
      ...mockProduct,
      stocks: []
    };

    render(
      <TestWrapper>
        <ProductCard product={productWithoutStock} />
      </TestWrapper>
    );

    expect(screen.getByText('Sem estoque')).toBeInTheDocument();
  });

  it('should format price correctly', () => {
    const expensiveProduct = {
      ...mockProduct,
      price: 1234.56
    };

    render(
      <TestWrapper>
        <ProductCard product={expensiveProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('R$ 1.234,56')).toBeInTheDocument();
  });

  it('should show product as out of stock when quantity is 0', () => {
    const outOfStockProduct = {
      ...mockProduct,
      stocks: [
        {
          id: 1,
          size: 'M',
          color: 'Blue',
          quantity: 0
        }
      ]
    };

    render(
      <TestWrapper>
        <ProductCard product={outOfStockProduct} />
      </TestWrapper>
    );

    expect(screen.getByText('Sem estoque')).toBeInTheDocument();
  });

  it('should disable add to cart button when out of stock', () => {
    const outOfStockProduct = {
      ...mockProduct,
      stocks: [
        {
          id: 1,
          size: 'M',
          color: 'Blue',
          quantity: 0
        }
      ]
    };

    render(
      <TestWrapper>
        <ProductCard product={outOfStockProduct} />
      </TestWrapper>
    );

    const addButton = screen.getByText('Sem estoque');
    expect(addButton).toBeDisabled();
  });

  it('should show multiple stock options', () => {
    const productWithMultipleStock = {
      ...mockProduct,
      stocks: [
        {
          id: 1,
          size: 'M',
          color: 'Blue',
          quantity: 10
        },
        {
          id: 2,
          size: 'L',
          color: 'Red',
          quantity: 5
        }
      ]
    };

    render(
      <TestWrapper>
        <ProductCard product={productWithMultipleStock} />
      </TestWrapper>
    );

    expect(screen.getByText('M - Blue')).toBeInTheDocument();
    expect(screen.getByText('L - Red')).toBeInTheDocument();
  });
});
