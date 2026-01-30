import { useEffect, useState } from "react";

const PAGE_SIZE = 50;

/**
 * ProductTable
 * Displays inventory with filters, sorting, pagination and inline editing
 */
export default function ProductTable({
  products,
  filters,
  setFilters,
  onUpdate,
  onDelete,
  canEdit,
  canDelete
}) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [page, setPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null // asc | desc | null
  });

  const DEFAULT_FILTERS = {
    referencia: "",
    cor: "",
    rack: "",
    acab: "",
    x: "",
    y: "",
    onlyMarked: false
  };

  /* ============================
     RESET PAGE ON FILTER / SORT
     ============================ */
  useEffect(() => {
    setPage(1);
  }, [filters, sortConfig]);

  /* ============================
     EDIT HANDLERS
     ============================ */
  function startEdit(product) {
    setEditingId(product.id);
    setEditForm({ ...product });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit() {
    await onUpdate(editingId, {
      ...editForm,
      x: Number(editForm.x),
      y: Number(editForm.y)
    });
    setEditingId(null);
  }

  function handleEditChange(e) {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === "checkbox" ? checked : value
    });
  }

  function handleDelete(id) {
    if (window.confirm("Are you sure you want to delete this product?")) {
      onDelete(id);
    }
  }

  /* ============================
     FILTERING
     ============================ */
  const filteredProducts = products.filter((p) => {
    if (filters.referencia && !p.referencia?.includes(filters.referencia)) return false;
    if (filters.cor && !p.cor?.includes(filters.cor)) return false;
    if (filters.rack && !p.rack?.includes(filters.rack)) return false;
    if (filters.acab && !p.acab?.includes(filters.acab)) return false;
    if (filters.x && p.x < Number(filters.x)) return false;
    if (filters.y && p.y < Number(filters.y)) return false;
    if (filters.onlyMarked && !p.marked) return false;
    return true;
  });

  /* ============================
     SORTING
     ============================ */
  function handleSort(key) {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "desc" };
      if (prev.direction === "desc") return { key, direction: "asc" };
      if (prev.direction === "asc") return { key: null, direction: null };
      return { key, direction: "desc" };
    });
  }

  function renderSortIndicator(columnKey) {
    if (sortConfig.key !== columnKey) return " ▲▼";
    if (sortConfig.direction === "asc") return " ▲";
    if (sortConfig.direction === "desc") return " ▼";
    return " ▲▼";
  }

  function sortProducts(list) {
    if (!sortConfig.key || !sortConfig.direction) return list;

    const dir = sortConfig.direction === "asc" ? 1 : -1;

    return [...list].sort((a, b) => {
      const A = a[sortConfig.key];
      const B = b[sortConfig.key];

      if (typeof A === "number" && typeof B === "number") {
        return (A - B) * dir;
      }

      if (typeof A === "boolean" && typeof B === "boolean") {
        return (A === B ? 0 : A ? 1 : -1) * dir;
      }

      return String(A ?? "")
        .localeCompare(String(B ?? ""), undefined, { sensitivity: "base" }) * dir;
    });
  }

  const sorted = sortProducts(filteredProducts);

  /* ============================
     PAGINATION
     ============================ */
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  const visibleProducts = sorted.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ============================
     ACTIONS
     ============================ */
  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  function toggleMarked(product) {
    if (!canEdit) return;
    onUpdate(product.id, { ...product, marked: !product.marked });
  }

  /* ============================
     RENDER
     ============================ */
  return (
    <div>
      <h3>Filters</h3>

      <label>
        Reference
        <input
          value={filters.referencia}
          onChange={(e) =>
            setFilters({ ...filters, referencia: e.target.value })
          }
        />
      </label>

      <label>
        Color
        <input
          value={filters.cor}
          onChange={(e) =>
            setFilters({ ...filters, cor: e.target.value })
          }
        />
      </label>

      <label>
        Rack
        <input
          value={filters.rack}
          onChange={(e) =>
            setFilters({ ...filters, rack: e.target.value })
          }
        />
      </label>

      <label>
        Acab
        <input
          value={filters.acab}
          onChange={(e) =>
            setFilters({ ...filters, acab: e.target.value })
          }
        />
      </label>

      <label>
        Min X
        <input
          type="number"
          value={filters.x}
          onChange={(e) =>
            setFilters({ ...filters, x: e.target.value })
          }
        />
      </label>

      <label>
        Min Y
        <input
          type="number"
          value={filters.y}
          onChange={(e) =>
            setFilters({ ...filters, y: e.target.value })
          }
        />
      </label>

      <label>
        Only marked
        <input
          type="checkbox"
          checked={filters.onlyMarked}
          onChange={(e) =>
            setFilters({ ...filters, onlyMarked: e.target.checked })
          }
        />
      </label>

      <button onClick={clearFilters}>Clear filters</button>

      {/* ============================
          TABLE
         ============================ */}
      <table border="1">
        <thead>
          <tr>
            <th onClick={() => handleSort("referencia")}>Ref{renderSortIndicator("referencia")}</th>
            <th onClick={() => handleSort("cor")}>Cor{renderSortIndicator("cor")}</th>
            <th onClick={() => handleSort("x")}>X{renderSortIndicator("x")}</th>
            <th onClick={() => handleSort("y")}>Y{renderSortIndicator("y")}</th>
            <th onClick={() => handleSort("rack")}>Rack{renderSortIndicator("rack")}</th>
            <th onClick={() => handleSort("acab")}>Acab{renderSortIndicator("acab")}</th>
            <th onClick={() => handleSort("obs")}>Obs{renderSortIndicator("obs")}</th>
            <th onClick={() => handleSort("marked")}>Marked{renderSortIndicator("marked")}</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {visibleProducts.map((p) => (
            <tr key={p.id}>
              {editingId === p.id ? (
                <>
                  <td><input name="referencia" value={editForm.referencia || ""} onChange={handleEditChange} /></td>
                  <td><input name="cor" value={editForm.cor || ""} onChange={handleEditChange} /></td>
                  <td><input name="x" type="number" value={editForm.x || ""} onChange={handleEditChange} /></td>
                  <td><input name="y" type="number" value={editForm.y || ""} onChange={handleEditChange} /></td>
                  <td><input name="rack" value={editForm.rack || ""} onChange={handleEditChange} /></td>
                  <td><input name="acab" value={editForm.acab || ""} onChange={handleEditChange} /></td>
                  <td><input name="obs" value={editForm.obs || ""} onChange={handleEditChange} /></td>
                  <td><input type="checkbox" name="marked" checked={!!editForm.marked} onChange={handleEditChange} /></td>
                  <td>
                    <button onClick={saveEdit}>Save</button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{p.referencia}</td>
                  <td>{p.cor}</td>
                  <td>{p.x}</td>
                  <td>{p.y}</td>
                  <td>{p.rack}</td>
                  <td>{p.acab}</td>
                  <td>{p.obs}</td>
                  <td
                    style={{ cursor: canEdit ? "pointer" : "default" }}
                    onClick={() => toggleMarked(p)}
                  >
                    {p.marked ? "✓" : ""}
                  </td>
                  <td>
                    {canEdit && <button onClick={() => startEdit(p)}>Edit</button>}
                    {canDelete && <button onClick={() => handleDelete(p.id)}>Delete</button>}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* ============================
          PAGINATION CONTROLS
         ============================ */}
      <div style={{ marginTop: 10 }}>
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>

        <span style={{ margin: "0 10px" }}>
          Page {page} / {totalPages || 1}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
