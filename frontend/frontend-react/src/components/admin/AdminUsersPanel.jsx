import { useEffect, useState } from "react";
import {
  getUsers,
  updateUserRole,
  deleteUser
} from "../../api/users";
import { useAuth } from "../../context/AuthContext";

export default function AdminUsersPanel({ onClose }) {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track pending role changes
  const [pendingRoles, setPendingRoles] = useState({});

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function handleRoleSelect(userId, newRole) {
    setPendingRoles((prev) => ({
      ...prev,
      [userId]: newRole
    }));
  }

  async function confirmRoleChange(userId) {
    const newRole = pendingRoles[userId];
    if (!newRole) return;

    await updateUserRole(userId, newRole);

    setPendingRoles((prev) => {
      const copy = { ...prev };
      delete copy[userId];
      return copy;
    });

    loadUsers();
  }

  async function handleDelete(userId) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await deleteUser(userId);
    loadUsers();
  }

  if (loading) return <p>Loading users...</p>;
  if (error) return <p>{error}</p>;

  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <div style={{ border: "1px solid #ccc", padding: "12px", marginTop: "20px" }}>
      <h3>
        User Management{" "}
        <button onClick={onClose} style={{ marginLeft: "10px" }}>
          Close
        </button>
      </h3>

      <table border="1" width="100%">
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
          {users.map((u) => {
            const pendingRole = pendingRoles[u.id];

            const isSelf = u.id === currentUser.id;
            const isLastAdmin = u.role === "admin" && adminCount === 1;

            const roleChangeDisabled = isSelf;
            const deleteDisabled = isSelf || isLastAdmin;

            return (
              <tr key={u.id}>
                <td>{u.email}</td>

                <td>
                  <select
                    value={pendingRole ?? u.role}
                    disabled={roleChangeDisabled}
                    onChange={(e) =>
                      handleRoleSelect(u.id, e.target.value)
                    }
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td>
                  {!roleChangeDisabled &&
                    pendingRole &&
                    pendingRole !== u.role && (
                      <button onClick={() => confirmRoleChange(u.id)}>
                        Confirm
                      </button>
                    )}
                </td>

                <td>{new Date(u.created_at).toLocaleString()}</td>

                <td>
                  <button
                    disabled={deleteDisabled}
                    title={
                      isSelf
                        ? "You cannot delete your own account"
                        : isLastAdmin
                        ? "Cannot delete the last admin"
                        : ""
                    }
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
  );
}
