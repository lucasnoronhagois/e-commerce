import axios from 'axios';
import { 
  Product, 
  Stock, 
  User, 
  Customer, 
  AuthResponse, 
  LoginRequest, 
  CreateProductRequest, 
  CreateStockRequest, 
  CreateUserRequest, 
  CreateCustomerRequest 
} from '../types';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Product API
export const productApi = {
  getAll: (): Promise<Product[]> => api.get('/products').then(res => res.data),
  getById: (id: number): Promise<Product> => api.get(`/products/${id}`).then(res => res.data),
  search: (query: string): Promise<Product[]> => api.get(`/products/search?q=${query}`).then(res => res.data),
  create: (data: CreateProductRequest): Promise<Product> => api.post('/products', data).then(res => res.data),
  update: (id: number, data: Partial<CreateProductRequest>): Promise<Product> => 
    api.put(`/products/${id}`, data).then(res => res.data),
  delete: (id: number): Promise<void> => api.delete(`/products/${id}`).then(() => {}),
  uploadImages: (productId: number, formData: FormData): Promise<any[]> => 
    api.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).then(res => res.data),
  deleteImage: (imageId: number): Promise<void> => api.delete(`/products/images/${imageId}`).then(() => {}),
  setPrimaryImage: (imageId: number): Promise<void> => api.put(`/products/images/${imageId}/primary`).then(() => {}),
};

// Stock API
export const stockApi = {
  getAll: (): Promise<Stock[]> => api.get('/stock').then(res => res.data),
  getById: (id: number): Promise<Stock> => api.get(`/stock/${id}`).then(res => res.data),
  getByProductId: (productId: number): Promise<Stock[]> => 
    api.get(`/stock/product/${productId}`).then(res => res.data),
  create: (data: CreateStockRequest): Promise<Stock> => api.post('/stock', data).then(res => res.data),
  update: (id: number, data: Partial<CreateStockRequest>): Promise<Stock> => 
    api.put(`/stock/${id}`, data).then(res => res.data),
  updateQuantity: (id: number, quantity: number): Promise<Stock> => 
    api.put(`/stock/${id}/quantity`, { quantity }).then(res => res.data),
  delete: (id: number): Promise<void> => api.delete(`/stock/${id}`).then(res => res.data),
};

// User API (unificada para admin e customer)
export const userApi = {
  getAll: (): Promise<User[]> => api.get('/users').then(res => res.data),
  getById: (id: number): Promise<User> => api.get(`/users/${id}`).then(res => res.data),
  create: (data: CreateUserRequest): Promise<User> => api.post('/users', data).then(res => res.data),
  update: (id: number, data: Partial<CreateUserRequest>): Promise<User> => 
    api.put(`/users/${id}`, data).then(res => res.data),
  delete: (id: number): Promise<void> => api.delete(`/users/${id}`).then(res => res.data),
  login: (data: LoginRequest): Promise<AuthResponse> => api.post('/auth/login', data).then(res => res.data),
  register: (data: CreateUserRequest): Promise<User> => api.post('/auth/register', data).then(res => res.data),
};

// Customer API
export const customerApi = {
  getAll: (): Promise<Customer[]> => api.get('/customers').then(res => res.data),
  getById: (id: number): Promise<Customer> => api.get(`/customers/${id}`).then(res => res.data),
  create: (data: CreateCustomerRequest): Promise<Customer> => api.post('/customers/register', data).then(res => res.data),
  update: (id: number, data: Partial<CreateCustomerRequest>): Promise<Customer> => 
    api.put(`/customers/${id}`, data).then(res => res.data),
  delete: (id: number): Promise<void> => api.delete(`/customers/${id}`).then(res => res.data),
  login: (data: LoginRequest): Promise<AuthResponse> => api.post('/customers/login', data).then(res => res.data),
};

export default api;