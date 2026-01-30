import { useState } from "react";
import PageLayout from "../components/layout/PageLayout.jsx";
import TopBar from "../components/layout/TopBar.jsx";

import ProductForm from "../components/inventory/ProductForm.jsx";
import ProductFilters from "../components/inventory/ProductFilters.jsx";
import ProductTable from "../components/inventory/ProductTable.jsx";

import AuditLogPanel from "../components/admin/AuditLogPanel.jsx";
import AdminCreateUserPanel from "../components/AdminCreateUserPanel.jsx";
import AdminUsersPanel from "../components/admin/AdminUsersPanel.jsx";

import { useAuth } from "../context/AuthContext.js";

export default function InventoryPage() {
  const { user, logout } = useAuth();

  const isAdmin = user.role === "admin";
  const canEdit = user.role === "admin" || user.role === "editor";

  // ✅ MINIMUM REQUIRED STATE
  const [products] = useState([]);
  const [filters, setFilters] = useState({
    referencia: "",
    cor: "",
    rack: "",
    acab: "",
    x: "",
    y: "",
    onlyMarked: false
  });

  return (
    <PageLayout
      title="Inventory Manager"
      actions={<TopBar user={user} onLogout={logout} />}
    >
      {canEdit && (
        <section className="panel">
          <h2>Add Product</h2>
          <ProductForm onAdd={() => {}} canEdit={canEdit} />
        </section>
      )}

      <section className="panel">
        <h2>Filters</h2>
        <ProductFilters />
      </section>

      <section className="panel">
        <ProductTable
          products={products}
          filters={filters}
          setFilters={setFilters}
          onUpdate={() => {}}
          onDelete={() => {}}
          canEdit={canEdit}
          canDelete={canEdit}
        />
      </section>

      {isAdmin && <AuditLogPanel />}
      {isAdmin && <AdminCreateUserPanel />}
      {isAdmin && <AdminUsersPanel />}
    </PageLayout>
  );
}
