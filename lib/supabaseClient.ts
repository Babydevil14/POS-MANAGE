import { createClient } from '@supabase/supabase-js';

// Define types for Category, Product, and Transaction
export interface Category {
  id?: string;
  name: string;
  created_at?: string;
}

export interface Product {
  id?: string;
  name: string;
  category_id: string;
  price: number;
  picture?: string;
  created_at?: string;
}

export interface Transaction {
  id?: string;
  product_id: string;
  quantity: number;
  total_price: number;
  created_at?: string;
}

const supabaseUrl = 'https://oinotdezgunxbkftwfdu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbm90ZGV6Z3VueGJrZnR3ZmR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwODc0NzksImV4cCI6MjA2NTY2MzQ3OX0.l5O2vl9Lr0LwhTv5B4FtrMD4sTi7YmTPvNejv_yks4k';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Category functions
export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  return { data, error };
};

export const addCategory = async (category: Category) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([category]);
  return { data, error };
};

export const updateCategory = async (id: string, category: Partial<Category>) => {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id);
  return { data, error };
};

export const deleteCategory = async (id: string) => {
  const { data, error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  return { data, error };
};

// Product functions
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*');
  return { data, error };
};

export const addProduct = async (product: Product) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product]);
  return { data, error };
};

export const updateProduct = async (id: string, product: Partial<Product>) => {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id);
  return { data, error };
};

export const deleteProduct = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  return { data, error };
};

// Transaction functions
export const getTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*');
  return { data, error };
};

export const addTransaction = async (transaction: Transaction) => {
  const { data, error } = await supabase
    .from('transactions')
    .insert([transaction]);
  return { data, error };
};

export const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
  const { data, error } = await supabase
    .from('transactions')
    .update(transaction)
    .eq('id', id);
  return { data, error };
};

export const deleteTransaction = async (id: string) => {
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);
  return { data, error };
};

export default supabase;