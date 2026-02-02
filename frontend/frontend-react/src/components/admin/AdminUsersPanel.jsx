import { useEffect, useState } from "react";
import {
  getUsers,
  updateUserRole,
  deleteUser,
  createUser
} from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import Modal from "../common/Modal";

/*
  ADMIN USERS PANEL
  -----------------
  - Single modal
  - Create user ALWAYS visible at top
  - Users list below
  - No nested modals
  - X closes everything
*/

export default function AdminUsersPanel({ onClose }) {
  const { user: currentUser } = useAuth();

  /* ===== USERS LIST STATE ===== */
  const [users, setUsers] = useState([]);
  const [pendingRoles, setPendingRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ===== CREATE USER STATE ===== */
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "viewer"
  });

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  /* ===== LOAD USERS ===== */
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  /* ===== CREATE USER ===== */
  function handleCreateChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      await createUser(form);
      setForm({ email: "", password: "", role: "viewer" });
      loadUsers();
    } catch {
      setCreateError("Failed to create user");
    } finally {
      setCreating(false);
    }
  }

  /* ===== ROLE CHANGE ===== */
  function handleRoleSelect(userId, newRole) {
    setPendingRoles(prev => ({ ...prev, [userId]: newRole }));
  }

  async function confirmRoleChange(userId) {
    const newRole = pendingRoles[userId];
    if (!newRole) return;

    await updateUserRole(userId, newRole);

    setPendingRoles(prev => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });

    loadUsers();
  }

  /* ===== DELETE USER ===== */
  async function handleDelete(userId) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await deleteUser(userId);
    loadUsers();
  }

  const adminCount = users.filter(u => u.role === "admin").length;

  return (
    <Modal title="Users" onClose={onClose} width={900}>
      {/* =========================
         CREATE USER (TOP)
         ========================= */}
      <form className="modal-form" onSubmit={handleCreateUser}>
        <label>
          Email
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleCreateChange}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            name="password"
            required
            value={form.password}
            onChange={handleCreateChange}
          />
        </label>

        <label>
          Role
          <select
            name="role"
            value={form.role}
            onChange={handleCreateChange}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <div className="full">
          <button type="submit" disabled={creating}>
            {creating ? "Creating..." : "Create User"}
          </button>
        </div>

        {createError && (
          <p style={{ color: "red" }} className="full">
            {createError}
          </p>
        )}
      </form>

      <hr style={{ margin: "20px 0" }} />

      {/* =========================
         USERS LIST
         ========================= */}
      {loading && <p>Loading users...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
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
              const pendingRole = pendingRoles[u.id];
              const isSelf = u.id === currentUser.id;
              const isLastAdmin =
                u.role === "admin" && adminCount === 1;

              return (
                <tr key={u.id}>
                  <td>{u.email}</td>

                  <td>
                    <select
                      value={pendingRole ?? u.role}
                      disabled={isSelf}
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
                    {!isSelf &&
                      pendingRole &&
                      pendingRole !== u.role && (
                        <button
                          onClick={() =>
                            confirmRoleChange(u.id)
                          }
                        >
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
      )}
    </Modal>
  );
}
