import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, Receipt, CreditCard, DollarSign, Scan, User, Calculator } from 'lucide-react';
import axios from 'axios';

function POS() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cliente, setCliente] = useState({ nombre: '', telefono: '' });
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [mostrarPago, setMostrarPago] = useState(false);
  const [ventaCompleta, setVentaCompleta] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar productos al montar el componente
  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/productos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductos(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  // Filtrar productos por búsqueda
  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    producto.codigo?.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Agregar producto al carrito
  const agregarAlCarrito = (producto) => {
    const itemExistente = carrito.find(item => item.id === producto.id);
    
    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock) {
        setCarrito(carrito.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ));
      }
    } else {
      if (producto.stock > 0) {
        setCarrito([...carrito, { 
          ...producto, 
          cantidad: 1,
          subtotal: producto.precio 
        }]);
      }
    }
  };

  // Actualizar cantidad en carrito
  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad === 0) {
      eliminarDelCarrito(id);
      return;
    }

    const producto = productos.find(p => p.id === id);
    if (nuevaCantidad <= producto.stock) {
      setCarrito(carrito.map(item =>
        item.id === id
          ? { ...item, cantidad: nuevaCantidad, subtotal: item.precio * nuevaCantidad }
          : item
      ));
    }
  };

  // Eliminar producto del carrito
  const eliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  // Calcular totales
  const subtotal = carrito.reduce((sum, item) => sum + item.subtotal, 0);
  const impuestos = subtotal * 0.21; // 21% IVA
  const total = subtotal + impuestos;
  const cambio = montoRecibido ? parseFloat(montoRecibido) - total : 0;

  // Procesar venta
  const procesarVenta = async () => {
    if (metodoPago === 'efectivo' && parseFloat(montoRecibido) < total) {
      alert('El monto recibido es insuficiente');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const ventaData = {
        cliente: cliente.nombre || 'Cliente General',
        telefono: cliente.telefono || '',
        productos: carrito.map(item => ({
          id: item.id,
          cantidad: item.cantidad,
          precio: item.precio,
          subtotal: item.subtotal
        })),
        subtotal,
        impuestos,
        total,
        metodoPago,
        montoRecibido: metodoPago === 'efectivo' ? parseFloat(montoRecibido) : total,
        cambio: metodoPago === 'efectivo' ? cambio : 0
      };

      await axios.post('http://localhost:5000/api/ventas', ventaData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setVentaCompleta(true);
      setTimeout(() => {
        limpiarVenta();
      }, 3000);

    } catch (error) {
      console.error('Error al procesar venta:', error);
      alert('Error al procesar la venta');
    } finally {
      setLoading(false);
    }
  };

  // Limpiar venta
  const limpiarVenta = () => {
    setCarrito([]);
    setCliente({ nombre: '', telefono: '' });
    setMontoRecibido('');
    setMostrarPago(false);
    setVentaCompleta(false);
    setBusqueda('');
    cargarProductos(); // Recargar para actualizar stock
  };

  if (ventaCompleta) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">¡Venta Exitosa!</h2>
          <p className="text-gray-600 mb-4">Total: ${total.toFixed(2)}</p>
          {metodoPago === 'efectivo' && cambio > 0 && (
            <p className="text-lg font-semibold text-blue-600">Cambio: ${cambio.toFixed(2)}</p>
          )}
          <div className="text-sm text-gray-500 mt-4">
            Redirigiendo automáticamente...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              Punto de Venta
            </h1>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel de Productos */}
          <div className="lg:col-span-2 space-y-4">
            {/* Búsqueda */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Grid de Productos */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-4">Productos Disponibles</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {productosFiltrados.map((producto) => (
                  <div
                    key={producto.id}
                    onClick={() => agregarAlCarrito(producto)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      producto.stock === 0 
                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-800 mb-1 truncate">
                      {producto.nombre}
                    </div>
                    <div className="text-lg font-bold text-blue-600 mb-1">
                      ${producto.precio}
                    </div>
                    <div className={`text-xs ${producto.stock === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      Stock: {producto.stock}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel de Carrito */}
          <div className="space-y-4">
            {/* Información del Cliente */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Cliente
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Nombre del cliente"
                  value={cliente.nombre}
                  onChange={(e) => setCliente({...cliente, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={cliente.telefono}
                  onChange={(e) => setCliente({...cliente, telefono: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Carrito */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold mb-3">
                Carrito ({carrito.length} productos)
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {carrito.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">
                        {item.nombre}
                      </div>
                      <div className="text-sm text-gray-600">
                        ${item.precio} c/u
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                        className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                        className="w-6 h-6 flex items-center justify-center bg-green-100 text-green-600 rounded hover:bg-green-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => eliminarDelCarrito(item.id)}
                        className="w-6 h-6 flex items-center justify-center bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {carrito.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Carrito vacío</p>
                </div>
              )}
            </div>

            {/* Totales */}
            {carrito.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA (21%):</span>
                    <span>${impuestos.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {!mostrarPago ? (
                  <button
                    onClick={() => setMostrarPago(true)}
                    className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-5 h-5" />
                    Procesar Pago
                  </button>
                ) : (
                  <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Método de Pago:</label>
                      <select
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="transferencia">Transferencia</option>
                      </select>
                    </div>

                    {metodoPago === 'efectivo' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Monto Recibido:</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={montoRecibido}
                          onChange={(e) => setMontoRecibido(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        {montoRecibido && cambio >= 0 && (
                          <div className="text-sm text-green-600 font-medium">
                            Cambio: ${cambio.toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setMostrarPago(false)}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={procesarVenta}
                        disabled={loading || (metodoPago === 'efectivo' && parseFloat(montoRecibido) < total)}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Receipt className="w-4 h-4" />
                            Confirmar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default POS;
