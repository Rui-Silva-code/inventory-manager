export default function ProductFilters({ filters, setFilters }) {
  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFilters({
      ...filters,
      [name]: type === "checkbox" ? checked : value
    });
  }

  function clearFilters() {
    setFilters({
      referencia: "",
      cor: "",
      rack: "",
      acab: "",
      x: "",
      y: "",
      onlyMarked: false
    });
  }

  return (
    <div className="form-grid">
      <label>
        Reference
        <input
          name="referencia"
          value={filters.referencia}
          onChange={handleChange}
        />
      </label>

      <label>
        Color
        <input
          name="cor"
          value={filters.cor}
          onChange={handleChange}
        />
      </label>

      <label>
        Rack
        <input
          name="rack"
          value={filters.rack}
          onChange={handleChange}
        />
      </label>

      <label>
        Acab
        <input
          name="acab"
          value={filters.acab}
          onChange={handleChange}
        />
      </label>

      <label>
        Min X
        <input
          type="number"
          name="x"
          value={filters.x}
          onChange={handleChange}
        />
      </label>

      <label>
        Min Y
        <input
          type="number"
          name="y"
          value={filters.y}
          onChange={handleChange}
        />
      </label>

      <div className="form-footer">
        <button onClick={clearFilters}>Clear filters</button>
      </div>
    </div>
  );
}
