// frontend/src/services/api.js
// Configuración centralizada para la API
import axios from 'axios';

const getApiUrl = () => {
  // Si hay variable de entorno definida, usarla
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Si estamos en desarrollo, usar localhost
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api';
  }
  
  // En producción sin variable definida, intentar detectar automáticamente
  const hostname = window.location.hostname;
  
  // Si es un dominio de Render, usar la URL correcta del backend
  if (hostname.includes('onrender.com')) {
    console.warn('⚠️ VITE_API_URL no está configurada. Usando fallback.');
    return 'https://supermercado-los-pinos.onrender.com/api'; // ← CORREGIDO: Con /api
  }
  
  // Fallback final
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiUrl();

// Configuración adicional
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Sistema Supermercado Los Pinos',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

// URLs específicas de la API
export const API_ENDPOINTS = {
  // Auth
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  
  // Productos
  productos: `${API_BASE_URL}/productos`,
  
  // Estadísticas
  estadisticas: `${API_BASE_URL}/estadisticas`,
  
  // Upload
  upload: `${API_BASE_URL}/upload`,
  
  // Health check
  health: `${API_BASE_URL}/health`,
};

// Función para construir URL de imagen
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si ya es una URL completa, retornarla
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Construir URL completa para imágenes
  const baseUrl = API_BASE_URL.replace('/api', '');
  return `${baseUrl}${imagePath}`;
};

// Configuración para axios - ✅ MEJORADA para debugging
export const createApiClient = () => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  // Interceptor para agregar token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Debug info solo en desarrollo
      if (import.meta.env.DEV) {
        console.log('🔄 API Request:', config.method?.toUpperCase(), config.url);
      }
      
      return config;
    },
    (error) => {
      console.error('❌ Request Error:', error);
      return Promise.reject(error);
    }
  );
  
  // Interceptor para manejar respuestas
  client.interceptors.response.use(
    (response) => {
      // Debug info solo en desarrollo
      if (import.meta.env.DEV) {
        console.log('✅ API Response:', response.status, response.config.url);
      }
      return response;
    },
    (error) => {
      console.error('❌ API Error:', error.response?.status, error.response?.data);
      
      if (error.response?.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
  
  return client;
};

// Debug info (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseUrl: API_BASE_URL,
    isDev: APP_CONFIG.isDev,
    endpoints: API_ENDPOINTS
  });
}
