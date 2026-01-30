import PageLayout from "../layout/PageLayout";
import TopBar from "../layout/TopBar";

import ProductForm from "../components/inventory/ProductForm";
import ProductFilters from "../components/inventory/ProductFilters";
import ProductTable from "../components/inventory/ProductTable";

import AuditLogPanel from "../components/admin/AuditLogPanel";
import AdminCreateUserPanel from "../components/AdminCreateUserPanel";
import AdminUsersPanel from "../components/admin/AdminUsersPanel";

import { useAuth } from "../context/AuthContext";

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
          <h2>Add Product</h2>
          <ProductForm />
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
