function ProductForm({ form, onChange, onSubmit, editando }) {
  return (
    <form onSubmit={onSubmit} className="form-producto">
      <h3>{editando ? "Editar producto" : "Crear nuevo producto"}</h3>

      <input
        type="text"
        name="nombre"
        placeholder="Nombre"
        value={form.nombre}
        onChange={onChange}
        required
      />
      <input
        type="text"
        name="descripcion"
        placeholder="Descripción"
        value={form.descripcion}
        onChange={onChange}
      />
      <input
        type="number"
        name="precio"
        placeholder="Precio"
        value={form.precio}
        onChange={onChange}
        required
      />
      <input
        type="number"
        name="stock_minimo"
        placeholder="Stock mínimo"
        value={form.stock_minimo}
        onChange={onChange}
        required
      />
      <input
        type="number"
        name="stock_actual"
        placeholder="Stock actual"
        value={form.stock_actual}
        onChange={onChange}
        required
      />
      <input
        type="date"
        name="fecha_vencimiento"
        value={form.fecha_vencimiento || ""}
        onChange={onChange}
      />

      <select
        name="categoria"
        value={form.categoria || "Otros"}
        onChange={onChange}
        required
      >
        <option value="Bebidas">Bebidas</option>
        <option value="Alimentos">Alimentos</option>
        <option value="Limpieza">Limpieza</option>
        <option value="Otros">Otros</option>
      </select>
      <input
      type="text"
      name="imagen_url"
      placeholder="URL de la imagen"
      value={form.imagen_url}
      onChange={onChange}
/>


      <button type="submit">
        {editando ? "Actualizar" : "Crear"}
      </button>
    </form>
  );
}

export default ProductForm;
