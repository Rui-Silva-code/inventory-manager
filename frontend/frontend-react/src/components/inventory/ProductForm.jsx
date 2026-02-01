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
      {/* Reference */}
      <label>
        Reference
        <input
          name="referencia"
          value={form.referencia}
          onChange={handleChange}
          required
        />
      </label>

      {/* Color */}
      <label>
        Color
        <input
          name="cor"
          value={form.cor}
          onChange={handleChange}
          required
        />
      </label>

      {/* X / Y compact row */}
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

      {/* Rack */}
      <label>
        Rack
        <input
          name="rack"
          value={form.rack}
          onChange={handleChange}
        />
      </label>

      {/* Acab */}
      <label>
        Acab
        <input
          name="acab"
          value={form.acab}
          onChange={handleChange}
        />
      </label>

      {/* Obs */}
      <label className="full">
        Obs
        <input
          name="obs"
          value={form.obs}
          onChange={handleChange}
        />
      </label>

      {/* Marked + Submit */}
      <div className="form-footer">
        <label className="checkbox">
           Marked
          <input
            type="checkbox"
            name="marked"
            checked={form.marked}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Create</button>
      </div>
    </form>
  );
}
