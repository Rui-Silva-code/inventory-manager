import { useEffect, useMemo, useState } from "react";
import {
  getUsers,
  updateUserRole,
  deleteUser,
  createUser
} from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import Modal from "../common/Modal";

export default function AdminUsersPanel({ onClose }) {
  const { user: currentUser } = useAuth();

  /* =========================
     DATA
     ========================= */
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  /* =========================
     ROLE EDIT STATE
     ========================= */
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState("");

  /* =========================
     CREATE USER FORM
     ========================= */
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "viewer"
  });

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const data = await getUsers();
    setUsers(data);
  }

  /* =========================
     CREATE USER
     ========================= */
  async function handleCreateUser(e) {
    e.preventDefault();
    await createUser(form);
    setForm({ email: "", password: "", role: "viewer" });
    loadUsers();
  }

  /* =========================
     ROLE EDIT FLOW
     ========================= */
  function startEditRole(user) {
    setEditingId(user.id);
    setEditRole(user.role);
  }

  function cancelEditRole() {
    setEditingId(null);
    setEditRole("");
  }

  async function saveEditRole(user) {
    await updateUserRole(user.id, editRole);
    cancelEditRole();
    loadUsers();
  }

  /* =========================
     DELETE USER
     ========================= */
  async function handleDelete(user) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await deleteUser(user.id);
    loadUsers();
  }

  /* =========================
     HELPERS
     ========================= */
  const adminCount = users.filter(u => u.role === "admin").length;

  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  function roleBadge(role) {
    return (
      <span className={`role-badge role-${role}`}>
        {role}
      </span>
    );
  }

  /* =========================
     RENDER
     ========================= */
  return (
    <Modal title="Users" onClose={onClose}>
      {/* =========================
         CREATE USER
         ========================= */}
      <div className="users-create">
        <h4 className="users-section-title">Create User</h4>

        <form className="users-form-vertical" onSubmit={handleCreateUser}>
          <label>
            Email
            <input
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </label>

          <label>
            Role
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button type="submit">Create User</button>
        </form>
      </div>

      <hr className="users-divider" />

      {/* =========================
         USERS LIST
         ========================= */}
      <div>
        <h4 className="users-section-title">Users</h4>

        {/* SEARCH */}
        <input
          className="users-search"
          placeholder="Search by email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
              <th className="actions-header">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map(u => {
              const isSelf = u.id === currentUser.id;
              const isLastAdmin = u.role === "admin" && adminCount === 1;
              const isEditing = editingId === u.id;

              return (
                <tr key={u.id}>
                  <td>{u.email}</td>

                  <td>
                    {isEditing ? (
                      <select
                        value={editRole}
                        onChange={e => setEditRole(e.target.value)}
                        disabled={isSelf}
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      roleBadge(u.role)
                    )}
                  </td>

                  <td>{new Date(u.created_at).toLocaleString()}</td>

                  <td className="actions-cell">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEditRole(u)}
                          disabled={isSelf}
                        >
                          Save
                        </button>
                        <button onClick={cancelEditRole}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEditRole(u)}>
                          Edit
                        </button>
                        <button
                          disabled={isSelf || isLastAdmin}
                          onClick={() => handleDelete(u)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
