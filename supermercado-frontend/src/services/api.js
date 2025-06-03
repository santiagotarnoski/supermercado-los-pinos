// Configuración automática de URLs del API
const API_CONFIG = {
  // En desarrollo usa localhost, en producción usa la variable de entorno
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  
  // Endpoints específicos
  endpoints: {
    auth: {
      login: '/api/auth/login'
    },
    productos: {
      list: '/api/productos',
      create: '/api/productos',
      update: (id) => `/api/productos/${id}`,
      delete: (id) => `/api/productos/${id}`
    },
    uploads: {
      image: '/api/upload-image'
    }
  }
};

// Función helper para construir URLs completas
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Funciones específicas para cada endpoint
export const API_URLS = {
  // Auth
  LOGIN: () => getApiUrl(API_CONFIG.endpoints.auth.login),
  
  // Productos
  PRODUCTOS_LIST: () => getApiUrl(API_CONFIG.endpoints.productos.list),
  PRODUCTOS_CREATE: () => getApiUrl(API_CONFIG.endpoints.productos.create),
  PRODUCTOS_UPDATE: (id) => getApiUrl(API_CONFIG.endpoints.productos.update(id)),
  PRODUCTOS_DELETE: (id) => getApiUrl(API_CONFIG.endpoints.productos.delete(id)),
  
  // Uploads
  UPLOAD_IMAGE: () => getApiUrl(API_CONFIG.endpoints.uploads.image)
};

export default API_CONFIG;
