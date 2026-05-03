
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  image_url: string;
  category?: string;
  sizes?: string[];
}

export interface Category {
  id: number;
  name: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  role: 'client' | 'admin';
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface Order {
  id: number;
  user_email: string;
  customer_name: string;
  status: 'pending' | 'completed' | 'cancelled';
  total_price: number;
  payment_method?: string;
  created_at: string;
  items: any[];
}