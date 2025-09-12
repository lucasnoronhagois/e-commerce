import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import toast from 'react-hot-toast';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
  getItemQuantity: (productId: number) => number;
  isInitialized: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('luxury-cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          // Validar se os dados estão no formato correto
          if (Array.isArray(parsedCart)) {
            setCartItems(parsedCart);
            console.log('Carrinho carregado do localStorage:', parsedCart.length, 'itens');
          } else {
            console.warn('Formato inválido do carrinho no localStorage, iniciando vazio');
            setCartItems([]);
          }
        } else {
          console.log('Nenhum carrinho encontrado no localStorage, iniciando vazio');
          setCartItems([]);
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho do localStorage:', error);
        setCartItems([]);
        // Limpar dados corrompidos
        localStorage.removeItem('luxury-cart');
      } finally {
        setIsInitialized(true);
      }
    };

    loadCart();
  }, []);

  // Salvar carrinho no localStorage sempre que houver mudanças
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('luxury-cart', JSON.stringify(cartItems));
        console.log('Carrinho salvo no localStorage:', cartItems.length, 'itens');
      } catch (error) {
        console.error('Erro ao salvar carrinho no localStorage:', error);
      }
    }
  }, [cartItems, isInitialized]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Se o produto já está no carrinho, aumenta a quantidade
        const updatedItems = prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        
        toast.success(`${product.name} adicionado ao carrinho!`, {
          icon: '🛒',
          style: {
            background: '#D4AF37',
            color: '#000000',
            fontWeight: 'bold',
            border: '2px solid #B8860B',
            borderRadius: '8px',
            padding: '12px 16px'
          }
        });
        
        return updatedItems;
      } else {
        // Se é um novo produto, adiciona ao carrinho
        const newItems = [...prev, { product, quantity }];
        
        toast.success(`${product.name} adicionado ao carrinho!`, {
          icon: '🛒',
          style: {
            background: '#D4AF37',
            color: '#000000',
            fontWeight: 'bold',
            border: '2px solid #B8860B',
            borderRadius: '8px',
            padding: '12px 16px'
          }
        });
        
        return newItems;
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCartItems(prev => {
      const item = prev.find(item => item.product.id === productId);
      const newItems = prev.filter(item => item.product.id !== productId);
      
      if (item) {
        toast.success(`${item.product.name} removido do carrinho!`, {
          icon: '🗑️',
          style: {
            background: 'var(--luxury-charcoal)',
            color: 'var(--luxury-white)',
            fontWeight: 'bold'
          }
        });
      }
      
      return newItems;
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.product.price || 0) * item.quantity, 0);
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('luxury-cart');
      console.log('Carrinho limpo do localStorage');
    } catch (error) {
      console.error('Erro ao limpar carrinho do localStorage:', error);
    }
    toast.success('Carrinho limpo!', {
      icon: '🧹',
      style: {
        background: 'var(--luxury-gold)',
        color: 'var(--luxury-black)',
        fontWeight: 'bold'
      }
    });
  };

  const isInCart = (productId: number) => {
    return cartItems.some(item => item.product.id === productId);
  };

  const getItemQuantity = (productId: number) => {
    const item = cartItems.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    clearCart,
    isInCart,
    getItemQuantity,
    isInitialized
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
