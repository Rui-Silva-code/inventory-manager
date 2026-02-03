import { useEffect, useState } from "react";
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
  const [pendingRoles, setPendingRoles] = useState({});

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

  async function handleCreateUser(e) {
    e.preventDefault();
    await createUser(form);
    setForm({ email: "", password: "", role: "viewer" });
    loadUsers();
  }

  function handleRoleSelect(userId, role) {
    setPendingRoles(prev => ({ ...prev, [userId]: role }));
  }

  async function confirmRoleChange(userId) {
    await updateUserRole(userId, pendingRoles[userId]);
    setPendingRoles(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });
    loadUsers();
  }

  async function handleDelete(userId) {
    if (!window.confirm("Delete this user?")) return;
    await deleteUser(userId);
    loadUsers();
  }

  const adminCount = users.filter(u => u.role === "admin").length;

  return (
    <Modal title="Users" onClose={onClose}>
      {/* =========================
         CREATE USER (TOP)
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
         USERS TABLE
         ========================= */}
      <div>
        <h4 className="users-section-title">Users</h4>

        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Confirm</th>
              <th>Created</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {users.map(u => {
              const isSelf = u.id === currentUser.id;
              const isLastAdmin = u.role === "admin" && adminCount === 1;
              const pending = pendingRoles[u.id];

              return (
                <tr key={u.id}>
                  <td>{u.email}</td>

                  <td>
                    <select
                      disabled={isSelf}
                      value={pending ?? u.role}
                      onChange={e =>
                        handleRoleSelect(u.id, e.target.value)
                      }
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td>
                    {!isSelf && pending && pending !== u.role && (
                      <button onClick={() => confirmRoleChange(u.id)}>
                        Confirm
                      </button>
                    )}
                  </td>

                  <td>
                    {new Date(u.created_at).toLocaleString()}
                  </td>

                  <td>
                    <button
                      disabled={isSelf || isLastAdmin}
                      onClick={() => handleDelete(u.id)}
                    >
                      Delete
                    </button>
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
