import React, { useEffect, useState } from 'react';
import { orderApi } from '../api/orders';
import { Order, OrderStatus } from '../types';
import { Package, Clock, CheckCircle2, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getMyOrders();
      setOrders(data.content);
    } catch (err) {
      // Mock Data (오프라인/테스트용)
      setOrders([
        {
          id: 101,
          userId: 1,
          status: 'COMPLETED',
          totalAmount: 449000,
          shippingAddress: '서울특별시 강남구 테헤란로 152 7층',
          receiverName: '홍길동',
          receiverPhone: '010-1234-5678',
          items: [
            {
              productId: 2,
              productName: '소니 WH-1000XM5 노이즈 캔슬링 헤드폰',
              quantity: 1,
              price: 449000,
            }
          ],
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>결제 및 재고 처리 중 (Kafka SAGA)</span>
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>결제 완료 (재고 차감 진행 중)</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>주문 확정 완료</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>주문 취소됨</span>
          </span>
        );
      case 'FAILED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>처리 실패</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">내 주문 내역</h1>
          <p className="text-xs text-gray-500 mt-1">
            Kafka 이벤트 기반 분산 트랜잭션의 처리 상태를 실시간으로 확인하실 수 있습니다.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-sm font-semibold text-gray-700 shadow-sm transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>새로고침</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl p-6 border border-gray-100 h-36" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">아직 주문 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-800 text-sm">
                    주문번호 #{order.id}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>{getStatusBadge(order.status)}</div>
              </div>

              {/* Items List */}
              <div className="p-4 sm:p-6 divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex justify-between items-center text-sm">
                    <div>
                      <h4 className="font-semibold text-gray-800">{item.productName}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.price.toLocaleString()}원 × {item.quantity}개
                      </p>
                    </div>
                    <span className="font-bold text-gray-900">
                      {(item.price * item.quantity).toLocaleString()}원
                    </span>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-5 bg-gray-50/40 border-t border-gray-100 flex flex-wrap justify-between items-center text-xs text-gray-600 gap-2">
                <div>
                  <span className="font-semibold text-gray-700">배송지:</span> {order.shippingAddress} (수령인: {order.receiverName})
                </div>
                <div className="text-sm font-extrabold text-sky-600">
                  총 결제액: {order.totalAmount.toLocaleString()}원
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
