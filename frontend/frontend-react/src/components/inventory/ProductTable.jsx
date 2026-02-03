import { useEffect, useRef, useState } from "react";

const PAGE_SIZE = 100;
const MIN_COL_WIDTH = 60;

export default function ProductTable({
  products,
  filters,
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

  /* ============================
     COLUMN STATE
     ============================ */
  const [columns, setColumns] = useState([
    { key: "referencia", label: "Ref", width: 140 },
    { key: "cor", label: "Color", width: 110 },
    { key: "x", label: "X", width: 70 },
    { key: "y", label: "Y", width: 70 },
    { key: "rack", label: "Rack", width: 90 },
    { key: "acab", label: "Acab", width: 100 },
    { key: "obs", label: "Obs", width: 140 },

    /* NEW JOIN COLUMN */
    { key: "resume", label: "Resume", width: 220 },

    { key: "marked", label: "Marked", width: 80 }
  ]);

  const resizingRef = useRef(null);

  /* ============================
     RESET PAGE
     ============================ */
  useEffect(() => {
    setPage(1);
  }, [filters, sortConfig]);

  /* ============================
     HELPERS
     ============================ */
  const normalize = v =>
    String(v ?? "").toLowerCase().trim();

  const toNumber = v => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  function buildResume(p) {
    if (!p) return "";
    const ref = p.referencia ?? "";
    const color = p.cor ?? "";
    const x = p.x ?? "";
    const y = p.y ?? "";
    if (!ref && !color && !x && !y) return "";
    return `${ref} ${color} ${x}x${y}cm`.trim();
  }

  /* ============================
     FILTERING
     ============================ */
  const filtered = products.filter(p => {
    if (filters.referencia && !normalize(p.referencia).includes(normalize(filters.referencia))) return false;
    if (filters.cor && !normalize(p.cor).includes(normalize(filters.cor))) return false;
    if (filters.acab && !normalize(p.acab).includes(normalize(filters.acab))) return false;
    if (filters.rack && !normalize(p.rack).includes(normalize(filters.rack))) return false;

    const minX = toNumber(filters.x);
    const minY = toNumber(filters.y);

    if (minX !== null && toNumber(p.x) < minX) return false;
    if (minY !== null && toNumber(p.y) < minY) return false;

    if (filters.onlyMarked && !p.marked) return false;
    return true;
  });

  /* ============================
     SORTING
     ============================ */
  function handleSort(key) {
    if (key === "resume") return;

    setSortConfig(prev => {
      if (prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return { key: null, direction: null };
    });
  }

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const dir = sortConfig.direction === "asc" ? 1 : -1;
    const key = sortConfig.key;

    if (key === "x" || key === "y") {
      return ((a[key] ?? 0) - (b[key] ?? 0)) * dir;
    }

    return normalize(a[key]).localeCompare(normalize(b[key])) * dir;
  });

  const visible = sorted.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* ============================
     COLUMN RESIZE
     ============================ */
  function startResize(e, index) {
    resizingRef.current = {
      index,
      startX: e.clientX,
      startWidth: columns[index].width
    };

    document.addEventListener("mousemove", resizeMove);
    document.addEventListener("mouseup", stopResize);
  }

  function resizeMove(e) {
    if (!resizingRef.current) return;
    const { index, startX, startWidth } = resizingRef.current;
    const delta = e.clientX - startX;

    setColumns(cols =>
      cols.map((c, i) =>
        i === index
          ? { ...c, width: Math.max(MIN_COL_WIDTH, startWidth + delta) }
          : c
      )
    );
  }

  function stopResize() {
    resizingRef.current = null;
    document.removeEventListener("mousemove", resizeMove);
    document.removeEventListener("mouseup", stopResize);
  }

  /* DOUBLE CLICK AUTO SIZE */
  function autoSizeColumn(index) {
    const key = columns[index].key;
    const headerText = columns[index].label;

    let max = headerText.length;

    visible.forEach(p => {
      const value =
        key === "resume" ? buildResume(p) : String(p[key] ?? "");
      max = Math.max(max, value.length);
    });

    setColumns(cols =>
      cols.map((c, i) =>
        i === index
          ? { ...c, width: Math.min(420, max * 8 + 24) }
          : c
      )
    );
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
    cancelEdit();
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setEditForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  }

  function toggleMarked(p) {
    if (!canEdit) return;
    onUpdate(p.id, { ...p, marked: !p.marked });
  }

  function confirmDelete(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    onDelete(id);
  }

  /* ============================
     RENDER
     ============================ */
  return (
    <>
      <div className="table-wrapper">
        <table className="excel-table">
          <colgroup>
            {columns.map(c => (
              <col key={c.key} style={{ width: c.width }} />
            ))}
            <col style={{ width: 150 }} />
          </colgroup>

          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={c.key}>
                  <div className="th-inner">
                    <span>{c.label}</span>
                    {c.key !== "resume" && (
                      <span
                        className="sort-indicator"
                        onClick={() => handleSort(c.key)}
                      >
                        {sortConfig.key === c.key
                          ? sortConfig.direction === "asc" ? "↑" : "↓"
                          : "↕"}
                      </span>
                    )}
                  </div>

                  <div
                    className="col-resizer"
                    onMouseDown={e => startResize(e, i)}
                    onDoubleClick={() => autoSizeColumn(i)}
                  />
                </th>
              ))}
              <th className="actions-header">Actions</th>
            </tr>
          </thead>

         <tbody>
  {visible.map(p => {
    const isEditing = editingId === p.id;

    return (
      <tr key={p.id} className={p.marked ? "row-marked" : ""}>
        {columns.map(c => (
          <td key={c.key} className="cell-clip">
            {c.key === "resume" ? (
              buildResume(p)
            ) : c.key === "marked" ? (
              <input
                type="checkbox"
                checked={!!(isEditing ? editForm.marked : p.marked)}
                disabled={!canEdit}
                onChange={() =>
                  isEditing
                    ? setEditForm(f => ({ ...f, marked: !f.marked }))
                    : toggleMarked(p)
                }
              />
            ) : isEditing ? (
              <input
                name={c.key}
                value={editForm[c.key] ?? ""}
                onChange={handleChange}
              />
            ) : (
              String(p[c.key] ?? "")
            )}
          </td>
        ))}

        <td className="actions-cell">
          {isEditing ? (
            <>
              <button onClick={saveEdit}>Save</button>
              <button onClick={cancelEdit}>Cancel</button>
            </>
          ) : (
            <>
              {canEdit && <button onClick={() => startEdit(p)}>Edit</button>}
              {canDelete && (
                <button onClick={() => confirmDelete(p.id)}>Delete</button>
              )}
            </>
          )}
        </td>
      </tr>
    );
  })}
</tbody>

        </table>
      </div>

      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          Prev
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </>
  );
}
