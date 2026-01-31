import { useEffect, useRef, useState } from "react";

const PAGE_SIZE = 50;

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
    direction: null
  });

  const [colWidths, setColWidths] = useState({
    referencia: 120,
    cor: 120,
    x: 70,
    y: 70,
    rack: 90,
    acab: 120,
    obs: 200,
    marked: 80,
    actions: 140
  });

  const resizingCol = useRef(null);

  /* ============================
     RESET PAGE
     ============================ */
  useEffect(() => {
    setPage(1);
  }, [filters, sortConfig]);

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
     SORTING (UNCHANGED LOGIC)
     ============================ */
  function handleSort(key) {
    setSortConfig((prev) => {
      if (prev.key !== key) return { key, direction: "desc" };
      if (prev.direction === "desc") return { key, direction: "asc" };
      if (prev.direction === "asc") return { key: null, direction: null };
      return { key, direction: "desc" };
    });
  }

  function sortIndicator(key) {
    if (sortConfig.key !== key) return "↕";
    if (sortConfig.direction === "desc") return "↓";
    if (sortConfig.direction === "asc") return "↑";
    return "↕";
  }

  function sortProducts(list) {
    if (!sortConfig.key || !sortConfig.direction) return list;
    const dir = sortConfig.direction === "asc" ? 1 : -1;

    return [...list].sort((a, b) => {
      const A = a[sortConfig.key];
      const B = b[sortConfig.key];
      return String(A ?? "").localeCompare(String(B ?? ""), undefined, { sensitivity: "base" }) * dir;
    });
  }

  const sorted = sortProducts(filteredProducts);

  /* ============================
     PAGINATION
     ============================ */
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const visibleProducts = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ============================
     COLUMN RESIZE (UNCHANGED)
     ============================ */
  function startResize(e, key) {
    resizingCol.current = { key, startX: e.clientX, startWidth: colWidths[key] };
    document.addEventListener("mousemove", onResize);
    document.addEventListener("mouseup", stopResize);
  }

  function onResize(e) {
    if (!resizingCol.current) return;
    const delta = e.clientX - resizingCol.current.startX;
    setColWidths((w) => ({
      ...w,
      [resizingCol.current.key]: Math.max(50, resizingCol.current.startWidth + delta)
    }));
  }

  function stopResize() {
    resizingCol.current = null;
    document.removeEventListener("mousemove", onResize);
    document.removeEventListener("mouseup", stopResize);
  }

  function autoFitColumn(key) {
    const maxLen = Math.max(
      key.length,
      ...products.map((p) => String(p[key] ?? "").length)
    );
    setColWidths((w) => ({
      ...w,
      [key]: Math.min(320, maxLen * 9 + 24)
    }));
  }

  /* ============================
     EDITING
     ============================ */
  function startEdit(p) {
    setEditingId(p.id);
    setEditForm({ ...p });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit() {
    await onUpdate(editingId, editForm);
    setEditingId(null);
  }

  function handleEditChange(e) {
    const { name, value, type, checked } = e.target;
    setEditForm({
      ...editForm,
      [name]: type === "checkbox" ? checked : value
    });
  }

  function toggleMarked(p) {
    if (!canEdit) return;
    onUpdate(p.id, { ...p, marked: !p.marked });
  }

  const columns = [
    ["referencia", "Ref"],
    ["cor", "Color"],
    ["x", "X"],
    ["y", "Y"],
    ["rack", "Rack"],
    ["acab", "Acab"],
    ["obs", "Obs"],
    ["marked", "Marked"]
  ];

  return (
    <>
      <div className="table-wrapper">
        <table className="excel-table">
          <thead>
            <tr>
              {columns.map(([key, label]) => (
                <th key={key} style={{ width: colWidths[key] }}>
                  <div className="th-inner">
                    <span className="th-title">{label}</span>

                    <span
                      className="sort-indicator"
                      onClick={() => handleSort(key)}
                    >
                      {sortIndicator(key)}
                    </span>

                    <span
                      className="col-resizer"
                      onMouseDown={(e) => startResize(e, key)}
                      onDoubleClick={() => autoFitColumn(key)}
                    />
                  </div>
                </th>
              ))}

              <th style={{ width: colWidths.actions }}>
                <div className="th-inner">
                  <span>Actions</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleProducts.map((p) => (
              <tr
                key={p.id}
                className={p.marked ? "row-marked" : ""}
              >
                {editingId === p.id ? (
                  <>
                    {columns.map(([key]) => (
                      <td key={key} style={{ width: colWidths[key] }}>
                        {key === "marked" ? (
                          <input
                            type="checkbox"
                            checked={!!editForm.marked}
                            onChange={handleEditChange}
                            name="marked"
                          />
                        ) : (
                          <input
                            name={key}
                            value={editForm[key] ?? ""}
                            onChange={handleEditChange}
                            style={{ width: "100%" }}
                          />
                        )}
                      </td>
                    ))}

                    <td>
                      <div className="action-buttons">
                        <button onClick={saveEdit}>Save</button>
                        <button onClick={cancelEdit}>Cancel</button>
                      </div>
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
                    <td>
                      <input
                        type="checkbox"
                        checked={!!p.marked}
                        disabled={!canEdit}
                        onChange={() => toggleMarked(p)}
                      />
                    </td>
                    <td>
                      <div className="action-buttons">
                        {canEdit && <button onClick={() => startEdit(p)}>Edit</button>}
                        {canDelete && (
                          <button
                            onClick={() => {
                              if (window.confirm("Delete this product?")) {
                                onDelete(p.id);
                              }
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span>Page {page} / {totalPages || 1}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </>
  );
}
