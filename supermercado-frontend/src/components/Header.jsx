import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";
import logo from "../assets/los-pinos-logo.png";

function Header() {
  return (
    <header>
      <div className="header-top">
        <div className="logo-container">
          <img src={logo} alt="Logo Supermercado Los Pinos" />
          <h1>Supermercado Los Pinos</h1>
        </div>
        <nav className="nav-bar">
          <Link to="/">Inicio</Link>
          <Link to="/productos">Productos</Link>
          <Link to="/ofertas">Ofertas</Link>
          <Link to="/contacto">Contacto</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
