import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const paymentService = {
  // Get all transactions (admin only)
  getAllTransactions: async (params = {}) => {
    const response = await api.get('/payments/admin/transactions', { params });
    return response.data;
  },
  
  // Update transaction status (admin only)
  updateTransactionStatus: async (transactionId, status) => {
    const response = await api.patch(`/payments/admin/transactions/${transactionId}/status`, { status });
    return response.data;
  }
};
