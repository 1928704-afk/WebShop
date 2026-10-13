import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CheckoutModal } from '../components/CheckoutModal';

interface CartPageProps {
  onOpenAuth: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onOpenAuth }) => {
  const { items, updateQuantity, removeFromCart, totalPrice, totalCount } = useCart();
  const { isAuthenticated } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const navigate = useNavigate();

  const handleCheckoutClick = () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (orderId: number) => {
    navigate('/orders');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">장바구니가 비어 있습니다</h2>
        <p className="text-gray-500 mb-8 text-sm">마음에 드는 상품을 장바구니에 담아보세요.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>쇼핑 계속하기</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">장바구니 ({totalCount})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex gap-4 items-center"
            >
              <img
                src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                alt={product.name}
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl bg-gray-100 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <span className="text-xs text-gray-400 font-medium">{product.category}</span>
                <h3 className="font-semibold text-gray-800 text-base truncate">{product.name}</h3>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {product.price.toLocaleString()}원
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="p-1 hover:bg-gray-50 text-gray-600 transition"
                      aria-label="감소"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 text-xs font-semibold">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="p-1 hover:bg-gray-50 text-gray-600 transition"
                      aria-label="증가"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-xs text-gray-500 font-medium">
                    소계: {(product.price * quantity).toLocaleString()}원
                  </span>
                </div>
              </div>

              {/* Delete Button */}
              <button
                onClick={() => removeFromCart(product.id)}
                className="p-2 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-gray-50 transition"
                title="삭제"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm h-fit space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
            주문 요약
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>총 상품금액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>배송비</span>
              <span className="text-sky-600 font-medium">무료배송</span>
            </div>
            <div className="flex justify-between font-extrabold text-base text-gray-900 pt-3 border-t border-gray-100">
              <span>결제 예정 금액</span>
              <span className="text-xl text-sky-600">{totalPrice.toLocaleString()}원</span>
            </div>
          </div>

          <button
            onClick={handleCheckoutClick}
            className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold text-base rounded-xl transition shadow-md"
          >
            {isAuthenticated ? '주문하기' : '로그인 후 주문하기'}
          </button>
        </div>
      </div>

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handleOrderSuccess}
      />
    </div>
  );
};
