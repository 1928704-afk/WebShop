import { apiClient } from './client';
import { ApiResponse, PageResponse, Product } from '../types';

export const productApi = {
  getProducts: async (category?: string, keyword?: string, page = 0, size = 12): Promise<PageResponse<Product>> => {
    const params: Record<string, any> = { page, size };
    if (category) params.category = category;
    if (keyword) params.keyword = keyword;

    const res = await apiClient.get<ApiResponse<PageResponse<Product>>>('/products', { params });
    return res.data.data;
  },

  getProductById: async (id: number): Promise<Product> => {
    const res = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },

  createProduct: async (product: Partial<Product>): Promise<Product> => {
    const res = await apiClient.post<ApiResponse<Product>>('/products', product);
    return res.data.data;
  }
};
