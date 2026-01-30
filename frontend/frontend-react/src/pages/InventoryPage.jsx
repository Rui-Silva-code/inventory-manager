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

  return (
    <PageLayout
      title="Inventory Manager"
      actions={
        <TopBar
          user={user}
          onLogout={logout}
        />
      }
    >
      {canEdit && (
        <section className="panel">
  <ProductTable
    products={[]}
    filters={{
      referencia: "",
      cor: "",
      rack: "",
      acab: "",
      x: "",
      y: "",
      onlyMarked: false
    }}
    setFilters={() => {}}
    onUpdate={() => {}}
    onDelete={() => {}}
    canEdit={canEdit}
    canDelete={canEdit}
  />
</section>

      )}

      <section className="panel">
        <h2>Filters</h2>
        <ProductFilters />
      </section>

      <section className="panel">
        <ProductTable />
      </section>

      {isAdmin && <AuditLogPanel />}
      {isAdmin && <AdminCreateUserPanel />}
      {isAdmin && <AdminUsersPanel />}
    </PageLayout>
  );
}
<ProductForm
  canEdit={canEdit}
  onAdd={async (product) => {
    // TEMP FIX until state lifting
    console.warn("onAdd not wired yet", product);
  }}
/>



