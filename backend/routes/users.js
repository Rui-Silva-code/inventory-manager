import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = express.Router();

/* ============================
   GET /users
   Admin only
============================ */
router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT id, email, role, created_at
        FROM users
        ORDER BY created_at DESC
        `
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }
);

/* ============================
   POST /users
   Admin only (create user)
============================ */
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Missing fields" });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `
        INSERT INTO users (id, email, password_hash, role)
        VALUES ($1,$2,$3,$4)
        RETURNING id, email, role, created_at
        `,
        [uuidv4(), email, passwordHash, role]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: "Email already exists" });
      }
      console.error(err);
      res.status(500).json({ error: "Failed to create user" });
    }
  }
);

/* ============================
   PUT /users/:id/role
   Admin only
============================ */
router.put(
  "/:id/role",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // ❌ Admin cannot change own role
    if (id === req.user.id) {
      return res
        .status(403)
        .json({ error: "You cannot change your own role" });
    }

    try {
      // Check target user
      const target = await pool.query(
        "SELECT role FROM users WHERE id = $1",
        [id]
      );

      if (target.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // ❌ Prevent removing last admin
      if (target.rows[0].role === "admin" && role !== "admin") {
        const admins = await pool.query(
          "SELECT COUNT(*) FROM users WHERE role = 'admin'"
        );

        if (Number(admins.rows[0].count) === 1) {
          return res
            .status(403)
            .json({ error: "Cannot remove the last admin" });
        }
      }

      const result = await pool.query(
        `
        UPDATE users
        SET role = $1
        WHERE id = $2
        RETURNING id, email, role, created_at
        `,
        [role, id]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update role" });
    }
  }
);

/* ============================
   DELETE /users/:id
   Admin only
============================ */
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const { id } = req.params;

    // ❌ Admin cannot delete themselves
    if (id === req.user.id) {
      return res
        .status(403)
        .json({ error: "You cannot delete your own account" });
    }

    try {
      const target = await pool.query(
        "SELECT role FROM users WHERE id = $1",
        [id]
      );

      if (target.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      // ❌ Prevent deleting last admin
      if (target.rows[0].role === "admin") {
        const admins = await pool.query(
          "SELECT COUNT(*) FROM users WHERE role = 'admin'"
        );

        if (Number(admins.rows[0].count) === 1) {
          return res
            .status(403)
            .json({ error: "Cannot delete the last admin" });
        }
      }

      await pool.query("DELETE FROM users WHERE id = $1", [id]);
      res.json({ message: "User deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
);

export default router;
