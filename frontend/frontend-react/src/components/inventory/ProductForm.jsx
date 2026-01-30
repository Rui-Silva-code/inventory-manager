import { useState } from "react";

/**
 * ProductForm
 * Creates new inventory rows
 */
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
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
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
    <form onSubmit={handleSubmit}>
      <h3>Add Product</h3>

      <label>
        Reference
        <input
          name="referencia"
          placeholder="Reference"
          value={form.referencia}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Color
        <input
          name="cor"
          placeholder="Color"
          value={form.cor}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        X
        <input
          name="x"
          type="number"
          placeholder="X"
          value={form.x}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Y
        <input
          name="y"
          type="number"
          placeholder="Y"
          value={form.y}
          onChange={handleChange}
          required
        />
      </label>

      <label>
        Rack
        <input
          name="rack"
          placeholder="Rack"
          value={form.rack}
          onChange={handleChange}
        />
      </label>

      <label>
        Acabamento
        <input
          name="acab"
          placeholder="Acabamento"
          value={form.acab}
          onChange={handleChange}
        />
      </label>

      <label>
        Obs
        <input
          name="obs"
          placeholder="Obs"
          value={form.obs}
          onChange={handleChange}
        />
      </label>

      <label>
        Marked
        <input
          type="checkbox"
          name="marked"
          checked={form.marked}
          onChange={handleChange}
        />
      </label>

      <button type="submit">Create</button>
    </form>
  );
}
