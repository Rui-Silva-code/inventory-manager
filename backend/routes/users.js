import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = express.Router();

/**
 * GET /users
 * Admin only – list users
 */
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

/**
 * POST /users
 * Admin only – create user
 */
router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (!["viewer", "editor", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    try {
      const exists = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (exists.rows.length > 0) {
        return res.status(409).json({ error: "User already exists" });
      }

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
      console.error(err);
      res.status(500).json({ error: "Failed to create user" });
    }
  }
);

/**
 * PUT /users/:id
 * Admin only – update role
 */
router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!["viewer", "editor", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    try {
      const result = await pool.query(
        `
        UPDATE users
        SET role = $1
        WHERE id = $2
        RETURNING id, email, role
        `,
        [role, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update user" });
    }
  }
);

/**
 * DELETE /users/:id
 * Admin only – delete user
 */
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "User deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
);

export default router;
