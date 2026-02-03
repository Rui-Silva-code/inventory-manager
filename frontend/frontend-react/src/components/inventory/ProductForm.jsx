import { useState } from "react";

export default function ProductForm({ onAdd, canEdit }) {
  const [form, setForm] = useState({
    referencia: "",
    cor: "",
    x: "",
    y: "",
    rack: "",
    acab: "",
    obs: "",
    marked: false
  });

  if (!canEdit) return null;

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    await onAdd({
      ...form,
      x: Number(form.x),
      y: Number(form.y)
    });

    setForm({
      referencia: "",
      cor: "",
      x: "",
      y: "",
      rack: "",
      acab: "",
      obs: "",
      marked: false
    });
  }

  return (
    <form onSubmit={handleSubmit} className="form-grid">

      {/* Top 50 / 50 */}
      <div className="form-half">
        <label>
          Reference
          <input
            name="referencia"
            value={form.referencia}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Color
          <input
            name="cor"
            value={form.cor}
            onChange={handleChange}
            required
          />
        </label>
      </div>

      <div className="form-half">
        <div className="form-row">
          <label>
            X
            <input
              type="number"
              name="x"
              value={form.x}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Y
            <input
              type="number"
              name="y"
              value={form.y}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <label>
          Rack
          <input
            name="rack"
            value={form.rack}
            onChange={handleChange}
          />
        </label>
      </div>

      {/* Full width */}
      <label className="full">
        Acab
        <input
          name="acab"
          value={form.acab}
          onChange={handleChange}
        />
      </label>

      <label className="full">
        Obs
        <input
          name="obs"
          value={form.obs}
          onChange={handleChange}
        />
      </label>

      {/* Footer */}
       <div className="form-footer form-footer-stacked">
  <div className="checkbox-inline">
    <input
      type="checkbox"
      className="checkbox-input"
      name="marked"
      checked={form.marked}
      onChange={handleChange}
    />
    <span className="checkbox-text">Marked</span>
  </div>

  <button type="submit">Create</button>
</div>

    </form>
  );
}
