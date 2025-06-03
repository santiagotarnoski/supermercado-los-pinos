// frontend/src/components/ProductosPublic.jsx - Versión con mejor debugging
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getImageUrl } from '../config/api.js';
import { 
  Search, 
  Filter, 
  Package, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const ProductosPublic = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Función mejorada para cargar productos con mejor manejo de errores
  const cargarProductos = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔍 Intentando cargar productos desde:', API_BASE_URL);
      
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 12,
        ...(busqueda && { busqueda }),
        ...(categoriaFiltro !== 'todos' && { categoria: categoriaFiltro })
      });

      const url = `${API_BASE_URL}/productos/?${params}`;
      console.log('📡 URL completa:', url);

      const response = await axios.get(url, {
        timeout: 10000, // 10 segundos
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Respuesta recibida:', response.data);
      
      setProductos(response.data.productos || []);
      setCategorias(response.data.categorias || []);
      setTotalPages(response.data.pages || 1);
      
    } catch (error) {
      console.error('❌ Error completo:', error);
      
      let errorMessage = 'Error desconocido';
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        errorMessage = '🔌 No se puede conectar al servidor. Verifica que el backend esté corriendo en http://localhost:5000';
      } else if (error.response) {
        // El servidor respondió con un error
        errorMessage = `📡 Error del servidor (${error.response.status}): ${error.response.data?.message || error.response.statusText}`;
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        errorMessage = '⏱️ El servidor no responde. Verifica tu conexión y que el backend esté activo.';
      } else {
        // Error en la configuración de la petición
        errorMessage = `⚙️ Error de configuración: ${error.message}`;
      }
      
      setError(errorMessage);
      setProductos([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  // Función para verificar la conexión al backend
  const verificarConexion = async () => {
    try {
      console.log('🔍 Verificando conexión al backend...');
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/health`, {
        timeout: 5000
      });
      console.log('✅ Backend está activo:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Backend no responde:', error.message);
      return false;
    }
  };

  useEffect(() => {
    // Primero verificar si el backend está activo
    verificarConexion().then(isConnected => {
      if (isConnected) {
        cargarProductos();
      } else {
        setError('🔌 No se puede conectar al backend. Asegúrate de que esté corriendo en http://localhost:5000');
        setLoading(false);
      }
    });
  }, [currentPage, busqueda, categoriaFiltro]);

  const reintentarConexion = () => {
    cargarProductos();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
          <p className="mt-2 text-sm text-gray-500">Conectando a: {API_BASE_URL}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto p-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error de conexión</h2>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm whitespace-pre-line">{error}</p>
          </div>
          
          {/* Información de debugging */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left">
            <h3 className="font-semibold text-blue-900 mb-2">🔧 Información de debugging:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• URL del backend: <code className="bg-blue-100 px-1 rounded">{API_BASE_URL}</code></li>
              <li>• Verifica que el backend esté corriendo: <code className="bg-blue-100 px-1 rounded">python app.py</code></li>
              <li>• Prueba abrir en el navegador: <a href="http://localhost:5000/api/health" target="_blank" className="underline">http://localhost:5000/api/health</a></li>
            </ul>
          </div>
          
          <button
            onClick={reintentarConexion}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            Reintentar conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Supermercado Los Pinos</h1>
              <p className="mt-2 text-gray-600">Encuentra todo lo que necesitas</p>
            </div>
            
            {/* Status del backend */}
            <div className="mt-4 lg:mt-0">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Conectado al backend</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por categoría */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select 
                value={categoriaFiltro}
                onChange={(e) => {
                  setCategoriaFiltro(e.target.value);
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {productos.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No se encontraron productos</h3>
            <p className="mt-2 text-gray-600">
              {busqueda || categoriaFiltro !== 'todos' 
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'No hay productos disponibles en este momento'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                {/* Imagen del producto */}
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
                  {producto.imagen_url ? (
                    <img
                      src={getImageUrl(producto.imagen_url)}
                      alt={producto.nombre}
                      className="h-48 w-full object-cover object-center"
                      onError={(e) => {
                        console.warn('Error cargando imagen:', producto.imagen_url);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="h-48 w-full bg-gray-200 flex items-center justify-center"
                    style={{display: producto.imagen_url ? 'none' : 'flex'}}
                  >
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                </div>

                {/* Información del producto */}
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                    {producto.nombre}
                  </h3>
                  {producto.descripcion && (
                    <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                      {producto.descripcion}
                    </p>
                  )}

                  {/* Precio */}
                  <div className="mt-3">
                    <span className="text-lg font-bold text-green-600">
                      ${producto.precio?.toFixed(2) || '0.00'}
                    </span>
                  </div>

                  {/* Categoría */}
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {producto.categoria}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductosPublic;
