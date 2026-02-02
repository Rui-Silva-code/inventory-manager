import Modal from "../common/Modal";
import AdminCreateUserPanel from "../AdminCreateUserPanel";
import AdminUsersPanel from "./AdminUsersPanel";

export default function AdminUsersModal({ onClose }) {
  return (
    <Modal title="Users" width={900} onClose={onClose}>
      {/* CREATE USER */}
      <div style={{ marginBottom: 24 }}>
        <h4>Create user</h4>
        <AdminCreateUserPanel />
      </div>

      <hr />

      {/* USERS LIST */}
      <div style={{ marginTop: 24 }}>
        <h4>Users</h4>
        <AdminUsersPanel />
      </div>
    </Modal>
  );
}
