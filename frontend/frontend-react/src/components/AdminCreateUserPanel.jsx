import { useState } from "react";
import { createUser } from "../api/users.js";
import Modal from "../components/common/Modal";

export default function AdminCreateUserPanel({ onClose }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "viewer"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createUser(form);
      setSuccess("User created successfully");
      setForm({
        email: "",
        password: "",
        role: "viewer"
      });
    } catch {
      setError("Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Create User" width={460} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </label>

        <label>
          Role
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </button>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </form>
    </Modal>
  );
}
