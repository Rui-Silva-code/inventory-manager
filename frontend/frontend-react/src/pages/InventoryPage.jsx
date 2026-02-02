import { useEffect, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import TopBar from "../components/layout/TopBar";

import ProductForm from "../components/inventory/ProductForm";
import ProductFilters from "../components/inventory/ProductFilters";
import ProductTable from "../components/inventory/ProductTable";

import AuditLogPanel from "../components/admin/AuditLogPanel";
import AdminUsersPanel from "../components/admin/UsersPanel";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../api/products";

import { useAuth } from "../context/AuthContext";

/*
  INVENTORY PAGE
  --------------
  - Owns products data
  - Owns filters
  - Owns modals
  - NO styling logic
  - NO table logic
*/

export default function InventoryPage() {
  const { user, logout } = useAuth();

  const isAdmin = user.role === "admin";
  const canEdit = user.role === "admin" || user.role === "editor";

  /* =========================
     DATA
     ========================= */
  const [products, setProducts] = useState([]);

  /* =========================
     UI STATE
     ========================= */
  const [showAdd, setShowAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);

  /* =========================
     FILTERS
     ========================= */
  const [filters, setFilters] = useState({
    referencia: "",
    cor: "",
    rack: "",
    acab: "",
    x: "",
    y: "",
    onlyMarked: false
  });

  /* =========================
     LOAD PRODUCTS
     ========================= */
  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data);
  }

  /* =========================
     CRUD
     ========================= */
  async function handleAdd(product) {
    await createProduct(product);
    loadProducts();
  }

  async function handleUpdate(id, product) {
    await updateProduct(id, product);
    loadProducts();
  }

  async function handleDelete(id) {
    await deleteProduct(id);
    loadProducts();
  }

  /* =========================
     EXPORT CSV (VISIBLE BUTTON)
     ========================= */
  function handleExport() {
    if (!products.length) return;

    const headers = [
      "referencia",
      "cor",
      "x",
      "y",
      "rack",
      "acab",
      "obs",
      "marked"
    ];

    const csv = [
      headers.join(","),
      ...products.map(p =>
        headers
          .map(h => `"${String(p[h] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `SOBRAS_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /* =========================
     IMPORT CSV (ROBUST)
     ========================= */
  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const rows = parseCSV(text);

    if (!rows.length) {
      alert("Invalid or empty CSV file");
      return;
    }

    let success = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        await createProduct({
          referencia: row.referencia || "",
          cor: row.cor || "",
          x: row.x !== "" ? Number(row.x) : null,
          y: row.y !== "" ? Number(row.y) : null,
          rack: row.rack || "",
          acab: row.acab || "",
          obs: row.obs || "",
          marked: false
        });
        success++;
      } catch {
        failed++;
      }
    }

    await loadProducts();
    alert(`Import finished\nCreated: ${success}\nFailed: ${failed}`);
    e.target.value = "";
  }

  /* =========================
     RENDER
     ========================= */
  return (
    <PageLayout
      title="Inventory Manager"
      actions={<TopBar user={user} onLogout={logout} />}
    >
      {/* =========================
         TOP CONTROLS
         ========================= */}
      <div className="panel-toggles">
        {/* ===== LEFT SIDE ===== */}
        <div className="left">
          {canEdit && (
            <button
              className={showAdd ? "active" : ""}
              onClick={() => setShowAdd(v => !v)}
            >
              Add Product
            </button>
          )}

          <button
            className={showFilters ? "active" : ""}
            onClick={() => setShowFilters(v => !v)}
          >
            Filters
          </button>

          <button
            className={filters.onlyMarked ? "active" : ""}
            onClick={() =>
              setFilters(f => ({
                ...f,
                onlyMarked: !f.onlyMarked
              }))
            }
          >
            Marked
          </button>

          {filters.onlyMarked && (
            <button onClick={() => window.print()}>
              Print
            </button>
          )}
        </div>

        {/* ===== RIGHT SIDE ===== */}
        <div className="right">
          <button onClick={handleExport}>
            Export
          </button>

          <button
            onClick={() =>
              document.getElementById("import-file").click()
            }
          >
            Import
          </button>

          <input
            id="import-file"
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleImport}
          />

          {isAdmin && (
            <>
              <button onClick={() => setShowUsers(true)}>
                Users
              </button>

              <button onClick={() => setShowAuditLog(true)}>
                Audit Log
              </button>
            </>
          )}
        </div>
      </div>

      {/* =========================
         ADD PRODUCT
         ========================= */}
      {showAdd && canEdit && (
        <section className="panel add-product">
          <h3 className="panel-title">Add Product</h3>
          <ProductForm
            onAdd={handleAdd}
            canEdit={canEdit}
          />
        </section>
      )}

      {/* =========================
         FILTERS
         ========================= */}
      {showFilters && (
        <section className="panel filters">
          <h3 className="panel-title">Filters</h3>
          <ProductFilters
            filters={filters}
            setFilters={setFilters}
          />
        </section>
      )}

      {/* =========================
         TABLE
         ========================= */}
      <section className="panel">
        <ProductTable
          products={products}
          filters={filters}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          canEdit={canEdit}
          canDelete={canEdit}
        />
      </section>

      {/* =========================
         MODALS
         ========================= */}
      {showUsers && (
        <AdminUsersPanel
          onClose={() => setShowUsers(false)}
        />
      )}

      {showAuditLog && (
        <AuditLogPanel
          onClose={() => setShowAuditLog(false)}
        />
      )}
    </PageLayout>
  );
}

/* =========================================================
   CSV HELPERS (SAFE, COMMENTED)
   ========================================================= */

function parseCSV(text) {
  const lines = text
    .split(/\r?\n/)
    .filter(l => l.trim() !== "");

  if (lines.length < 2) return [];

  const headers = splitCSVLine(lines[0]).map(normalizeHeader);

  return lines.slice(1).map(line => {
    const values = splitCSVLine(line);
    return headers.reduce((obj, h, i) => {
      obj[h] = values[i] ?? "";
      return obj;
    }, {});
  });
}

function splitCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function normalizeHeader(h) {
  const key = h.toLowerCase().trim();
  if (key.startsWith("ref")) return "referencia";
  if (key.startsWith("color")) return "cor";
  if (key === "x") return "x";
  if (key === "y") return "y";
  if (key.startsWith("rack")) return "rack";
  if (key.startsWith("acab")) return "acab";
  if (key.startsWith("obs")) return "obs";
  if (key.startsWith("mark")) return "marked";
  return key;
}
