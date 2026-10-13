export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  timestamp: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: string;
  createdAt: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  receiverName: string;
  receiverPhone: string;
  items: OrderItem[];
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
