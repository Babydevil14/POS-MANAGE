export interface Category {
  id: string; // uuid
  name: string;
  created_at: string;
}

export interface Product {
  id: string; // uuid
  name: string;
  category_id: string; // uuid
  price: number;
  stock: number;
  picture?: string;
  created_at: string;
  description?: string;
}

export interface Transaction {
  id: string; // uuid
  product_id: string; // uuid
  quantity: number;
  total_price: number;
  created_at: string;
}