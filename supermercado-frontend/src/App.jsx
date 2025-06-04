import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Home from "@pages/Home";
import Login from "@components/Login";
import Register from "@components/Register";
import Dashboard from "@components/Dashboard";
import Admin from "@pages/Admin";
import NotFound from "@pages/Notfound";
import Header from "@components/Header";
import Ofertas from "@pages/Ofertas";
import Contacto from "@pages/Contacto";
import ProductosPublic from "@pages/ProductosPublic";
import POS from "@components/POS";

// Componente para manejar el Header condicionalmente
function AppContent() {
  const location = useLocation();
  
  // Páginas donde NO queremos mostrar el Header
  const paginasSinHeader = ['/login', '/register', '/pos'];
  const mostrarHeader = !paginasSinHeader.includes(location.pathname);

  return (
    <>
      {mostrarHeader && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/ofertas" element={<Ofertas />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/productos" element={<ProductosPublic />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
