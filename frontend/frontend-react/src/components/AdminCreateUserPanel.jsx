import { useState } from "react";
import { createUser } from "../api/users";

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
    } catch (err) {
      setError("Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: "12px", marginTop: "20px" }}>
      <h3>
        Create User{" "}
        <button onClick={onClose} style={{ marginLeft: "10px" }}>
          Close
        </button>
      </h3>

      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Email<br />
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <label>
            Password<br />
            <input
              name="password"
              type="password"
              required
              value={form.password}
              onChange={handleChange}
            />
          </label>
        </div>

        <div>
          <label>
            Role<br />
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
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}
