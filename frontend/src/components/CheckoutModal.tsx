import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderApi } from '../api/orders';
import { OrderItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orderId: number) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();

  const [receiverName, setReceiverName] = useState(user?.name || '');
  const [receiverPhone, setReceiverPhone] = useState(user?.phone || '010-0000-0000');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '서울특별시 강남구 역삼동');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setErrorMsg('');

    const orderItems: OrderItem[] = items.map((i) => ({
      productId: i.product.id,
      productName: i.product.name,
      quantity: i.quantity,
      price: i.product.price,
    }));

    try {
      const order = await orderApi.createOrder({
        items: orderItems,
        receiverName,
        receiverPhone,
        shippingAddress,
      });

      clearCart();
      onSuccess(order.id);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || '주문 생성에 실패했습니다.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">주문서 작성 & 결제</h2>
          <p className="text-xs text-gray-500 mt-1">배송 정보를 확인하고 결제를 진행해주세요.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-100">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">수령인</label>
              <input
                type="text"
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">연락처</label>
              <input
                type="tel"
                required
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">배송지 주소</label>
            <input
              type="text"
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">결제 수단</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>신용/체크카드</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('EASY_PAY')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition ${
                  paymentMethod === 'EASY_PAY'
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>간편결제 (카카오/네이버)</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-500 text-xs">
              <span>주문 품목 ({items.length}개 상품)</span>
              <span>{items.reduce((acc, i) => acc + i.quantity, 0)}개</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
              <span>최종 결제 금액</span>
              <span className="text-sky-600 text-base">{totalPrice.toLocaleString()}원</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-base rounded-xl transition shadow-md disabled:opacity-50"
          >
            {loading ? '주문 및 결제 처리 중...' : `${totalPrice.toLocaleString()}원 결제하기`}
          </button>
        </form>
      </div>
    </div>
  );
};
