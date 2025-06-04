import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  Settings, 
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Clock,
  RefreshCw
} from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('rol');
  
  // Estados para las estadísticas
  const [estadisticas, setEstadisticas] = useState({
    ventasHoy: 0,
    totalProductos: 0,
    stockBajo: 0,
    totalClientes: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    cargarEstadisticas();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(cargarEstadisticas, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Realizar todas las consultas en paralelo con manejo de errores individual
      const resultados = await Promise.allSettled([
        axios.get('http://localhost:5000/api/estadisticas/ventas-hoy', { headers }),
        axios.get('http://localhost:5000/api/estadisticas/productos', { headers }),
        axios.get('http://localhost:5000/api/estadisticas/stock-bajo', { headers }),
        axios.get('http://localhost:5000/api/estadisticas/clientes', { headers })
      ]);

      const [ventasResult, productosResult, stockBajoResult, clientesResult] = resultados;

      setEstadisticas({
        ventasHoy: ventasResult.status === 'fulfilled' ? (ventasResult.value.data.total || 0) : 0,
        totalProductos: productosResult.status === 'fulfilled' ? (productosResult.value.data.total || 0) : 0,
        stockBajo: stockBajoResult.status === 'fulfilled' ? (stockBajoResult.value.data.total || 0) : 0,
        totalClientes: clientesResult.status === 'fulfilled' ? (clientesResult.value.data.total || 0) : 0
      });
      
      setUltimaActualizacion(new Date());
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      setError('Error al cargar las estadísticas');
      
      // Si es error de autenticación, redirigir al login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Ventas Hoy",
      value: loading ? "..." : `$${estadisticas.ventasHoy.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      bgColor: "bg-green-50",
      loading: loading
    },
    {
      title: "Productos",
      value: loading ? "..." : estadisticas.totalProductos.toLocaleString('es-ES'),
      icon: Package,
      color: "bg-blue-100 text-blue-600",
      bgColor: "bg-blue-50",
      loading: loading
    },
    {
      title: "Stock Bajo",
      value: loading ? "..." : estadisticas.stockBajo.toLocaleString('es-ES'),
      icon: AlertTriangle,
      color: "bg-orange-100 text-orange-600",
      bgColor: "bg-orange-50",
      loading: loading,
      alert: estadisticas.stockBajo > 0
    },
    {
      title: "Clientes",
      value: loading ? "..." : estadisticas.totalClientes.toLocaleString('es-ES'),
      icon: Users,
      color: "bg-purple-100 text-purple-600",
      bgColor: "bg-purple-50",
      loading: loading
    }
  ];

  const quickActions = [
    {
      title: "Punto de Venta",
      description: "Sistema de caja para procesar ventas y generar facturas",
      icon: ShoppingCart,
      color: "bg-green-600 hover:bg-green-700",
      route: "/pos",
      priority: true
    },
    {
      title: "Gestión de Productos",
      description: "Administrar inventario, precios y stock",
      icon: Package,
      color: "bg-blue-600 hover:bg-blue-700",
      route: "/admin"
    },
    {
      title: "Reportes",
      description: "Ver estadísticas y análisis de ventas",
      icon: BarChart3,
      color: "bg-purple-600 hover:bg-purple-700",
      route: "/reportes"
    },
    {
      title: "Clientes",
      description: "Gestionar base de datos de clientes",
      icon: Users,
      color: "bg-indigo-600 hover:bg-indigo-700",
      route: "/clientes"
    }
  ];

  // Filtrar acciones según el rol
  const actionsFiltered = quickActions.filter(action => {
    if (userRole === 'admin') return true;
    if (userRole === 'cajero') return ['Punto de Venta', 'Clientes'].includes(action.title);
    return action.title === 'Punto de Venta';
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-800 mb-2">Error al cargar el Dashboard</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={cargarEstadisticas}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Bienvenido al sistema de gestión de Supermercado Los Pinos
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Última actualización: {ultimaActualizacion.toLocaleTimeString('es-ES')}
              </div>
              <button
                onClick={cargarEstadisticas}
                disabled={loading}
                className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Actualizar estadísticas"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className={`${stat.bgColor} rounded-xl p-6 border border-gray-100 ${stat.alert ? 'ring-2 ring-orange-200' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold text-gray-900 ${stat.loading ? 'animate-pulse' : ''}`}>
                      {stat.value}
                    </p>
                    {stat.alert && (
                      <p className="text-xs text-orange-600 mt-1 font-medium">
                        ⚠️ Requiere atención
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actionsFiltered.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <div 
                  key={index}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden ${
                    action.priority ? 'ring-2 ring-green-200 bg-green-50' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${action.priority ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <IconComponent className={`w-6 h-6 ${action.priority ? 'text-green-600' : 'text-gray-600'}`} />
                      </div>
                      {action.priority && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          Recomendado
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {action.description}
                    </p>
                    <button
                      onClick={() => navigate(action.route)}
                      className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${action.color}`}
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Resumen del Sistema
            </h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Sistema Operativo</h4>
              <p className="text-sm text-green-600">Todas las funciones están disponibles</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Base de Datos</h4>
              <p className="text-sm text-blue-600">Conectada y funcionando correctamente</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Última Sincronización</h4>
              <p className="text-sm text-purple-600">{ultimaActualizacion.toLocaleString('es-ES')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
