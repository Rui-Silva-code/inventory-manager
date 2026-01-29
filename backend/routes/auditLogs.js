import express from "express";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const router = express.Router();

/**
 * GET /audit-logs
 * Admin only
 */
router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
        SELECT *
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT 200
        `
      );

      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  }
);

export default router;
