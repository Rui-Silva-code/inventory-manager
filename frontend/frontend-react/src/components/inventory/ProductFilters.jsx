export default function ProductFilters({ filters, setFilters }) {
  function handleChange(e) {
    const { name, value } = e.target;

    setFilters({
      ...filters,
      [name]: value
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

      {/* Row 1 */}
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

      {/* Row 2 */}
      <label className="full">
        Acab
        <input
          name="acab"
          value={filters.acab}
          onChange={handleChange}
        />
      </label>

      {/* Row 3 */}
      <div className="form-row full">
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

        <label>
          Rack
          <input
            name="rack"
            value={filters.rack}
            onChange={handleChange}
          />
        </label>
      </div>

      <div className="form-footer">
  <button
    type="button"
    className="primary-action"
    onClick={clearFilters}
  >
    Clear filters
  </button>
</div>

    </div>
  );
}
