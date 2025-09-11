export interface ProductImage {
  id: number;
  product_id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  category: string;
  created_at: string;
  updated_at: string;
  stocks?: Stock[];
  images?: ProductImage[];
}

export interface Stock {
  id: number;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  mail: string;
  login: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  mail: string;
  login: string;
  address: string;
  zip_code: string;
  document: string;
  neighborhood: string;
  city: string;
  state: string;
  address_number: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user?: User;
  customer?: Customer;
  token: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price?: number;
  category: string;
}

export interface CreateStockRequest {
  productId: number;
  quantity: number;
}

export interface CreateUserRequest {
  name: string;
  phone: string;
  mail: string;
  login: string;
  password: string;
  role?: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  mail: string;
  login: string;
  password: string;
  address: string;
  zipCode: string;
  document: string;
  neighborhood: string;
  city: string;
  state: string;
  addressNumber: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  errors?: Array<{ message: string }>;
}
