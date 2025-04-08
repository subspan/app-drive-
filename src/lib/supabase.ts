import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export type User = {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  is_age_verified: boolean;
  created_at: string;
  updated_at: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'driver' | 'admin' | 'shop_owner';
};

export type Shop = {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  banner_url?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  owner_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  rating?: number;
  delivery_time?: string;
};

export type Product = {
  id: string;
  shop_id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  shop_id: string;
  driver_id?: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled';
  total: number;
  delivery_address: string;
  delivery_fee: number;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
};

export type AgeVerification = {
  id: string;
  user_id: string;
  id_front_url: string;
  id_back_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
};