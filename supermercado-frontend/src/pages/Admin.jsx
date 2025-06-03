import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "../services/api";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  Upload,
  Image,
  X,
  Save,
  AlertCircle,
  Package,
  Tag
} from 'lucide-react';

const Admin = () => {
  const CATEGORIAS_DISPONIBLES = [
    { value: 'alimentos', label: '🍞 Alimentos', color: 'bg-orange-100 text-orange-800' },
    { value: 'bebidas', label: '🥤 Bebidas', color: 'bg-blue-100 text-blue-800' },
    { value: 'lacteos', label: '🥛 Lácteos', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'carnes', label: '🥩 Carnes', color: 'bg-red-100 text-red-800' },
    { value: 'frutas-verduras', label: '🥕 Frutas y Verduras', color: 'bg-green-100 text-green-800' },
    { value: 'panaderia', label: '🥖 Panadería', color: 'bg-amber-100 text-amber-800' },
    { value: 'limpieza', label: '🧽 Limpieza', color: 'bg-purple-100 text-purple-800' },
    { value: 'higiene', label: '🧴 Higiene Personal', color: 'bg-pink-100 text-pink-800' },
    { value: 'golosinas', label: '🍭 Golosinas', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'snacks', label: '🍿 Snacks', color: 'bg-teal-100 text-teal-800' },
    { value: 'congelados', label: '🧊 Congelados', color: 'bg-cyan-100 text-cyan-800' },
    { value: 'otros', label: '📦 Otros', color: 'bg-gray-100 text-gray-800' }
  ];

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('success');
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock_minimo: '',
    stock_actual: '',
    categoria: '',
    fecha_vencimiento: '',
    imagen: null
  });
  const [previewImage, setPreviewImage] = useState(null);

  const token = localStorage.getItem('token');

  const getCategoriaInfo = (categoriaValue) => {
    const found = CATEGORIAS_DISPONIBLES.find(cat => cat.value === categoriaValue);
    return found || { value: categoriaValue, label: categoriaValue, color: 'bg-gray-100 text-gray-800' };
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        per_page: 10,
        ...(busqueda && { busqueda }),
        ...(categoriaFiltro !== 'todos' && { categoria: categoriaFiltro })
      });

      const response = await axios.get(`${API_BASE_URL}/productos/?${params}`);
      
      setProductos(response.data.productos || []);
      setCategorias(response.data.categorias || []);
      setTotalPages(response.data.pages || 1);
      
    } catch (error) {
      console.error('Error cargando productos:', error);
      mostrarMensaje('Error al cargar productos', 'error');
      setProductos([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, [currentPage, busqueda, categoriaFiltro]);

  const mostrarMensaje = (texto, tipo = 'success') => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setTimeout(() => setMensaje(''), 4000);
  };

  const abrirModal = (producto = null) => {
    if (producto) {
      setEditingProduct(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio.toString(),
        stock_minimo: producto.stock_minimo.toString(),
        stock_actual: producto.stock_actual.toString(),
        categoria: producto.categoria,
        fecha_vencimiento: producto.fecha_vencimiento || '',
        imagen: null
      });
      setPreviewImage(getImageUrl(producto.imagen_url));
    } else {
      setEditingProduct(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        stock_minimo: '0',
        stock_actual: '0',
        categoria: '',
        fecha_vencimiento: '',
        imagen: null
      });
      setPreviewImage(null);
    }
    setShowModal(true);
  };

  const cerrarModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock_minimo: '0',
      stock_actual: '0',
      categoria: '',
      fecha_vencimiento: '',
      imagen: null
    });
    setPreviewImage(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        mostrarMensaje('Por favor selecciona un archivo de imagen válido', 'error');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        mostrarMensaje('La imagen debe ser menor a 5MB', 'error');
        return;
      }

      setFormData(prev => ({
        ...prev,
        imagen: file
      }));

      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const eliminarImagen = () => {
    setFormData(prev => ({ ...prev, imagen: null }));
    setPreviewImage(null);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.precio || !formData.categoria) {
      mostrarMensaje('Nombre, precio y categoría son obligatorios', 'error');
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'imagen' && formData[key]) {
          formDataToSend.append('imagen', formData[key]);
        } else if (key !== 'imagen') {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (editingProduct) {
        await axios.put(
          `${API_BASE_URL}/productos/${editingProduct.id}`,
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        mostrarMensaje('Producto actualizado exitosamente');
      } else {
        await axios.post(
          `${API_BASE_URL}/productos/`,
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        mostrarMensaje('Producto creado exitosamente');
      }

      cerrarModal();
      cargarProductos();
    } catch (error) {
      console.error('Error guardando producto:', error);
      mostrarMensaje('Error al guardar producto', 'error');
    }
  };

  const eliminarProducto = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/productos/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      mostrarMensaje('Producto eliminado exitosamente');
      cargarProductos();
    } catch (error) {
      console.error('Error eliminando producto:', error);
      mostrarMensaje('Error al eliminar producto', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600 mt-2">Gestiona tu inventario de productos</p>
      </div>

      {mensaje && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
          tipoMensaje === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <AlertCircle className="h-5 w-5" />
          {mensaje}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select 
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-48"
            >
              <option value="todos">📂 Todas las categorías</option>
              {CATEGORIAS_DISPONIBLES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => abrirModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Imagen
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(productos) && productos.length > 0 ? productos.map((producto) => {
                const categoriaInfo = getCategoriaInfo(producto.categoria);
                
                return (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {producto.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {producto.descripcion}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoriaInfo.color}`}>
                        {categoriaInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Number(producto.precio).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className={`font-medium ${
                          producto.stock_actual <= producto.stock_minimo 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {producto.stock_actual} unidades
                        </div>
                        <div className="text-gray-500">
                          Mín: {producto.stock_minimo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {producto.imagen_url ? (
                        <img
                          src={getImageUrl(producto.imagen_url)}
                          alt={producto.nombre}
                          className="h-12 w-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Image className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => abrirModal(producto)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => eliminarProducto(producto.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Package className="h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Comienza agregando tu primer producto
                      </p>
                      <button
                        onClick={() => abrirModal()}
                        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Agregar Producto
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <button
                  onClick={cerrarModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={guardarProducto} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Coca Cola 500ml"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción detallada del producto..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Precio *
                    </label>
                    <input
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Categoría *
                    </label>
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecciona una categoría</option>
                      {CATEGORIAS_DISPONIBLES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Stock Actual
                    </label>
                    <input
                      type="number"
                      name="stock_actual"
                      value={formData.stock_actual}
                      onChange={handleInputChange}
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      name="stock_minimo"
                      value={formData.stock_minimo}
                      onChange={handleInputChange}
                      min="0"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    name="fecha_vencimiento"
                    value={formData.fecha_vencimiento}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Imagen del Producto
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {previewImage ? (
                        <div className="relative">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="mx-auto h-32 w-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={eliminarImagen}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                              <span>Subir imagen</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="sr-only"
                              />
                            </label>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF hasta 5MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    {editingProduct ? 'Actualizar' : 'Crear'}
                  </button>
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
