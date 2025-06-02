function ProductTable({ productos, onEditar, onEliminar }) {
  return (
    <table border="1" cellPadding="5">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Precio</th>
          <th>Stock Actual</th>
          <th>Stock Mínimo</th>
          <th>Vencimiento</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((p) => (
          <tr key={p.id}>
            <td>{p.nombre}</td>
            <td>{p.descripcion}</td>
            <td>${p.precio}</td>
            <td>{p.stock_actual}</td>
            <td>{p.stock_minimo}</td>
            <td>{p.fecha_vencimiento || "-"}</td>
            <td>
              <button onClick={() => onEditar(p)}>Editar</button>
              <button onClick={() => onEliminar(p.id)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ProductTable;
