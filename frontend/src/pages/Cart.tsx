import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import '../styles/cart.css';

const Cart: React.FC = () => {
  const { cartItems, updateQuantity, removeFromCart, getTotalItems, getTotalPrice, isInitialized } = useCart();
  const [shipping, setShipping] = useState(5.00);
  const [discountCode, setDiscountCode] = useState('');
  const navigate = useNavigate();

  const getSubtotal = () => {
    return getTotalPrice();
  };

  const getTotal = () => {
    return getSubtotal() + shipping;
  };

  const handleCheckout = () => {
    // Implementar checkout
    console.log('Checkout iniciado');
  };

  // Mostrar loading enquanto o carrinho está sendo carregado
  if (!isInitialized) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-luxury-gold" role="status">
          <span className="visually-hidden">Carregando carrinho...</span>
        </div>
        <p className="mt-3 text-luxury-charcoal">Carregando seu carrinho...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="fade-in">
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-shopping-cart text-luxury-gold" style={{ fontSize: '4rem' }}></i>
          </div>
          <h3 className="text-luxury-charcoal mb-3">Seu carrinho está vazio</h3>
          <p className="text-luxury-silver mb-4">
            Adicione alguns produtos de luxo à sua coleção
          </p>
          <Button 
            onClick={() => navigate('/products')}
            className="gradient-luxury-gold text-luxury-black fw-bold border-0 shadow-gold px-4 py-2"
          >
            <i className="fas fa-arrow-left me-2"></i>
            CONTINUAR COMPRANDO
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-card">
        <div className="row cart-row">
          {/* Lista de Produtos */}
          <div className="col-md-8 cart-section">
            <div className="cart-title">
              <div className="row cart-row">
                <div className="col">
                  <h4>CARRINHO DE COMPRAS</h4>
                </div>
                <div className="col align-self-center text-right text-muted">
                  {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Lista de Itens */}
            {cartItems.map((item, index) => (
              <div key={item.product.id} className={`row border-top border-bottom ${index === 0 ? 'border-top' : ''}`}>
                <div className="row cart-main align-items-center">
                  <div className="col-2">
                    <img 
                      src={item.product.images?.[0]?.url || '/placeholder-product.jpg'} 
                      alt={item.product.name}
                      className="cart-img img-fluid"
                    />
                  </div>
                  <div className="col">
                    <div className="row text-muted">{item.product.category?.toUpperCase()}</div>
                    <div className="row">{item.product.name}</div>
                  </div>
                  <div className="col">
                    <a href="#" onClick={(e) => { e.preventDefault(); updateQuantity(item.product.id, item.quantity - 1); }}>-</a>
                    <a href="#" className="border">{item.quantity}</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); updateQuantity(item.product.id, item.quantity + 1); }}>+</a>
                  </div>
                  <div className="col">
                    R$ {((item.product.price || 0) * item.quantity).toFixed(2).replace('.', ',')} 
                    <button 
                      className="cart-close" 
                      onClick={() => removeFromCart(item.product.id)}
                      title="Remover item"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Voltar às Compras */}
            <div className="cart-back-to-shop">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/products'); }}>
                <i className="fas fa-arrow-left"></i>
                <span className="text-muted">Voltar às compras</span>
              </a>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="col-md-4 cart-summary">
            <div>
              <h5>RESUMO</h5>
            </div>
            <hr className="cart-hr" />
            <div className="row cart-row">
              <div className="col" style={{ paddingLeft: 0 }}>ITENS {getTotalItems()}</div>
              <div className="col text-right">R$ {getSubtotal().toFixed(2).replace('.', ',')}</div>
            </div>
            <form className="cart-form">
              <p>FRETE</p>
              <select 
                className="cart-select"
                value={shipping}
                onChange={(e) => setShipping(parseFloat(e.target.value))}
              >
                <option value={5.00}>Entrega Padrão - R$ 5,00</option>
                <option value={15.00}>Entrega Expressa - R$ 15,00</option>
                <option value={0.00}>Retirada na Loja - Grátis</option>
              </select>
              <p>CUPOM DE DESCONTO</p>
              <input 
                id="code" 
                className="cart-input cart-code"
                placeholder="Digite seu cupom"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
            </form>
            <div className="row cart-row" style={{ borderTop: '1px solid rgba(0,0,0,.1)', padding: '2vh 0' }}>
              <div className="col">TOTAL</div>
              <div className="col text-right">R$ {getTotal().toFixed(2).replace('.', ',')}</div>
            </div>
            <button className="cart-btn" onClick={handleCheckout}>
              FINALIZAR COMPRA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
