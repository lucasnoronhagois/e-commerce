import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartProvider, useCart } from '../../contexts/CartContext';
import { TestWrapper } from '../setup';

// Mock do axios
vi.mock('axios', () => ({
  default: {
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
  const { 
    cartItems, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    getTotalItems, 
    getTotalPrice,
    isInitialized 
  } = useCart();

  return (
    <div>
      <div data-testid="isInitialized">{isInitialized ? 'true' : 'false'}</div>
      <div data-testid="totalItems">{getTotalItems()}</div>
      <div data-testid="totalPrice">{getTotalPrice().toFixed(2)}</div>
      <div data-testid="cartItems">{cartItems.length}</div>
      <button onClick={() => addToCart({
        id: 1,
        name: 'Test Product',
        price: 100,
        description: 'Test Description',
        category: 'test',
        images: []
      })}>Add Product</button>
      <button onClick={() => removeFromCart(1)}>Remove Product</button>
      <button onClick={() => updateQuantity(1, 5)}>Update Quantity</button>
    </div>
  );
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should provide initial state', () => {
    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );

    expect(screen.getByTestId('isInitialized')).toHaveTextContent('true');
    expect(screen.getByTestId('totalItems')).toHaveTextContent('0');
    expect(screen.getByTestId('totalPrice')).toHaveTextContent('0.00');
    expect(screen.getByTestId('cartItems')).toHaveTextContent('0');
  });

  it('should add product to cart', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );

    await act(async () => {
      await user.click(screen.getByText('Add Product'));
    });

    expect(screen.getByTestId('totalItems')).toHaveTextContent('1');
    expect(screen.getByTestId('totalPrice')).toHaveTextContent('100.00');
    expect(screen.getByTestId('cartItems')).toHaveTextContent('1');
  });

  it('should not add duplicate product to cart', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );

    // Adicionar produto duas vezes
    await act(async () => {
      await user.click(screen.getByText('Add Product'));
      await user.click(screen.getByText('Add Product'));
    });

    expect(screen.getByTestId('totalItems')).toHaveTextContent('1');
    expect(screen.getByTestId('totalPrice')).toHaveTextContent('100.00');
    expect(screen.getByTestId('cartItems')).toHaveTextContent('1');
  });

  it('should update product quantity', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );

    // Adicionar produto
    await act(async () => {
      await user.click(screen.getByText('Add Product'));
    });

    // Atualizar quantidade
    await act(async () => {
      await user.click(screen.getByText('Update Quantity'));
    });

    expect(screen.getByTestId('totalItems')).toHaveTextContent('5');
    expect(screen.getByTestId('totalPrice')).toHaveTextContent('500.00');
  });

  it('should remove product from cart', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );

    // Adicionar produto
    await act(async () => {
      await user.click(screen.getByText('Add Product'));
    });

    expect(screen.getByTestId('totalItems')).toHaveTextContent('1');

    // Remover produto
    await act(async () => {
      await user.click(screen.getByText('Remove Product'));
    });

    expect(screen.getByTestId('totalItems')).toHaveTextContent('0');
    expect(screen.getByTestId('totalPrice')).toHaveTextContent('0.00');
    expect(screen.getByTestId('cartItems')).toHaveTextContent('0');
  });

  it('should persist cart in localStorage', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );

    // Adicionar produto
    await act(async () => {
      await user.click(screen.getByText('Add Product'));
    });

    // Verificar se foi salvo no localStorage
    const savedCart = localStorage.getItem('cart');
    expect(savedCart).toBeTruthy();
    
    const cartData = JSON.parse(savedCart!);
    expect(cartData).toHaveLength(1);
    expect(cartData[0].product.id).toBe(1);
    expect(cartData[0].quantity).toBe(1);
  });

  it('should restore cart from localStorage on mount', () => {
    const mockCart = [
      {
        product: {
          id: 1,
          name: 'Test Product',
          price: 100,
          description: 'Test Description',
          category: 'test',
          images: []
        },
        quantity: 2
      }
    ];

    localStorage.setItem('cart', JSON.stringify(mockCart));

    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );

    expect(screen.getByTestId('totalItems')).toHaveTextContent('2');
    expect(screen.getByTestId('totalPrice')).toHaveTextContent('200.00');
    expect(screen.getByTestId('cartItems')).toHaveTextContent('1');
  });

  it('should handle invalid localStorage data', () => {
    localStorage.setItem('cart', 'invalid-json');

    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );

    expect(screen.getByTestId('totalItems')).toHaveTextContent('0');
    expect(screen.getByTestId('totalPrice')).toHaveTextContent('0.00');
    expect(screen.getByTestId('cartItems')).toHaveTextContent('0');
  });

  it('should calculate total correctly with multiple products', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );

    // Adicionar primeiro produto
    await act(async () => {
      await user.click(screen.getByText('Add Product'));
    });

    // Adicionar segundo produto (diferente)
    await act(async () => {
      await user.click(screen.getByText('Add Product'));
    });

    // Atualizar quantidade do primeiro produto
    await act(async () => {
      await user.click(screen.getByText('Update Quantity'));
    });

    expect(screen.getByTestId('totalItems')).toHaveTextContent('6'); // 5 + 1
    expect(screen.getByTestId('totalPrice')).toHaveTextContent('600.00'); // (100 * 5) + (100 * 1)
  });

  it('should handle removing non-existent product', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );

    // Tentar remover produto que não existe
    await act(async () => {
      await user.click(screen.getByText('Remove Product'));
    });

    expect(screen.getByTestId('totalItems')).toHaveTextContent('0');
    expect(screen.getByTestId('totalPrice')).toHaveTextContent('0.00');
  });

  it('should handle updating quantity of non-existent product', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <CartProvider>
          <TestComponent />
        </CartProvider>
      </TestWrapper>
    );

    // Tentar atualizar quantidade de produto que não existe
    await act(async () => {
      await user.click(screen.getByText('Update Quantity'));
    });

    expect(screen.getByTestId('totalItems')).toHaveTextContent('0');
    expect(screen.getByTestId('totalPrice')).toHaveTextContent('0.00');
  });
});
