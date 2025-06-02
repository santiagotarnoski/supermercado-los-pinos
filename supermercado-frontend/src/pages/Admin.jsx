import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Package, TrendingUp, AlertTriangle, Check } from "lucide-react";

function Admin() {
  const [productos, setProductos] = useState([
    // Datos de ejemplo para mostrar el diseño
    {
      id: 1,
      nombre: "iPhone 15 Pro",
      descripcion: "Smartphone Apple con chip A17 Pro",
      precio: 1299.99,
      stock_minimo: 5,
      stock_actual: 15,
      fecha_vencimiento: null,
      categoria: "Tecnología",
      imagen_url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      nombre: "MacBook Pro M3",
      descripcion: "Laptop profesional con chip M3",
      precio: 2499.99,
      stock_minimo: 3,
      stock_actual: 8,
      fecha_vencimiento: null,
      categoria: "Tecnología",
      imagen_url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop"
    }
  ]);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock_minimo: "",
    stock_actual: "",
    fecha_vencimiento: "",
    categoria: "Otros",
    imagen_url: "",
  });
  
  const [mensaje, setMensaje] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [showForm, setShowForm] = useState(false);

  const categorias = ["Todas", "Tecnología", "Ropa", "Hogar", "Deportes", "Libros", "Otros"];

  // Simulación de carga de productos (reemplaza con tu lógica real)
  const cargarProductos = async () => {
    // Tu lógica existente aquí
    console.log("Cargando productos...");
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simulación de guardado
    const nuevoProducto = {
      id: Date.now(),
      ...form,
      precio: parseFloat(form.precio),
      stock_minimo: parseInt(form.stock_minimo),
      stock_actual: parseInt(form.stock_actual),
    };

    if (editandoId) {
      setProductos(productos.map(p => p.id === editandoId ? { ...nuevoProducto, id: editandoId } : p));
      setMensaje("Producto actualizado exitosamente ✅");
    } else {
      setProductos([...productos, nuevoProducto]);
      setMensaje("Producto creado exitosamente ✅");
    }

    resetForm();
    setShowForm(false);
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => setMensaje(""), 3000);
  };

  const resetForm = () => {
    setForm({
      nombre: "",
      descripcion: "",
      precio: "",
      stock_minimo: "",
      stock_actual: "",
      fecha_vencimiento: "",
      categoria: "Otros",
      imagen_url: "",
    });
    setEditandoId(null);
  };

  const handleEditar = (producto) => {
    setForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio.toString(),
      stock_minimo: producto.stock_minimo.toString(),
      stock_actual: producto.stock_actual.toString(),
      fecha_vencimiento: producto.fecha_vencimiento || "",
      categoria: producto.categoria || "Otros",
      imagen_url: producto.imagen_url || "",
    });
    setEditandoId(producto.id);
    setShowForm(true);
  };

  const handleEliminar = async (id) => {
    setProductos(productos.filter(p => p.id !== id));
    setMensaje("Producto eliminado exitosamente 🗑️");
    setTimeout(() => setMensaje(""), 3000);
  };

  // Filtrar productos
  const productosFiltrados = productos.filter(producto => {
    const matchesSearch = producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || producto.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Estadísticas
  const totalProductos = productos.length;
  const stockBajo = productos.filter(p => p.stock_actual <= p.stock_minimo).length;
  const valorTotal = productos.reduce((sum, p) => sum + (p.precio * p.stock_actual), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard Admin
              </h1>
              <p className="text-gray-600 mt-2">Gestiona tu inventario de productos</p>
            </div>
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) resetForm();
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              {showForm ? 'Cancelar' : 'Nuevo Producto'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Mensaje de estado */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-pulse ${
            mensaje.includes("❌") 
              ? "bg-red-50 text-red-700 border border-red-200" 
              : "bg-green-50 text-green-700 border border-green-200"
          }`}>
            {mensaje.includes("❌") ? <AlertTriangle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
            {mensaje}
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Productos</p>
                <p className="text-3xl font-bold text-gray-900">{totalProductos}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Stock Bajo</p>
                <p className="text-3xl font-bold text-orange-600">{stockBajo}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Valor Total</p>
                <p className="text-3xl font-bold text-green-600">${valorTotal.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 transform animate-in slide-in-from-top duration-300">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editandoId ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nombre del Producto</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="Ej: iPhone 15 Pro"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  >
                    {categorias.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Precio</label>
                  <input
                    type="number"
                    name="precio"
                    value={form.precio}
                    onChange={handleChange}
                    required
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Stock Actual</label>
                  <input
                    type="number"
                    name="stock_actual"
                    value={form.stock_actual}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Stock Mínimo</label>
                  <input
                    type="number"
                    name="stock_minimo"
                    value={form.stock_minimo}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    placeholder="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    name="fecha_vencimiento"
                    value={form.fecha_vencimiento}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                  placeholder="Describe el producto..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">URL de Imagen</label>
                <input
                  type="url"
                  name="imagen_url"
                  value={form.imagen_url}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 font-medium"
                >
                  {editandoId ? 'Actualizar Producto' : 'Crear Producto'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de productos */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {productosFiltrados.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay productos</h3>
              <p className="text-gray-500">Agrega tu primer producto para comenzar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Producto</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Categoría</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Precio</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Stock</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Estado</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((producto, index) => (
                    <tr key={producto.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          {producto.imagen_url && (
                            <img
                              src={producto.imagen_url}
                              alt={producto.nombre}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{producto.nombre}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{producto.descripcion}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {producto.categoria}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        ${producto.precio.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">{producto.stock_actual} disponibles</p>
                          <p className="text-gray-500">Mín: {producto.stock_minimo}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {producto.stock_actual <= producto.stock_minimo ? (
                          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3 h-3" />
                            Stock Bajo
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                            En Stock
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditar(producto)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEliminar(producto.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;