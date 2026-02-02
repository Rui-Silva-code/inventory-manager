import { useEffect, useState } from "react";
import PageLayout from "../components/layout/PageLayout.jsx";
import TopBar from "../components/layout/TopBar.jsx";

import ProductForm from "../components/inventory/ProductForm.jsx";
import ProductFilters from "../components/inventory/ProductFilters.jsx";
import ProductTable from "../components/inventory/ProductTable.jsx";

import AuditLogPanel from "../components/admin/AuditLogPanel.jsx";
import AdminUsersModal from "../components/admin/AdminUsersModal.jsx";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from "../api/products";

import { useAuth } from "../context/AuthContext.js";

export default function InventoryPage() {
  const { user, logout } = useAuth();

  const isAdmin = user.role === "admin";
  const canEdit = user.role === "admin" || user.role === "editor";
  const canDelete = canEdit;

  const [products, setProducts] = useState([]);

  const [filters, setFilters] = useState({
    referencia: "",
    cor: "",
    rack: "",
    acab: "",
    x: "",
    y: "",
    onlyMarked: false
  });

  const [showAdd, setShowAdd] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  /* =========================
     LOAD DATA
     ========================= */
  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data);
  }

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
     CSV EXPORT
     ========================= */
  function exportCSV(rows) {
    if (!rows.length) return;

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map(r =>
        headers
          .map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `SOBRAS_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  /* =========================
     CSV IMPORT
     ========================= */
  async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return alert("Invalid CSV");

    const headers = lines[0].split(",").map(h => h.trim());

    for (const line of lines.slice(1)) {
      const values = line.split(",");
      const row = headers.reduce((o, h, i) => {
        o[h] = values[i]?.replace(/^"|"$/g, "") ?? "";
        return o;
      }, {});

      await createProduct({
        referencia: row.referencia || "",
        cor: row.cor || "",
        x: row.x ? Number(row.x) : null,
        y: row.y ? Number(row.y) : null,
        rack: row.rack || "",
        acab: row.acab || "",
        obs: row.obs || "",
        marked: false
      });
    }

    loadProducts();
    alert("Import completed");
  }

  return (
    <PageLayout
      title="Inventory Manager"
      actions={
        <TopBar
          user={user}
          onLogout={logout}
          isAdmin={isAdmin}
        />
      }
    >
      {/* =========================
         TOP CONTROLS
         ========================= */}
      <div className="panel-toggles">
        <div className="left">
          {canEdit && (
            <button onClick={() => setShowAdd(v => !v)}>Add Product</button>
          )}

          <button onClick={() => setShowFilters(v => !v)}>Filters</button>

          <button
            onClick={() =>
              setFilters(f => ({ ...f, onlyMarked: !f.onlyMarked }))
            }
          >
            Marked
          </button>

          {filters.onlyMarked && (
            <button onClick={() => window.print()}>Print</button>
          )}
        </div>

        <div className="right">
          <button
            onClick={() => {
              const rows = [...document.querySelectorAll("tbody tr")].map(tr =>
                [...tr.children].reduce((o, td, i) => {
                  o[`col_${i}`] = td.innerText;
                  return o;
                }, {})
              );
              exportCSV(rows);
            }}
          >
            Export
          </button>

          <button onClick={() => document.getElementById("import-file").click()}>
            Import
          </button>

          <input
            id="import-file"
            type="file"
            accept=".csv"
            hidden
            onChange={handleImport}
          />

          {isAdmin && (
            <>
              <button onClick={() => setShowUsers(true)}>Users</button>
              <button onClick={() => setShowAuditLog(true)}>Audit Log</button>
            </>
          )}
        </div>
      </div>

      {/* =========================
         PANELS
         ========================= */}
      {showAdd && canEdit && (
        <section className="panel">
          <ProductForm onAdd={handleAdd} />
        </section>
      )}

      {showFilters && (
        <section className="panel">
          <ProductFilters filters={filters} setFilters={setFilters} />
        </section>
      )}

      <section className="panel">
        <ProductTable
          products={products}
          filters={filters}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </section>

      {/* =========================
         MODALS
         ========================= */}
      {showUsers && (
        <AdminUsersModal onClose={() => setShowUsers(false)} />
      )}

      {showAuditLog && (
        <AuditLogPanel onClose={() => setShowAuditLog(false)} />
      )}
    </PageLayout>
  );
}
