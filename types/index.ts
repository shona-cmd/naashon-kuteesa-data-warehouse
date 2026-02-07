// Database Types for TypeScript

export interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  location: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Sale {
  id: number;
  customer_id: number | null;
  total_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'refunded';
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  customer?: Customer;
  items?: SaleItem[];
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  price_at_sale: number;
  product?: Product;
}

export interface Payment {
  id: number;
  sale_id: number | null;
  customer_id: number | null;
  phone: string;
  amount: number;
  provider: string;
  transaction_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  payment_method: string | null;
  raw_response: string | null;
  created_at: Date;
  updated_at: Date;
  sale?: Sale;
  customer?: Customer;
}

export interface PaymentTransaction {
  id: number;
  payment_id: number;
  action: string;
  request_data: string | null;
  response_data: string | null;
  status_code: number | null;
  created_at: Date;
}

// Analytics Types
export interface DailySalesTrend {
  date: string;
  total_sales: number;
  order_count: number;
}

export interface CustomerSalesSummary {
  customer_id: number;
  customer_name: string;
  total_sales: number;
  order_count: number;
}

export interface ProductSalesSummary {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface DashboardMetrics {
  total_revenue: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
  pending_payments: number;
  recent_sales: Sale[];
  top_customers: CustomerSalesSummary[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Payment Request Types
export interface PaymentInitRequest {
  sale_id: number;
  phone: string;
  provider?: string;
}

export interface PaymentVerifyRequest {
  transaction_id: string;
}

// Cart Types
export interface CartItem {
  product_id: number;
  quantity: number;
  product?: Product;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

