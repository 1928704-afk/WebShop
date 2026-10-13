import { apiClient } from './client';
import { ApiResponse, Order, OrderItem, PageResponse } from '../types';

export interface CreateOrderPayload {
  items: OrderItem[];
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
}

export const orderApi = {
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const res = await apiClient.post<ApiResponse<Order>>('/orders', payload);
    return res.data.data;
  },

  getOrderById: async (id: number): Promise<Order> => {
    const res = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data.data;
  },

  getMyOrders: async (page = 0, size = 10): Promise<PageResponse<Order>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Order>>>('/orders/my', {
      params: { page, size }
    });
    return res.data.data;
  },

  cancelOrder: async (id: number): Promise<void> => {
    await apiClient.post(`/orders/${id}/cancel`);
  }
};
