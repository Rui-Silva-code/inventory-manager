import express from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = express.Router();

/**
 * POST /users
 * Admin only — create a new user
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
      // Check if email already exists
      const existing = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );

      if (existing.rows.length > 0) {
        return res.status(409).json({ error: "User already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `
        INSERT INTO users (
          id,
          email,
          password_hash,
          role
        )
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

export default router;
