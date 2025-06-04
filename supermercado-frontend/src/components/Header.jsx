import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogOut, User, Menu, X, ShoppingCart } from "lucide-react";
import logo from "../assets/los-pinos-logo.png";

function Header() {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const usuario = localStorage.getItem('username') || 'Usuario';
  const rol = localStorage.getItem('rol') || 'usuario';

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const esRutaActiva = (ruta) => location.pathname === ruta;

  const navegacionItems = [
    { nombre: 'Inicio', ruta: '/dashboard' },
    { nombre: 'Productos', ruta: '/productos' },
    { nombre: 'Ofertas', ruta: '/ofertas' },
    { nombre: 'Contacto', ruta: '/contacto' }
  ];

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Nombre */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img 
                src={logo} 
                alt="Logo Supermercado Los Pinos" 
                className="h-10 w-10 rounded-full shadow-md"
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Supermercado Los Pinos
              </h1>
            </div>
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex space-x-8">
            {navegacionItems.map((item) => (
              <Link
                key={item.ruta}
                to={item.ruta}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  esRutaActiva(item.ruta)
                    ? 'bg-green-100 text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                {item.nombre}
              </Link>
            ))}
          </nav>

          {/* Usuario y Acciones Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Botón POS para acceso rápido */}
            <Link
              to="/pos"
              className="inline-flex items-center px-3 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors duration-200"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              POS
            </Link>

            {/* Menú de Usuario */}
            <div className="relative">
              <button
                onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-lg p-2"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">{usuario}</div>
                  <div className="text-xs text-gray-500 capitalize">{rol}</div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {menuUsuarioAbierto && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{usuario}</p>
                    <p className="text-xs text-gray-500 capitalize">{rol}</p>
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setMenuUsuarioAbierto(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Mi Dashboard
                  </Link>
                  <button
                    onClick={cerrarSesion}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Botón Menú Móvil */}
          <div className="md:hidden">
            <button
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className="p-2 rounded-lg text-gray-600 hover:text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {menuMovilAbierto ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menú Móvil */}
        {menuMovilAbierto && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navegacionItems.map((item) => (
                <Link
                  key={item.ruta}
                  to={item.ruta}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                    esRutaActiva(item.ruta)
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
                  onClick={() => setMenuMovilAbierto(false)}
                >
                  {item.nombre}
                </Link>
              ))}
              
              {/* Separador */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <Link
                  to="/pos"
                  className="flex items-center px-3 py-2 text-green-700 bg-green-50 rounded-lg font-medium"
                  onClick={() => setMenuMovilAbierto(false)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Punto de Venta
                </Link>
              </div>

              {/* Usuario en Móvil */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center px-3 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-teal-500 rounded-full flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{usuario}</div>
                    <div className="text-xs text-gray-500 capitalize">{rol}</div>
                  </div>
                </div>
                <button
                  onClick={cerrarSesion}
                  className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
