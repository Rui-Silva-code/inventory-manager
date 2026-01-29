import express from "express";
import { v4 as uuidv4 } from "uuid";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { logAudit } from "../utils/auditLogger.js";

const router = express.Router();

/**
 * GET /products
 * Viewer / Editor / Admin
 */
router.get(
  "/",
  requireAuth,
  async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT * FROM products ORDER BY created_at DESC"
      );
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }
);

/**
 * POST /products
 * Editor / Admin only
 */
router.post(
  "/",
  requireAuth,
  requireRole("editor", "admin"),
  async (req, res) => {
    const {
      referencia,
      cor,
      x,
      y,
      rack,
      acab,
      obs,
      marked = false
    } = req.body;

    try {
      const result = await pool.query(
        `
        INSERT INTO products (
          id, referencia, cor, x, y, rack, acab, obs, marked
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
        `,
        [
          uuidv4(),
          referencia,
          cor,
          x,
          y,
          rack,
          acab,
          obs,
          marked
        ]
      );

      const createdProduct = result.rows[0];

      await logAudit({
        user: req.user,
        action: "CREATE",
        entity: "product",
        entityId: createdProduct.id,
        beforeState: null,
        afterState: createdProduct
      });

      res.status(201).json(createdProduct);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create product" });
    }
  }
);

/**
 * PUT /products/:id
 * Editor / Admin
 */
router.put(
  "/:id",
  requireAuth,
  requireRole("editor", "admin"),
  async (req, res) => {
    const { id } = req.params;
    const {
      referencia,
      cor,
      x,
      y,
      rack,
      acab,
      obs,
      marked
    } = req.body;

    try {
      // 🔹 Fetch existing product (for audit log)
      const existing = await pool.query(
        "SELECT * FROM products WHERE id = $1",
        [id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      const beforeProduct = existing.rows[0];

      // 🔹 Update product
      const result = await pool.query(
        `
        UPDATE products
        SET
          referencia = $1,
          cor = $2,
          x = $3,
          y = $4,
          rack = $5,
          acab = $6,
          obs = $7,
          marked = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
        `,
        [
          referencia,
          cor,
          x,
          y,
          rack,
          acab,
          obs,
          marked,
          id
        ]
      );

      const updatedProduct = result.rows[0];

      await logAudit({
        user: req.user,
        action: "UPDATE",
        entity: "product",
        entityId: id,
        beforeState: beforeProduct,
        afterState: updatedProduct
      });

      res.json(updatedProduct);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update product" });
    }
  }
);

/**
 * DELETE /products/:id
 * Admin only
 */
router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  async (req, res) => {
    const { id } = req.params;

    try {
      // 🔹 Fetch existing product (for audit log)
      const existing = await pool.query(
        "SELECT * FROM products WHERE id = $1",
        [id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      const beforeProduct = existing.rows[0];

      // 🔹 Delete product
      await pool.query(
        "DELETE FROM products WHERE id = $1",
        [id]
      );

      await logAudit({
        user: req.user,
        action: "DELETE",
        entity: "product",
        entityId: id,
        beforeState: beforeProduct,
        afterState: null
      });

      res.json({ message: "Product deleted" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete product" });
    }
  }
);

export default router;
