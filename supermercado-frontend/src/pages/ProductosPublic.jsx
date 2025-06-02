import { useEffect, useState } from "react";
import axios from "axios";
import logoPlaceholder from "../assets/los-pinos-logo.png";

function ProductosPublic() {
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const [ordenPrecio, setOrdenPrecio] = useState("asc");
  const [paginaActual, setPaginaActual] = useState(1);

  const productosPorPagina = 6;

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/productos")
      .then((res) => setProductos(res.data))
      .catch((err) => console.error("Error al obtener productos:", err));
  }, []);

  const categorias = ["Todas", ...new Set(productos.map(p => p.categoria || "Sin categoría"))];

  const filtrados = productos
    .filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .filter(p => categoriaSeleccionada === "Todas" || p.categoria === categoriaSeleccionada)
    .sort((a, b) =>
      ordenPrecio === "asc"
        ? parseFloat(a.precio) - parseFloat(b.precio)
        : parseFloat(b.precio) - parseFloat(a.precio)
    );

  const totalPaginas = Math.ceil(filtrados.length / productosPorPagina);
  const productosPaginados = filtrados.slice(
    (paginaActual - 1) * productosPorPagina,
    paginaActual * productosPorPagina
  );

  const cambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) setPaginaActual(nueva);
  };

  return (
    <div className="min-h-screen p-6 bg-white text-black">
      <h1 className="text-3xl font-bold text-center mb-6">Nuestros Productos</h1>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPaginaActual(1);
          }}
          className="border border-gray-400 rounded px-4 py-2 w-72"
        />
        <select
          value={categoriaSeleccionada}
          onChange={(e) => {
            setCategoriaSeleccionada(e.target.value);
            setPaginaActual(1);
          }}
          className="border border-gray-400 rounded px-4 py-2 w-60"
        >
          {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={ordenPrecio}
          onChange={(e) => setOrdenPrecio(e.target.value)}
          className="border border-gray-400 rounded px-4 py-2 w-60"
        >
          <option value="asc">Precio: menor a mayor</option>
          <option value="desc">Precio: mayor a menor</option>
        </select>
      </div>

      {/* Productos */}
      {productosPaginados.length === 0 ? (
        <p className="text-center text-red-500 font-semibold">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          {productosPaginados.map((prod) => (
            <div
              key={prod.id}
              className="border border-gray-300 p-4 rounded shadow hover:shadow-md bg-white text-center"
            >
              <img
                src={prod.imagen_url || logoPlaceholder}
                alt={prod.nombre}
                className="mx-auto h-[96px] w-[96px] object-contain mb-2 rounded"
              />
              <p className="text-xs text-gray-500 italic mb-1">{prod.categoria || "Sin categoría"}</p>
              <h3 className="text-xl font-semibold mb-1">{prod.nombre}</h3>
              <p className="text-sm text-gray-600">{prod.descripcion}</p>
              <p className="font-bold mt-1">Precio: ${prod.precio}</p>
              <p>Stock: {prod.stock_actual}</p>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            ← Anterior
          </button>
          <span className="px-3 py-1 text-sm font-medium">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductosPublic;
