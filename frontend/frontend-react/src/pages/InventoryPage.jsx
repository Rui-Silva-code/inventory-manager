import { useEffect, useState } from "react";
import PageLayout from "../components/layout/PageLayout.jsx";
import TopBar from "../components/layout/TopBar.jsx";

import ProductForm from "../components/inventory/ProductForm.jsx";
import ProductFilters from "../components/inventory/ProductFilters.jsx";
import ProductTable from "../components/inventory/ProductTable.jsx";

import AuditLogPanel from "../components/admin/AuditLogPanel.jsx";
import AdminCreateUserPanel from "../components/AdminCreateUserPanel.jsx";
import AdminUsersPanel from "../components/admin/AdminUsersPanel.jsx";

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

  /* ============================
     STATE
     ============================ */
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
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  /* ============================
     LOAD PRODUCTS
     ============================ */
  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data);
  }

  /* ============================
     CRUD HANDLERS
     ============================ */
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

  /* ============================
     RENDER
     ============================ */
  return (
    <PageLayout
      title="Inventory Manager"
      actions={
        <TopBar
          user={user}
          onLogout={logout}
          onAuditLog={() => setShowAuditLog(true)}
          onCreateUser={() => setShowCreateUser(true)}
          onUsers={() => setShowUsers(true)}
          isAdmin={isAdmin}
        />
      }
    >
      {/* ===== TOGGLE BUTTONS ===== */}
      <div className="panel-toggles">
        {canEdit && (
          <button
            className={showAdd ? "active" : ""}
            onClick={() => setShowAdd((v) => !v)}
          >
            Add Product ▾
          </button>
        )}

        <button
          className={showFilters ? "active" : ""}
          onClick={() => setShowFilters((v) => !v)}
        >
          Filters ▾
        </button>
      </div>

      {/* ===== ADD PRODUCT PANEL ===== */}
      {showAdd && canEdit && (
        <section className="panel">
          <h2>Add Product</h2>
          <ProductForm onAdd={handleAdd} canEdit={canEdit} />
        </section>
      )}

      {/* ===== FILTERS PANEL ===== */}
      {showFilters && (
        <section className="panel">
          <h2>Filters</h2>
          <ProductFilters
            filters={filters}
            setFilters={setFilters}
          />
        </section>
      )}

      {/* ===== TABLE ===== */}
      <section className="panel">
        <ProductTable
          products={products}
          filters={filters}
          setFilters={setFilters}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </section>

      {/* ===== ADMIN MODALS ===== */}
      {isAdmin && showAuditLog && (
        <AuditLogPanel onClose={() => setShowAuditLog(false)} />
      )}

      {isAdmin && showCreateUser && (
        <AdminCreateUserPanel onClose={() => setShowCreateUser(false)} />
      )}

      {isAdmin && showUsers && (
        <AdminUsersPanel onClose={() => setShowUsers(false)} />
      )}
    </PageLayout>
  );
}
