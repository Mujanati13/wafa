import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import axios from "axios";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASED_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add token to requests if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Remove Content-Type for FormData - let axios set it automatically with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);


